import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Animated } from 'react-native';
import { SearchBar } from './SearchBar';
import { 
  useFonts,
  Montserrat_600SemiBold,
  Montserrat_500Medium,
} from '@expo-google-fonts/montserrat';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LocationService } from '../services/LocationService';
import { StorageService } from '../services/StorageService';
import { PurchaseStorage } from '../services/PurchaseStorage';
import { PurchaseSheet } from './PurchaseSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

type RootStackParamList = {
  CitySelect: undefined;
  CityGuide: {
    cityId: string;
    mapZoom: number;
    onMapStateChange: (center: [number, number], zoom: number) => void;
    headerTitle: string;
  };
};

type CitySelectScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CitySelect'>;

interface City {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
  isOwned?: boolean;
  iap_id: string;
}

const cityImages = {
  'paris_cover.png': require('../assets/paris_cover.png'),
  'rome_cover.png': require('../assets/rome_cover.png'),
  'san_francisco_cover.png': require('../assets/san_francisco_cover.png'),
  //'test.jpg': require('../assets/test.jpg'),
  'tokyo_cover.png': require('../assets/tokyo_cover.png'),
  'title_image.png': require('../assets/title_image.png'),
  'paris_stamp.png': require('../assets/paris_stamp.png'),
  'rome_stamp.png': require('../assets/rome_stamp.png'),
  'san_francisco_stamp.png': require('../assets/san_francisco_stamp.png'),
  'tokyo_stamp.png': require('../assets/tokyo_stamp.png'),
  'new_york_city_cover.png': require('../assets/new_york_city_cover.png'),
  'london_cover.png': require('../assets/london_cover.png'),
  'new_york_city_stamp.png': require('../assets/new_york_city_stamp.png'),
  'london_stamp.png': require('../assets/london_stamp.png'),
};

const cities: City[] = [
  {
    id: 'London',
    name: 'London',
    country: 'United Kingdom',
    imageUrl: 'london_cover.png',
    iap_id: 'com.halfspud.CityWikiApp.london',
  },
  {
    id: 'New York City',
    name: 'New York City',
    country: 'United States',
    imageUrl: 'new_york_city_cover.png',
    iap_id: 'com.halfspud.CityWikiApp.newyork',
  },
  {
    id: 'Paris',
    name: 'Paris',
    country: 'France',
    imageUrl: 'paris_cover.png',
    iap_id: 'com.halfspud.CityWikiApp.paris',
  },
  {
    id: 'Rome',
    name: 'Rome',
    country: 'Italy',
    imageUrl: 'rome_cover.png',
    iap_id: 'com.halfspud.CityWikiApp.rome',
  }
];

