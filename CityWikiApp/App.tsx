import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapScreen from './MapScreen';
import ExploreScreen from './ExploreScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'map' | 'explore'>('home');

  const renderScreen = () => {
    if (currentScreen === 'map') {
      return <MapScreen onNavigate={setCurrentScreen} currentScreen="map" />;
    }

    if (currentScreen === 'explore') {
      return <ExploreScreen onNavigate={setCurrentScreen} currentScreen="explore" />;
    }

    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setCurrentScreen('map')}
        >
          <Text style={styles.buttonText}>Open Map</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.buttonMargin]}
          onPress={() => setCurrentScreen('explore')}
        >
          <Text style={styles.buttonText}>Explore</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {renderScreen()}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonMargin: {
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
