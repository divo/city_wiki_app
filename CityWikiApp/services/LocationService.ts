import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { StorageService } from './StorageService';

interface PointOfInterest {
  district: string;
  name: string;
  category: string;
  sub_category: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  website?: string;
  hours?: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  rank: number;
}

interface PoiList {
  title: string;
  pois: PointOfInterest[];
}

interface CityData {
  city: {
    name: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
    image_url: string;
    about: string;
  };
  districts: {
    name: string;
    parent_district: string | null;
  }[];
  points_of_interest: PointOfInterest[];
  poi_lists: PoiList[];
}

class LocationService {
  private static instance: LocationService;
  private pois: PointOfInterest[] = [];
  private cityData?: CityData;
  private baseUrl = 'http://localhost:8000';
  private storageService: StorageService;

  private constructor() {
    this.storageService = StorageService.getInstance();
  }

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  public async loadLocations(cityId: string): Promise<void> {
    try {
      // Try to get data from cache first
      const cachedData = await this.storageService.getCityData(cityId);
      if (cachedData) {
        console.log('Using cached data for city:', cityId);
        this.cityData = cachedData;
        this.pois = cachedData.points_of_interest;
        return;
      }

      // If not in cache, fetch from network
      console.log('Fetching fresh data for city:', cityId);
      const response = await fetch(`${this.baseUrl}/city/${cityId}/dump/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: CityData = await response.json();
      
      // Store in cache
      await this.storageService.storeCityData(cityId, data);
      
      // Update local state
      this.cityData = data;
      this.pois = data.points_of_interest || [];
    } catch (error) {
      console.error('Error loading points of interest:', error);
      throw error;
    }
  }

  public getCityInfo() {
    return this.cityData?.city;
  }

  public getDistricts() {
    return this.cityData?.districts || [];
  }

  public getAllPois(): PointOfInterest[] {
    return this.pois;
  }

  public getPoisByCategory(category: string): PointOfInterest[] {
    if (category.toLowerCase() === 'all') {
      return this.pois;
    }

    const normalizedCategory = category.toLowerCase().trim();
    return this.pois.filter(poi => {
      const poiCategory = poi.category.toLowerCase().trim();
      return poiCategory === normalizedCategory;
    });
  }

  public getPoisByDistrict(district: string): PointOfInterest[] {
    return this.pois.filter(poi => poi.district === district);
  }

  public getPoisByRank(minRank: number): PointOfInterest[] {
    return this.pois.filter(poi => poi.rank >= minRank);
  }

  public getCenterCoordinates(): [number, number] {
    if (this.pois.length === 0) {
      // Default to San Francisco city center if no POIs
      return [-122.4194, 37.7749];
    }

    const validPois = this.pois.filter(poi => 
      typeof poi.longitude === 'number' && 
      typeof poi.latitude === 'number' && 
      !isNaN(poi.longitude) && 
      !isNaN(poi.latitude)
    );

    if (validPois.length === 0) {
      return [-122.4194, 37.7749];
    }

    const sumLat = validPois.reduce((sum, poi) => sum + poi.latitude, 0);
    const sumLng = validPois.reduce((sum, poi) => sum + poi.longitude, 0);
    
    return [
      sumLng / validPois.length,
      sumLat / validPois.length
    ];
  }

  public async clearData(): Promise<void> {
    try {
      // Clear in-memory data
      this.storageService.clearAll();
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  public getPoiLists(): PoiList[] {
    return this.cityData?.poi_lists || [];
  }
}

export { LocationService, type PointOfInterest, type CityData }; 
