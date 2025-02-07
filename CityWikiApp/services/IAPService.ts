import { PurchaseStorage } from './PurchaseStorage';
import * as RNIap from 'react-native-iap';
import { cities } from '../types/city';

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
      await RNIap.endConnection();
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to end IAP connection:', error);
      throw error;
    }
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
    // TODO: Handle purchase flow
    return false;
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