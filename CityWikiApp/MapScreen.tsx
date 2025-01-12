import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import MapView from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const categories = [
  'All', 'See', 'Eat', 'Sleep', 'Shop', 'Drink', 'Play'
];

const MapScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
      <SafeAreaView style={styles.topBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((category, index) => (
            <Text key={index} style={styles.categoryButton}>{category}</Text>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryScroll: {
    paddingHorizontal: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    marginVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    fontSize: 14,
    color: '#333',
  },
});

export default MapScreen;
