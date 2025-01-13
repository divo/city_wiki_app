import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface HoursItemProps {
  name: string;
  day: string;
  hours: string;
  imageUrl: string;
}

export function HoursItem({ name, day, hours, imageUrl }: HoursItemProps) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.day}>{day}</Text>
        <Text style={styles.hours}>{hours}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
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
  hours: {
    fontSize: 14,
    color: '#0066CC',
  },
});

