import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { PointOfInterest } from '../services/LocationService';
import { getImageSource } from '../utils/imageUtils';

interface PoiList {
  title: string;
  pois: PointOfInterest[];
}

interface PoiListViewProps {
  title: string;
  pois: PoiList[];
  onSelectList?: (list: PoiList) => void;
}

// Used to display a carousel of PoiLists, a list of lists of POIs
export const PoiCollectionCarousel: React.FC<PoiListViewProps> = ({ title, pois, onSelectList }) => {
  const getListImage = (list: PoiList): string | null => {
    // Find the first POI with an image_url
    const poiWithImage = list.pois.find(poi => poi.image_url);
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
              style={styles.collectionItem}
              onPress={() => onSelectList?.(list)}
            >
              {imageUrl && (
                <Image
                  source={getImageSource(imageUrl)}
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
  collectionItem: {
    width: 260,
    height: 200,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
    marginVertical: 2,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  listImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  listContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  listCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    textShadowColor: 'black',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
  },
}); 