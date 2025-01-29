import React, { useCallback, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Platform, Animated } from 'react-native';
import { PointOfInterest } from '../services/LocationService';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import { useFavorites } from '../contexts/FavoritesContext';
import { MAP_STYLE_URL } from '../screens/MapScreen';
import { getImageSource } from '../utils/imageUtils';
import { LinearGradient } from 'expo-linear-gradient';

interface PoiDetailSheetProps {
  poi: PointOfInterest | null;
  onClose: () => void;
  cityId: string;
}

export function PoiDetailSheet({ poi, onClose, cityId }: PoiDetailSheetProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [localBookmarked, setLocalBookmarked] = useState<boolean | null>(null);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  if (!poi) return null;

  const snapPoints = useMemo(() => ['25%', '75%', '90%'], []);

  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const isBookmarked = localBookmarked ?? isFavorite(poi);

  const handleSave = () => {
    const newState = !isBookmarked;
    setLocalBookmarked(newState);
    if (newState) {
      addFavorite(cityId, poi);
    } else {
      removeFavorite(cityId, poi);
    }
  };

  const openMaps = () => {
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' }) ?? 'maps:';
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(poi.name)}@${poi.latitude},${poi.longitude}`,
      android: `geo:0,0?q=${poi.latitude},${poi.longitude}(${encodeURIComponent(poi.name)})`
    }) ?? `maps:0,0?q=${encodeURIComponent(poi.name)}@${poi.latitude},${poi.longitude}`;

    Linking.canOpenURL(scheme).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };

  const handleWebsitePress = () => {
    if (poi.website) {
      Linking.openURL(poi.website);
    }
  };

  const handlePhonePress = () => {
    if (poi.phone) {
      Linking.openURL(`tel:${poi.phone}`);
    }
  };

  const toggleDescription = () => {
    setIsTextExpanded(!isTextExpanded);
    Animated.spring(animatedHeight, {
      toValue: isTextExpanded ? 0 : 1,
      useNativeDriver: false,
      friction: 10,
      tension: 40
    }).start();
  };

  return (
    <View style={styles.container}>
      <BottomSheet
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        enablePanDownToClose
        index={1}
        handleIndicatorStyle={styles.handle}
        style={styles.bottomSheet}
      >
        <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{poi.name}</Text>
            <TouchableOpacity onPress={handleSave} style={styles.shareButton}>
              <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isBookmarked ? "#007AFF" : "#000"} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={[styles.category, { textAlign: 'center' }]}>
              {poi.category.charAt(0).toUpperCase() + poi.category.slice(1)} · {poi.district}
            </Text>
            
            <View style={styles.descriptionContainer}>
              <Animated.View style={{
                maxHeight: animatedHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [150, 1000]
                }),
                overflow: 'hidden'
              }}>
                <Text style={styles.description}>
                  {poi.description}
                </Text>
              </Animated.View>

              {!isTextExpanded && poi.description.length > 200 && (
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']}
                  style={styles.gradient}
                  pointerEvents="none"
                />
              )}

              {poi.description.length > 200 && (
                <TouchableOpacity 
                  style={styles.expandButton}
                  onPress={toggleDescription}
                >
                  <Text style={styles.expandButtonText}>
                    {isTextExpanded ? 'Show Less' : 'Read More'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {poi.image_url && (
              <Image
                source={getImageSource(poi.image_url)}
                style={styles.image}
                resizeMode="cover"
              />
            )}

            <TouchableOpacity 
              style={styles.mapPreview} 
              onPress={openMaps}
              activeOpacity={0.9}
            >
              <Mapbox.MapView
                style={styles.map}
                styleURL={MAP_STYLE_URL}
                scrollEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                zoomEnabled={false}
                attributionEnabled={false}
                logoEnabled={false}
                compassEnabled={false}
              >
                <Mapbox.Camera
                  defaultSettings={{
                    centerCoordinate: [Number(poi.longitude), Number(poi.latitude)],
                    zoomLevel: 14,
                  }}
                />
                <Mapbox.PointAnnotation
                  id={poi.name}
                  coordinate={[poi.longitude, poi.latitude]}
                >
                  <View style={styles.mapMarker} />
                </Mapbox.PointAnnotation>
              </Mapbox.MapView>
              
              <View style={styles.mapOverlay}>
                <View style={styles.mapOverlayContent}>
                  <Ionicons name="navigate-outline" size={20} color="#fff" />
                  <Text style={styles.mapOverlayText}>Open in Maps</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.detailsSection}>
              <View>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <Text style={styles.detailText}>{poi.address}</Text>
                </View>
                <View style={styles.divider} />
              </View>

              {poi.phone && (
                <View>
                  <TouchableOpacity style={styles.detailRow} onPress={handlePhonePress}>
                    <Ionicons name="call-outline" size={20} color="#666" />
                    <Text style={styles.detailText}>{poi.phone}</Text>
                  </TouchableOpacity>
                  <View style={styles.divider} />
                </View>
              )}

              {poi.website && (
                <View>
                  <TouchableOpacity style={styles.detailRow} onPress={handleWebsitePress}>
                    <Ionicons name="globe-outline" size={20} color="#666" />
                    <Text style={[styles.detailText, styles.link]} numberOfLines={1}>{poi.website}</Text>
                  </TouchableOpacity>
                  <View style={styles.divider} />
                </View>
              )}

              {poi.hours && (
                <View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <Text style={styles.detailText}>{poi.hours}</Text>
                  </View>
                  <View style={styles.divider} />
                </View>
              )}
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 999,
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
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  backButton: {
    padding: 4,
  },
  shareButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  category: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 16,
  },
  mapPreview: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  detailsSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  detailText: {
    fontSize: 15,
    color: '#333333',
    marginLeft: 12,
    flex: 1,
  },
  link: {
    color: '#007AFF',
  },
  directionsButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mapMarker: {
    width: 16,
    height: 16,
    borderRadius: 10,
    backgroundColor: '#0066CC',
    borderWidth: 2,
    borderColor: 'white',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginLeft: 32,
  },
  expandButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  expandButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '500',
  },
  descriptionContainer: {
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapOverlayContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapOverlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
}); 