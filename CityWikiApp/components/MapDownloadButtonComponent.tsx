import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/globalStyles';

interface MapDownloadButtonComponentProps {
  type: 'download' | 'downloading' | 'downloaded';
  onPress: () => void;
  disabled?: boolean;
}

export const MapDownloadButtonComponent: React.FC<MapDownloadButtonComponentProps> = ({
  type,
  onPress,
  disabled = false
}) => {
  const spinValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (type === 'downloading') {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [type]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons 
        name={ type === 'download' ? 'map-outline' : 'map' }
        size={24} 
        color={disabled ? colors.text.tertiary : colors.primary} 
      />
      <View style={styles.overlayIconContainer}>
        {type === 'download' && (
          <Ionicons 
            name="cloud-download-outline" 
            size={12} 
            color={disabled ? colors.text.tertiary : colors.primary} 
          />
        )}
        {type === 'downloading' && (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons 
              name="sync-outline" 
              size={12} 
              color={disabled ? colors.text.tertiary : colors.primary} 
            />
          </Animated.View>
        )}
        {type === 'downloaded' && (
          <Ionicons 
            name="checkmark-circle" 
            size={12} 
            color={colors.success} 
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  overlayIconContainer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    padding: 2,
  },
}); 