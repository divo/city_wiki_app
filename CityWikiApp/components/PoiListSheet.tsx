import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { PointOfInterest } from '../services/LocationService';
import { Ionicons } from '@expo/vector-icons';
import { LocationObjectCoords } from 'expo-location';
import { colors } from '../styles/globalStyles';

type FilterType = 'name' | 'must-visit' | 'nearby';

interface PoiListProps {
  pois: PointOfInterest[];
  onSelectPoi: (poi: PointOfInterest) => void;
  snapPoints: string[];
  showSegmentedControl?: boolean;
  cityId: string;
  userLocation?: LocationObjectCoords;
  sortByDistance: (pois: PointOfInterest[]) => PointOfInterest[];
  index?: number;
  onIndexChange?: (index: number) => void;
}

export function PoiListSheet({ 
  pois, 
  onSelectPoi, 
  snapPoints,
  showSegmentedControl = true,
  cityId,
  userLocation,
  sortByDistance,
  index = 1,
  onIndexChange
}: PoiListProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('name');

  const handleSheetChange = useCallback((index: number) => {
    onIndexChange?.(index);
    if (index === 0) {
      setIsCollapsed(true);
    } else if (isCollapsed) {
      setIsCollapsed(false);
    }
  }, [onIndexChange, isCollapsed]);

  const filteredPois = React.useMemo(() => {
    switch (activeFilter) {
      case 'name':
        return [...pois].sort((a, b) => a.name.localeCompare(b.name));
      case 'must-visit':
        return [...pois].sort((a, b) => (a.rank || 0) - (b.rank || 0));
      case 'nearby':
        return sortByDistance ? sortByDistance(pois) : pois;
      default:
        return pois;
    }
  }, [pois, activeFilter, sortByDistance]);

  const ITEM_HEIGHT = 68; // Fixed height for each POI list item

  const renderSegmentButton = (type: FilterType, label: string) => (
    <TouchableOpacity
      style={[
        styles.segmentButton,
        activeFilter === type && styles.segmentButtonActive,
        type === 'nearby' && !userLocation && styles.segmentButtonDisabled
      ]}
      onPress={() => setActiveFilter(type)}
      disabled={type === 'nearby' && !userLocation}
    >
      <Text style={[
        styles.segmentButtonText,
        activeFilter === type && styles.segmentButtonTextActive,
        type === 'nearby' && !userLocation && styles.segmentButtonTextDisabled
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheet
      snapPoints={snapPoints}
      onChange={handleSheetChange}
      index={index}
      style={styles.bottomSheet}
      handleIndicatorStyle={styles.handle}
      enablePanDownToClose={false}
      enableContentPanningGesture={true}
      enableOverDrag={false}
      animateOnMount={true}
    >
      <View style={styles.header}>
        {showSegmentedControl ? (
          <View style={styles.segmentedControl}>
            {renderSegmentButton('name', 'Name')}
            {renderSegmentButton('must-visit', 'Must Visit')}
            {renderSegmentButton('nearby', 'Nearby')}
          </View>
        ) : null}
      </View>
      
      <BottomSheetFlatList
        data={filteredPois}
        keyExtractor={(item) => `${item.name}-${item.latitude}-${item.longitude}`}
        contentContainerStyle={styles.scrollContent}
        getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.poiItem}
            onPress={() => onSelectPoi(item)}
          >
            <View style={styles.poiInfo}>
              <View style={styles.titleRow}>
                {item.rank === 1 && (
                  <Ionicons 
                    name="star" 
                    size={16} 
                    color="#333333" 
                    style={styles.starIcon}
                  />
                )}
                <Text style={styles.poiName}>{item.name}</Text>
              </View>
              <Text style={styles.poiCategory}>{item.district} · {item.category.charAt(0).toUpperCase() + item.category.slice(1)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  handle: {
    backgroundColor: '#DDDDDD',
    width: 40,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 2,
    marginBottom: 8,
    width: '100%',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  segmentButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  segmentButtonDisabled: {
    opacity: 0.5,
  },
  segmentButtonTextDisabled: {
    color: '#999999',
  },
  count: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  scrollContent: {
    padding: 0,
  },
  poiItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: 'white',
  },
  poiInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  poiName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: -0.4,
  },
  poiCategory: {
    fontSize: 15,
    color: '#666666',
    letterSpacing: -0.2,
  },
  starIcon: {
    marginRight: 6,
  },
}); 