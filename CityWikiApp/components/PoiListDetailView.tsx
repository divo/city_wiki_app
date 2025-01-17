import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { PointOfInterest } from '../services/LocationService';
import POIDetailModal from './PoiDetailView';
import { PoiList } from './PoiList';

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
  visible: boolean;
  onClose: () => void;
  list: {
    title: string;
    pois: PointOfInterest[];
  } | null;
}

// Used to display a list of POIs and a map of the POIs
export const PoiListDetailView: React.FC<PoiListDetailViewProps> = ({
  visible,
  onClose,
  list
}) => {
  if (!list) return null;

  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const handleSheetChange = useCallback((index: number) => {
    setIsCollapsed(index === 0);
  }, []);

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

  const handleShare = () => {
    console.log('Sharing POI:', selectedPoi?.name);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{list.title}</Text>
            <View style={styles.placeholder} />
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

            <PoiList
              pois={filteredPois}
              onSelectPoi={setSelectedPoi}
              snapPoints={['25%', '50%', '90%']}
              showSegmentedControl={false}
            />
          </View>

          {selectedPoi && (
            <POIDetailModal
              poi={selectedPoi}
              onClose={() => setSelectedPoi(null)}
              onShare={handleShare}
            />
          )}
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
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
    justifyContent: 'space-between',
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
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  closeButtonText: {
    fontSize: 17,
    color: '#007AFF',
  },
  placeholder: {
    width: 60,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bottomSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  listContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 15,
    color: '#666666',
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