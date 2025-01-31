import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
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
  id: 'Paris' | 'Rome' | 'San Francisco' | 'Tokyo';
  name: string;
  country: string;
  imageUrl: string;
  isOwned?: boolean;
}

const cityImages = {
  'paris_cover.png': require('../assets/paris_cover.png'),
  'rome_cover.png': require('../assets/rome_cover.png'),
  'san_francisco_cover.png': require('../assets/san_francisco_cover.png'),
  //'test.jpg': require('../assets/test.jpg'),
  'tokyo_cover.png': require('../assets/tokyo_cover.png'),
  'title_image.png': require('../assets/title_image.png'),
};

const cities: City[] = [
  {
    id: 'Paris',
    name: 'Paris',
    country: 'France',
    imageUrl: 'paris_cover.png',
  },
  {
    id: 'Rome',
    name: 'Rome',
    country: 'Italy',
    imageUrl: 'rome_cover.png',
  },
  {
    id: 'San Francisco',
    name: 'San Francisco',
    country: 'United States',
    imageUrl: 'san_francisco_cover.png',
  },
  {
    id: 'Tokyo',
    name: 'Tokyo',
    country: 'Japan',
    imageUrl: 'tokyo_cover.png',
  }
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_MARGIN = 8;
const TILE_WIDTH = (SCREEN_WIDTH - (TILE_MARGIN * 4)) / 2;
const TILE_HEIGHT = TILE_WIDTH * 1.5;

interface CitySelectProps {
  onCitySelect: (cityId: City['id']) => Promise<void>;
  useLocalData: boolean;
}

export function CitySelect({ onCitySelect, useLocalData }: CitySelectProps) {
  const navigation = useNavigation<CitySelectScreenNavigationProp>();
  const [loadingCity, setLoadingCity] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [ownedCities, setOwnedCities] = useState<string[]>([]);
  const [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_500Medium,
  });

  useEffect(() => {
    const loadOwnedCities = async () => {
      const owned = await StorageService.getInstance().getOwnedCities();
      setOwnedCities(owned);
    };
    loadOwnedCities();
  }, []);

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
      const city = { ...selectedCity, isOwned: true };
      await StorageService.getInstance().markCityAsOwned(city.id);
      setOwnedCities(prev => [...prev, city.id]);
      setSelectedCity(null);
      await handleCitySelect(city);
    }
  };

  const handleDismiss = () => {
    setSelectedCity(null);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.container}>
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
      </SafeAreaView>

      {selectedCity && (
        <PurchaseSheet
          city={selectedCity}
          onClose={handleDismiss}
          onPurchase={handlePurchase}
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
});
