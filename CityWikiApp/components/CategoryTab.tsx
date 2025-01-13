import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CategoryTabProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export function CategoryTab({ label, isActive, onPress }: CategoryTabProps) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.tab,
        isActive && styles.activeTab
      ]}
    >
      <Text style={[
        styles.tabText,
        isActive && styles.activeTabText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0066CC',
  },
  tabText: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0066CC',
    fontWeight: '600',
  },
});

