import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { PointOfInterest } from '../services/LocationService';

interface PoiDetailViewProps {
  poi: PointOfInterest;
  onClose: () => void;
}

export function PoiDetailView({ poi, onClose }: PoiDetailViewProps) {
  const handleWebsitePress = async () => {
    if (poi.website) {
      await Linking.openURL(poi.website);
    }
  };

  const handlePhonePress = async () => {
    if (poi.phone) {
      await Linking.openURL(`tel:${poi.phone}`);
    }
  };

  const handleNavigationPress = () => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${poi.latitude},${poi.longitude}`;
    const label = poi.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{poi.name}</Text>
          <Text style={styles.category}>{poi.category} · {poi.sub_category}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>{poi.description}</Text>

      <View style={styles.infoSection}>
        <TouchableOpacity style={styles.infoRow} onPress={handleNavigationPress}>
          <Icon name="navigate" size={20} color="#0066CC" />
          <Text style={[styles.infoText, styles.linkText]}>{poi.address}</Text>
        </TouchableOpacity>
        
        {poi.phone && (
          <TouchableOpacity style={styles.infoRow} onPress={handlePhonePress}>
            <Icon name="call" size={20} color="#666" />
            <Text style={styles.infoText}>{poi.phone}</Text>
          </TouchableOpacity>
        )}
        
        {poi.website && (
          <TouchableOpacity style={styles.infoRow} onPress={handleWebsitePress}>
            <Icon name="globe" size={20} color="#666" />
            <Text style={styles.infoText}>{poi.website}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 4,
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 20,
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
  linkText: {
    color: '#0066CC',
  },
}); 