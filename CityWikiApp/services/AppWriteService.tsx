import { Client, Account, ID, Databases, Query } from 'react-native-appwrite';

export class AppWriteService {
  private static instance: AppWriteService;
  private client: Client;
  private databases: Databases;
  private static readonly DATABASE_ID = '67a875fa00164bc54a9e';
  private static readonly COLLECTION_ID = '67a87625002d105645ff';

  private constructor() {
    this.client = new Client()
      .setEndpoint('https://cloud.appwrite.io/v1')
      .setProject('67a874b10034a36253f1')
      .setPlatform('com.halfspud.CityWikiApp');

    this.databases = new Databases(this.client);
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

      return response.purchasedSKUs || [];
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
        try {
          // Try to update existing document
          await this.databases.updateDocument(
            AppWriteService.DATABASE_ID,
            AppWriteService.COLLECTION_ID,
            userId,
            {
              purchasedSKUs: [...currentPurchases, sku],
              lastUpdated: new Date().toISOString()
            }
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