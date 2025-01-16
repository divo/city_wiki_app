import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Mapbox from '@rnmapbox/maps';
import { HighlightCard } from '../components/HighlightCard';
import { VenueHours } from '../components/VenueHours';
import { LocationService, PointOfInterest } from '../services/LocationService';

interface ExploreScreenProps {
  route: {
    params: {
      mapZoom: number;
      cityId: string;
    };
  };
}

const ExploreScreen: React.FC<ExploreScreenProps> = ({ route }) => {
  const { mapZoom, cityId } = route.params;
  const placeholderCenter: [number, number] = [-122.4194, 37.7749];
  const [topPois, setTopPois] = useState<PointOfInterest[]>([]);
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [cityName, setCityName] = useState<string>('');

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationService = LocationService.getInstance();
        await locationService.loadLocations(cityId);
        // Get top ranked POIs
        const allPois = locationService.getPoisByCategory('all');
        const sortedPois = allPois.sort((a, b) => (a.rank || 999) - (b.rank || 999));
        setTopPois(sortedPois.slice(0, 3));
        
        // Get city info and set hero image
        const cityInfo = locationService.getCityInfo();
        if (cityInfo?.image_url) {
          setHeroImageUrl(cityInfo.image_url);
        }
        if (cityInfo?.name) {
          setCityName(cityInfo.name);
        }
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    };

    loadLocations();
  }, [cityId]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image with City Name Overlay */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: heroImageUrl || "" }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.cityNameOverlay}>{cityName}</Text>
          </View>
        </View>
        
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
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Mapbox.Camera
                zoomLevel={mapZoom}
                centerCoordinate={placeholderCenter}
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 32,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityNameOverlay: {
    color: 'white',
    fontSize: 36,
    fontWeight: '600',
    textAlign: 'center',
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
});
 

export default ExploreScreen;

