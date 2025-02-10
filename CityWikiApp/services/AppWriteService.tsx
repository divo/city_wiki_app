import { Client, Account, ID, Databases, Query } from 'react-native-appwrite';
import { PurchaseStorage } from './PurchaseStorage';
import { cities } from '../types/city';
import * as Keychain from 'react-native-keychain';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export class AppWriteService {
  private static instance: AppWriteService;
  private client: Client;
  private databases: Databases;
  private purchaseStorage: PurchaseStorage;
  private static readonly DATABASE_ID = '67a875fa00164bc54a9e';
  private static readonly COLLECTION_ID = '67a87625002d105645ff';
  private static readonly UUID_SERVICE = 'com.halfspud.CityWikiApp.uuid';
  private cachedUserId: string | null = null;

  private constructor() {
    this.client = new Client()
      .setEndpoint('https://cloud.appwrite.io/v1')
      .setProject('67a874b10034a36253f1')
      .setPlatform('com.halfspud.CityWikiApp');

    this.databases = new Databases(this.client);
    this.purchaseStorage = PurchaseStorage.getInstance();

    // Setup listener for purchase storage changes
    this.purchaseStorage.addChangeListener(this.handlePurchaseChange.bind(this));
  }

  public static getInstance(): AppWriteService {
    if (!AppWriteService.instance) {
      AppWriteService.instance = new AppWriteService();
    }
    return AppWriteService.instance;
  }

  private async handlePurchaseChange(): Promise<void> {
    try {
      // Get current owned cities
      const ownedCities = await this.purchaseStorage.getOwnedCities();
      
      // Convert city IDs to SKUs
      const skus = ownedCities
        .map(cityId => cities.find(c => c.id === cityId)?.iap_id)
        .filter((sku): sku is string => sku !== undefined);

      // Get current AppWrite purchases
      const currentPurchases = await this.getPurchasedSKUs();

      // Find new SKUs that aren't in AppWrite yet
      const newSkus = skus.filter(sku => !currentPurchases.includes(sku));

      // Register each new SKU
      for (const sku of newSkus) {
        await this.registerPurchase(sku);
      }
    } catch (error) {
      console.error('Error handling purchase change:', error);
    }
  }

  private async getUserId(): Promise<string> {
    try {
      // Return cached ID if available
      if (this.cachedUserId) {
        return this.cachedUserId;
      }

      // Try to retrieve the UUID from keychain
      const credentials = await Keychain.getGenericPassword({ 
        service: AppWriteService.UUID_SERVICE 
      });
      
      if (credentials) {
        this.cachedUserId = credentials.password;
        return credentials.password;
      }

      // Generate and store a new UUID if none exists
      const newUUID = uuidv4();
      await Keychain.setGenericPassword('uuid', newUUID, { 
        service: AppWriteService.UUID_SERVICE,
        accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK
      });
      
      this.cachedUserId = newUUID;
      return newUUID;
    } catch (error) {
      console.error('Error getting/setting UUID:', error);
      throw error;
    }
  }

  public async getDeviceId(): Promise<string> {
    return this.getUserId();
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