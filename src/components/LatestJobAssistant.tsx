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
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { HomeStackParamList } from '../navigation/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LatestJobAssistantProps {
  colors: any;
  showFilterGrid?: boolean;
}

type Nav = StackNavigationProp<HomeStackParamList, 'HomeFeed'>;

const LatestJobAssistant = ({ colors, showFilterGrid }: LatestJobAssistantProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAutoHint, setShowAutoHint] = useState(false);
  
  // Get latest jobs from Redux
  const { latest = [] } = useSelector((state: RootState) => state.jobs);
  const count = latest.length;

  // Reanimated Shared Values
  const rippleAnim = useSharedValue(0);
  const tooltipAnim = useSharedValue(0);
  const autoHintAnim = useSharedValue(0);
  const floatAnim = useSharedValue(0);

  // Start Ripple and Float Animation
  useEffect(() => {
    rippleAnim.value = withRepeat(
      withTiming(1, {
        duration: 2200,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false
    );

    floatAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Animations Styles
  const animatedRippleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(rippleAnim.value, [0, 1], [1, 1.5]) }],
      opacity: interpolate(rippleAnim.value, [0, 1], [0.6, 0]),
    };
  });

  const animatedTooltipStyle = useAnimatedStyle(() => {
    return {
      opacity: tooltipAnim.value,
      transform: [{ scale: interpolate(tooltipAnim.value, [0, 1], [0.85, 1]) }],
    };
  });

  const animatedAutoHintStyle = useAnimatedStyle(() => {
    return {
      opacity: autoHintAnim.value,
      transform: [
        { scale: autoHintAnim.value },
        { translateY: interpolate(autoHintAnim.value, [0, 1], [0, -8]) }
      ],
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: interpolate(floatAnim.value, [0, 1], [0, -3]) }],
    };
  });

  // Auto-hint Logic on mount/load if new jobs exist
  useEffect(() => {
    const timer = setTimeout(() => {
      if (count > 0 && !showTooltip) {
        setShowAutoHint(true);
        autoHintAnim.value = withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(1, { duration: 4500 }), 
          withTiming(0, { duration: 500 })
        );
        setTimeout(() => setShowAutoHint(false), 6000);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [count]);

  const toggleTooltip = () => {
    if (!showTooltip) {
      setShowTooltip(true);
      tooltipAnim.value = withTiming(1, { duration: 300 });
    } else {
      tooltipAnim.value = withTiming(0, { duration: 200 });
      setTimeout(() => setShowTooltip(false), 200);
    }
  };

  const handleViewAll = () => {
    toggleTooltip();
    navigation.navigate('CategoryJobs', { section: 'latest' });
  };

  const handleOpenJob = (job: any) => {
    toggleTooltip();
    navigation.navigate('JobDetail', { jobId: job.slug || job.id });
  };

  if (count === 0) return null;

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
            // Positioned exactly 72px above the ProfileStrengthAssistant bottom position
            bottom: insets.bottom + spacing.lg + 110 + 72, 
            right: spacing.lg,
          }
        ]}
        pointerEvents="box-none"
      >
        {/* Auto Hint Bubble */}
        {showAutoHint && !showTooltip && (
          <Animated.View
            style={[
              styles.autoHint,
              animatedAutoHintStyle,
              { backgroundColor: '#FF5A5F' }
            ]}>
            <Text style={[typography.tiny, { color: '#FFF', fontWeight: '800' }]}>
              {count} New Jobs! 🔥
            </Text>
            <View style={[styles.arrowDown, { borderTopColor: '#FF5A5F' }]} />
          </Animated.View>
        )}

        {/* Tooltip Card */}
        {showTooltip && (
          <Animated.View style={[styles.tooltip, animatedTooltipStyle, {
            backgroundColor: colors.surface + 'FA',
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
              <View style={[styles.countBadge, { backgroundColor: '#FF5A5F15' }]}>
                <Text style={[typography.tiny, { color: '#FF5A5F', fontWeight: '800' }]}>{count} new</Text>
              </View>
            </View>

            {/* Quick Preview list of top 2 jobs */}
            <View style={styles.miniList}>
              {latest.slice(0, 2).map((job: any, index: number) => {
                const companyName = job.employer?.company?.company_name || job.company || 'Company';
                const salaryLabel = job.salary || (job.salary_min && job.salary_max ? `₹${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` : 'Negotiable');

                return (
                  <TouchableOpacity
                    key={job.id || index}
                    onPress={() => handleOpenJob(job)}
                    style={[styles.miniJobItem, { borderBottomColor: index === 0 ? colors.border + '50' : 'transparent', borderBottomWidth: index === 0 ? 1 : 0 }]}
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

            <Pressable onPress={handleViewAll} style={[styles.tooltipBtn, { backgroundColor: '#FF5A5F' }]}>
              <Text style={[typography.labelMedium, { color: '#FFF', fontWeight: '700' }]}>
                View All New Jobs
              </Text>
              <Icon name="chevron-right" size={12} color="#FFF" style={{ marginLeft: 8 }} />
            </Pressable>
          </Animated.View>
        )}

        <View style={styles.fabContainer}>
          {/* Animated Ripple */}
          {!showTooltip && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.fabRippleLarge,
                animatedRippleStyle,
                { backgroundColor: '#FF5A5F' }
              ]}
            />
          )}

          <Pressable
            onPress={() => {
              toggleTooltip();
              setShowAutoHint(false);
            }}
            style={styles.fabTouch}>
            <View style={[styles.circleRing, {
              backgroundColor: colors.surface,
              shadowColor: '#FF5A5F',
              elevation: 8,
            }]}>
              <Animated.View style={[styles.iconStack, animatedIconStyle]}>
                <Icon name="briefcase" size={20} color="#FF5A5F" />
              </Animated.View>
              <View style={styles.badgeCountFab}>
                <Text style={styles.badgeTextCount}>{count > 9 ? '9+' : count}</Text>
              </View>
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
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  iconStack: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  badgeCountFab: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF5A5F',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  badgeTextCount: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  autoHint: {
    position: 'absolute',
    bottom: 72,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    minWidth: 120,
    alignItems: 'center',
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  arrowDown: {
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
  tooltip: {
    position: 'absolute',
    bottom: 75,
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
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
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
  tooltipBtn: {
    marginTop: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
});

export default React.memo(LatestJobAssistant);
