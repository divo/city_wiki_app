import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface NavItem {
  label: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
}

function NavItem({ label, icon, isActive, onPress }: NavItem) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Icon 
        name={icon} 
        size={24} 
        color={isActive ? '#0066CC' : '#666666'} 
      />
      <Text style={[
        styles.navLabel,
        isActive && styles.activeNavLabel
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface BottomNavProps {
  currentScreen: 'explore' | 'map';
  onNavigate: (screen: 'explore' | 'map') => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  return (
    <View style={styles.container}>
      <NavItem
        label="Guide"
        icon="book-outline"
        isActive={currentScreen === 'explore'}
        onPress={() => onNavigate('explore')}
      />
      <NavItem
        label="Explore"
        icon="map-outline"
        isActive={currentScreen === 'map'}
        onPress={() => onNavigate('map')}
      />
      <NavItem
        label="In Detail"
        icon="list-outline"
        isActive={false}
        onPress={() => {}}
      />
      <NavItem
        label="Favorites"
        icon="bookmark-outline"
        isActive={false}
        onPress={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#666666',
  },
  activeNavLabel: {
    color: '#0066CC',
    fontWeight: '500',
  },
});

