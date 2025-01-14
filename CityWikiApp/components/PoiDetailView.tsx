import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Mapbox from '@rnmapbox/maps';
import { DetailItem } from './DetailItem';
import { PointOfInterest } from '../services/LocationService';

interface POIDetailModalProps {
  onClose: () => void;
  onShare: () => void;
  poi: PointOfInterest;
}

export default function POIDetailModal({ onClose, onShare, poi }: POIDetailModalProps) {
  const [isSaved, setIsSaved] = React.useState(false);

  console.log('Rendering POI Detail Modal for:', poi.name);

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.handle} />
        <ScrollView 
          style={styles.scrollView} 
          bounces={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Point of Interest</Text>
            <TouchableOpacity onPress={onShare} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="share-outline" size={24} color="#333333" />
            </TouchableOpacity>
          </View>

          {/* Title Section */}
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
                color="#333333" 
              />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            {poi.description}
          </Text>

          {/* Map */}
          <View style={styles.mapContainer}>
            <Mapbox.MapView
              style={styles.map}
              styleURL={Mapbox.StyleURL.Street}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Mapbox.Camera
                zoomLevel={15}
                centerCoordinate={[poi.longitude, poi.latitude]}
                animationMode="none"
              />
              <Mapbox.PointAnnotation
                id={poi.name}
                coordinate={[poi.longitude, poi.latitude]}
              >
                <View style={styles.mapMarker} />
              </Mapbox.PointAnnotation>
            </Mapbox.MapView>
          </View>

          {/* Details */}
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

          {/* Get Directions Button */}
          <TouchableOpacity style={styles.directionsButton}>
            <Icon name="navigate-outline" size={20} color="white" style={styles.directionsIcon} />
            <Text style={styles.directionsText}>Get directions</Text>
          </TouchableOpacity>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </View>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
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
  },
  map: {
    flex: 1,
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

