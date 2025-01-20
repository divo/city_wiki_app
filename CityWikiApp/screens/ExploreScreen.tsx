import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, SafeAreaView, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Mapbox from '@rnmapbox/maps';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HighlightCard } from '../components/HighlightCard';
import { VenueHours } from '../components/VenueHours';
import { Ionicons } from '@expo/vector-icons';
import { LocationService, PointOfInterest } from '../services/LocationService';
import { PoiCollectionCarousel } from '../components/PoiCollectionCarousel';
import { PoiListDetailView } from '../components/PoiListDetailView';
import { PoiListCarousel } from '../components/PoiListCarousel';
import { PoiDetailSheet } from '../components/PoiDetailSheet';

interface ExploreScreenProps {
  route: {
    params: {
      mapZoom: number;
      cityId: string;
    };
  };
}

const ExploreScreen: React.FC<ExploreScreenProps> = ({ route }) => {
  const { mapZoom, cityId } = route.params;
  const placeholderCenter: [number, number] = [-122.4194, 37.7749];
  const [topPois, setTopPois] = useState<PointOfInterest[]>([]);
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [cityName, setCityName] = useState<string>('');
  const [cityAbout, setCityAbout] = useState<string>('');
  const [poiLists, setPoiLists] = useState<{ title: string; pois: PointOfInterest[] }[]>([]);
  const [selectedList, setSelectedList] = useState<{ title: string; pois: PointOfInterest[] } | null>(null);
  const [isListModalVisible, setIsListModalVisible] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationService = LocationService.getInstance();
        await locationService.loadLocations(cityId);
        // Get top ranked POIs
        const allPois = locationService.getPoisByCategory('all');
        const sortedPois = allPois.sort((a, b) => (a.rank || 999) - (b.rank || 999));
        setTopPois(sortedPois.slice(0, 3));
        
        // Get city info and set hero image
        const cityInfo = locationService.getCityInfo();
        if (cityInfo?.image_url) {
          setHeroImageUrl(cityInfo.image_url);
        }
        if (cityInfo?.name) {
          setCityName(cityInfo.name);
        }
        if (cityInfo?.about) {
          setCityAbout(cityInfo.about);
        }

        // Get POI lists
        const lists = locationService.getPoiLists();
        console.log('POI Lists:', JSON.stringify(lists, null, 2));
        setPoiLists(lists);
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    };

    loadLocations();
  }, [cityId]);

  const handlePoiSelect = (poi: PointOfInterest) => {
    setSelectedPoi(poi);
  };

  const handleShare = () => {
    console.log('Sharing POI:', selectedPoi?.name);
  };

  const handleListSelect = (list: { title: string; pois: PointOfInterest[] }) => {
    setSelectedList(list);
    setIsListModalVisible(true);
  };

  const mustSeeList = useMemo(() => {
    return poiLists.find(list => 
      list.title.toLowerCase() === 'must see'
    );
  }, [poiLists]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image with City Name Overlay */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: heroImageUrl || "" }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.cityNameOverlay}>{cityName}</Text>
          </View>
        </View>
        
        {/* Description */}
        <Text style={styles.description}>
          {cityAbout}
        </Text>

        {/* Must See/Highlights Section */}
        {mustSeeList && (
          <PoiListCarousel
            title={mustSeeList.title}
            pois={mustSeeList.pois}
            onSelectPoi={handlePoiSelect}
          />
        )}

        {/* POI Lists */}
        <PoiCollectionCarousel
          key="collections"
          title="Collections"
          pois={poiLists.filter(list => 
            list.title.toLowerCase() !== 'must see'
          )}
          onSelectList={handleListSelect}
        />

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        visible={isListModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <GestureHandlerRootView style={styles.container}>
          <PoiListDetailView
            list={selectedList}
            cityId={cityId}
            onSelectPoi={handlePoiSelect}
            onClose={() => setIsListModalVisible(false)}
          />
        </GestureHandlerRootView>
      </Modal>

      {selectedPoi && (
        <PoiDetailSheet 
          poi={selectedPoi} 
          onClose={() => setSelectedPoi(null)}
          cityId={cityId}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 32,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityNameOverlay: {
    color: 'white',
    fontSize: 36,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
    padding: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  highlightsContainer: {
    paddingRight: 16,
  },
  mapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  directionsButton: {
    backgroundColor: '#0066CC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
 

export default ExploreScreen;

