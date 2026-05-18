import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Share,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const BRAND_ICON = require('../../../../assets/Job india Icon & logo file/Icon Job india.jpg');
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';
import { radius } from '../../../../theme/radius';
import { components } from '../../../../theme/components';
import type { ThemeColors } from '../../../../theme/colors';
import { useTheme } from '../../../../context/ThemeContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface HomescreenHeaderProps {
  scrollY: Animated.Value;
  colors: ThemeColors;
  navigation: any;
  displayName: string;
  selectedCity: string;
  selectedArea: string;
  showNotifyHint: boolean;
  notifyHintAnim: Animated.Value;
  bellAnim: Animated.Value;
  badgeAnim: Animated.Value;
  showFilterGrid: boolean;
  activeFilter: string | null;
  handleFilterOpen: () => void;
  goSearch: () => void;
  goProfile: () => void;
  onHeaderLayout?: (height: number) => void;
  onPressNotifyHint?: () => void;
}

const styles = StyleSheet.create({
  statusBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 101,
  },
  fixedHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: 0,
    paddingBottom: spacing.xs,
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
  headerGreeting: {
    flex: 1,
    minWidth: 0,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTextStack: {
    justifyContent: 'center',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notifyBtnCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'visible',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
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

const SearchTicker: React.FC<{ colors: ThemeColors }> = ({ colors }) => {
  const suggestions = [
    'a job or company',
    'Graphic Designer',
    'Software Engineer',
    'Sales Executive',
    'Part-time jobs',
    'Remote opportunities'
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
      <Text style={[styles.searchPlaceholderWide, { color: colors.textPlaceholder, flex: 0 }]}>Search for</Text>
      <Animated.Text 
        style={[
          styles.searchPlaceholderWide, 
          { color: colors.textPlaceholder, transform: [{ translateY }], marginLeft: 4, flex: 1 }
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
  selectedCity,
  selectedArea,
  showNotifyHint,
  notifyHintAnim,
  bellAnim,
  badgeAnim,
  showFilterGrid,
  activeFilter,
  handleFilterOpen,
  goSearch,
  goProfile,
  onHeaderLayout,
  onPressNotifyHint,
}) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const COLLAPSE_DISTANCE = 80;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [0, -COLLAPSE_DISTANCE + 26],
    extrapolate: 'clamp',
  });

  const topRowOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <>
      <Animated.View
        style={[
          styles.statusBarFill,
          {
            height: insets.top,
            backgroundColor: colors.surface,
            opacity: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
          },
        ]}
      />
      <View
        style={[
          styles.statusBarFill,
          {
            height: insets.top,
            backgroundColor: colors.background,
            zIndex: 100,
          },
        ]}
      />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <Animated.View
        onLayout={(e) => {
          const { height } = e.nativeEvent.layout;
          if (height > 0) onHeaderLayout?.(height);
        }}
        style={[
          styles.fixedHeader,
          {
            paddingTop: insets.top + 10,
            backgroundColor: colors.surface,
            transform: [{ translateY: headerTranslateY }],
            // Use opacity for background transition instead of color interpolation
            // This is much more stable on Android
            shadowColor: colors.shadow,
            shadowOpacity: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 0.1],
              extrapolate: 'clamp',
            }),
            elevation: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 4],
              extrapolate: 'clamp',
            }),
          },
        ]}>
        {/* Background layer for color transition */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: colors.background,
              opacity: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      <View style={styles.headerBlock}>
        <Animated.View style={[styles.headerTopRow, { opacity: topRowOpacity }]}>
          <Pressable
            onPress={goProfile}
            style={styles.headerLeft}
            accessibilityRole="button"
            accessibilityLabel="Open profile">
            <View style={styles.headerGreeting}>
              <Pressable
                onPress={() => navigation.navigate('LocationSelection')}
                style={styles.locationSelector}
              >
                <View style={[styles.locationIconBox, { backgroundColor: '#fff', overflow: 'hidden' }]}>
                  <Image 
                    source={BRAND_ICON} 
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }} 
                  />
                </View>
                <View style={styles.locationTextStack}>
                  <View style={styles.cityRow}>
                    <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: '900' }]}>
                      {selectedCity || 'Mumbai'}
                    </Text>
                    <Icon name="map-marker" size={12} color={colors.primary} style={{ marginLeft: 6 }} />
                    <Icon name="chevron-down" size={10} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                  </View>
                  <Text style={[typography.tiny, { color: colors.textSecondary, marginTop: -2 }]} numberOfLines={1}>
                    {selectedArea || 'Andheri East'}
                  </Text>
                </View>
              </Pressable>
            </View>
          </Pressable>
          <View style={styles.headerActions}>
            {showNotifyHint && (
              <AnimatedPressable
                onPress={onPressNotifyHint}
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
              </AnimatedPressable>
            )}
            <Pressable
              onPress={() => navigation.navigate('Saved')}
              hitSlop={8}
              style={[
                styles.notifyBtnCircle,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                  marginRight: 4,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Saved jobs">
              <IonIcon name="heart" size={24} color="#EF4444" />
            </Pressable>

            <Pressable
              onPress={() => {
                if (onPressNotifyHint) {
                  onPressNotifyHint();
                }
                navigation.navigate('Notifications');
              }}
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
                <IonIcon name="notifications" size={22} color={colors.primary} />
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

        <View
          style={[
            styles.searchBarOuter,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
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
            onPress={handleFilterOpen}
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
        </View>
      </View>
    </Animated.View>
    </>
  );
};

export default React.memo(HomescreenHeader);
