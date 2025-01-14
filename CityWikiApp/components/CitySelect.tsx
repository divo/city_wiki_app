import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SearchBar } from './SearchBar';
import { 
  useFonts,
  Montserrat_600SemiBold,
  Montserrat_500Medium,
} from '@expo-google-fonts/montserrat';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  CitySelect: undefined;
  CityGuide: {
    cityId: string;
    mapCenter: [number, number];
    mapZoom: number;
    onMapStateChange: (center: [number, number], zoom: number) => void;
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
  'tokyo_cover.png': require('../assets/tokyo_cover.png'),
};

const cities: City[] = [
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    imageUrl: 'paris_cover.png'
  },
  {
    id: 'rm',
    name: 'Rome',
    country: 'Italy',
    imageUrl: 'rome_cover.png'
  },
  {
    id: 'sf',
    name: 'San Francisco',
    country: 'United States',
    imageUrl: 'san_francisco_cover.png'
  },
  {
    id: 'tk',
    name: 'Tokyo',
    country: 'Japan',
    imageUrl: 'tokyo_cover.png'
  }
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_MARGIN = 8;
const TILE_WIDTH = (SCREEN_WIDTH - (TILE_MARGIN * 4)) / 2; // 2 tiles per row with margins
const TILE_HEIGHT = TILE_WIDTH * 1.5; // 2:3 aspect ratio

export function CitySelect() {
  const navigation = useNavigation<CitySelectScreenNavigationProp>();
  const [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleCitySelect = (cityId: string) => {
    navigation.navigate('CityGuide', {
      cityId,
      mapCenter: [-122.4194, 37.7749], // San Francisco coordinates
      mapZoom: 12,
      onMapStateChange: () => {}, // This will be overridden by the actual handler in App.tsx
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>City Guides</Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar />
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#333333',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
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
    padding: 12,
    paddingBottom: 16,
  },
  cityName: {
    fontSize: 32,
    fontFamily: 'Montserrat_600SemiBold',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  countryName: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    color: 'rgba(255, 255, 255, 0.95)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});