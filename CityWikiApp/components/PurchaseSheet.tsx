import React, { useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { StorageService } from '../services/StorageService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH * 0.4;
const IMAGE_HEIGHT = IMAGE_WIDTH * 1.5;

interface PurchaseSheetProps {
  city: {
    name: string;
    country: string;
    id: string;
  };
  onClose: () => void;
  onPurchase: () => void;
}

const CustomBackground: React.FC<BottomSheetBackgroundProps> = ({ style }) => {
  const containerStyle = useMemo(
    () => [style, { backgroundColor: 'transparent' }],
    [style]
  );

  return <Animated.View pointerEvents="none" style={containerStyle} />;
};

export function PurchaseSheet({ city, onClose, onPurchase }: PurchaseSheetProps) {
  const snapPoints = React.useMemo(() => ['45%'], []);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handlePurchase = async () => {
    try {
      await StorageService.getInstance().markCityAsOwned(city.id);
      onPurchase();
      onClose();
    } catch (error) {
      console.error('Error purchasing city:', error);
    }
  };

  return (
    <View style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        bottomInset={46}
        detached={true}
        style={styles.sheetContainer}
        handleIndicatorStyle={styles.handle}
        backgroundComponent={CustomBackground}
      >
        <BottomSheetView style={styles.content}>
          <Text style={styles.title}>Get {city.name} Guide</Text>

          <Text style={styles.description}>
            Unlock the complete city guide to discover the best places to eat, drink, and explore in {city.name}.
          </Text>

          <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
            <Text style={styles.purchaseButtonText}>Get Free Access</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    marginHorizontal: 24,
    backgroundColor: 'white',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  handle: {
    backgroundColor: '#DDDDDD',
    width: 40,
  },
  imageContainer: {
    top: '20%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  heroImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 32,
    backgroundColor: 'white',
    borderRadius: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#666666',
    marginBottom: 32,
  },
  description: {
    fontSize: 18,
    fontFamily: 'Montserrat_400Regular',
    color: '#333333',
    lineHeight: 28,
    marginBottom: 32,
  },
  purchaseButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Montserrat_600SemiBold',
  },
}); 