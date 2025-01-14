import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import MapScreen from './MapScreen';
import ExploreScreen from './ExploreScreen';

const Tab = createBottomTabNavigator();

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
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName = '';
              if (route.name === 'Guide') {
                iconName = focused ? 'book' : 'book-outline';
              } else if (route.name === 'Explore') {
                iconName = focused ? 'map' : 'map-outline';
              }
              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#0066CC',
            tabBarInactiveTintColor: '#666666',
          })}
        >
          <Tab.Screen 
            name="Guide" 
            component={ExploreScreen}
            initialParams={{ mapCenter, mapZoom }}
          />
          <Tab.Screen 
            name="Explore" 
            children={() => (
              <MapScreen 
                initialCenter={mapCenter}
                initialZoom={mapZoom}
                onMapStateChange={handleMapStateChange}
              />
            )}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({});
