import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import VersionCheck from 'react-native-version-check';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

const AppUpdateChecker = () => {
  const [updateNeeded, setUpdateNeeded] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');
  const { colors } = useTheme();

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const update = await VersionCheck.needUpdate();
        if (update && update.isNeeded) {
          const url = await VersionCheck.getStoreUrl({
             appID: 'YOUR_IOS_APP_ID', // Replace with your iOS App ID if available
          });
          if (url) {
             setStoreUrl(url);
          }
          setUpdateNeeded(true);
        }
      } catch (error) {
        console.log('Error checking for app update:', error);
      }
    };

    // Add a small delay so it doesn't block initial rendering
    setTimeout(() => {
      checkUpdate();
    }, 2000);
  }, []);

  const handleUpdate = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl).catch(err => {
        console.error('Failed to open store URL', err);
      });
    } else {
      // Fallback if URL is not found but we know it's Android
      if (Platform.OS === 'android') {
         Linking.openURL(`market://details?id=com.jobsindia`).catch(() => {
            Linking.openURL(`https://play.google.com/store/apps/details?id=com.jobsindia`);
         });
      }
    }
  };

  return (
    <Modal
      visible={updateNeeded}
      transparent={true}
      animationType="fade"
      // Removing onRequestClose prevents Android back button from dismissing it (forces update)
    >
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Icon name="rocket-outline" size={60} color={colors.primary} style={styles.icon} />
          
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Update Required
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.textPrimary, opacity: 0.8 }]}>
            A new version of the app is available! Please update to get the latest features and improvements.
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]} 
            onPress={handleUpdate}
          >
            <Text style={styles.buttonText}>UPDATE NOW</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.6)', 
  },
  card: {
    width: '90%',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default AppUpdateChecker;
