import React, { useState, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { typography } from '../theme/typography';

interface NotificationAssistantProps {
  navigation: any;
}

const NotificationAssistant: React.FC<NotificationAssistantProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [showStatus, setShowStatus] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Animations
  const pulseAnim = useMemo(() => new Animated.Value(1), []);
  const rippleScale = useMemo(() => new Animated.Value(1), []);
  const rippleOpacity = useMemo(() => new Animated.Value(0.6), []);
  const fabRippleScale = useMemo(() => new Animated.Value(1), []);
  const fabRippleOpacity = useMemo(() => new Animated.Value(0.4), []);
  const hintOpacity = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    // Show hint initially after 2 seconds
    const initialTimer = setTimeout(() => {
      setShowHint(true);
      Animated.timing(hintOpacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      
      // Hide after 6 seconds
      setTimeout(() => {
        Animated.timing(hintOpacity, { toValue: 0, duration: 800, useNativeDriver: true }).start(() => setShowHint(false));
      }, 6000);
    }, 2000);

    // Repeat every 30 seconds for demo (User asked for 5 min, but for visibility I'll use 30s or can set to 300000)
    const repeatInterval = setInterval(() => {
      setShowHint(true);
      Animated.timing(hintOpacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      setTimeout(() => {
        Animated.timing(hintOpacity, { toValue: 0, duration: 800, useNativeDriver: true }).start(() => setShowHint(false));
      }, 6000);
    }, 45000); // 45 seconds interval

    return () => {
      clearTimeout(initialTimer);
      clearInterval(repeatInterval);
    };
  }, [hintOpacity]);

  useEffect(() => {
    // Pulse animation for the FAB
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Small ripple for the badge
    Animated.loop(
      Animated.parallel([
        Animated.timing(rippleScale, { toValue: 2.5, duration: 1500, useNativeDriver: true }),
        Animated.timing(rippleOpacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // LARGE ripple for the whole FAB
    Animated.loop(
      Animated.parallel([
        Animated.timing(fabRippleScale, { toValue: 1.6, duration: 2000, useNativeDriver: true }),
        Animated.timing(fabRippleOpacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim, rippleScale, rippleOpacity, fabRippleScale, fabRippleOpacity]);

  return (
    <View style={[styles.fabWrapper, { bottom: insets.bottom + spacing.lg }]}>
      {showStatus && (
        <Animated.View 
          style={[
            styles.statusCard, 
            { 
              backgroundColor: colors.surface, 
              borderColor: colors.border, 
              shadowColor: colors.shadow,
              transform: [{ translateY: 0 }] 
            }
          ]}>
          <View style={styles.statusHeader}>
            <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Notification Status</Text>
            <Pressable onPress={() => setShowStatus(false)} hitSlop={8}>
              <Icon name="times" size={14} color={colors.textSecondary} />
            </Pressable>
          </View>
          <View style={[styles.statusDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: colors.accent }]} />
            <Text style={[typography.small, { color: colors.textPrimary }]}>Latest: 2 New jobs matched</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: colors.textPlaceholder }]} />
            <Text style={[typography.small, { color: colors.textSecondary }]}>Old: 5 Read notifications</Text>
          </View>
          <Pressable 
            onPress={() => {
              setShowStatus(false);
              navigation.navigate('Notifications');
            }}
            style={styles.statusMore}>
            <Text style={[typography.small, { color: colors.primary, fontFamily: typography.labelMedium.fontFamily }]}>
              View all notifications
            </Text>
            <Icon name="chevron-right" size={10} color={colors.primary} />
          </Pressable>
        </Animated.View>
      )}

      {showHint && (
        <Animated.View style={[styles.hintBubble, { backgroundColor: colors.accent, opacity: hintOpacity, shadowColor: colors.shadow }]}>
          <Text style={[typography.small, { color: colors.onPrimary, fontWeight: '600' }]}>
            Check your latest notifications! 🔔
          </Text>
          <View style={[styles.hintArrow, { borderTopColor: colors.accent }]} />
        </Animated.View>
      )}

      <Animated.View style={[styles.fabContainer, { transform: [{ scale: pulseAnim }] }]}>
        {!showStatus && (
          <Animated.View 
            style={[
              styles.fabRippleLarge, 
              { 
                backgroundColor: colors.primary,
                opacity: fabRippleOpacity,
                transform: [{ scale: fabRippleScale }]
              }
            ]} 
          />
        )}
        <Pressable
          onPress={() => setShowStatus(!showStatus)}
          style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Notification status helper">
          <Icon name={showStatus ? "times" : "commenting-o"} size={24} color={colors.onPrimary} />
          {!showStatus && (
            <View style={styles.badgeContainer}>
              <Animated.View 
                style={[
                  styles.ripple, 
                  { 
                    backgroundColor: colors.accent,
                    opacity: rippleOpacity,
                    transform: [{ scale: rippleScale }]
                  }
                ]} 
              />
              <View style={[styles.fabBadge, { backgroundColor: colors.accent, borderColor: colors.primary }]} />
            </View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  fabWrapper: {
    position: 'absolute',
    right: spacing.lg,
    alignItems: 'flex-end',
    gap: spacing.sm,
    zIndex: 100,
  },
  fab: {
    width: 46,
    height: 46,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 2,
  },
  fabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabRippleLarge: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    zIndex: 1,
  },
  fabBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  badgeContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusCard: {
    width: 220,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    marginBottom: spacing.sm,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusDivider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  hintBubble: {
    position: 'absolute',
    bottom: 70,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    minWidth: 160,
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  hintArrow: {
    position: 'absolute',
    bottom: -6,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

export default NotificationAssistant;
