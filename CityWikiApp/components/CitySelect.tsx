import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Modal, Animated } from 'react-native';
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
import { cities, City } from '../types/city';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';

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

const cityImages = {
  'paris_cover.png': require('../assets/paris_cover.png'),
  'rome_cover.png': require('../assets/rome_cover.png'),
  'san_francisco_cover.png': require('../assets/san_francisco_cover.png'),
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

const getRotationForCity = (cityName: string) => {
  // Cache the rotation values
  const rotationCache: { [key: string]: number } = {};
  
  if (rotationCache[cityName]) {
    return rotationCache[cityName];
  }
  
  const sum = cityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rotation = ((sum % 45) - 30);
  rotationCache[cityName] = rotation;
  return rotation;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_MARGIN = 8;
const TILE_WIDTH = (SCREEN_WIDTH - (TILE_MARGIN * 4)) / 2;
const TILE_HEIGHT = TILE_WIDTH * 1.5;

interface CitySelectProps {
  onCitySelect: (cityId: City['id']) => Promise<void>;
  useLocalData: boolean;
}

// Memoize the city tile component
const CityTile = React.memo(({ 
  city, 
  isOwned, 
  isLoading, 
  onPress, 
}: { 
  city: City; 
  isOwned: boolean; 
  isLoading: boolean; 
  onPress: () => void;
}) => {
  const stampScale = React.useRef(new Animated.Value(1)).current;
  const stampOpacity = React.useRef(new Animated.Value(0.95)).current;
  const prevIsOwnedRef = React.useRef(isOwned);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (isOwned && !prevIsOwnedRef.current) {
      setIsAnimating(true);
      stampOpacity.setValue(0);
      stampScale.setValue(10);
      
      const ANIMATION_DURATION = 400;
      
      Animated.parallel([
        Animated.timing(stampOpacity, {
          toValue: 0.95,
          duration: ANIMATION_DURATION - 20, // End opacity slightly earlier
          useNativeDriver: true,
        }),
        Animated.timing(stampScale, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();

      // Switch to static image slightly before animation ends
      setTimeout(() => {
        setIsAnimating(false);
      }, ANIMATION_DURATION - 16); // Roughly one frame before end (60fps ≈ 16.7ms)
    }
    
    prevIsOwnedRef.current = isOwned;
  }, [isOwned]);

  return (
    <TouchableOpacity
      style={styles.cityTile}
      onPress={onPress}
      disabled={isLoading}
    >
      <Image
        source={
          city.imageUrl.startsWith('http')
            ? { uri: city.imageUrl }
            : cityImages[city.imageUrl as keyof typeof cityImages]
        }
        style={[styles.cityImage, !isOwned && styles.unownedImage]}
        resizeMode="cover"
      />
      {!isOwned && <View style={styles.greyTint} />}
      {isOwned && isAnimating ? (
        <Animated.Image
          source={cityImages[`${city.id.toLowerCase().replace(/ /g, '_')}_stamp.png` as keyof typeof cityImages]}
          style={[
            styles.stampOverlay,
            {
              opacity: stampOpacity,
              transform: [
                { rotate: `${getRotationForCity(city.name)}deg` },
                { translateX: -5 },
                { translateY: 5 },
                { scale: stampScale }
              ]
            }
          ]}
          resizeMode="contain"
        />
      ) : isOwned ? (
        <Image
          source={cityImages[`${city.id.toLowerCase().replace(/ /g, '_')}_stamp.png` as keyof typeof cityImages]}
          style={[
            styles.stampOverlay,
            {
              opacity: 0.95,
              transform: [
                { rotate: `${getRotationForCity(city.name)}deg` },
                { translateX: -5 },
                { translateY: 5 }
              ]
            }
          ]}
          resizeMode="contain"
        />
      ) : null}
      <View style={styles.cityInfo}>
        <Text style={styles.countryName}>{city.country}</Text>
        <Text style={styles.cityName} numberOfLines={2}>
          {city.name.replace(' ', '\n')}
        </Text>
      </View>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
});

export function CitySelect({ onCitySelect, useLocalData }: CitySelectProps) {
  const navigation = useNavigation<CitySelectScreenNavigationProp>();
  const [loadingCity, setLoadingCity] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [ownedCities, setOwnedCities] = useState<string[]>([]);
  const [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_500Medium,
  });
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  useEffect(() => {
    const loadNewlyOwnedCities = async () => {
      const owned = await PurchaseStorage.getInstance().getOwnedCities();
      setOwnedCities(owned);
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
  }, []);

  const loadOwnedCities = async () => {
    const owned = await PurchaseStorage.getInstance().getOwnedCities();
    setOwnedCities(owned);
  };

  const handleCitySelect = useCallback(async (city: City) => {
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
  }, [ownedCities, useLocalData, onCitySelect, navigation]);

  const handlePurchase = async () => {
    if (selectedCity) {
      setSelectedCity(null);
    }
  };

  const renderCityTile = useCallback((city: City) => (
    <CityTile
      key={city.id}
      city={city}
      isOwned={ownedCities.includes(city.id)}
      isLoading={loadingCity === city.id}
      onPress={() => handleCitySelect(city)}
    />
  ), [ownedCities, loadingCity, handleCitySelect]);

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
          <TouchableOpacity
            onPress={() => setIsSettingsVisible(true)}
            style={styles.settingsButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={true}
        >
          <View style={styles.tilesContainer}>
            {cities.map(renderCityTile)}
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

      <Modal
        visible={isSettingsVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SettingsScreen onClose={() => setIsSettingsVisible(false)} />
      </Modal>
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
  settingsButton: {
    position: 'absolute',
    right: 16,
    top: 24,
    zIndex: 1,
  },
  stampOverlay: {
    position: 'absolute',
    top: '8%',
    right: '8%',
    width: '40%',
    height: '40%',
    opacity: 0.95,
  },
});
