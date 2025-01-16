import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

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
  //private baseUrl = 'http://192.168.1.220:8000';
  private baseUrl = 'http://localhost:8000';

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  public async loadLocations(cityId: string): Promise<void> {
    try {
      const response = await fetch(`http://localhost:8000/city/${cityId}/dump/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
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
}

export { LocationService, type PointOfInterest, type CityData }; 
