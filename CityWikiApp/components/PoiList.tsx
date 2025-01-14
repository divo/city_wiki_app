import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { PointOfInterest } from '../services/LocationService';

interface PoiListProps {
  pois: PointOfInterest[];
  onSelectPoi: (poi: PointOfInterest) => void;
  snapPoints: string[];
}

export function PoiList({ pois, onSelectPoi, snapPoints }: PoiListProps) {
  return (
    <BottomSheet
      snapPoints={snapPoints}
      index={1}
      style={styles.bottomSheet}
      handleIndicatorStyle={styles.handle}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Points of Interest</Text>
        <Text style={styles.count}>{pois.length} places</Text>
      </View>
      
      <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
        {pois.map((poi) => (
          <TouchableOpacity
            key={`${poi.name}-${poi.latitude}-${poi.longitude}`}
            style={styles.poiItem}
            onPress={() => onSelectPoi(poi)}
          >
            <View style={styles.poiInfo}>
              <Text style={styles.poiName}>{poi.name}</Text>
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    color: '#666666',
  },
  scrollContent: {
    padding: 16,
  },
  poiItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  poiInfo: {
    flex: 1,
  },
  poiName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  poiCategory: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  poiDistrict: {
    fontSize: 14,
    color: '#999999',
  },
}); 