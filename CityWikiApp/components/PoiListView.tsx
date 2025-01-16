import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { PointOfInterest } from '../services/LocationService';

interface PoiList {
  title: string;
  pois: PointOfInterest[];
}

interface PoiListViewProps {
  title: string;
  pois: PoiList[];
  onSelectList?: (list: PoiList) => void;
}

export const PoiListView: React.FC<PoiListViewProps> = ({ title, pois, onSelectList }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {pois.map((list, index) => (
          <TouchableOpacity
            key={`${list.title}-${index}`}
            style={styles.listTile}
            onPress={() => onSelectList?.(list)}
          >
            <View style={styles.listContent}>
              <Text style={styles.listTitle} numberOfLines={2}>
                {list.title}
              </Text>
              <Text style={styles.listCount}>
                {list.pois.length} places
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  listTile: {
    width: 160,
    height: 100,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  listContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  listCount: {
    fontSize: 14,
    color: '#666666',
  },
}); 