import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PointOfInterest } from '../services/LocationService';
import { PoiDetailSheet } from './PoiDetailSheet';
import { PoiListSheet } from './PoiListSheet';

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
}

export const PoiListDetailView: React.FC<PoiListDetailViewProps> = ({
  list,
  cityId
}) => {
  if (!list) return null;

  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null);

  // Filter out POIs that are in the "Must See" or "Highlights" list
  const filteredPois = useMemo(() => {
    return list.pois.filter(poi => 
      poi.sub_category?.toLowerCase() !== 'must see' && 
      poi.sub_category?.toLowerCase() !== 'highlights'
    );
  }, [list.pois]);

  const calculateBounds = useCallback(() => {
    const validPois = list.pois.filter(validateCoordinates);
    if (validPois.length === 0) {
      return {
        ne: [-122.4194, 37.7749],
        sw: [-122.4194, 37.7749]
      };
    }

    const lngs = validPois.map(poi => Number(poi.longitude));
    const lats = validPois.map(poi => Number(poi.latitude));

    return {
      sw: [Math.min(...lngs), Math.min(...lats)],
      ne: [Math.max(...lngs), Math.max(...lats)]
    };
  }, [list.pois]);

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

  const renderMarkers = () => {
    return list.pois
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
            <View style={styles.markerContainer}>
              <Image 
                source={categoryIcons[poi.category.toLowerCase() as keyof typeof categoryIcons] || categoryIcons.see}
                style={styles.markerIcon}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </Mapbox.MarkerView>
      ));
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{list.title}</Text>
        </View>
        
        <View style={styles.contentContainer}>
          <Mapbox.MapView
            style={styles.map}
            styleURL={Mapbox.StyleURL.Street}
          >
            <Mapbox.Camera
              bounds={calculateBounds()}
              padding={{ paddingTop: 50, paddingBottom: 50, paddingLeft: 50, paddingRight: 50 }}
              animationDuration={0}
            />
            {renderMarkers()}
          </Mapbox.MapView>

          <PoiListSheet
            pois={filteredPois}
            onSelectPoi={setSelectedPoi}
            snapPoints={['25%', '50%', '90%']}
            showSegmentedControl={false}
            cityId={cityId}
          />
        </View>

        {selectedPoi && (
          <PoiDetailSheet 
            poi={selectedPoi} 
            onClose={() => setSelectedPoi(null)}
            cityId={cityId}
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
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: 'white',
    zIndex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333333',
  },
  map: {
    width: '100%',
    height: '100%',
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
}); 