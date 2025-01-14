import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { CategoryTab } from './components/CategoryTab';
import { SearchBar } from './components/SearchBar';
import { BottomNav } from './components/BottomNav';
import { LocationService, PointOfInterest } from './services/LocationService';
import POIDetailModal from './components/PoiDetailView';

// Initialize Mapbox with your access token
Mapbox.setAccessToken('pk.eyJ1IjoiZGl2b2RpdmVuc29uIiwiYSI6ImNtNWI5emtqbDFmejkybHI3ZHJicGZjeTIifQ.r-F49IgRf5oLrtQEzMppmA');

const categories = ['All', 'See', 'Eat', 'Sleep', 'Shop', 'Drink', 'Play'];

interface MapScreenProps {
  currentScreen: 'map' | 'explore';
  onNavigate: (screen: 'map' | 'explore') => void;
}

// Add icon imports
const categoryIcons = {
  see: require('./assets/see.png'),
  eat: require('./assets/eat.png'),
  sleep: require('./assets/sleep.png'),
  shop: require('./assets/shop.png'),
  drink: require('./assets/drink.png'),
  play: require('./assets/play.png'),
};

const MapScreen: React.FC<MapScreenProps> = ({ currentScreen, onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [locations, setLocations] = useState<PointOfInterest[]>([]);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null);

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
      //console.warn(`Invalid coordinate types for POI "${poi.name}": longitude=${poi.longitude}, latitude=${poi.latitude}`);
      return false;
    }
    
    if (isNaN(poi.longitude) || isNaN(poi.latitude)) {
      //console.warn(`NaN coordinates for POI "${poi.name}": longitude=${poi.longitude}, latitude=${poi.latitude}`);
      return false;
    }
    
    if (poi.longitude < -180 || poi.longitude > 180) {
      //console.warn(`Invalid longitude for POI "${poi.name}": ${poi.longitude}`);
      return false;
    }
    
    if (poi.latitude < -90 || poi.latitude > 90) {
      //console.warn(`Invalid latitude for POI "${poi.name}": ${poi.latitude}`);
      return false;
    }
    
    return true;
  };

  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'see':
        return '#F0B429';
      case 'eat':
        return '#F35627';
      case 'sleep':
        return '#0967D2';
      case 'shop':
        return '#DA127D';
      case 'drink':
        return '#E12D39';
      case 'play':
        return '#6CD410';
      default:
        return '#FFFFFF';
    }
  };

  const renderMarkers = () => {
    const showIcons = zoomLevel >= 13;

    return locations
      .filter(validateCoordinates)
      .map((poi) => (
        <Mapbox.MarkerView
          key={`${poi.name}-${poi.latitude}-${poi.longitude}`}
          id={poi.name}
          coordinate={[Number(poi.longitude), Number(poi.latitude)]}
        >
          <TouchableOpacity
            onPress={() => {
              console.log('POI tapped:', poi.name);
              setSelectedPoi(poi);
            }}
          >
            {showIcons ? (
              <View style={styles.markerContainer}>
                <Image 
                  source={categoryIcons[poi.category.toLowerCase() as keyof typeof categoryIcons] || categoryIcons.see}
                  style={styles.markerIcon}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={[
                styles.dotMarker,
                { backgroundColor: getCategoryColor(poi.category) }
              ]} />
            )}
          </TouchableOpacity>
        </Mapbox.MarkerView>
      ));
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing POI:', selectedPoi?.name);
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
          onCameraChanged={event => {
            //console.log('Camera Event:', event.properties);
            setZoomLevel(event.properties.zoom);
          }}
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

      {selectedPoi && (
        <POIDetailModal 
          onClose={() => setSelectedPoi(null)}
          onShare={handleShare}
          poi={selectedPoi}
        />
      )}
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
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerIcon: {
    width: 24,
    height: 24,
  },
  dotMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'white',
  },
});

export default MapScreen;
