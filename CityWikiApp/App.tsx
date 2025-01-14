import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapScreen from './MapScreen';
import ExploreScreen from './ExploreScreen';
import { CitySelect } from './components/CitySelect';

type Screen = 'select' | 'map' | 'explore';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('select');
  const [selectedCity, setSelectedCity] = useState<string>('');

  const handleCitySelect = (cityId: string) => {
    setSelectedCity(cityId);
    setCurrentScreen('explore');
  };

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    if (currentScreen === 'select') {
      return <CitySelect onSelectCity={handleCitySelect} />;
    }
    
    if (currentScreen === 'map') {
      return <MapScreen onNavigate={handleNavigate} currentScreen="map" />;
    }

    return <ExploreScreen onNavigate={handleNavigate} currentScreen="explore" />;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {renderScreen()}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({});
