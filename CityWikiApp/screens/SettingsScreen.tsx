import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/globalStyles';
import { IAPService } from '../services/IAPService';
import { Client, ExecutionMethod, Functions } from 'react-native-appwrite';
import { AppWriteService } from '../services/AppWriteService';
import { LicensesScreen } from './LicensesScreen';
import { PrivacyPolicyScreen } from './PrivacyPolicyScreen';
import { OfflineMapService } from '../services/OfflineMapService';

// Initialize AppWrite client
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67a874b10034a36253f1');

const functions = new Functions(client);

interface SettingsScreenProps {
  onClose: () => void;
}

interface SettingsItem {
  title: string;
  icon: string;
  onPress: () => void;
}

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [licensesModalVisible, setLicensesModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [mapPacksModalVisible, setMapPacksModalVisible] = useState(false);
  const [mapPacks, setMapPacks] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleRestorePurchases = async () => {
    try {
      await IAPService.getInstance().restorePurchases();
    } catch (error) {
      console.error('Error restoring purchases:', error);
    }
  };

  const handleRateApp = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/app/id6741071597');
    } else {
      // Handle other platforms if needed
      console.log('Rating is only available on iOS.');
    }
  };

  const handleSendFeedback = () => {
    setFeedbackModalVisible(true);
  };

  const submitFeedback = async () => {
    try {
      const userId = await AppWriteService.getInstance().getDeviceId();
      const result = await functions.createExecution(
        '67aa1dfc002f4919df40',
        JSON.stringify({ email, body: message, user_id: userId }),
        true,
        '/',
        ExecutionMethod.POST,
        { 'Content-Type': 'application/json' },
      );
      console.log('Feedback sent:', result);
      setFeedbackModalVisible(false);
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  const handlePrivacyLegal = () => {
    setPrivacyModalVisible(true);
  };

  const handleLicenses = () => {
    setLicensesModalVisible(true);
  };

  const handleMapPacks = async () => {
    try {
      const offlineManager = OfflineMapService.getInstance();
      const packs = await offlineManager.getPacks();
      setMapPacks(packs);
      setMapPacksModalVisible(true);
    } catch (error) {
      console.error('Error getting map packs:', error);
    }
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
    {
      title: 'Map Packs',
      icon: 'map-outline',
      onPress: handleMapPacks,
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

      <Modal
        animationType="slide"
        transparent={false}
        visible={licensesModalVisible}
        onRequestClose={() => setLicensesModalVisible(false)}
      >
        <LicensesScreen onClose={() => setLicensesModalVisible(false)} />
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={privacyModalVisible}
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <PrivacyPolicyScreen onClose={() => setPrivacyModalVisible(false)} />
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={feedbackModalVisible}
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setFeedbackModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Send Feedback</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <TextInput
              style={styles.input}
              placeholder="Your Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Your Message"
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={submitFeedback}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={mapPacksModalVisible}
        onRequestClose={() => setMapPacksModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setMapPacksModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Map Packs Debug</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.debugTitle}>Offline Map Packs</Text>
            {mapPacks.length === 0 ? (
              <Text style={styles.debugText}>No map packs found</Text>
            ) : (
              mapPacks.map((root, index) => {
                const metadata = root._metadata ?? {};
                const bounds = metadata._rnmapbox?.bounds?.coordinates?.[0] ?? [];
                const pack = root.pack;
                return (
                  <View key={index} style={styles.debugItem}>
                    <Text style={styles.debugItemTitle}>{root.metadata.name?.replace(/^city_/, '') ?? 'Unknown'}</Text>
                    <View style={styles.debugItemContent}>
                      <Text style={styles.debugText}>Size: {((pack.completedResourceSize ?? 0) / 1024 / 1024).toFixed(2)} MB</Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: 'white',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  messageInput: {
    height: 150,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  debugItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  debugItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  debugItemContent: {
    gap: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scrollContent: {
    padding: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  indentedText: {
    marginLeft: 16,
  },
}); 