import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
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
  const getListImage = (list: PoiList): string | null => {
    // Find the first POI with an image_url
    const poiWithImage = list.pois.find(poi => poi.image_url);
    console.log('poiWithImage', poiWithImage?.image_url);
    return poiWithImage?.image_url || null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {pois.map((list, index) => {
          const imageUrl = getListImage(list);
          return (
            <TouchableOpacity
              key={`${list.title}-${index}`}
              style={styles.listTile}
              onPress={() => onSelectList?.(list)}
            >
              {imageUrl && (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.listImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.listContent}>
                <Text style={styles.listTitle} numberOfLines={2}>
                  {list.title}
                </Text>
                <Text style={styles.listCount}>
                  {list.pois.length} places
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
  listImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  listContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  listCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
}); 