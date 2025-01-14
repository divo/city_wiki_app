import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapScreen from './MapScreen';
import ExploreScreen from './ExploreScreen';
import { CitySelect } from './components/CitySelect';

type RootStackParamList = {
  CitySelect: undefined;
  CityGuide: {
    cityId: string;
    mapCenter: [number, number];
    mapZoom: number;
    onMapStateChange: (center: [number, number], zoom: number) => void;
  };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator = ({ route, navigation }: any) => {
  const { cityId, mapCenter, mapZoom, onMapStateChange } = route.params;
  
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
        headerTitle: "San Francisco",
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
            route={{ params: { mapCenter, mapZoom } }}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Map">
        {() => (
          <MapScreen
            initialCenter={mapCenter}
            initialZoom={mapZoom}
            onMapStateChange={onMapStateChange}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default function App() {
  const [mapCenter, setMapCenter] = useState<[number, number]>([-122.4194, 37.7749]);
  const [mapZoom, setMapZoom] = useState(12);

  const handleMapStateChange = (center: [number, number], zoom: number) => {
    setMapCenter(center);
    setMapZoom(zoom);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="CitySelect" 
            component={CitySelect}
            options={{ headerShown: false }}
          />
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
