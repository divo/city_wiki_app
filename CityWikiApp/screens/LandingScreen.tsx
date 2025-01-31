import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useFonts, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';

interface LandingScreenProps {
  onDismiss: () => void;
}

export function LandingScreen({ onDismiss }: LandingScreenProps) {
  const [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBackground} />
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/onboarding_hero.png')} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to City Wandr</Text>
          <Text style={styles.subtitle}>
            Discover new places and experiences in the cities you love.
          </Text>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={onDismiss}
        >
          <Text style={styles.buttonText}>Get your first guide for free</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#FEF6E1',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  bottomContainer: {
    padding: 20,
    width: '100%',
    backgroundColor: '#F8F9FA',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: '50%',
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: '#1A1A1A',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  paginationDots: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDD',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
}); 
