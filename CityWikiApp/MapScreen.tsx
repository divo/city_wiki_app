import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { CategoryTab } from './components/CategoryTab';
import { SearchBar } from './components/SearchBar';
import { BottomNav } from './components/BottomNav';
import { LocationService, Location } from './services/LocationService';

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
        const filteredLocations = locationService.getPoisByCategory(activeCategory);
        setLocations(filteredLocations);
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    };

    loadLocations();
  }, [activeCategory]);

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
          zoomLevel={12}
          centerCoordinate={[-122.4194, 37.7749]} // San Francisco coordinates
        >
          <Mapbox.Camera
            zoomLevel={12}
            centerCoordinate={[-122.4194, 37.7749]}
            animationMode="flyTo"
            animationDuration={2000}
          />
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
});

export default MapScreen;
