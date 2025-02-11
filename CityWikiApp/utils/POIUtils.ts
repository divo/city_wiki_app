import { PointOfInterest } from '../services/LocationService';

export interface BoundingBox {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

export const calculateBoundingBox = (pois: PointOfInterest[]): BoundingBox | null => {
  if (!pois.length) return null;

  return pois.reduce((bounds, poi) => {
    const lng = Number(poi.longitude);
    const lat = Number(poi.latitude);
    
    if (isNaN(lng) || isNaN(lat)) return bounds;
    
    return {
      minLng: Math.min(bounds.minLng, lng),
      maxLng: Math.max(bounds.maxLng, lng),
      minLat: Math.min(bounds.minLat, lat),
      maxLat: Math.max(bounds.maxLat, lat),
    };
  }, {
    minLng: Number(pois[0].longitude),
    maxLng: Number(pois[0].longitude),
    minLat: Number(pois[0].latitude),
    maxLat: Number(pois[0].latitude),
  });
}; 