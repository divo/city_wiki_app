import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/globalStyles';
import { IAPService } from '../services/IAPService';
import { Client, ExecutionMethod, Functions } from 'react-native-appwrite';
import { AppWriteService } from '../services/AppWriteService';

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
    // Replace with your app's App Store URL
    Linking.openURL('https://apps.apple.com/app/yourappid');
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={feedbackModalVisible}
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Feedback</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Your Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Your Message"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setFeedbackModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]} 
                onPress={submitFeedback}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  messageInput: {
    height: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: '#666666',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
}); 