import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { components } from '../../../theme/components';
import type { ThemeColors } from '../../../theme/colors';

const BRAND_ICON = require('../../../assets/icons/icon2.2.png');

interface HomescreenHeaderProps {
  scrollY: Animated.Value;
  colors: ThemeColors;
  navigation: any;
  displayName: string;
  goProfile: () => void;
  handleRefer: () => void;
  goSearch: () => void;
  showFilterGrid: boolean;
  setShowFilterGrid: (v: boolean) => void;
  activeFilter: string | null;
}

function greetingLine(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  return 'Good evening';
}

const SearchTicker: React.FC<{ colors: ThemeColors }> = ({ colors }) => {
  const suggestions = [
    'Search for a job or company',
    'Search for Graphic Designer',
    'Search for Software Engineer',
    'Search for Sales Executive',
    'Search for Part-time jobs',
    'Search for Remote opportunities'
  ];
  
  const [index, setIndex] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(translateY, {
        toValue: -30,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setIndex((prev) => (prev + 1) % suggestions.length);
        translateY.setValue(30);
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [suggestions.length]);

  return (
    <View style={styles.tickerContainer}>
      <Animated.Text 
        style={[
          styles.searchPlaceholderWide, 
          { color: colors.textPlaceholder, transform: [{ translateY }] }
        ]} 
        numberOfLines={1}
      >
        {suggestions[index]}
      </Animated.Text>
    </View>
  );
};

const HomescreenHeader: React.FC<HomescreenHeaderProps> = ({
  scrollY,
  colors,
  navigation,
  displayName,
  goProfile,
  handleRefer,
  goSearch,
  showFilterGrid,
  setShowFilterGrid,
  activeFilter,
}) => {
  const [showNotifyHint, setShowNotifyHint] = useState(false);
  const notifyHintAnim = useRef(new Animated.Value(0)).current;
  const bellAnim = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(1)).current;

  const shakeBell = useCallback(() => {
    Animated.sequence([
      Animated.timing(bellAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(bellAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
      Animated.timing(bellAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(bellAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
      Animated.timing(bellAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.timing(badgeAnim, { toValue: 1.5, duration: 200, useNativeDriver: true }),
      Animated.timing(badgeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(badgeAnim, { toValue: 1.5, duration: 200, useNativeDriver: true }),
      Animated.timing(badgeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [bellAnim, badgeAnim]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotifyHint(true);
      shakeBell();
      Animated.spring(notifyHintAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(notifyHintAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setShowNotifyHint(false));
      }, 5000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [notifyHintAnim, shakeBell]);

  useEffect(() => {
    const interval = setInterval(() => {
      shakeBell();
    }, 8000);
    return () => clearInterval(interval);
  }, [shakeBell]);

  const COLLAPSE_DISTANCE = 100;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [0, -84],
    extrapolate: 'clamp',
  });

  const topRowOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE * 0.4],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const searchBarTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [0, 4],
    extrapolate: 'clamp',
  });

  const headerBorderColor = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: ['transparent', colors.border],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.fixedHeader,
        {
          backgroundColor: colors.background,
          borderBottomColor: headerBorderColor,
          borderBottomWidth: 1,
          transform: [{ translateY: headerTranslateY }],
        },
      ]}>
      <View style={styles.headerBlock}>
        <Animated.View style={[styles.headerTopRow, { opacity: topRowOpacity }]}>
          <Pressable
            onPress={goProfile}
            style={styles.headerLeft}
            accessibilityRole="button"
            accessibilityLabel="Open profile">
            <View style={styles.headerAvatar}>
              <Image source={BRAND_ICON} style={styles.avatarImage} />
            </View>
            <View style={styles.headerGreeting}>
              <Text style={[typography.small, { color: colors.textSecondary }]}>
                {greetingLine()} 👋
              </Text>
              <Text style={[typography.appTitle, { color: colors.textPrimary, marginTop: 2 }]} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={[typography.small, { color: colors.primary, marginTop: 4 }]} numberOfLines={2}>
                {"Let's find your dream job"}
              </Text>
            </View>
          </Pressable>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleRefer}
              style={[styles.referBtn, { backgroundColor: colors.primary + '15' }]}
            >
              <Icon name="gift" size={16} color={colors.primary} />
              <Text style={[styles.referText, { color: colors.primary }]}>Refer</Text>
            </TouchableOpacity>

            {showNotifyHint && (
              <Animated.View
                style={[
                  styles.headerNotifyHint,
                  {
                    backgroundColor: colors.accent,
                    opacity: notifyHintAnim,
                    transform: [
                      { scale: notifyHintAnim },
                      { translateX: -1 }
                    ]
                  }
                ]}>
                <Text style={[typography.tiny, { color: colors.onPrimary, fontWeight: '700' }]}>
                  New Notification! 🔔
                </Text>
                <View style={[styles.hintArrowRight, { borderLeftColor: colors.accent }]} />
              </Animated.View>
            )}
            <Pressable
              onPress={() => navigation.navigate('Notifications')}
              hitSlop={8}
              style={[
                styles.notifyBtnCircle,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Notifications">
              <Animated.View style={{
                transform: [{
                  rotate: bellAnim.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ['-20deg', '20deg']
                  })
                }]
              }}>
                <Icon name="bell-o" size={20} color={colors.textPrimary} />
              </Animated.View>
              <Animated.View style={[
                styles.notifyBadge,
                {
                  backgroundColor: colors.accent,
                  borderColor: colors.surface,
                  transform: [{ scale: badgeAnim }]
                }
              ]} />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.searchBarOuter,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
              transform: [{ translateY: searchBarTranslateY }],
            },
          ]}>
          <Pressable
            onPress={goSearch}
            style={styles.searchBarMain}
            accessibilityRole="search"
            accessibilityLabel="Search for a job or company">
            <Icon name="search" size={18} color={colors.textPlaceholder} />
            <SearchTicker colors={colors} />
          </Pressable>

          <Pressable
            onPress={() => setShowFilterGrid(!showFilterGrid)}
            style={({ pressed }) => [
              styles.searchFilterBtnPremium,
              {
                backgroundColor: showFilterGrid || activeFilter !== 'All' ? colors.primary : colors.surfaceHighlight,
              },
              pressed && { transform: [{ scale: 0.94 }] }
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open search and filters">
            <View style={styles.filterBtnContent}>
              <Icon
                name="sliders"
                size={14}
                color={showFilterGrid || activeFilter !== 'All' ? '#fff' : colors.primary}
              />
              {(activeFilter !== 'All' && activeFilter !== null) && (
                <View style={[styles.filterActiveBadgeWhite, { backgroundColor: '#fff' }]} />
              )}
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fixedHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    maxWidth: '100%',
    width: '100%',
    alignSelf: 'stretch',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBlock: {
    gap: spacing.xs,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    zIndex: 5,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 0,
  },
  headerAvatar: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  headerGreeting: {
    flex: 1,
    minWidth: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  referBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    gap: 6,
    marginRight: 4,
  },
  referText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  notifyBtnCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    ...components.jobCard,
    shadowOpacity: 0.08,
    elevation: 2,
  },
  notifyBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
  },
  headerNotifyHint: {
    position: 'absolute',
    right: 54,
    top: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    zIndex: 100,
    elevation: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    minWidth: 110,
    alignItems: 'center',
  },
  hintArrowRight: {
    position: 'absolute',
    right: -6,
    top: 10,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  searchBarOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 46,
    overflow: 'hidden',
    ...components.jobCard,
    shadowOpacity: 0.06,
    elevation: 2,
    zIndex: 10,
  },
  searchBarMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minWidth: 0,
  },
  searchPlaceholderWide: {
    flex: 1,
    fontSize: 15,
    fontFamily: typography.body.fontFamily,
  },
  tickerContainer: {
    flex: 1,
    height: 30,
    overflow: 'hidden',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  searchFilterBtnPremium: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    borderRadius: radius.pill,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterActiveBadgeWhite: {
    position: 'absolute',
    top: -6,
    right: -10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});

export default HomescreenHeader;
