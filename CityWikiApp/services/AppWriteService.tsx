import { Client, Account, ID, Databases, Query } from 'react-native-appwrite';
import { PurchaseStorage } from './PurchaseStorage';
import { cities } from '../types/city';

export class AppWriteService {
  private static instance: AppWriteService;
  private client: Client;
  private databases: Databases;
  private purchaseStorage: PurchaseStorage;
  private static readonly DATABASE_ID = '67a875fa00164bc54a9e';
  private static readonly COLLECTION_ID = '67a87625002d105645ff';

  private constructor() {
    this.client = new Client()
      .setEndpoint('https://cloud.appwrite.io/v1')
      .setProject('67a874b10034a36253f1')
      .setPlatform('com.halfspud.CityWikiApp');

    this.databases = new Databases(this.client);
    this.purchaseStorage = PurchaseStorage.getInstance();
  }

  public static getInstance(): AppWriteService {
    if (!AppWriteService.instance) {
      AppWriteService.instance = new AppWriteService();
    }
    return AppWriteService.instance;
  }

  private async getUserId(): Promise<string> {
    // Get device unique ID
    return '67a878e600038bb88801';
  }

  public async getPurchasedSKUs(): Promise<string[]> {
    try {
      const userId = await this.getUserId();
      
      const response = await this.databases.getDocument(
        AppWriteService.DATABASE_ID,
        AppWriteService.COLLECTION_ID,
        userId
      );

      const purchasedSKUs = response.purchasedSKUs || [];

      // Sync with PurchaseStorage
      for (const sku of purchasedSKUs) {
        const city = cities.find(c => c.iap_id === sku);
        if (city) {
          await this.purchaseStorage.markCityAsOwned(city.id);
        }
      }

      return purchasedSKUs;
    } catch (error) {
      // If document doesn't exist, return empty array
      if ((error as any)?.code === 404) {
        return [];
      }
      console.error('Error getting purchased SKUs:', error);
      throw error;
    }
  }

  public async registerPurchase(sku: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      const currentPurchases = await this.getPurchasedSKUs();

      // Don't add duplicate SKUs
      if (!currentPurchases.includes(sku)) {
        const data = {
          purchasedSKUs: [...currentPurchases, sku],
          lastUpdated: new Date().toISOString()
        };

        try {
          // Try to update existing document
          await this.databases.updateDocument(
            AppWriteService.DATABASE_ID,
            AppWriteService.COLLECTION_ID,
            userId,
            data
          );
        } catch (error) {
          // If document doesn't exist, create it
          if ((error as any)?.code === 404) {
            await this.databases.createDocument(
              AppWriteService.DATABASE_ID,
              AppWriteService.COLLECTION_ID,
              userId,
              {
                purchasedSKUs: [sku],
                lastUpdated: new Date().toISOString()
              }
            );
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Error registering purchase:', error);
      throw error;
    }
  }
}