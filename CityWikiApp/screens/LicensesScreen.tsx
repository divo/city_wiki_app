import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/globalStyles';

interface LicensesScreenProps {
  onClose: () => void;
}

interface LicenseItem {
  text: string;
  image: any;
  extraImages?: any[];
}

const licenses: LicenseItem[] = [
  {
    text: "City Stamp designs by Freepik",
    image: require('../assets/freepik-logo.png'),
  },
  {
    text: "Images provided by Pixabay",
    image: require('../assets/pixabay-logo.png'),
  },
  {
    text: "Some of the content in this app is derived from Wikipedia and/or WikiVoyage and is available under the Creative Commons Attribution-ShareAlike License (CC BY-SA 3.0) and/or the GNU Free Documentation License. The text has been modified from its original form. For more details, please visit Wikipedia or WikiVoyage.",
    image: null,
    extraImages: [
      require('../assets/wikimedia-logo.png'),
      require('../assets/wikivoyage-logo.png')
    ],
  },
];

export function LicensesScreen({ onClose }: LicensesScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={onClose}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Licenses</Text>
      </View>

      <ScrollView style={styles.content}>
        {licenses.map((item, index) => (
          <View 
            key={index} 
            style={[
              styles.licenseItem,
              index === licenses.length - 1 && styles.lastItem
            ]}
          >
            <View style={styles.licenseContent}>
              {item.image ? (
                <View style={styles.logoContainer}>
                  <Image 
                    source={item.image}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              ) : item.extraImages && (
                <View style={styles.multiLogoContainer}>
                  {item.extraImages.map((img, imgIndex) => (
                    <Image 
                      key={imgIndex}
                      source={img}
                      style={[
                        styles.logo,
                        imgIndex > 0 && styles.extraLogo
                      ]}
                      resizeMode="contain"
                    />
                  ))}
                </View>
              )}
              <Text style={styles.licenseText}>{item.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  licenseItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  licenseContent: {
    alignItems: 'flex-start',
  },
  logoContainer: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  multiLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  logo: {
    width: 40,
    height: 40,
  },
  extraLogo: {
    marginLeft: 16,
  },
  licenseText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'left',
  },
  lastItem: {
    marginBottom: 0,
  },
}); 