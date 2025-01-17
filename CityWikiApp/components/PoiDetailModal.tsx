import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Linking, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Mapbox from '@rnmapbox/maps';
import { DetailItem } from './DetailItem';
import { PointOfInterest } from '../services/LocationService';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';

interface POIDetailModalProps {
  onClose: () => void;
  onShare: () => void;
  poi: PointOfInterest;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.7;
const MIN_TRANSLATE_Y = -SCREEN_HEIGHT * 0.4;
const DISMISS_THRESHOLD = -SCREEN_HEIGHT * 0.3;

// View used to display a POI's details
export default function POIDetailModal({ onClose, onShare, poi }: POIDetailModalProps) {
  const [isSaved, setIsSaved] = React.useState(false);
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

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

  useEffect(() => {
    // Animate the modal in when it mounts
    translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
  }, []);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
    })
    .onEnd((event) => {
      if (translateY.value > DISMISS_THRESHOLD) {
        translateY.value = withSpring(0, { damping: 50 });
        runOnJS(onClose)();
      } else {
        const shouldSnap = event.velocityY > 0;
        if (shouldSnap) {
          translateY.value = withSpring(MIN_TRANSLATE_Y, { damping: 50 });
        } else {
          translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
        }
      }
    });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    const translateStyle = {
      transform: [{ translateY: translateY.value }]
    };
    return translateStyle;
  });

  return (
    <View style={styles.overlay}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.modalContainer, rBottomSheetStyle]}>
          <View style={styles.handle} />
          <ScrollView 
            style={styles.scrollView} 
            bounces={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Rest of your content stays the same */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon name="arrow-back" size={24} color="#333333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Point of Interest</Text>
              <TouchableOpacity onPress={onShare} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon name="share-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <View style={styles.titleSection}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{poi.name}</Text>
                <Text style={styles.subtitle}>{poi.sub_category} · {poi.district}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setIsSaved(!isSaved)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon 
                  name={isSaved ? "bookmark" : "bookmark-outline"} 
                  size={24} 
                  color="#FF3B30" 
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.description}>
              {poi.description}
            </Text>

            <View style={styles.mapContainer} pointerEvents="none">
              <Mapbox.MapView
                style={styles.map}
                styleURL={Mapbox.StyleURL.Street}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                attributionEnabled={false}
                logoEnabled={false}
                compassEnabled={false}
              >
                <Mapbox.Camera
                  zoomLevel={15}
                  centerCoordinate={[poi.longitude, poi.latitude]}
                  animationMode="flyTo"
                  animationDuration={0}
                />
                <Mapbox.PointAnnotation
                  id={poi.name}
                  coordinate={[poi.longitude, poi.latitude]}
                >
                  <View style={styles.mapMarker} />
                </Mapbox.PointAnnotation>
              </Mapbox.MapView>
            </View>

            <View style={styles.details}>
              <DetailItem
                icon="location"
                text={poi.address}
              />
              {poi.phone && (
                <DetailItem
                  icon="call"
                  text={poi.phone}
                />
              )}
              {poi.website && (
                <DetailItem
                  icon="globe"
                  text={poi.website}
                />
              )}
              {poi.hours && (
                <DetailItem
                  icon="time"
                  text="Open today"
                />
              )}
            </View>

            <TouchableOpacity style={styles.directionsButton} onPress={openMaps}>
              <Icon name="navigate-outline" size={20} color="white" style={styles.directionsIcon} />
              <Text style={styles.directionsText}>Get directions</Text>
            </TouchableOpacity>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT * 0.8,
    width: '100%',
    position: 'absolute',
    bottom: -SCREEN_HEIGHT * 0.8,
    paddingTop: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDDDDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  mapContainer: {
    height: 180,
    marginTop: 16,
    backgroundColor: 'white',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  mapMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0066CC',
    borderWidth: 2,
    borderColor: 'white',
  },
  details: {
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: 'white',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  directionsIcon: {
    marginRight: 8,
  },
  directionsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 24,
  },
});

