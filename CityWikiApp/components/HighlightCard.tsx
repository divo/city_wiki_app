import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

interface HighlightCardProps {
  title: string;
  imageUrl: string;
}

export function HighlightCard({ title, imageUrl }: HighlightCardProps) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
    color: '#333333',
  },
});

