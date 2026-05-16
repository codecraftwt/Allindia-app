import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, Dimensions, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  interpolate
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { typography } from '../theme/typography';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchProfileCompletion } from '../redux/slice/profileSlice';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProfileStrengthCardProps {
  profile: any;
  colors: any;
  navigation: any;
  scrollY?: any;
}

const ProfileStrengthAssistant = ({ profile, colors, navigation, scrollY }: ProfileStrengthCardProps) => {
  const insets = useSafeAreaInsets();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAutoHint, setShowAutoHint] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { completion } = useSelector((state: RootState) => state.profile);

  useEffect(() => {
    if (!completion) {
      dispatch(fetchProfileCompletion());
    }
  }, [dispatch, completion]);

  const strength = completion?.percentage || 0;

  // Reanimated Shared Values
  const launchY = useSharedValue(0);
  const launchScale = useSharedValue(1);
  const rippleAnim = useSharedValue(0);
  const tooltipAnim = useSharedValue(0);
  const autoHintAnim = useSharedValue(0);

  // Start Ripple Animation
  useEffect(() => {
    rippleAnim.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false
    );
  }, []);

  // Animations Styles
  const animatedRocketStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: launchY.value },
        { scale: launchScale.value }
      ],
      opacity: withTiming(launchY.value < -SCREEN_HEIGHT + 100 ? 0 : 1),
    };
  });

  const animatedRippleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(rippleAnim.value, [0, 1], [1, 1.6]) }],
      opacity: interpolate(rippleAnim.value, [0, 1], [0.5, 0]),
    };
  });

  const animatedTooltipStyle = useAnimatedStyle(() => {
    return {
      opacity: tooltipAnim.value,
      transform: [{ scale: interpolate(tooltipAnim.value, [0, 1], [0.8, 1]) }],
    };
  });

  const animatedAutoHintStyle = useAnimatedStyle(() => {
    return {
      opacity: autoHintAnim.value,
      transform: [
        { scale: autoHintAnim.value },
        { translateY: interpolate(autoHintAnim.value, [0, 1], [0, -10]) }
      ],
    };
  });

  // Auto-hint Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (strength < 100 && !isLaunching && !showTooltip) {
        setShowAutoHint(true);
        autoHintAnim.value = withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(1, { duration: 4000 }), // Wait using timing
          withTiming(0, { duration: 500 })
        );
        setTimeout(() => setShowAutoHint(false), 5500);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [strength, isLaunching, showTooltip]);

  const toggleTooltip = () => {
    if (!showTooltip) {
      setShowTooltip(true);
      tooltipAnim.value = withTiming(1, { duration: 300 });
    } else {
      tooltipAnim.value = withTiming(0, { duration: 200 });
      setTimeout(() => setShowTooltip(false), 200);
    }
  };

  const handleLaunch = () => {
    if (isLaunching) return;
    setIsLaunching(true);
    setShowAutoHint(false);

    // Launch sequence
    launchY.value = withSequence(
      withTiming(-50, { duration: 600 }),
      withTiming(-SCREEN_HEIGHT - 200, { duration: 800 })
    );
    launchScale.value = withSequence(
      withTiming(1.5, { duration: 600 }),
      withTiming(8, { duration: 800 })
    );

    tooltipAnim.value = withTiming(0, { duration: 300 });
    setTimeout(() => {
      navigation.navigate('Profile');
      setTimeout(() => {
        launchY.value = 0;
        launchScale.value = 1;
        setIsLaunching(false);
        setShowTooltip(false);
      }, 1000);
    }, 1500);
  };

  if (strength === 100) return null;

  const rotation = (strength / 100) * 360;

  return (
    <View 
      style={[StyleSheet.absoluteFill, { zIndex: 110 }]} 
      pointerEvents="box-none"
    >
      {showTooltip && (
        <Pressable 
          style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]} 
          onPress={toggleTooltip} 
        />
      )}
      
      <View 
        style={[
          styles.innerContainer, 
          { 
            bottom: insets.bottom + spacing.lg + 110, // Adjusted to match your desired height
            right: spacing.lg,
          }
        ]}
        pointerEvents="box-none"
      >
        {/* Auto Hint Bubble */}
        {showAutoHint && !showTooltip && !isLaunching && (
          <Animated.View
            style={[
              styles.autoHint,
              animatedAutoHintStyle,
              { backgroundColor: colors.primary }
            ]}>
            <Text style={[typography.tiny, { color: colors.onPrimary, fontWeight: '700' }]}>
              Complete Profile !
            </Text>
            <View style={[styles.arrowDown, { borderTopColor: colors.primary }]} />
          </Animated.View>
        )}

        {/* Main Tooltip Card */}
        {showTooltip && (
          <Animated.View style={[styles.tooltip, animatedTooltipStyle, {
            backgroundColor: colors.surface + 'F8',
            borderColor: colors.border,
            shadowColor: colors.primary,
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
              <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${strength}%` }]} />
            </View>

            <Text style={[typography.small, { color: colors.textSecondary, marginTop: spacing.md, lineHeight: 18 }]}>
              {strength < 50
                ? 'Your profile is just starting! Complete it to unlock premium matches.'
                : 'Almost complete! Finish the last bits to stand out from others.'}
            </Text>

            <Pressable onPress={handleLaunch} style={[styles.tooltipBtn, { backgroundColor: colors.primary }]}>
              <Text style={[typography.labelMedium, { color: colors.onPrimary, fontWeight: '700' }]}>
                Upgrade Profile Now
              </Text>
              <Icon name="bolt" size={14} color={colors.onPrimary} style={{ marginLeft: 8 }} />
            </Pressable>
          </Animated.View>
        )}

        <View style={styles.fabContainer}>
          {/* Animated Ripple */}
          {!showTooltip && !isLaunching && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.fabRippleLarge,
                animatedRippleStyle,
                { backgroundColor: colors.primary }
              ]}
            />
          )}

          <Pressable
            onPress={() => {
              if (isLaunching) return;
              toggleTooltip();
              setShowAutoHint(false);
            }}
            style={styles.fabTouch}>
            <View style={[styles.circleRing, {
              backgroundColor: 'transparent',
              shadowColor: isLaunching ? 'transparent' : colors.primary,
              elevation: isLaunching ? 0 : 8,
            }]}>
              {!isLaunching && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface, borderRadius: 31, overflow: 'hidden' }]} />
              )}
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
    bottom: spacing.lg + 80,
    alignItems: 'flex-end',
    zIndex: 110,
  },
  innerContainer: {
    position: 'absolute',
    alignItems: 'flex-end',
    zIndex: 111,
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

export default React.memo(ProfileStrengthAssistant);