import AsyncStorage from '@react-native-async-storage/async-storage';
import { CityData, PointOfInterest } from './LocationService';

class StorageService {
  private static instance: StorageService;
  private static readonly FAVORITES_KEY_PREFIX = 'favorites';

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

  private getFavoritesKey(cityId: string): string {
    return `${StorageService.FAVORITES_KEY_PREFIX}_${cityId.toLowerCase()}`;
  }

  // Favorites methods
  public async addFavorite(cityId: string, poi: PointOfInterest): Promise<void> {
    try {
      const favorites = await this.getFavorites(cityId);
      // Check if POI already exists in favorites
      const exists = favorites.some(fav => fav.name === poi.name && fav.district === poi.district);
      if (!exists) {
        favorites.push(poi);
        await this.storeData(this.getFavoritesKey(cityId), favorites);
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }

  public async removeFavorite(cityId: string, poi: PointOfInterest): Promise<void> {
    try {
      const favorites = await this.getFavorites(cityId);
      const updatedFavorites = favorites.filter(
        fav => !(fav.name === poi.name && fav.district === poi.district)
      );
      await this.storeData(this.getFavoritesKey(cityId), updatedFavorites);
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }

  public async getFavorites(cityId: string): Promise<PointOfInterest[]> {
    try {
      const favorites = await this.getData<PointOfInterest[]>(this.getFavoritesKey(cityId));
      return favorites || [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      throw error;
    }
  }

  public async isFavorite(cityId: string, poi: PointOfInterest): Promise<boolean> {
    try {
      const favorites = await this.getFavorites(cityId);
      return favorites.some(fav => fav.name === poi.name && fav.district === poi.district);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      throw error;
    }
  }

  public async checkFirstLaunch(): Promise<boolean> {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        await AsyncStorage.setItem('hasLaunched', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking first launch:', error);
      return false;
    }
  }
}

export { StorageService }; 