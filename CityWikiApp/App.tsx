import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, View, TouchableOpacity, Text, StyleSheet, AppState, Alert } from 'react-native';
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
import * as amplitude from '@amplitude/analytics-react-native';
import { AppWriteService } from './services/AppWriteService';
import { AnalyticsService } from './services/AnalyticsService';
import { flush } from './services/AnalyticsService';

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

// Add memoized screen components at the top level
const MemoizedExploreScreen = React.memo(ExploreScreen);
const MemoizedMapScreen = React.memo(MapScreen);
const MemoizedPoiListDetailView = React.memo(PoiListDetailView);

// Memoize the BookmarksScreen component
const BookmarksScreen = React.memo(({ cityId, favorites }: { cityId: string; favorites: PointOfInterest[] }) => (
  <View style={styles.container}>
    <MemoizedPoiListDetailView
      list={{
        title: 'Bookmarks',
        pois: favorites
      }}
      cityId={cityId}
    />
  </View>
));

// Memoize TabNavigator
const TabNavigator = React.memo(({ route, navigation }: any) => {
  const { cityId, mapZoom, onMapStateChange, headerTitle } = route.params;
  const locationService = LocationService.getInstance();
  const storageService = StorageService.getInstance();
  const centerCoordinates = useMemo(() => locationService.getCenterCoordinates(), []);
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null);
  const { favorites, loadFavorites } = useFavorites();

  const screenOptions = useMemo(() => {
    return ({ route }: { route: any }) => ({
      tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
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
    });
  }, [navigation, headerTitle]);

  // Load favorites when tab is focused
  useEffect(() => {
    loadFavorites(cityId);
  }, [cityId, loadFavorites]);

  const renderGuideScreen = useCallback(() => (
    <MemoizedExploreScreen
      route={{ params: { mapZoom, cityId } }}
    />
  ), [mapZoom, cityId]);

  const renderMapScreen = useCallback(() => (
    <MemoizedMapScreen
      initialZoom={mapZoom}
      initialCenter={centerCoordinates}
      onMapStateChange={onMapStateChange}
      cityId={cityId}
    />
  ), [mapZoom, centerCoordinates, onMapStateChange, cityId]);

  const renderBookmarksScreen = useCallback(() => (
    <BookmarksScreen cityId={cityId} favorites={favorites} />
  ), [cityId, favorites]);

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Guide" component={renderGuideScreen} />
      <Tab.Screen name="Map" component={renderMapScreen} />
      <Tab.Screen 
        name="Bookmarks" 
        component={renderBookmarksScreen}
        options={{ tabBarLabel: 'Bookmarks' }}
      />
    </Tab.Navigator>
  );
});

type CitySelectScreenProps = {
  onCitySelect: (cityId: string) => Promise<void>;
  useLocalData: boolean;
  handleClearCache: () => void;
  toggleLocalData: () => void;
  showLanding: boolean;
};

// Memoize CitySelectScreen
const CitySelectScreen = React.memo(({ 
  onCitySelect, 
  useLocalData, 
  handleClearCache, 
  toggleLocalData, 
  showLanding 
}: CitySelectScreenProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  useEffect(() => {
    if (showLanding) {
      navigation.navigate('Landing');
    }
  }, [showLanding, navigation]);

  const debugButtons = __DEV__ ? (
    <View style={styles.debugButtonContainer}>
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
      <TouchableOpacity 
        style={styles.debugButton} 
        onPress={async () => {
          await flush();
          Alert.alert('Analytics', 'Events flushed');
        }}
      >
        <Text style={styles.debugButtonText}>Flush Analytics</Text>
      </TouchableOpacity>
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      <CitySelect 
        onCitySelect={onCitySelect} 
        useLocalData={useLocalData}
      />
      {debugButtons}
    </View>
  );
});

// Main App component with memoized callbacks and values
const App = () => {
  const [mapZoom, setMapZoom] = useState(12);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [useLocalData, setUseLocalData] = useState(true);
  const [showLanding, setShowLanding] = useState(false);

  const handleMapStateChange = useCallback((center: [number, number], zoom: number) => {
    setMapZoom(zoom);
  }, []);

  const handleCitySelect = useCallback(async (cityId: string) => {
    return Promise.resolve();
  }, []);

  const handleClearCache = useCallback(async () => {
    await AsyncStorage.clear();
    LocationService.getInstance().clearData();
    OfflineMapService.getInstance().clearData();
  }, []);

  const toggleLocalData = useCallback(() => {
    setUseLocalData(prev => !prev);
  }, []);

  const renderCitySelectScreen = useCallback(() => (
    <CitySelectScreen 
      onCitySelect={handleCitySelect}
      useLocalData={useLocalData}
      handleClearCache={handleClearCache}
      toggleLocalData={toggleLocalData}
      showLanding={showLanding}
    />
  ), [handleCitySelect, useLocalData, handleClearCache, toggleLocalData, showLanding]);

  const renderLandingScreen = useCallback((props: any) => (
    <LandingScreen onDismiss={() => props.navigation.goBack()} />
  ), []);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    const initializeAmplitude = async () => {
      try {
        const userId = await AppWriteService.getInstance().getUserId();
        await AnalyticsService.getInstance().initialize(userId);
      } catch (error) {
        console.error('Failed to initialize Amplitude:', error);
      }
    };

    initializeAmplitude();
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

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      await Location.getCurrentPositionAsync({});
    };

    getLocation();
  }, []);

  const checkFirstLaunch = useCallback(async () => {
    const isFirstLaunch = await StorageService.getInstance().checkFirstLaunch();
    setShowLanding(isFirstLaunch);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <FavoritesProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="CitySelect" component={renderCitySelectScreen} />
              <Stack.Screen name="CityGuide" component={TabNavigator} />
              <Stack.Screen
                name="Landing"
                component={renderLandingScreen}
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                  headerShown: false,
                  contentStyle: { backgroundColor: 'transparent' }
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </FavoritesProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

export default React.memo(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debugContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    gap: 8,
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
  debugButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    gap: 8,
    display: 'none',
  },
});
