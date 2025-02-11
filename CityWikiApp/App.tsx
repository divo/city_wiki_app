import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { NavigationContainer, useNavigation, useRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
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

// Type definitions
type RootStackParamList = {
  CitySelect: {
    onCitySelect: (cityId: string) => Promise<void>;
    useLocalData: boolean;
    handleClearCache: () => void;
    toggleLocalData: () => void;
    showLanding: boolean;
  };
  CityGuide: {
    cityId: string;
    headerTitle: string;
    mapZoom: number;
    onMapStateChange: (center: [number, number], zoom: number) => void;
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

// Add these screen wrapper components at the top level after the memoized components
const GuideScreenWrapper = React.memo(({ route }: { route: any }) => {
  const { mapZoom, cityId } = route.params;
  
  return (
    <MemoizedExploreScreen
      route={{ params: { mapZoom, cityId } }}
    />
  );
});

const MapScreenWrapper = React.memo(({ route }: { route: any }) => {
  const { mapZoom, cityId, onMapStateChange } = route.params;
  const locationService = LocationService.getInstance();
  const centerCoordinates = useMemo(() => locationService.getCenterCoordinates(), []);
  
  return (
    <MemoizedMapScreen
      initialZoom={mapZoom}
      initialCenter={centerCoordinates}
      onMapStateChange={onMapStateChange}
      cityId={cityId}
    />
  );
});

const BookmarksScreenWrapper = React.memo(({ route }: { route: any }) => {
  const { cityId } = route.params;
  const { favorites } = useFavorites();
  
  return (
    <BookmarksScreen 
      cityId={cityId} 
      favorites={favorites} 
    />
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

  const debugButtons = useMemo(() => (
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
  ), [handleClearCache, useLocalData, toggleLocalData, navigation]);

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

// Create proper screen components for the stack navigator
const CitySelectScreenWrapper = React.memo(({ route }: { route: any }) => {
  const { onCitySelect, useLocalData, handleClearCache, toggleLocalData, showLanding } = route.params;
  return (
    <CitySelectScreen 
      onCitySelect={onCitySelect}
      useLocalData={useLocalData}
      handleClearCache={handleClearCache}
      toggleLocalData={toggleLocalData}
      showLanding={showLanding}
    />
  );
});

const LandingScreenWrapper = React.memo(({ navigation }: { navigation: any }) => (
  <LandingScreen onDismiss={() => navigation.goBack()} />
));

// Update TabNavigator to use the wrapper components directly
const TabNavigator = React.memo(({ route, navigation }: any) => {
  const { cityId, headerTitle, mapZoom, onMapStateChange } = route.params;
  const { loadFavorites } = useFavorites();

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
      tabBarHideOnKeyboard: true,
      tabBarStyle: { elevation: 0, borderTopWidth: 1, borderTopColor: '#EEEEEE' },
      tabBarLabelStyle: { paddingBottom: 4 },
      animationEnabled: false,
    });
  }, [navigation, headerTitle]);

  // Load favorites when tab is focused
  useEffect(() => {
    loadFavorites(cityId);
  }, [cityId, loadFavorites]);

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen 
        name="Guide" 
        component={GuideScreenWrapper}
        initialParams={{ mapZoom, cityId }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreenWrapper}
        initialParams={{ mapZoom, cityId, onMapStateChange }}
      />
      <Tab.Screen 
        name="Bookmarks" 
        component={BookmarksScreenWrapper}
        initialParams={{ cityId }}
        options={{ tabBarLabel: 'Bookmarks' }}
      />
    </Tab.Navigator>
  );
});

// Main App component with memoized callbacks and values
const AppNavigator = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [mapZoom, setMapZoom] = useState(12);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [useLocalData, setUseLocalData] = useState(true);
  const [showLanding, setShowLanding] = useState(false);

  const landingScreenOptions = useMemo(() => ({
    presentation: 'modal' as const,
    animation: 'slide_from_bottom' as const,
    headerShown: false,
    contentStyle: { backgroundColor: 'transparent' }
  }), []);

  const stackNavigatorOptions = useMemo(() => ({
    headerShown: false,
    animation: 'fade' as const,
    animationDuration: 200
  }), []);

  const handleMapStateChange = useCallback((center: [number, number], zoom: number) => {
    setMapZoom(zoom);
  }, []);

  const handleCitySelect = useCallback(async (cityId: string) => {
    navigation.navigate('CityGuide', {
      cityId,
      headerTitle: LocationService.getInstance().getCityInfo()?.name || '',
      mapZoom: mapZoom,
      onMapStateChange: handleMapStateChange
    });
  }, [mapZoom, handleMapStateChange, navigation]);

  const handleClearCache = useCallback(async () => {
    await AsyncStorage.clear();
    LocationService.getInstance().clearData();
    OfflineMapService.getInstance().clearData();
  }, []);

  const toggleLocalData = useCallback(() => {
    setUseLocalData(prev => !prev);
  }, []);

  const citySelectScreenParams = useMemo(() => ({
    onCitySelect: handleCitySelect,
    useLocalData,
    handleClearCache,
    toggleLocalData,
    showLanding
  }), [handleCitySelect, useLocalData, handleClearCache, toggleLocalData, showLanding]);

  return (
    <Stack.Navigator screenOptions={stackNavigatorOptions}>
      <Stack.Screen 
        name="CitySelect" 
        component={CitySelectScreenWrapper}
        initialParams={citySelectScreenParams}
      />
      <Stack.Screen 
        name="CityGuide" 
        component={TabNavigator}
      />
      <Stack.Screen
        name="Landing"
        component={LandingScreenWrapper}
        options={landingScreenOptions}
      />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <FavoritesProvider>
          <NavigationContainer>
            <AppNavigator />
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
});
