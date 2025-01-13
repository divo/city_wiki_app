import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { CategoryTab } from './components/CategoryTab';
import { SearchBar } from './components/SearchBar';
import { BottomNav } from './components/BottomNav';
import { LocationService, PointOfInterest } from './services/LocationService';

// Initialize Mapbox with your access token
Mapbox.setAccessToken('pk.eyJ1IjoiZGl2b2RpdmVuc29uIiwiYSI6ImNtNWI5emtqbDFmejkybHI3ZHJicGZjeTIifQ.r-F49IgRf5oLrtQEzMppmA');

const categories = ['All', 'See', 'Eat', 'Sleep', 'Shop', 'Drink', 'Play'];

interface MapScreenProps {
  currentScreen: 'map' | 'explore';
  onNavigate: (screen: 'map' | 'explore') => void;
}

const MapScreen: React.FC<MapScreenProps> = ({ currentScreen, onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [locations, setLocations] = useState<PointOfInterest[]>([]);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationService = LocationService.getInstance();
        await locationService.loadLocations();
        const filteredLocations = locationService.getPoisByCategory(activeCategory.toLowerCase());
        console.log(`Filtered ${filteredLocations.length} locations for category: ${activeCategory.toLowerCase()}`);
        setLocations(filteredLocations);
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    };

    loadLocations();
  }, [activeCategory]);

  const validateCoordinates = (poi: PointOfInterest): boolean => {
    if (typeof poi.longitude !== 'number' || typeof poi.latitude !== 'number') {
      console.warn(`Invalid coordinate types for POI "${poi.name}": longitude=${poi.longitude}, latitude=${poi.latitude}`);
      return false;
    }
    
    if (isNaN(poi.longitude) || isNaN(poi.latitude)) {
      console.warn(`NaN coordinates for POI "${poi.name}": longitude=${poi.longitude}, latitude=${poi.latitude}`);
      return false;
    }
    
    if (poi.longitude < -180 || poi.longitude > 180) {
      console.warn(`Invalid longitude for POI "${poi.name}": ${poi.longitude}`);
      return false;
    }
    
    if (poi.latitude < -90 || poi.latitude > 90) {
      console.warn(`Invalid latitude for POI "${poi.name}": ${poi.latitude}`);
      return false;
    }
    
    return true;
  };

  const renderMarkers = () => {
    return locations
      .filter(validateCoordinates)
      .map((poi) => (
        <Mapbox.MarkerView
          key={`${poi.name}-${poi.latitude}-${poi.longitude}`}
          id={poi.name}
          coordinate={[Number(poi.longitude), Number(poi.latitude)]}
        >
          <View style={[styles.markerContainer, { backgroundColor: getCategoryColor(poi.category) }]} />
        </Mapbox.MarkerView>
      ));
  };

  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'eat':
        return '#FF6B6B';
      case 'drink':
        return '#4ECDC4';
      case 'see':
        return '#45B7D1';
      case 'sleep':
        return '#96CEB4';
      case 'shop':
        return '#FFEEAD';
      case 'play':
        return '#D4A5A5';
      default:
        return '#666666';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>San Francisco</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <CategoryTab
              key={category}
              label={category}
              isActive={activeCategory === category}
              onPress={() => setActiveCategory(category)}
            />
          ))}
        </ScrollView>

        <SearchBar />
      </View>

      <View style={styles.mapContainer}>
        <Mapbox.MapView
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
        >
          <Mapbox.Camera
            zoomLevel={12}
            centerCoordinate={[-122.4194, 37.7749]}
            animationMode="flyTo"
            animationDuration={2000}
          />
          {renderMarkers()}
        </Mapbox.MapView>
      </View>

      <BottomNav currentScreen={currentScreen} onNavigate={onNavigate} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginVertical: 4,
  },
  categoriesScroll: {
    marginVertical: 4,
  },
  categoriesContent: {
    paddingHorizontal: 12,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: '#FF0000',
  },
});

export default MapScreen;
