import React, { createContext, useContext, useState, useCallback } from 'react';
import { PointOfInterest } from '../services/LocationService';
import { StorageService } from '../services/StorageService';

interface FavoritesContextType {
  favorites: PointOfInterest[];
  addFavorite: (cityId: string, poi: PointOfInterest) => Promise<void>;
  removeFavorite: (cityId: string, poi: PointOfInterest) => Promise<void>;
  loadFavorites: (cityId: string) => Promise<void>;
  isFavorite: (poi: PointOfInterest) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<PointOfInterest[]>([]);
  const storageService = StorageService.getInstance();

  const loadFavorites = useCallback(async (cityId: string) => {
    try {
      const favs = await storageService.getFavorites(cityId);
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  const addFavorite = useCallback(async (cityId: string, poi: PointOfInterest) => {
    try {
      await storageService.addFavorite(cityId, poi);
      setFavorites(prev => [...prev, poi]);
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  }, []);

  const removeFavorite = useCallback(async (cityId: string, poi: PointOfInterest) => {
    try {
      await storageService.removeFavorite(cityId, poi);
      setFavorites(prev => 
        prev.filter(fav => !(fav.name === poi.name && fav.district === poi.district))
      );
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }, []);

  const isFavorite = useCallback((poi: PointOfInterest) => {
    return favorites.some(fav => fav.name === poi.name && fav.district === poi.district);
  }, [favorites]);

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    loadFavorites,
    isFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}; 