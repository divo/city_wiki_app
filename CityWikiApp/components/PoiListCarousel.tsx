import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { PointOfInterest } from '../services/LocationService';
import Icon from 'react-native-vector-icons/Ionicons';

interface PoiListFullViewProps {
  title: string;
  pois: PointOfInterest[];
  onSelectPoi: (poi: PointOfInterest) => void;
}

// Displays a carousel of POIs, a single list where each POI is displayed in a card
export const PoiListCarousel: React.FC<PoiListFullViewProps> = ({
  title,
  pois,
  onSelectPoi,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {pois.map((poi) => (
          <TouchableOpacity
            key={`${poi.name}-${poi.latitude}-${poi.longitude}`}
            style={styles.poiItem}
            onPress={() => onSelectPoi(poi)}
          >
            <Image 
              source={{ uri: poi.image_url }} 
              style={styles.poiImage}
              resizeMode="cover"
            />
            <View style={styles.poiInfo}>
              <Text style={styles.poiSubcategory}>
                {poi.sub_category || poi.category}
              </Text>
              <Text style={styles.poiName} numberOfLines={2}>
                {poi.name}
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
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  poiItem: {
    width: 200,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  poiImage: {
    width: '100%',
    height: 133,
  },
  poiInfo: {
    padding: 12,
  },
  poiSubcategory: {
    fontSize: 13,
    color: '#666666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  poiName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    lineHeight: 20,
  },
}); 