const getRotationForCity = (cityName: string) => {
  // Sum the character codes to get a deterministic number
  const sum = cityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // Use modulo to get an angle between -20 and 20 degrees
  return ((sum % 41) - 30);
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_MARGIN = 8;
const TILE_WIDTH = (SCREEN_WIDTH - (TILE_MARGIN * 4)) / 2;
const TILE_HEIGHT = TILE_WIDTH * 1.5;

interface CitySelectProps {
  onCitySelect: (cityId: City['id']) => Promise<void>;
  useLocalData: boolean;
}

interface AnimatedStampProps {
  cityId: string;
  rotation: number;
  onAnimationComplete: () => void;
  isStatic?: boolean;
}

const AnimatedStamp = ({ cityId, rotation, onAnimationComplete, isStatic }: AnimatedStampProps) => {
  const scale = useRef(new Animated.Value(isStatic ? 1 : 8)).current;
  const opacity = useRef(new Animated.Value(isStatic ? 1 : 0)).current;

  useEffect(() => {
    if (!isStatic) {
      Animated.sequence([
        // Initial delay
        Animated.delay(200),
        // Make stamp visible with a fade in
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100, // Short fade in
          useNativeDriver: true,
        }),
        // Then animate the scale with a spring effect
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start(() => {
        onAnimationComplete();
      });
    }
  }, []);

  return (
    <Animated.Image
      source={cityImages[`${cityId.toLowerCase().replace(/ /g, '_')}_stamp.png` as keyof typeof cityImages]}
      style={[
        styles.stampOverlay,
        {
          transform: [
            { scale },
            { rotate: `${rotation}deg` },
            { translateX: -5 },
            { translateY: 5 }
          ],
          opacity,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.5,
          shadowRadius: 3.84,
        }
      ]}
      resizeMode="contain"
    />
  );
};

export function CitySelect({ onCitySelect, useLocalData }: CitySelectProps) {
  const navigation = useNavigation<CitySelectScreenNavigationProp>();
  const [loadingCity, setLoadingCity] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [ownedCities, setOwnedCities] = useState<string[]>([]);
  const [animatingCities, setAnimatingCities] = useState<{[key: string]: boolean}>({});
  const [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_500Medium,
  });

  useEffect(() => {
    const loadNewlyOwnedCities = async () => {
      const owned = await PurchaseStorage.getInstance().getOwnedCities();
      const newCities = owned.filter(cityId => !ownedCities.includes(cityId));
      setOwnedCities(owned);
      // Trigger animation for newly owned cities
      newCities.forEach(cityId => {
        setAnimatingCities(prev => ({ ...prev, [cityId]: true }));
      });
    };  
    
    // Load initial state
    loadOwnedCities();

    // Listen for changes
    const purchaseStorage = PurchaseStorage.getInstance();
    purchaseStorage.addChangeListener(loadNewlyOwnedCities);

    // Cleanup
    return () => {
      purchaseStorage.removeChangeListener(loadNewlyOwnedCities);
    };
  }, [ownedCities]);

  const loadOwnedCities = async () => {
    const owned = await PurchaseStorage.getInstance().getOwnedCities();
    const newCities = owned.filter(cityId => !ownedCities.includes(cityId));
    setOwnedCities(owned);
  };

  const handleCitySelect = async (city: City) => {
    const isOwned = ownedCities.includes(city.id);
    if (!isOwned && !city.isOwned) {
      setSelectedCity(city);
      return;
    }

    try {
      setLoadingCity(city.id);
      const locationService = LocationService.getInstance();
      
      if (useLocalData) {
        await locationService.loadLocationFromAssets(city.id);
      } else {
        await locationService.loadLocations(city.id);
      }
      
      await onCitySelect(city.id);
      
      const cityInfo = locationService.getCityInfo();
      const centerCoords = locationService.getCenterCoordinates();
      
      navigation.navigate('CityGuide', {
        cityId: city.id,
        mapZoom: 12,
        onMapStateChange: () => {},
        headerTitle: cityInfo?.name || city.id,
      });
    } catch (error) {
      console.error('Error loading city data:', error);
    } finally {
      setLoadingCity(null);
    }
  };

  const handlePurchase = async () => {
    if (selectedCity) {
      setSelectedCity(null);
    }
  };

  const handleAnimationComplete = (cityId: string) => {
    setAnimatingCities(prev => {
      const next = { ...prev };
      delete next[cityId];
      return next;
    });
    setSelectedCity(null);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <SafeAreaView style={styles.topSafeArea} />
        <View style={styles.header}>
          <Image 
            source={cityImages['title_image.png']}
            style={styles.titleImage}
            resizeMode="contain"
          />
          <View style={styles.titleOverlay}>
            <Text style={styles.titleText}>City Wandr</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.tilesContainer}>
            {cities.map(city => (
              <TouchableOpacity
                key={city.id}
                style={styles.cityTile}
                onPress={() => handleCitySelect(city)}
                disabled={loadingCity !== null}
              >
                <Image
                  source={
                    city.imageUrl.startsWith('http')
                      ? { uri: city.imageUrl }
                      : cityImages[city.imageUrl as keyof typeof cityImages]
                  }
                  style={[styles.cityImage, !ownedCities.includes(city.id) && styles.unownedImage]}
                  resizeMode="cover"
                />
                {!ownedCities.includes(city.id) && <View style={styles.greyTint} />}
                {ownedCities.includes(city.id) && (
                  <AnimatedStamp
                    cityId={city.id}
                    rotation={getRotationForCity(city.name)}
                    onAnimationComplete={() => handleAnimationComplete(city.id)}
                    isStatic={!animatingCities[city.id]}
                  />
                )}
                <View style={styles.cityInfo}>
                  <Text style={styles.countryName}>{city.country}</Text>
                  <Text style={styles.cityName} numberOfLines={2}>
                    {city.name.replace(' ', '\n')}
                  </Text>
                </View>
                {loadingCity === city.id && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <SafeAreaView style={styles.bottomSafeArea} />
      </View>

      {selectedCity && (
        <PurchaseSheet
          city={selectedCity}
          onClose={() => setSelectedCity(null)}
          onPurchase={handlePurchase}
          ownedCities={ownedCities}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#88A9AA',
  },
  container: {
    flex: 1,
  },
  topSafeArea: {
    flex: 0,
    backgroundColor: '#88A9AA',
  },
  bottomSafeArea: {
    flex: 0,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 0,
    height: 60,
    backgroundColor: '#88A9AA',
    position: 'relative',
  },
  titleImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  titleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'Montserrat_600SemiBold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: 'white',
  },
  scrollContent: {
    padding: TILE_MARGIN,
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cityTile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    marginBottom: TILE_MARGIN * 2,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  cityImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  unownedImage: {
    transform: [{ scale: 0.95 }],
  },
  greyTint: {
    position: 'absolute',
    top: '2.5%',
    left: '2.5%',
    right: '2.5%',
    bottom: '2.5%',
    backgroundColor: 'rgba(180, 180, 180, 0.4)',
  },
  cityInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  countryName: {
    fontSize: 16,
    fontFamily: 'Montserrat_500SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cityName: {
    fontSize: 28,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampOverlay: {
    position: 'absolute',
    top: '8%',
    right: '8%',
    width: '40%',
    height: '40%',
    opacity: 0.95,
    transform: [
      { scale: 1.1 },
      { translateX: -5 },
      { translateY: 5 },
    ],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
