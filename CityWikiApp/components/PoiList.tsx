import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { PointOfInterest } from '../services/LocationService';
import Icon from 'react-native-vector-icons/Ionicons';

type FilterType = 'name' | 'must-visit' | 'nearby';

interface PoiListProps {
  pois: PointOfInterest[];
  onSelectPoi: (poi: PointOfInterest) => void;
  snapPoints: string[];
}

export function PoiList({ pois, onSelectPoi, snapPoints }: PoiListProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('name');

  const handleSheetChange = useCallback((index: number) => {
    if (index === 0) {
      setIsCollapsed(true);
    } else if (isCollapsed) {
      setIsCollapsed(false);
    }
  }, [isCollapsed]);

  const filteredPois = React.useMemo(() => {
    switch (activeFilter) {
      case 'name':
        return [...pois].sort((a, b) => a.name.localeCompare(b.name));
      case 'must-visit':
        return [...pois].sort((a, b) => (a.rank || 0) - (b.rank || 0));
      case 'nearby':
        // TODO: Implement nearby sorting based on user location
        return pois;
      default:
        return pois;
    }
  }, [pois, activeFilter]);

  const renderSegmentButton = (type: FilterType, label: string) => (
    <TouchableOpacity
      style={[
        styles.segmentButton,
        activeFilter === type && styles.segmentButtonActive
      ]}
      onPress={() => setActiveFilter(type)}
    >
      <Text style={[
        styles.segmentButtonText,
        activeFilter === type && styles.segmentButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheet
      snapPoints={isCollapsed ? ['5%', '50%', '90%'] : ['15%', '50%', '90%']}
      index={isCollapsed ? 0 : 1}
      style={styles.bottomSheet}
      handleIndicatorStyle={styles.handle}
      onChange={handleSheetChange}
      enablePanDownToClose={false}
    >
      <View style={styles.header}>
        <View style={styles.segmentedControl}>
          {renderSegmentButton('name', 'Name')}
          {renderSegmentButton('must-visit', 'Must Visit')}
          {renderSegmentButton('nearby', 'Nearby')}
        </View>
        <Text style={styles.count}>{filteredPois.length} places</Text>
      </View>
      
      <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
        {filteredPois.map((poi) => (
          <TouchableOpacity
            key={`${poi.name}-${poi.latitude}-${poi.longitude}`}
            style={styles.poiItem}
            onPress={() => onSelectPoi(poi)}
          >
            <View style={styles.poiInfo}>
              <View style={styles.titleRow}>
                {poi.rank === 1 && (
                  <Icon 
                    name="star" 
                    size={16} 
                    color="#333333" 
                    style={styles.starIcon}
                  />
                )}
                <Text style={styles.poiName}>{poi.name}</Text>
              </View>
              <Text style={styles.poiCategory}>{poi.district} · {poi.category.charAt(0).toUpperCase() + poi.category.slice(1)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 2,
    marginBottom: 8,
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
    color: '#007AFF',
    fontWeight: '600',
  },
  count: {
    fontSize: 14,
    color: '#666666',
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