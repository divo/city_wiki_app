import React, { useState } from 'react';
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
}

const cityImages = {
  'paris_cover.png': require('../assets/paris_cover.png'),
  'rome_cover.png': require('../assets/rome_cover.png'),
  'san_francisco_cover.png': require('../assets/san_francisco_cover.png'),
  //'test.jpg': require('../assets/test.jpg'),
  'tokyo_cover.png': require('../assets/tokyo_cover.png'),
};

const cities: City[] = [
  {
    id: 'Paris',
    name: 'Paris',
    country: 'France',
    imageUrl: 'paris_cover.png'
  },
  {
    id: 'Rome',
    name: 'Rome',
    country: 'Italy',
    imageUrl: 'rome_cover.png'
  },
  {
    id: 'San Francisco',
    name: 'San Francisco',
    country: 'United States',
    imageUrl: 'san_francisco_cover.png'
  },
  {
    id: 'Tokyo',
    name: 'Tokyo',
    country: 'Japan',
    imageUrl: 'tokyo_cover.png'
  }
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_MARGIN = 8;
const TILE_WIDTH = (SCREEN_WIDTH - (TILE_MARGIN * 4)) / 2;
const TILE_HEIGHT = TILE_WIDTH * 1.5;

interface CitySelectProps {
  onCitySelect: (cityId: string) => Promise<void>;
  useLocalData: boolean;
}

export function CitySelect({ onCitySelect, useLocalData }: CitySelectProps) {
  const navigation = useNavigation<CitySelectScreenNavigationProp>();
  const [loadingCity, setLoadingCity] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleCitySelect = async (cityId: string) => {
    try {
      setLoadingCity(cityId);
      const locationService = LocationService.getInstance();
      
      if (useLocalData) {
        await locationService.loadLocationFromAssets(cityId);
      } else {
        await locationService.loadLocations(cityId);
      }
      
      await onCitySelect(cityId);
      
      const cityInfo = locationService.getCityInfo();
      const centerCoords = locationService.getCenterCoordinates();
      
      navigation.navigate('CityGuide', {
        cityId,
        mapZoom: 12,
        onMapStateChange: () => {}, // This will be overridden by App.tsx
        headerTitle: cityInfo?.name || cityId,
      });
    } catch (error) {
      console.error('Error loading city data:', error);
    } finally {
      setLoadingCity(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>City Guides</Text>
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
              onPress={() => handleCitySelect(city.id)}
              disabled={loadingCity !== null}
            >
              <Image
                source={
                  city.imageUrl.startsWith('http')
                    ? { uri: city.imageUrl }
                    : cityImages[city.imageUrl as keyof typeof cityImages]
                }
                style={styles.cityImage}
              />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#333333',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
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
  },
  cityImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
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
