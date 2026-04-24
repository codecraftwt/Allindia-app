import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, Dimensions, Image } from 'react-native';
import { Animated as RNAnimated, Easing } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  runOnJS
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { typography } from '../theme/typography';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProfileStrengthCardProps {
  profile: any;
  colors: any;
  navigation: any;
  scrollY?: RNAnimated.Value;
}

const ProfileStrengthAssistant: React.FC<ProfileStrengthCardProps> = ({ profile, colors, navigation, scrollY }) => {
  const insets = useSafeAreaInsets();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAutoHint, setShowAutoHint] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [frame, setFrame] = useState(0);

  // Manual Animation fallback for Rocket
  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f === 0 ? 1 : 0));
    }, 150);
    return () => clearInterval(timer);
  }, []);

  const launchY = useSharedValue(0);
  const launchScale = useSharedValue(1);

  const animatedRocketStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: launchY.value },
        { scale: launchScale.value }
      ],
      opacity: withTiming(launchY.value < -SCREEN_HEIGHT + 100 ? 0 : 1),
    };
  });

  // Animations
  const rippleScale = useRef(new RNAnimated.Value(1)).current;
  const rippleOpacity = useRef(new RNAnimated.Value(0.4)).current;
  const autoHintAnim = useRef(new RNAnimated.Value(0)).current;
  const tooltipOpacity = useRef(new RNAnimated.Value(1)).current;

  const strength = useMemo(() => {
    if (!profile) return 0;
    let score = 0;
    if (profile.name) score += 10;
    if (profile.email) score += 10;
    if (profile.phone) score += 10;
    if (profile.current_city_id) score += 10;
    if (profile.job_category_id) score += 10;
    if (profile.qualification_id) score += 10;
    if (profile.experience_type) score += 20;
    if (profile.resume_url) score += 20;
    return score;
  }, [profile]);

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    // Start animation only if it's not launching and tooltip is not shown (ripple is visible)
    if (!isLaunching && !showTooltip) {
      // Reset values to ensure the loop restarts correctly
      rippleScale.setValue(1);
      rippleOpacity.setValue(0.4);

      animation = RNAnimated.loop(
        RNAnimated.parallel([
          RNAnimated.timing(rippleScale, {
            toValue: 1.5,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          RNAnimated.timing(rippleOpacity, {
            toValue: 0,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isLaunching, showTooltip, rippleScale, rippleOpacity]);

  useEffect(() => {
    // Auto-hint
    const timer = setTimeout(() => {
      if (strength < 100 && !isLaunching && !showTooltip) {
        setShowAutoHint(true);
        RNAnimated.sequence([
          RNAnimated.delay(1000),
          RNAnimated.timing(autoHintAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          RNAnimated.delay(4000),
          RNAnimated.timing(autoHintAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => setShowAutoHint(false));
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [strength, isLaunching, showTooltip, autoHintAnim]);

  // Auto-hide on scroll
  useEffect(() => {
    if (!scrollY) return;

    const listenerId = scrollY.addListener(({ value }) => {
      // If tooltip is open and user scrolls more than a tiny bit, hide it
      if (showTooltip && Math.abs(value) > 10) {
        RNAnimated.timing(tooltipOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setShowTooltip(false));
      }
    });

    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [showTooltip, scrollY]);

  const toggleTooltip = () => {
    if (!showTooltip) {
      setShowTooltip(true);
      tooltipOpacity.setValue(0);
      RNAnimated.spring(tooltipOpacity, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      RNAnimated.timing(tooltipOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowTooltip(false));
    }
  };

  const handleLaunch = () => {
    if (isLaunching) return;
    setIsLaunching(true);
    setShowAutoHint(false);

    // Ignition & Giant Launch Sequence
    launchY.value = withSequence(
      withTiming(-50, { duration: 600 }), // Slow ignition
      withTiming(-SCREEN_HEIGHT - 200, { duration: 800 }), // High-speed zoom out
    );

    launchScale.value = withSequence(
      withTiming(1.5, { duration: 600 }), // Get slightly bigger at start
      withTiming(8, { duration: 800 }), // Become giant as it flies away
    );

    // Fade out tooltip and navigate
    RNAnimated.timing(tooltipOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        navigation.navigate('Profile');
        // Reset rocket for next time (hidden)
        setTimeout(() => {
          launchY.value = 0;
          launchScale.value = 1;
          setIsLaunching(false);
          tooltipOpacity.setValue(1);
        }, 1000);
      }, 1200);
    });
  };

  if (strength === 100) return null;

  const rotation = (strength / 100) * 360;

  return (
    <View style={[styles.container, { bottom: insets.bottom + spacing.lg }]}>
      {/* Auto Hint Bubble */}
      {showAutoHint && !showTooltip && !isLaunching && (
        <RNAnimated.View
          style={[
            styles.autoHint,
            {
              backgroundColor: colors.primary,
              opacity: autoHintAnim,
              transform: [{ scale: autoHintAnim }, { translateY: -10 }]
            }
          ]}>
          <Text style={[typography.tiny, { color: colors.onPrimary, fontWeight: '700' }]}>
            Complete Profile !
          </Text>
          <View style={[styles.arrowDown, { borderTopColor: colors.primary }]} />
        </RNAnimated.View>
      )}

      {/* Backdrop to hide on outside click */}
      {showTooltip && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={toggleTooltip}
        />
      )}

      {/* Main Tooltip Card */}
      {showTooltip && (
        <RNAnimated.View style={[styles.tooltip, {
          backgroundColor: colors.surface + 'F8',
          borderColor: colors.border,
          shadowColor: colors.primary,
          opacity: tooltipOpacity,
          transform: [{
            scale: tooltipOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            })
          }]
        }]}>
          <View style={styles.tooltipHeader}>
            <Text style={[typography.labelMedium, { color: colors.textPrimary, fontSize: 16 }]}>
              Profile Assistant ✨
            </Text>
            <View style={[styles.strengthBadge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[typography.tiny, { color: colors.primary, fontWeight: '800' }]}>{strength}%</Text>
            </View>
          </View>

          <View style={[styles.progressBarBase, { backgroundColor: colors.border + '30' }]}>
            <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${strength}%`, shadowColor: colors.primary, shadowOpacity: 0.5, shadowRadius: 4, elevation: 2 }]} />
          </View>

          <Text style={[typography.small, { color: colors.textSecondary, marginTop: spacing.md, lineHeight: 18 }]}>
            {strength < 50
              ? 'Your profile is just starting! Complete it to unlock premium matches.'
              : 'Almost complete! Finish the last bits to stand out from others.'}
          </Text>

          <Pressable
            onPress={handleLaunch}
            style={[styles.tooltipBtn, { backgroundColor: colors.primary }]}>
            <Text style={[typography.labelMedium, { color: colors.onPrimary, fontWeight: '700' }]}>
              Upgrade Profile Now
            </Text>
            <Icon name="bolt" size={14} color={colors.onPrimary} style={{ marginLeft: 8 }} />
          </Pressable>
        </RNAnimated.View>
      )}

      <View style={styles.fabContainer}>
        {/* Solid Ripple Effect */}
        {!showTooltip && !isLaunching && (
          <RNAnimated.View
            pointerEvents="none"
            style={[
              styles.fabRippleLarge,
              {
                backgroundColor: colors.primary,
                opacity: rippleOpacity,
                transform: [{ scale: rippleScale }]
              }
            ]}
          />
        )}

        <View>
          <Pressable
            onPress={() => {
              if (isLaunching) return;
              toggleTooltip();
              setShowAutoHint(false);
            }}
            style={styles.fabTouch}>
            <View style={[styles.circleRing, {
              backgroundColor: 'transparent', // Container is transparent to avoid square leak
              shadowColor: isLaunching ? 'transparent' : colors.primary,
              elevation: isLaunching ? 0 : 8,
            }]}>
              {/* Actual circular background layer */}
              {!isLaunching && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface, borderRadius: 31, overflow: 'hidden' }]} />
              )}
              {/* Glow Track */}
              {!isLaunching && (
                <>
                  <View style={[styles.circleProgress, { borderColor: colors.primary + '20', borderWidth: 4 }]} />
                  <View style={[styles.circleProgress, {
                    borderColor: colors.primary,
                    transform: [{ rotate: `${rotation}deg` }],
                    borderTopColor: colors.primary,
                    borderRightColor: rotation > 90 ? colors.primary : 'transparent',
                    borderBottomColor: rotation > 180 ? colors.primary : 'transparent',
                    borderLeftColor: rotation > 270 ? colors.primary : 'transparent',
                    shadowColor: colors.primary,
                    shadowOpacity: 0.8,
                    shadowRadius: 6,
                  }]} />
                </>
              )}
              <View style={[styles.fab, { backgroundColor: 'transparent' }]}>
                {!isLaunching && (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface, borderRadius: 25, overflow: 'hidden' }]} />
                )}
                <Animated.View style={[styles.iconStack, animatedRocketStyle, { backgroundColor: 'transparent', width: 32 }]}>
                  <Image
                    source={require('../assets/rocket-bg.png')}
                    style={styles.rocketGif}
                    resizeMode="contain"
                    fadeDuration={0}
                  />
                </Animated.View>
                {!isLaunching && (
                  <Text style={[styles.centerPercentText, { color: colors.primary }]}>{strength}%</Text>
                )}
              </View>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: spacing.lg,
    alignItems: 'flex-end',
    zIndex: 110,
  },
  fabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabTouch: {
    zIndex: 10,
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabRippleLarge: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 1,
  },
  circleRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  circleProgress: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 4,
    borderColor: 'transparent',
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStack: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  rocketGif: {
    width: 32,
    height: 32,
    backgroundColor: 'transparent',
  },
  centerPercentText: {
    fontSize: 10,
    fontWeight: '900',
    marginTop: 0,
    fontFamily: typography.labelMedium.fontFamily,
  },
  autoHint: {
    position: 'absolute',
    bottom: 80,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    minWidth: 150,
    alignItems: 'center',
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  arrowDown: {
    position: 'absolute',
    bottom: -6,
    right: 24,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tooltip: {
    position: 'absolute',
    bottom: 85,
    right: 0,
    width: 260,
    padding: spacing.lg,
    borderRadius: radius.xxl,
    borderWidth: 1,
    elevation: 20,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  strengthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  progressBarBase: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tooltipBtn: {
    marginTop: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});

export default ProfileStrengthAssistant;
