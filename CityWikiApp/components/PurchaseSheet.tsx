import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

interface PurchaseSheetProps {
  city: {
    name: string;
    country: string;
  };
  onClose: () => void;
  onPurchase: () => void;
}

export function PurchaseSheet({ city, onClose, onPurchase }: PurchaseSheetProps) {
  const snapPoints = React.useMemo(() => ['25%', '90%'], []);

  return (
    <View style={styles.container}>
      <BottomSheet
        snapPoints={snapPoints}
        onClose={onClose}
        enablePanDownToClose={true}
        index={1}
        style={styles.bottomSheet}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Get {city.name} Guide</Text>
            <Text style={styles.subtitle}>{city.country}</Text>

            <View style={styles.contentSection}>
              <Text style={styles.description}>
                Unlock the complete city guide to discover the best places to eat, drink, and explore in {city.name}.
              </Text>

              <View style={styles.features}>
                <Text style={styles.featuresTitle}>What's included:</Text>
                <Text style={styles.featureItem}>• Curated list of must-visit spots</Text>
                <Text style={styles.featureItem}>• Offline access to all locations</Text>
                <Text style={styles.featureItem}>• Detailed descriptions and tips</Text>
                <Text style={styles.featureItem}>• Regular content updates</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.purchaseButton} onPress={onPurchase}>
              <Text style={styles.purchaseButtonText}>Get Free Access</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
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
    zIndex: 999,
    elevation: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
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
  scrollContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  contentSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    color: '#666666',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    color: '#333333',
    lineHeight: 24,
    marginBottom: 24,
  },
  features: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  featuresTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
    color: '#333333',
    lineHeight: 24,
  },
  purchaseButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
}); 