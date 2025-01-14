import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapScreen from './MapScreen';
import ExploreScreen from './ExploreScreen';
import { CitySelect } from './components/CitySelect';

type Screen = 'select' | 'map' | 'explore';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('select');

  const handleCitySelect = (cityId: string) => {
    // For now, just navigate to map screen when any city is selected
    setCurrentScreen('map');
  };

  const renderScreen = () => {
    if (currentScreen === 'select') {
      return <CitySelect onSelectCity={handleCitySelect} />;
    }
    
    if (currentScreen === 'map') {
      return <MapScreen onNavigate={setCurrentScreen} currentScreen="map" />;
    }

    return <ExploreScreen onNavigate={setCurrentScreen} currentScreen="explore" />;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {renderScreen()}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({});
