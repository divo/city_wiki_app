import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import cityData from '../assets/san_francisco.json';

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

interface CityData {
  city: {
    name: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
  };
  districts: {
    name: string;
    parent_district: string | null;
  }[];
  points_of_interest: PointOfInterest[];
}

class LocationService {
  private static instance: LocationService;
  private pois: PointOfInterest[] = [];
  private cityData?: CityData;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  public async loadLocations(): Promise<PointOfInterest[]> {
    try {
      this.cityData = cityData;
      
      if (!this.cityData.points_of_interest) {
        throw new Error('No points of interest found in san_francisco.json');
      }
      
      this.pois = this.cityData.points_of_interest;
      return this.pois;
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
}

export { LocationService, type PointOfInterest, type CityData }; 