import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Image, TouchableOpacity, Keyboard } from 'react-native';
import Mapbox, { UserLocation, Camera, UserLocationRenderMode, Images } from '@rnmapbox/maps';
import { CategoryTab } from '../components/CategoryTab';
import { LocationService, PointOfInterest } from '../services/LocationService';
import { PoiDetailSheet } from '../components/PoiDetailSheet';
import Icon from 'react-native-vector-icons/Ionicons';
import { PoiListSheet } from '../components/PoiListSheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../hooks/useLocation';
import { SearchBar } from '../components/SearchBar';
import * as turf from '@turf/turf';

// Initialize Mapbox with your access token
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN);

export const MAP_STYLE_URL = 'mapbox://styles/divodivenson/cm6718g0f00gw01r8ev759xtp';

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

// Add this helper function at the top level
const fuzzyMatch = (text: string, query: string): boolean => {
  const pattern = query.toLowerCase().split('').join('.*');
  const regex = new RegExp(pattern);
  return regex.test(text.toLowerCase());
};

export default function MapScreen({ initialZoom, onMapStateChange, cityId }: MapScreenProps) {
  const { location } = useLocation();
  const cameraRef = useRef<Camera>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [locations, setLocations] = useState<PointOfInterest[]>([]);
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null);
  const [centerCoordinate, setCenterCoordinate] = useState<[number, number]>([-122.4194, 37.7749]);
  const bottomSheetSnapPoints = useMemo(() => ['25%', '50%', '90%'], []);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Add this function to sort POIs by distance
  const sortByDistance = useCallback((pois: PointOfInterest[]) => {
    if (!location) return pois;
    
    const userPoint = turf.point([location.coords.longitude, location.coords.latitude]);
    
    return [...pois].sort((a, b) => {
      if (!validateCoordinates(a) || !validateCoordinates(b)) return 0;
      
      const pointA = turf.point([a.longitude, a.latitude]);
      const pointB = turf.point([b.longitude, b.latitude]);
      
      const distanceA = turf.distance(userPoint, pointA, { units: 'kilometers' });
      const distanceB = turf.distance(userPoint, pointB, { units: 'kilometers' });
      
      return distanceA - distanceB;
    });
  }, [location]);

  // Update the filteredPois to include sorting capability
  const filteredPois = useMemo(() => {
    let filtered = locations;
    if (searchQuery.trim()) {
      filtered = filtered.filter(poi => fuzzyMatch(poi.name, searchQuery.trim()));
    }
    return filtered;
  }, [locations, searchQuery]);

  // Convert POIs to GeoJSON feature collection
  const poiFeatures = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredPois
      .filter(validateCoordinates)
      .map(poi => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [Number(poi.longitude), Number(poi.latitude)]
        },
        properties: {
          id: `${poi.name}-${poi.latitude}-${poi.longitude}`,
          poiName: poi.name,
          poiCategory: poi.category.toLowerCase(),
          district: poi.district,
          description: poi.description,
          image_url: poi.image_url,
          website: poi.website,
          phone: poi.phone,
          hours: poi.hours,
          address: poi.address,
          rank: poi.rank
        }
      }))
  }), [filteredPois]);

  const handleSymbolPress = useCallback((event: any) => {
    const feature = event.features[0];
    if (feature) {
      const poi = locations.find(p => 
        p.name === feature.properties.poiName && 
        p.district === feature.properties.district
      );
      if (poi) {
        setSelectedPoi(poi);
      }
    }
  }, [locations]);

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
    const allLocations = LocationService.getInstance().getAllPois();
    const bounds = calculateBoundingBox(allLocations);
    if (!bounds) return null;

    // Add padding to the bounds (10% of the total span)
    const lngPadding = (bounds.maxLng - bounds.minLng) * 0.1;
    const latPadding = (bounds.maxLat - bounds.minLat) * 0.1;

    return {
      ne: [bounds.maxLng + lngPadding, bounds.maxLat + latPadding],
      sw: [bounds.minLng - lngPadding, bounds.minLat - latPadding],
    };
  }, []);

  const coordinateBounds = useMemo(() => {
    if (!cameraBounds) return null;
    return [cameraBounds.sw, cameraBounds.ne];
  }, [cameraBounds]);

  const handleLocationPress = () => {
    if (location && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [location.coords.longitude, location.coords.latitude],
        zoomLevel: 15,
        animationDuration: 1000,
      });
    }
  };

  // Update the search handler
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleMapPress = () => {
    Keyboard.dismiss();
  };

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
            <SearchBar
              onChangeText={handleSearch}
              value={searchQuery}
            />
          </View>
        </View>

        <View style={styles.mapContainer}>
          <Mapbox.MapView
            style={styles.map}
            styleURL={MAP_STYLE_URL}
            onPress={handleMapPress}
            onCameraChanged={event => {
              setZoomLevel(event.properties.zoom);
              if (onMapStateChange) {
                onMapStateChange([event.properties.center[0], event.properties.center[1]], event.properties.zoom);
              }
            }}
          >
            <Mapbox.Camera
              ref={cameraRef}
              defaultSettings={{
                centerCoordinate: centerCoordinate,
                zoomLevel: zoomLevel,
                animationDuration: 0
              }}
              bounds={cameraBounds || undefined}
              animationDuration={1000}
              maxBounds={cameraBounds || undefined}
            />

            <Images
              images={{
                see: require('../assets/see.png'),
                eat: require('../assets/eat.png'),
                sleep: require('../assets/sleep.png'),
                shop: require('../assets/shop.png'),
                drink: require('../assets/drink.png'),
                play: require('../assets/play.png'),
              }}
            />

            <Mapbox.ShapeSource
              id="poiSource"
              shape={poiFeatures}
              onPress={handleSymbolPress}
            >
              <Mapbox.CircleLayer
                id="poiDots"
                style={{
                  circleRadius: 4,
                  circleColor: [
                    'match',
                    ['get', 'poiCategory'],
                    'see', '#F0B429',
                    'eat', '#F35627',
                    'sleep', '#0967D2',
                    'shop', '#DA127D',
                    'drink', '#E12D39',
                    'play', '#6CD410',
                    '#FFFFFF'
                  ],
                  circleSortKey: [
                    'match',
                    ['get', 'poiCategory'],
                    'see', 2,    // See POIs will render on top
                    'sleep', 0,  // Sleep POIs will render underneath
                    1           // All other POIs will render in the middle
                  ],
                  circleStrokeWidth: 1,
                  circleStrokeColor: 'white',
                  circleOpacity: [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    12.8, 1,
                    13, 0
                  ]
                }}
              />
              <Mapbox.SymbolLayer
                id="poiSymbols"
                style={{
                  iconImage: ['get', 'poiCategory'],
                  iconSize: 0.15,
                  iconAllowOverlap: true,
                  symbolSortKey: [
                    'match',
                    ['get', 'poiCategory'],
                    'see', 2,    // See POIs will render on top
                    'sleep', 0,  // Sleep POIs will render underneath
                    1           // All other POIs will render in the middle
                  ],
                  iconPadding: 4,
                  iconOffset: [0, 4],
                  iconOpacity: [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    12.8, 0,
                    13, 1
                  ]
                }}
              />
            </Mapbox.ShapeSource>

            <UserLocation 
              visible={true}
              renderMode={UserLocationRenderMode.Native}
              androidRenderMode="compass"
            />
          </Mapbox.MapView>
        </View>

        {<PoiListSheet
          pois={filteredPois}
          onSelectPoi={setSelectedPoi}
          snapPoints={bottomSheetSnapPoints}
          cityId={cityId}
          userLocation={location?.coords}
          sortByDistance={sortByDistance}
        />}


        {selectedPoi && (
          <PoiDetailSheet 
            poi={selectedPoi} 
            onClose={() => setSelectedPoi(null)} 
            cityId={cityId}
          />
        )}

        <TouchableOpacity 
          style={styles.locationButton}
          onPress={handleLocationPress}
        >
          <Ionicons name="locate" size={24} color="#007AFF" />
        </TouchableOpacity>
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
  locationButton: {
    position: 'absolute',
    right: 16,
    bottom: 60,
    backgroundColor: 'white',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchBarContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    marginTop: 0,
  },
  searchBarInputContainer: {
    backgroundColor: '#f5f5f5',
    height: 36,
    borderRadius: 8,
  },
});
