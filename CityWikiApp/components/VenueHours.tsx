import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface VenueHoursProps {
  name: string;
  day: string;
  status: string;
  imageUrl: string;
}

export function VenueHours({ name, day, status, imageUrl }: VenueHoursProps) {
  return (
    <TouchableOpacity style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.details}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.day}>{day}</Text>
        <Text style={styles.status}>{status}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  details: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  day: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  status: {
    fontSize: 14,
    color: '#0066CC',
  },
});

