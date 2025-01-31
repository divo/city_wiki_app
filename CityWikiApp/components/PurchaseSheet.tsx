import React, { useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH * 0.4;
const IMAGE_HEIGHT = IMAGE_WIDTH * 1.5;

interface PurchaseSheetProps {
  city: {
    name: string;
    country: string;
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
        <View style={styles.content}>
          <Text style={styles.title}>Get {city.name}{'\n'}Guide</Text>
          <Text style={styles.subtitle}>{city.country}</Text>

          <Text style={styles.description}>
            Unlock the complete city guide to discover the best places to eat, drink, and explore in {city.name}.
          </Text>

          <TouchableOpacity style={styles.purchaseButton} onPress={onPurchase}>
            <Text style={styles.purchaseButtonText}>Get Free Access</Text>
          </TouchableOpacity>
        </View>
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
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 32,
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
    padding: 32,
    backgroundColor: 'white',
    borderRadius: 32,
  },
  title: {
    fontSize: 40,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 24,
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