import React, { useCallback, useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Mapbox, { Images, UserLocation, UserLocationRenderMode } from '@rnmapbox/maps';
import { PointOfInterest, LocationService } from '../services/LocationService';
import { PoiDetailSheet } from './PoiDetailSheet';
import { PoiListSheet } from './PoiListSheet';
import { Ionicons } from '@expo/vector-icons';
import { MAP_STYLE_URL } from '../screens/MapScreen';

// Add icon imports
const categoryIcons = {
  see: require('../assets/see.png'),
  eat: require('../assets/eat.png'),
  sleep: require('../assets/sleep.png'),
  shop: require('../assets/shop.png'),
  drink: require('../assets/drink.png'),
  play: require('../assets/play.png'),
};

interface PoiListDetailViewProps {
  list: {
    title: string;
    pois: PointOfInterest[];
  } | null;
  cityId: string;
  onClose?: () => void;
}

export const PoiListDetailView: React.FC<PoiListDetailViewProps> = ({
  list,
  cityId,
  onClose
}) => {
  if (!list) return null;

  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [listSheetIndex, setListSheetIndex] = useState(1); // Default to middle position

  const validateCoordinates = (poi: PointOfInterest): boolean => {
    if (typeof poi.longitude !== 'number' || typeof poi.latitude !== 'number') {
      return false;
    }
    
    if (isNaN(poi.longitude) || isNaN(poi.latitude)) {
      return false;
    }
    
    if (poi.longitude < -180 || poi.longitude > 180) {
      return false;
    }
    
    if (poi.latitude < -90 || poi.latitude > 90) {
      return false;
    }
    
    return true;
  };

  const poiFeatures = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: list.pois
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
  }), [list.pois]);

  const handleSymbolPress = useCallback((event: any) => {
    if (!event.features || event.features.length === 0) return;
    
    const feature = event.features[0];
    if (feature && feature.properties) {
      const poi = list.pois.find(p => 
        p.name === feature.properties.poiName && 
        p.district === feature.properties.district
      );
      if (poi) {
        setSelectedPoi(poi);
      }
    }
  }, [list.pois]);

  const calculateBoundingBox = useCallback((pois: PointOfInterest[]) => {
    const validPois = pois.filter(validateCoordinates);
    
    if (!validPois.length) return null;

    return validPois.reduce((bounds, poi) => {
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
      minLng: Number(validPois[0].longitude),
      maxLng: Number(validPois[0].longitude),
      minLat: Number(validPois[0].latitude),
      maxLat: Number(validPois[0].latitude),
    });
  }, []);

  const cameraBounds = useMemo(() => {
    // Calculate bounds for selected POIs
    const bounds = calculateBoundingBox(list.pois);
    if (!bounds) return null;

    // Add padding to the bounds (10% of the total span)
    const lngPadding = (bounds.maxLng - bounds.minLng) * 0.1;
    const latPadding = (bounds.maxLat - bounds.minLat) * 0.1;

    return {
      ne: [bounds.maxLng + lngPadding, bounds.maxLat + latPadding],
      sw: [bounds.minLng - lngPadding, bounds.minLat - latPadding],
    };
  }, [list.pois, calculateBoundingBox]);

  const maxBounds = useMemo(() => {
    // Calculate bounds for all POIs
    const allPois = LocationService.getInstance().getAllPois();
    const bounds = calculateBoundingBox(allPois);
    if (!bounds) return null;

    // Add padding to the bounds (10% of the total span)
    const lngPadding = (bounds.maxLng - bounds.minLng) * 0.1;
    const latPadding = (bounds.maxLat - bounds.minLat) * 0.1;

    return {
      ne: [bounds.maxLng + lngPadding, bounds.maxLat + latPadding],
      sw: [bounds.minLng - lngPadding, bounds.minLat - latPadding],
    };
  }, [calculateBoundingBox]);

  const coordinateBounds = useMemo(() => {
    if (!cameraBounds) return null;
    return [cameraBounds.sw, cameraBounds.ne];
  }, [cameraBounds]);

  const handleZoomToPoi = useCallback((poi: PointOfInterest) => {
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [poi.longitude, poi.latitude],
        zoomLevel: 16,
        animationDuration: 1000,
      });
      setListSheetIndex(0); // Collapse list sheet to lowest point
    }
  }, []);

  const sortByDistance = useCallback((pois: PointOfInterest[]) => {
    return pois; // No sorting needed in this view
  }, [list.pois]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          {onClose && (
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{list.title}</Text>
        </View>
        
        <View style={styles.contentContainer}>
          <Mapbox.MapView
            style={styles.map}
            styleURL={MAP_STYLE_URL}
          >
            <Mapbox.Camera
              ref={cameraRef}
              bounds={cameraBounds || undefined}
              maxBounds={maxBounds || undefined}
              padding={{ paddingTop: 50, paddingBottom: 300, paddingLeft: 50, paddingRight: 50 }}
              animationDuration={0}
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
              <Mapbox.SymbolLayer
                id="poiSymbols"
                style={{
                  iconImage: ['get', 'poiCategory'],
                  iconSize: 0.10,
                  iconAllowOverlap: true,
                  symbolSortKey: 1,
                  iconPadding: 4,
                  iconOffset: [0, 4]
                }}
              />
            </Mapbox.ShapeSource>

            <UserLocation 
              visible={true}
              renderMode={UserLocationRenderMode.Native}
              androidRenderMode="compass"
            />
          </Mapbox.MapView>

          <PoiListSheet
            pois={list.pois}
            onSelectPoi={setSelectedPoi}
            snapPoints={['25%', '50%', '90%']}
            cityId={cityId}
            showSegmentedControl={false}
            sortByDistance={sortByDistance}
            index={listSheetIndex}
            onIndexChange={setListSheetIndex}
          />
        </View>

        {selectedPoi && (
          <PoiDetailSheet 
            poi={selectedPoi} 
            onClose={() => setSelectedPoi(null)}
            cityId={cityId}
            onMapPress={handleZoomToPoi}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: 'white',
    zIndex: 1,
    height: 44,
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  }
}); 