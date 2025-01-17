import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { PointOfInterest } from '../services/LocationService';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Ionicons from '@expo/vector-icons/Ionicons';
import Mapbox from '@rnmapbox/maps';

interface PoiDetailSheetProps {
  poi: PointOfInterest | null;
  onClose: () => void;
}

export const PoiDetailSheet: React.FC<PoiDetailSheetProps> = ({ poi, onClose }) => {
  if (!poi) return null;

  const snapPoints = useMemo(() => ['25%', '75%', '90%'], []);

  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const handleShare = () => {
    // Implement share functionality
    console.log('Share pressed');
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
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{poi.name}</Text>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Ionicons name="share-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.category}>{poi.district} · {poi.category.charAt(0).toUpperCase() + poi.category.slice(1)}</Text>

            <Text style={styles.description}>{poi.description}</Text>

            {poi.image_url && (
              <Image
                source={{ uri: poi.image_url }}
                style={styles.image}
                resizeMode="cover"
              />
            )}

            <View style={styles.mapPreview} pointerEvents="none">
              <Mapbox.MapView
                style={styles.map}
                styleURL={Mapbox.StyleURL.Street}
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
            </View>

            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={20} color="#666" />
                <Text style={styles.detailText}>{poi.address}</Text>
              </View>

              {poi.phone && (
                <TouchableOpacity style={styles.detailRow} onPress={handlePhonePress}>
                  <Ionicons name="call-outline" size={20} color="#666" />
                  <Text style={styles.detailText}>{poi.phone}</Text>
                </TouchableOpacity>
              )}

              {poi.website && (
                <TouchableOpacity style={styles.detailRow} onPress={handleWebsitePress}>
                  <Ionicons name="globe-outline" size={20} color="#666" />
                  <Text style={[styles.detailText, styles.link]} numberOfLines={1}>{poi.website}</Text>
                </TouchableOpacity>
              )}

              {poi.hours && (
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.detailText}>{poi.hours}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.directionsButton} onPress={openMaps}>
              <Ionicons name="navigate-outline" size={20} color="#fff" />
              <Text style={styles.directionsButtonText}>Get directions</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

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
    fontSize: 16,
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
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
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
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0066CC',
    borderWidth: 2,
    borderColor: 'white',
  },
}); 