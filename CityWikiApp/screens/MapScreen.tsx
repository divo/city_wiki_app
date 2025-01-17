import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { CategoryTab } from '../components/CategoryTab';
import { SearchBar } from '../components/SearchBar';
import { LocationService, PointOfInterest } from '../services/LocationService';
import { PoiDetailSheet } from '../components/PoiDetailSheet';
import Icon from 'react-native-vector-icons/Ionicons';
import { PoiListSheet } from '../components/PoiListSheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Initialize Mapbox with your access token
Mapbox.setAccessToken('pk.eyJ1IjoiZGl2b2RpdmVuc29uIiwiYSI6ImNtNWI5emtqbDFmejkybHI3ZHJicGZjeTIifQ.r-F49IgRf5oLrtQEzMppmA');

const categories = ['All', 'See', 'Eat', 'Sleep', 'Shop', 'Drink', 'Play'];

interface MapScreenProps {
  initialCenter: [number, number];
  initialZoom: number;
  onMapStateChange: (center: [number, number], zoom: number) => void;
  cityId: string;
}

// Add icon imports
const categoryIcons = {
  see: require('../assets/see.png'),
  eat: require('../assets/eat.png'),
  sleep: require('../assets/sleep.png'),
  shop: require('../assets/shop.png'),
  drink: require('../assets/drink.png'),
  play: require('../assets/play.png'),
};

interface BoundingBox {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

export default function MapScreen({ initialZoom, onMapStateChange, cityId }: MapScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [locations, setLocations] = useState<PointOfInterest[]>([]);
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null);
  const [centerCoordinate, setCenterCoordinate] = useState<[number, number]>([-122.4194, 37.7749]);
  const bottomSheetSnapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  // Add effect to log state changes
  useEffect(() => {
    console.log('Selected POI changed:', selectedPoi?.name);
    console.log('About to render PoiDetailSheet:', selectedPoi ? 'yes' : 'no');
  }, [selectedPoi]);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationService = LocationService.getInstance();
        await locationService.loadLocations(cityId);
        const filteredLocations = locationService.getPoisByCategory(selectedCategory.toLowerCase());
        console.log(`Filtered ${filteredLocations.length} locations for category: ${selectedCategory.toLowerCase()}`);
        setLocations(filteredLocations);
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    };

    loadLocations();
  }, [selectedCategory, cityId]);

  // Only set initial center coordinates once on mount
  useEffect(() => {
    const locationService = LocationService.getInstance();
    setCenterCoordinate(locationService.getCenterCoordinates());
  }, []);

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
              console.log('Setting selectedPoi:', poi);
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

  const calculateBoundingBox = (pois: PointOfInterest[]): BoundingBox | null => {
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

  const cameraBounds = useMemo(() => {
    const bounds = calculateBoundingBox(locations);
    if (!bounds) return null;

    // Add padding to the bounds (10% of the total span)
    const lngPadding = (bounds.maxLng - bounds.minLng) * 0.1;
    const latPadding = (bounds.maxLat - bounds.minLat) * 0.1;

    return {
      ne: [bounds.maxLng + lngPadding, bounds.maxLat + latPadding],
      sw: [bounds.minLng - lngPadding, bounds.minLat - latPadding],
    };
  }, [locations]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
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
                isActive={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
              />
            ))}
          </ScrollView>

          <View style={styles.searchContainer}>
            <SearchBar />
          </View>
        </View>

        <View style={styles.mapContainer}>
          <Mapbox.MapView
            style={styles.map}
            styleURL={Mapbox.StyleURL.Street}
            onCameraChanged={event => {
              console.log('Camera zoom:', event.properties.zoom);
              setZoomLevel(event.properties.zoom);
              if (onMapStateChange) {
                onMapStateChange([event.properties.center[0], event.properties.center[1]], event.properties.zoom);
              }
            }}
          >
            <Mapbox.Camera
              defaultSettings={{
                centerCoordinate: centerCoordinate,
                zoomLevel: zoomLevel,
                animationDuration: 0
              }}
              bounds={cameraBounds || undefined}
              animationDuration={1000}
            />
            {renderMarkers()}
          </Mapbox.MapView>
        </View>

        {<PoiListSheet
          pois={locations}
          onSelectPoi={setSelectedPoi}
          snapPoints={bottomSheetSnapPoints}
        />}


        {selectedPoi && (
          <PoiDetailSheet 
            poi={selectedPoi} 
            onClose={() => setSelectedPoi(null)} 
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 12,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
