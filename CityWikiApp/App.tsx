import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, View, TouchableOpacity, Text, StyleSheet, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
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
import * as Location from "expo-location";
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LandingScreen } from './screens/LandingScreen';
import { colors } from './styles/globalStyles';
import { IAPService } from './services/IAPService';
import { OfflineMapService } from './services/OfflineMapService';
import * as FileSystem from 'expo-file-system';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const jsonFiles = [
  'assets/Paris/Paris.json',
];

async function resolveJsonAssets(fileList: string[]) {
  const resolvedAssets = [];

  for (const file of fileList) {
    try {
      // Resolve the asset and ensure it's available
      const asset = Asset.fromURI(FileSystem.documentDirectory + file);
      await asset.downloadAsync();

      // Push resolved asset details to the result
      resolvedAssets.push({
        file,
        localUri: asset.localUri, // File location in the filesystem
      });
    } catch (error) {
      console.error(`Error resolving JSON asset: ${file}`, error);
    }
  }

  return resolvedAssets;
}

resolveJsonAssets(jsonFiles).then((resolvedAssets) => {
  resolvedAssets.forEach(({ file, localUri }) => {
    console.log(`Resolved JSON asset: ${file}, located at: ${localUri}`);
  });
});

type RootStackParamList = {
  CitySelect: undefined;
  CityGuide: {
    cityId: string;
    mapZoom: number;
    onMapStateChange: (center: [number, number], zoom: number) => void;
    headerTitle: string;
  };
  Landing: undefined;
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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerTitle: headerTitle,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons 
              name="chevron-back" 
              size={28} 
              color={colors.primary}
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

type CitySelectScreenProps = {
  onCitySelect: (cityId: string) => Promise<void>;
  useLocalData: boolean;
  handleClearCache: () => void;
  toggleLocalData: () => void;
  showLanding: boolean;
};

const CitySelectScreen = ({ onCitySelect, useLocalData, handleClearCache, toggleLocalData, showLanding }: CitySelectScreenProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  useEffect(() => {
    if (showLanding) {
      navigation.navigate('Landing');
    }
  }, [showLanding, navigation]);

  return (
    <View style={styles.container}>
      <CitySelect 
        onCitySelect={onCitySelect} 
        useLocalData={useLocalData}
      />
      <View style={styles.debugContainer}>
        <TouchableOpacity 
          style={styles.debugButton} 
          onPress={handleClearCache}
        >
          <Text style={styles.debugButtonText}>Clear Cache</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.debugButton, useLocalData && styles.debugButtonActive]} 
          onPress={toggleLocalData}
        >
          <Text style={styles.debugButtonText}>Use Local Data</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.debugButton} 
          onPress={() => navigation.navigate('Landing')}
        >
          <Text style={styles.debugButtonText}>Show Landing</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function App() {
  const [mapZoom, setMapZoom] = useState(12);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [useLocalData, setUseLocalData] = useState(true);
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    const initializeIAP = async () => {
      try {
        await IAPService.getInstance().initialize();
      } catch (error) {
        console.error('Failed to initialize IAP:', error);
      }
    };

    initializeIAP();

    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        try {
          await IAPService.getInstance().endConnection();
        } catch (error) {
          console.error('Failed to end IAP connection:', error);
        }
      } else if (nextAppState === 'active') {
        try {
          await IAPService.getInstance().initialize();
        } catch (error) {
          console.error('Failed to reinitialize IAP:', error);
        }
      }
    });

    return () => {
      subscription.remove();
      IAPService.getInstance().endConnection().catch(error => {
        console.error('Failed to end IAP connection during cleanup:', error);
      });
    };
  }, []);

  const checkFirstLaunch = async () => {
    const isFirstLaunch = await StorageService.getInstance().checkFirstLaunch();
    setShowLanding(isFirstLaunch);
  };

  const handleMapStateChange = (center: [number, number], zoom: number) => {
    setMapZoom(zoom);
  };

  const handleCitySelect = async (cityId: string) => {
    return Promise.resolve();
  };

  const handleClearCache = useCallback(async () => {
    await AsyncStorage.clear();
    LocationService.getInstance().clearData();
    OfflineMapService.getInstance().clearData();
  }, []);

  const toggleLocalData = useCallback(() => {
    setUseLocalData(prev => !prev);
  }, []);

  useEffect(() => {
    const getLocation = async () => {
      // Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      // Get location
      await Location.getCurrentPositionAsync({});
    };

    getLocation();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <FavoritesProvider>
          <NavigationContainer>
            <Stack.Navigator 
              screenOptions={{ 
                headerShown: false,
              }}
            >
              <Stack.Screen name="CitySelect">
                {() => (
                  <CitySelectScreen 
                    onCitySelect={handleCitySelect}
                    useLocalData={useLocalData}
                    handleClearCache={handleClearCache}
                    toggleLocalData={toggleLocalData}
                    showLanding={showLanding}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="CityGuide"
                component={TabNavigator}
              />
              <Stack.Screen
                name="Landing"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                  headerShown: false,
                  contentStyle: { backgroundColor: 'transparent' }
                }}
              >
                {(props) => <LandingScreen onDismiss={() => props.navigation.goBack()} />}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
        </FavoritesProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debugContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    gap: 8,
    display: 'none',
  },
  debugButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  debugButtonActive: {
    backgroundColor: colors.primary,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 12,
  },
});
