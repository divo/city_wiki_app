import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapScreen from './MapScreen';
import ExploreScreen from './ExploreScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'map' | 'explore'>('map');

  const renderScreen = () => {
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
