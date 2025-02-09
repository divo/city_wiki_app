import { PurchaseStorage } from './PurchaseStorage';
import * as RNIap from 'react-native-iap';
import { cities } from '../types/city';
import { EmitterSubscription, Platform } from 'react-native';
import { AppWriteService } from './AppWriteService';

interface IAPProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
}

class IAPService {
  private static instance: IAPService;
  private purchaseStorage: PurchaseStorage;
  private appWriteService: AppWriteService;
  private isInitialized: boolean = false;
  private products: RNIap.Product[] = [];
  private purchaseUpdateSubscription: EmitterSubscription | null = null;
  private purchaseErrorSubscription: EmitterSubscription | null = null;
  private isSimulator: boolean;

  private constructor() {
    this.purchaseStorage = PurchaseStorage.getInstance();
    this.appWriteService = AppWriteService.getInstance();
    // Check if running in simulator
    this.isSimulator = Platform.select({
      ios: !!/Simulator/.test(navigator?.userAgent),
      android: false,
      default: false,
    });
  }

  public static getInstance(): IAPService {
    if (!IAPService.instance) {
      IAPService.instance = new IAPService();
    }
    return IAPService.instance;
  }

  // Initialize both IAP layers
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      if (!this.isSimulator) {
        await this.initializeAppleIAP();
      } else {
        console.log('Running in simulator - skipping Apple IAP initialization');
      }
      await this.initializeAppWriteIAP();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
      throw error;
    }
  }

  // Initialize Apple IAP
  private async initializeAppleIAP(): Promise<void> {
    try {
      await RNIap.initConnection();

      // Setup purchase update listener
      this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase: RNIap.Purchase) => {
        try {
          // Validate the purchase
          if (purchase.transactionReceipt) {
            // Finish the transaction
            await RNIap.finishTransaction({ purchase, isConsumable: false });
            
            // Extract the city ID from the product ID
            const cityId = this.getCityIdFromProductId(purchase.productId);
            if (cityId) {
              // Mark the city as owned locally
              await this.purchaseStorage.markCityAsOwned(cityId);
              // Sync with AppWrite
              await this.appWriteService.registerPurchase(purchase.productId);
            }
          }
        } catch (error) {
          console.error('Error processing purchase:', error);
        }
      });

      // Setup error listener
      this.purchaseErrorSubscription = RNIap.purchaseErrorListener((error: RNIap.PurchaseError) => {
        console.error('Purchase error:', error);
      });

      // Load products
      await this.getProducts();
    } catch (error) {
      console.error('Failed to initialize Apple IAP:', error);
      throw error;
    }
  }

  // Initialize AppWrite IAP
  private async initializeAppWriteIAP(): Promise<void> {
    try {
      // Get purchases from AppWrite and sync them locally
      const appWritePurchases = await this.appWriteService.getPurchasedSKUs();
      for (const sku of appWritePurchases) {
        const cityId = this.getCityIdFromProductId(sku);
        if (cityId) {
          await this.purchaseStorage.markCityAsOwned(cityId);
        }
      }
    } catch (error) {
      console.error('Failed to initialize AppWrite IAP:', error);
      throw error;
    }
  }

  // End IAP connection
  public async endConnection(): Promise<void> {
    if (!this.isInitialized) return;
    
    try {
      // Remove purchase listeners
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
        this.purchaseUpdateSubscription = null;
      }
      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
        this.purchaseErrorSubscription = null;
      }

      await RNIap.endConnection();
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to end IAP connection:', error);
      throw error;
    }
  }

  // Helper method to extract city ID from product ID
  private getCityIdFromProductId(productId: string): string | null {
    const city = cities.find(city => city.iap_id === productId);
    return city ? city.id : null;
  }

  // Get available products
  public async getProducts(): Promise<RNIap.Product[]> {
    if (this.isSimulator) {
      // Return mock products for simulator
      return cities.map(city => ({
        productId: city.iap_id,
        title: `${city.name} Guide`,
        description: `City guide for ${city.name}`,
        price: '0.99',
        currency: 'USD',
      })) as RNIap.Product[];
    }

    try {
      const skus = cities.map(city => city.iap_id);
      this.products = await RNIap.getProducts({ skus });
      return this.products;
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  // Start a purchase flow
  public async purchaseCity(cityId: string): Promise<boolean> {
    try {
      // Find the city and its IAP ID
      const city = cities.find(c => c.id === cityId);
      if (!city) {
        throw new Error(`City not found: ${cityId}`);
      }

      if (this.isSimulator) {
        // In simulator, directly mark as owned and sync to AppWrite
        await this.purchaseStorage.markCityAsOwned(cityId);
        await this.appWriteService.registerPurchase(city.iap_id);
        return true;
      }

      // Request the purchase through Apple IAP
      await RNIap.requestPurchase({
        sku: city.iap_id
      });

      // The purchase result will be handled by the purchaseUpdatedListener
      return true;
    } catch (error) {
      console.error('Failed to purchase city:', error);
      return false;
    }
  }

  // Restore previous purchases
  public async restorePurchases(): Promise<void> {
    try {
      // Get purchases from both sources
      const [iapPurchases, appWritePurchases] = await Promise.all([
        this.isSimulator ? [] : RNIap.getAvailablePurchases(),
        this.appWriteService.getPurchasedSKUs()
      ]);
      
      if (!this.isSimulator) {
        // Process IAP purchases
        for (const purchase of iapPurchases) {
          try {
            const cityId = this.getCityIdFromProductId(purchase.productId);
            if (cityId) {
              await this.purchaseStorage.markCityAsOwned(cityId);
              // Register with AppWrite if not already there
              if (!appWritePurchases.includes(purchase.productId)) {
                await this.appWriteService.registerPurchase(purchase.productId);
              }
            }
          } catch (error) {
            console.error('Error processing restored IAP purchase:', error);
          }
        }
      }

      // Process AppWrite purchases
      for (const sku of appWritePurchases) {
        try {
          const cityId = this.getCityIdFromProductId(sku);
          if (cityId) {
            await this.purchaseStorage.markCityAsOwned(cityId);
          }
        } catch (error) {
          console.error('Error processing AppWrite purchase:', error);
        }
      }
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }

  // Validate receipt
  private async validateReceipt(receipt: string): Promise<boolean> {
    // TODO: Validate receipt with backend
    return false;
  }

  // Check if a product is owned
  public async isProductOwned(productId: string): Promise<boolean> {
    // TODO: Check if product is owned
    return false;
  }
}

export { IAPService, type IAPProduct }; 