import { PurchaseStorage } from './PurchaseStorage';
import * as RNIap from 'react-native-iap';
import { cities } from '../types/city';
import { EmitterSubscription } from 'react-native';

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
  private isInitialized: boolean = false;
  private products: RNIap.Product[] = [];
  private purchaseUpdateSubscription: EmitterSubscription | null = null;
  private purchaseErrorSubscription: EmitterSubscription | null = null;

  private constructor() {
    this.purchaseStorage = PurchaseStorage.getInstance();
  }

  public static getInstance(): IAPService {
    if (!IAPService.instance) {
      IAPService.instance = new IAPService();
    }
    return IAPService.instance;
  }

  // Initialize IAP service and load products
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await RNIap.initConnection();
      this.isInitialized = true;

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
              // Mark the city as owned
              await this.purchaseStorage.markCityAsOwned(cityId);
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

      await this.getProducts(); // Load products after initialization
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
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

      // Request the purchase
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
    // TODO: Restore purchases
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