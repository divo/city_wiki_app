import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapScreen from './screens/MapScreen';
import ExploreScreen from './screens/ExploreScreen';
import { CitySelect } from './components/CitySelect';

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
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = route.name === 'Map' ? 'map' : 'compass';
          iconName = focused ? iconName : `${iconName}-outline`;
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

      <Tab.Screen name="Map">
        {() => (
          <MapScreen
            initialZoom={mapZoom}
            onMapStateChange={onMapStateChange}
            cityId={cityId}
          />
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
    // No need to load data here anymore, it's handled in CitySelect
    return Promise.resolve();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="CitySelect" 
            options={{ headerShown: false }}
          >
            {() => <CitySelect onCitySelect={handleCitySelect} />}
          </Stack.Screen>
          <Stack.Screen
            name="CityGuide"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
