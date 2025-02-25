import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Animated } from 'react-native';
import { useFonts, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { colors } from '../styles/globalStyles';

interface LandingScreenProps {
  onDismiss: () => void;
}

export function LandingScreen({ onDismiss }: LandingScreenProps) {
  const [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_400Regular,
  });

  const [isReady, setIsReady] = useState(false);
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (fontsLoaded) {
      setIsReady(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Animated.View style={[styles.modalContainer, { opacity }]}>
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
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
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: '100%',
  },
  title: {
    fontSize: 28,
    color: '#1A1A1A',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
  buttonContainer: {
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
}); 
