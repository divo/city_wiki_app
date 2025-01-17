import React, { createContext, useContext, useState, useCallback } from 'react';
import { PointOfInterest } from '../services/LocationService';
import { StorageService } from '../services/StorageService';

interface FavoritesContextType {
  favorites: PointOfInterest[];
  addFavorite: (cityId: string, poi: PointOfInterest) => void;
  removeFavorite: (cityId: string, poi: PointOfInterest) => void;
  loadFavorites: (cityId: string) => void;
  isFavorite: (poi: PointOfInterest) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<PointOfInterest[]>([]);
  const storageService = StorageService.getInstance();

  const loadFavorites = useCallback((cityId: string) => {
    storageService.getFavorites(cityId)
      .then(favs => {
        setFavorites(favs);
      })
      .catch(error => {
        console.error('Error loading favorites:', error);
      });
  }, []);

  const addFavorite = useCallback((cityId: string, poi: PointOfInterest) => {
    setFavorites(prev => [...prev, poi]);
    storageService.addFavorite(cityId, poi).catch(error => {
      console.error('Error adding favorite:', error);
      // Revert state on error
      setFavorites(prev => prev.filter(fav => !(fav.name === poi.name && fav.district === poi.district)));
    });
  }, []);

  const removeFavorite = useCallback((cityId: string, poi: PointOfInterest) => {
    setFavorites(prev => prev.filter(fav => !(fav.name === poi.name && fav.district === poi.district)));
    storageService.removeFavorite(cityId, poi).catch(error => {
      console.error('Error removing favorite:', error);
      // Revert state on error
      setFavorites(prev => [...prev, poi]);
    });
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