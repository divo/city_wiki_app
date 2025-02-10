import React, { useState, useLayoutEffect } from 'react';
import { TouchableOpacity, View, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SettingsScreen } from './SettingsScreen';

type CitySelectScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export function CitySelectScreen({ navigation }: CitySelectScreenProps) {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setIsSettingsVisible(true)}
          style={{ marginRight: 16 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <>
      <View style={styles.container}>
        {/* Existing View component */}
      </View>

      <Modal
        visible={isSettingsVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SettingsScreen onClose={() => setIsSettingsVisible(false)} />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 