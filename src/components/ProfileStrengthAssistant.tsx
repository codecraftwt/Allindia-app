import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, Dimensions, Image, TouchableOpacity } from 'react-native';
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
  showFilterGrid?: boolean;
}

const ProfileStrengthAssistant = ({ profile, colors, navigation, scrollY, showFilterGrid }: ProfileStrengthCardProps) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();

  // Redux data
  const { completion } = useSelector((state: RootState) => state.profile);
  const { latest = [] } = useSelector((state: RootState) => state.jobs);

  const strength = completion?.percentage || 0;
  const latestCount = latest.length;

  // Active Mode State: 'profile' or 'jobs'
  const [activeMode, setActiveMode] = useState<'profile' | 'jobs'>('profile');
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAutoHint, setShowAutoHint] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    if (!completion) {
      dispatch(fetchProfileCompletion());
    }
  }, [dispatch, completion]);

  // Mode cycling timer: changes mode every 3 seconds
  useEffect(() => {
    if (showTooltip || isLaunching) return; // Pause cycling if tooltip or launching animation is open

    const showProfile = strength < 100;
    const showJobs = latestCount > 0;

    if (showProfile && showJobs) {
      const interval = setInterval(() => {
        setActiveMode(prev => (prev === 'profile' ? 'jobs' : 'profile'));
      }, 3000);
      return () => clearInterval(interval);
    } else if (showProfile) {
      setActiveMode('profile');
    } else if (showJobs) {
      setActiveMode('jobs');
    }
  }, [showTooltip, isLaunching, strength, latestCount]);

  // Reanimated Shared Values
  const launchY = useSharedValue(0);
  const launchScale = useSharedValue(1);
  const rippleAnim = useSharedValue(0);
  const tooltipAnim = useSharedValue(0);
  const autoHintAnim = useSharedValue(0);
  const modeTransition = useSharedValue(0); // 0 = profile, 1 = jobs

  // Animate mode transition when activeMode changes
  useEffect(() => {
    modeTransition.value = withTiming(activeMode === 'profile' ? 0 : 1, {
      duration: 400,
      easing: Easing.inOut(Easing.ease)
    });
  }, [activeMode]);

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
    const rippleColor = activeMode === 'profile' ? colors.primary : '#FF5A5F';
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

  // Animated styles for alternating internals inside FAB
  const animatedProfileContentStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(modeTransition.value, [0, 1], [1, 0]),
      transform: [{ scale: interpolate(modeTransition.value, [0, 1], [1, 0.7]) }],
    };
  });

  const animatedJobsContentStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(modeTransition.value, [0, 1], [0, 1]),
      transform: [{ scale: interpolate(modeTransition.value, [0, 1], [0.7, 1]) }],
    };
  });

  // Auto-hint Logic on mount or mode switch
  useEffect(() => {
    if (showTooltip || isLaunching) return;

    const currentHasHint = activeMode === 'profile' ? (strength < 100) : (latestCount > 0);
    if (!currentHasHint) return;

    setShowAutoHint(true);
    autoHintAnim.value = withSequence(
      withTiming(1, { duration: 500 }),
      withTiming(1, { duration: 2000 }), // Shorter duration to fit 3 sec cycle
      withTiming(0, { duration: 500 })
    );

    const hintTimer = setTimeout(() => {
      setShowAutoHint(false);
    }, 3000);

    return () => clearTimeout(hintTimer);
  }, [activeMode, showTooltip, isLaunching, strength, latestCount]);

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

    // Launch sequence for rocket
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
      navigation.navigate('Profile', { screen: 'ProfileDetails' });
      setTimeout(() => {
        launchY.value = 0;
        launchScale.value = 1;
        setIsLaunching(false);
        setShowTooltip(false);
      }, 1000);
    }, 1500);
  };

  const handleViewAllJobs = () => {
    toggleTooltip();
    navigation.navigate('CategoryJobs', { section: 'latest' });
  };

  const handleOpenJob = (job: any) => {
    toggleTooltip();
    navigation.navigate('JobDetail', { jobId: job.slug || job.id });
  };

  const rotation = (strength / 100) * 360;

  // If both profile is completed (100%) and no latest jobs, hide the assistant FAB entirely
  if (strength === 100 && latestCount === 0) return null;

  return (
    <View
      style={[StyleSheet.absoluteFill, { zIndex: showFilterGrid ? 10 : 110 }]}
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
            bottom: insets.bottom + spacing.lg + 110,
            right: spacing.lg,
          }
        ]}
        pointerEvents="box-none"
      >
        {/* Auto Hint Bubble (Changes according to mode) */}
        {showAutoHint && !showTooltip && !isLaunching && (
          <Animated.View
            style={[
              styles.autoHint,
              animatedAutoHintStyle,
              { backgroundColor: activeMode === 'profile' ? colors.primary : '#FF5A5F' }
            ]}>
            <Text style={[typography.tiny, { color: colors.onPrimary, fontWeight: '700' }]}>
              {activeMode === 'profile' ? 'Complete Profile !' : `${latestCount} New Jobs! 🔥`}
            </Text>
            <View style={[styles.arrowDown, { borderTopColor: activeMode === 'profile' ? colors.primary : '#FF5A5F' }]} />
          </Animated.View>
        )}

        {/* Dynamic Tooltip rendering based on active mode */}
        {showTooltip && activeMode === 'profile' && (
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

        {showTooltip && activeMode === 'jobs' && (
          <Animated.View style={[styles.tooltip, animatedTooltipStyle, {
            backgroundColor: colors.surface + 'F8',
            borderColor: colors.border,
            shadowColor: '#FF5A5F',
          }]}>
            <View style={styles.tooltipHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="bolt" size={16} color="#FF5A5F" style={{ marginRight: 6 }} />
                <Text style={[typography.labelMedium, { color: colors.textPrimary, fontSize: 15, fontWeight: '800' }]}>
                  Latest Jobs
                </Text>
              </View>
              <View style={[styles.strengthBadge, { backgroundColor: '#FF5A5F15' }]}>
                <Text style={[typography.tiny, { color: '#FF5A5F', fontWeight: '800' }]}>{latestCount} new</Text>
              </View>
            </View>

            <View style={styles.miniList}>
              {latest.slice(0, 2).map((job: any, idx: number) => {
                const companyName = job.employer?.company?.company_name || job.company || 'Company';
                const salaryLabel = job.salary || (job.salary_min && job.salary_max ? `₹${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` : 'Negotiable');

                return (
                  <TouchableOpacity
                    key={job.id || idx}
                    onPress={() => handleOpenJob(job)}
                    style={[styles.miniJobItem, { borderBottomColor: idx === 0 ? colors.border + '50' : 'transparent', borderBottomWidth: idx === 0 ? 1 : 0 }]}
                  >
                    <Text style={[typography.labelMedium, { color: colors.textPrimary, fontSize: 13 }]} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <View style={styles.jobMeta}>
                      <Text style={[typography.small, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>
                        {companyName}
                      </Text>
                      <Text style={[typography.small, { color: colors.success, fontWeight: '700' }]}>
                        {salaryLabel}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Pressable onPress={handleViewAllJobs} style={[styles.tooltipBtn, { backgroundColor: '#FF5A5F' }]}>
              <Text style={[typography.labelMedium, { color: '#FFF', fontWeight: '700' }]}>
                View All New Jobs
              </Text>
              <Icon name="chevron-right" size={12} color="#FFF" style={{ marginLeft: 8 }} />
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
                { backgroundColor: activeMode === 'profile' ? colors.primary : '#FF5A5F' }
              ]}
            />
          )}

          <Pressable
            onPress={() => {
              if (isLaunching) return;
              if (activeMode === 'jobs') {
                setShowAutoHint(false);
                navigation.navigate('CategoryJobs', { section: 'latest' });
              } else {
                toggleTooltip();
                setShowAutoHint(false);
              }
            }}
            style={styles.fabTouch}>
            <View style={[styles.circleRing, {
              backgroundColor: 'transparent',
              shadowColor: isLaunching ? 'transparent' : (activeMode === 'profile' ? colors.primary : '#FF5A5F'),
              elevation: isLaunching ? 0 : 8,
            }]}>

              {!isLaunching && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface, borderRadius: 31, overflow: 'hidden' }]} />
              )}

              {/* OVERLAPPED INTERNAL CONTENTS WITH TRANSITIONS */}

              {/* Profile Assistant Mode View */}
              <Animated.View style={[StyleSheet.absoluteFill, styles.internalWrapper, animatedProfileContentStyle]}>
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
              </Animated.View>

              {/* Latest Jobs Mode View */}
              <Animated.View style={[StyleSheet.absoluteFill, styles.internalWrapper, animatedJobsContentStyle]}>
                <View style={styles.fab}>
                  <View style={styles.iconStack}>
                    <Icon name="briefcase" size={20} color="#FF5A5F" />
                  </View>
                  <View style={styles.badgeCountFab}>
                    <Text style={styles.badgeTextCount}>{latestCount > 9 ? '9+' : latestCount}</Text>
                  </View>
                </View>
              </Animated.View>

            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  internalWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
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
  badgeCountFab: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FF5A5F',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  badgeTextCount: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  autoHint: {
    position: 'absolute',
    bottom: 70,
    right: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
    width: 270,
    padding: spacing.md,
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
    marginBottom: spacing.sm,
  },
  strengthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    marginTop: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  miniList: {
    marginVertical: spacing.xs,
    gap: 4,
  },
  miniJobItem: {
    paddingVertical: 8,
  },
  jobMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
});

export default React.memo(ProfileStrengthAssistant);