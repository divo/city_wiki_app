import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Mapbox from '@rnmapbox/maps';
import { BottomNav } from './components/BottomNav';
import { HighlightCard } from './components/HighlightCard';
import { VenueHours } from './components/VenueHours';

interface ExploreScreenProps {
  currentScreen: 'map' | 'explore';
  onNavigate: (screen: 'map' | 'explore') => void;
}

const ExploreScreen: React.FC<ExploreScreenProps> = ({ currentScreen, onNavigate }) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <SafeAreaView>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>San Francisco</Text>
            <TouchableOpacity>
              <Icon name="bookmark-outline" size={24} color="#333333" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Hero Image */}
        <Image
          source={{ uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Galileo%20design-2-IlqctxXf8OlrEykrPJXZCOPhudoBGE.png" }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        
        {/* Description */}
        <Text style={styles.description}>
          The Golden Gate Bridge, the cable cars, Alcatraz... San Francisco is one of the most beautiful and unique cities in the world. It's also one of the most expensive. But there are plenty of things to do for free or on a budget.
        </Text>

        {/* Highlights Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.highlightsContainer}
          >
            <HighlightCard
              title="Palace of Fine Arts"
              imageUrl="/placeholder.svg?height=100&width=140"
            />
            <HighlightCard
              title="Alcatraz Island"
              imageUrl="/placeholder.svg?height=100&width=140"
            />
            <HighlightCard
              title="The Golden Gate Bridge"
              imageUrl="/placeholder.svg?height=100&width=140"
            />
          </ScrollView>
        </View>

        {/* Hours Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hours</Text>
          <VenueHours
            name="California Academy of Sciences"
            day="Sunday"
            status="Open now · Closes 9PM"
            imageUrl="/placeholder.svg?height=56&width=56"
          />
          <VenueHours
            name="Exploratorium"
            day="Tomorrow"
            status="Opens at 10AM"
            imageUrl="/placeholder.svg?height=56&width=56"
          />
          <VenueHours
            name="San Francisco Zoo"
            day="Sunday"
            status="Open now · Closes 8PM"
            imageUrl="/placeholder.svg?height=56&width=56"
          />
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapContainer}>
            <Mapbox.MapView
              style={styles.map}
              styleURL={Mapbox.StyleURL.Street}
              zoomLevel={12}
              centerCoordinate={[-122.4194, 37.7749]}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Mapbox.Camera
                zoomLevel={12}
                centerCoordinate={[-122.4194, 37.7749]}
              />
            </Mapbox.MapView>
          </View>
          <TouchableOpacity style={styles.directionsButton}>
            <Icon name="navigate-outline" size={20} color="white" style={styles.directionsIcon} />
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
      <SafeAreaView style={styles.bottomNav}>
        <BottomNav currentScreen={currentScreen} onNavigate={onNavigate} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
  },
  heroImage: {
    width: '100%',
    height: 240,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
    padding: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  highlightsContainer: {
    paddingRight: 16,
  },
  mapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  directionsButton: {
    backgroundColor: '#0066CC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  directionsIcon: {
    marginRight: 8,
  },
  directionsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 24,
  },
  bottomNav: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: 'white',
  },
});
 

export default ExploreScreen;

