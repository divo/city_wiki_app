import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ListRenderItem } from 'react-native';
import { PointOfInterest } from '../services/LocationService';
import Icon from 'react-native-vector-icons/Ionicons';
import { getImageSource } from '../utils/imageUtils';
import { colors } from '../styles/globalStyles';

interface PoiListCarouselProps {
  title: string;
  pois: PointOfInterest[];
  onSelectPoi: (poi: PointOfInterest) => void;
  onViewAll?: () => void;
}

// Displays a carousel of POIs, a single list where each POI is displayed in a card
const PoiListCarouselBase = ({ title, pois, onSelectPoi, onViewAll }: PoiListCarouselProps) => {
  const ITEM_WIDTH = 204; // width 200 + horizontal margins 2 * 2

  const renderItem: ListRenderItem<PointOfInterest> = React.useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.poiItem}
      onPress={() => onSelectPoi(item)}
    >
      <Image 
        source={getImageSource(item.image_url)}
        style={styles.poiImage}
        resizeMode="cover"
      />
      <View style={styles.poiInfo}>
        <Text style={styles.poiSubcategory}>
          {item.sub_category || item.category}
        </Text>
        <Text style={styles.poiName} numberOfLines={2}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  ), [onSelectPoi]);

  const getItemLayout = React.useCallback((data: ArrayLike<PointOfInterest> | null | undefined, index: number) => ({
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
    index,
  }), [ITEM_WIDTH]);

  const keyExtractor = React.useCallback((item: PointOfInterest) => 
    `${item.name}-${item.latitude}-${item.longitude}`, []);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAllButton}>Show Map</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={pois}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        getItemLayout={getItemLayout}
      />
    </View>
  );
}

export const PoiListCarousel = React.memo(PoiListCarouselBase);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
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
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
    marginVertical: 2,
    marginHorizontal: 2,
    borderRadius: 2,
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
  viewAllButton: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
}); 