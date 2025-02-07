import AsyncStorage from '@react-native-async-storage/async-storage';

class PurchaseStorage {
  private static instance: PurchaseStorage;
  private static readonly OWNED_CITIES_KEY = 'owned_cities';

  private constructor() {}

  public static getInstance(): PurchaseStorage {
    if (!PurchaseStorage.instance) {
      PurchaseStorage.instance = new PurchaseStorage();
    }
    return PurchaseStorage.instance;
  }

  // Methods for managing owned cities
  public async getOwnedCities(): Promise<string[]> {
    try {
      const ownedCities = await AsyncStorage.getItem(PurchaseStorage.OWNED_CITIES_KEY);
      return ownedCities ? JSON.parse(ownedCities) : [];
    } catch (error) {
      console.error('Error getting owned cities:', error);
      return [];
    }
  }

  public async markCityAsOwned(cityId: string): Promise<void> {
    try {
      const ownedCities = await this.getOwnedCities();
      if (!ownedCities.includes(cityId)) {
        ownedCities.push(cityId);
        await AsyncStorage.setItem(PurchaseStorage.OWNED_CITIES_KEY, JSON.stringify(ownedCities));
      }
    } catch (error) {
      console.error('Error marking city as owned:', error);
      throw error;
    }
  }

  public async isCityOwned(cityId: string): Promise<boolean> {
    try {
      const ownedCities = await this.getOwnedCities();
      return ownedCities.includes(cityId);
    } catch (error) {
      console.error('Error checking if city is owned:', error);
      return false;
    }
  }

  public async clearPurchases(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PurchaseStorage.OWNED_CITIES_KEY);
    } catch (error) {
      console.error('Error clearing purchases:', error);
      throw error;
    }
  }
}

export { PurchaseStorage }; 
