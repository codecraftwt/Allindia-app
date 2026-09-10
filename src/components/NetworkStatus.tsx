import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, moderateScale } from '../theme/typography';
import { spacing } from '../theme/spacing';

const { width } = Dimensions.get('window');

const NetworkStatus = () => {
  const netInfo = useNetInfo();
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Only animate if we actually have a known disconnected state
    if (netInfo.isConnected === false) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 10,
      }).start();
    } else if (netInfo.isConnected === true) {
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [netInfo.isConnected, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, moderateScale(20)),
          transform: [{ translateY: slideAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.content}>
        <Icon name="cloud-offline-outline" size={moderateScale(24)} color="#FFFFFF" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={[typography.h4, styles.title]}>No Internet Connection</Text>
          <Text style={[typography.small, styles.subtitle]}>Please check your internet connection to continue.</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    backgroundColor: '#E53935',
    zIndex: 9999,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: moderateScale(12),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    marginBottom: moderateScale(2),
  },
  subtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
});

export default NetworkStatus;
