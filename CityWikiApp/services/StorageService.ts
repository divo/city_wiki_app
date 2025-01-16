import AsyncStorage from '@react-native-async-storage/async-storage';
import { CityData } from './LocationService';

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public async storeData(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  }

  public async getData<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      throw error;
    }
  }

  public async removeData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  }

  public async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // Helper method to generate consistent keys for city data
  public getCityKey(cityId: string): string {
    return `city_${cityId.toLowerCase()}`;
  }

  // Specific methods for city data
  public async storeCityData(cityId: string, data: CityData): Promise<void> {
    await this.storeData(this.getCityKey(cityId), data);
  }

  public async getCityData(cityId: string): Promise<CityData | null> {
    return await this.getData<CityData>(this.getCityKey(cityId));
  }
}

export { StorageService }; 