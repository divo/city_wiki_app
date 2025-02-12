import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, SafeAreaView, TouchableOpacity, Modal, Platform, Dimensions } from 'react-native';
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
import { getImageSource } from '../utils/imageUtils';

interface ExploreScreenProps {
  route: {
    params: {
      mapZoom: number;
      cityId: string;
    };
  };
}

//const { height: screenHeight } = Dimensions.get('window');
//const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 65;
//const NAV_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

interface HeroSectionProps {
  heroImageUrl: string;
  cityName: string;
}

const HeroSection = React.memo(({ heroImageUrl, cityName }: HeroSectionProps) => (
  <View style={styles.heroContainer}>
    <Image
      source={getImageSource(heroImageUrl)}
      style={styles.heroImage}
      resizeMode="cover"
    />
    <View style={styles.heroOverlay}>
      <Text style={styles.cityNameOverlay}>{cityName}</Text>
    </View>
  </View>
));

interface AboutSectionProps {
  cityAbout: string;
}

const AboutSection = React.memo(({ cityAbout }: AboutSectionProps) => (
  <Text style={styles.description}>
    {cityAbout}
  </Text>
));

interface ListModalProps {
  isVisible: boolean;
  selectedList: { title: string; pois: PointOfInterest[] } | null;
  cityId: string;
  onClose: () => void;
}

const ListModal = React.memo(({ isVisible, selectedList, cityId, onClose }: ListModalProps) => (
  <Modal
    visible={isVisible}
    animationType="slide"
    presentationStyle="fullScreen"
  >
    <GestureHandlerRootView style={styles.container}>
      <PoiListDetailView
        list={selectedList}
        cityId={cityId}
        onClose={onClose}
      />
    </GestureHandlerRootView>
  </Modal>
));

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
        setPoiLists(lists);
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    };

    loadLocations();
  }, [cityId]);

  const handlePoiSelect = useCallback((poi: PointOfInterest) => {
    setSelectedPoi(poi);
  }, []);

  const handleShare = useCallback(() => {
    console.log('Sharing POI:', selectedPoi?.name);
  }, [selectedPoi?.name]);

  const handleListSelect = useCallback((list: { title: string; pois: PointOfInterest[] }) => {
    setSelectedList(list);
    setIsListModalVisible(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsListModalVisible(false);
  }, []);

  const mustSeeList = useMemo(() => {
    return poiLists.find(list => 
      list.title.toLowerCase() === 'must see'
    );
  }, [poiLists]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <HeroSection heroImageUrl={heroImageUrl} cityName={cityName} />
        <AboutSection cityAbout={cityAbout} />

        {mustSeeList && (
          <PoiListCarousel
            title={mustSeeList.title}
            pois={mustSeeList.pois}
            onSelectPoi={handlePoiSelect}
            onViewAll={() => handleListSelect(mustSeeList)}
          />
        )}

        <PoiCollectionCarousel
          key="collections"
          title="Collections"
          pois={poiLists.filter(list => 
            list.title.toLowerCase() !== 'must see'
          )}
          onSelectList={handleListSelect}
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <ListModal
        isVisible={isListModalVisible}
        selectedList={selectedList}
        cityId={cityId}
        onClose={handleModalClose}
      />

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
    //height: screenHeight - TAB_BAR_HEIGHT - NAV_BAR_HEIGHT,
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
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  cityNameOverlay: {
    color: 'white',
    fontSize: 78,
    fontWeight: '700',
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
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
 

export default React.memo(ExploreScreen);

