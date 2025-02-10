import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/globalStyles';
import { IAPService } from '../services/IAPService';

interface SettingsScreenProps {
  onClose: () => void;
}

interface SettingsItem {
  title: string;
  icon: string;
  onPress: () => void;
}

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const handleRestorePurchases = async () => {
    try {
      await IAPService.getInstance().restorePurchases();
    } catch (error) {
      console.error('Error restoring purchases:', error);
    }
  };

  const handleRateApp = () => {
    // Replace with your app's App Store URL
    Linking.openURL('https://apps.apple.com/app/yourappid');
  };

  const handleSendFeedback = () => {
    Linking.openURL('mailto:support@yourapp.com');
  };

  const handlePrivacyLegal = () => {
    // Replace with your privacy policy URL
    Linking.openURL('https://yourapp.com/privacy');
  };

  const handleLicenses = () => {
    // TODO: Show licenses screen
  };

  const settingsItems: SettingsItem[] = [
    {
      title: 'Rate our app',
      icon: 'star-outline',
      onPress: handleRateApp,
    },
    {
      title: 'Send Feedback',
      icon: 'mail-outline',
      onPress: handleSendFeedback,
    },
    {
      title: 'Privacy and Legal',
      icon: 'shield-outline',
      onPress: handlePrivacyLegal,
    },
    {
      title: 'Licenses',
      icon: 'document-text-outline',
      onPress: handleLicenses,
    },
  ];

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
        <Text style={styles.title}>Settings</Text>
      </View>

      <TouchableOpacity 
        style={styles.restoreButton} 
        onPress={handleRestorePurchases}
      >
        <Text style={styles.restoreButtonText}>Restore Purchases</Text>
      </TouchableOpacity>

      <View style={styles.listContainer}>
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={item.title}
            style={[
              styles.listItem,
              index === settingsItems.length - 1 && styles.lastListItem
            ]}
            onPress={item.onPress}
          >
            <View style={styles.listItemContent}>
              <Ionicons name={item.icon as any} size={22} color="#666" style={styles.listItemIcon} />
              <Text style={styles.listItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
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
  restoreButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    backgroundColor: 'white',
    marginTop: 32,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: 'white',
  },
  lastListItem: {
    borderBottomWidth: 0,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemIcon: {
    marginRight: 12,
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
}); 