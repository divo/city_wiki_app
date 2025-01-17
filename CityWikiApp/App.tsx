import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapScreen from './screens/MapScreen';
import ExploreScreen from './screens/ExploreScreen';
import { CitySelect } from './components/CitySelect';
import { LocationService } from './services/LocationService';
import { PoiListSheet } from './components/PoiListSheet';
import { PointOfInterest } from './services/LocationService';
import { StorageService } from './services/StorageService';
import { PoiDetailSheet } from './components/PoiDetailSheet';
import { FavoritesProvider, useFavorites } from './contexts/FavoritesContext';
import { PoiListDetailView } from './components/PoiListDetailView';

type RootStackParamList = {
  CitySelect: undefined;
  CityGuide: {
    cityId: string;
    mapZoom: number;
    onMapStateChange: (center: [number, number], zoom: number) => void;
    headerTitle: string;
  };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator = ({ route, navigation }: any) => {
  const { cityId, mapZoom, onMapStateChange, headerTitle } = route.params;
  const locationService = LocationService.getInstance();
  const storageService = StorageService.getInstance();
  const centerCoordinates = locationService.getCenterCoordinates();
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null);
  const { favorites, loadFavorites } = useFavorites();

  // Load favorites when tab is focused
  useEffect(() => {
    loadFavorites(cityId);
  }, [cityId, loadFavorites]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Guide') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerTitle: headerTitle,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons 
              name="chevron-back" 
              size={28} 
              color="#007AFF" 
              style={{ marginLeft: 16 }}
            />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Guide">
        {() => (
          <ExploreScreen
            route={{ params: { mapZoom, cityId } }}
          />
        )}
      </Tab.Screen>

      {/* TODO: Have center point and zoom level be passed in as props, store in server */}
      <Tab.Screen name="Map">
        {() => (
          <MapScreen
            initialZoom={mapZoom}
            initialCenter={centerCoordinates}
            onMapStateChange={onMapStateChange}
            cityId={cityId}
          />
        )}
      </Tab.Screen>

      <Tab.Screen 
        name="Bookmarks" 
        options={{ tabBarLabel: 'Bookmarks' }}
      >
        {() => (
          <View style={styles.container}>
            <PoiListDetailView
              list={{
                title: 'Bookmarks',
                pois: favorites
              }}
              cityId={cityId}
            />
          </View>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default function App() {
  const [mapZoom, setMapZoom] = useState(12);

  const handleMapStateChange = (center: [number, number], zoom: number) => {
    setMapZoom(zoom);
  };

  const handleCitySelect = async (cityId: string) => {
    return Promise.resolve();
  };

  const handleClearCache = async () => {
    try {
      const locationService = LocationService.getInstance();
      await locationService.clearData();
      console.log('Successfully cleared cache');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FavoritesProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen 
              name="CitySelect" 
              options={{ headerShown: false }}
            >
              {() => (
                <View style={styles.container}>
                  <CitySelect onCitySelect={handleCitySelect} />
                  <TouchableOpacity 
                    style={styles.clearCacheButton}
                    onPress={handleClearCache}
                  >
                    <Text style={styles.clearCacheText}>Clear Cache</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="CityGuide"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </FavoritesProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  clearCacheButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearCacheText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
