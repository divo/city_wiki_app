import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface DetailItemProps {
  icon: string;
  text: string;
  onPress?: () => void;
}

export function DetailItem({ icon, text, onPress }: DetailItemProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.container} onPress={onPress}>
      <Icon name={icon} size={20} color="#666666" style={styles.icon} />
      <Text style={styles.text}>{text}</Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  icon: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
  },
});
