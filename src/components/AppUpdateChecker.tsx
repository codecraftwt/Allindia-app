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
import { typography, moderateScale } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

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
    const timer = setTimeout(() => {
      checkUpdate();
    }, 2000);

    return () => clearTimeout(timer);
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
    >
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Icon name="rocket-outline" size={moderateScale(56)} color={colors.primary} style={styles.icon} />
          
          <Text style={[typography.h3, styles.title, { color: colors.textPrimary }]}>
            Update Required
          </Text>
          
          <Text style={[typography.body, styles.subtitle, { color: colors.textSecondary }]}>
            A new version of the app is available! Please update to get the latest features and improvements.
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]} 
            onPress={handleUpdate}
          >
            <Text style={[typography.labelMedium, styles.buttonText]}>UPDATE NOW</Text>
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
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.6)', 
  },
  card: {
    width: '90%',
    maxWidth: moderateScale(340),
    borderRadius: radius.xl,
    padding: moderateScale(28),
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  icon: {
    marginBottom: moderateScale(16),
  },
  title: {
    marginBottom: moderateScale(10),
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: moderateScale(24),
    lineHeight: moderateScale(22),
  },
  button: {
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(24),
    borderRadius: radius.button,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default AppUpdateChecker;
