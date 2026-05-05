import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Share,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
const BRAND_ICON = require('../../../assets/icons/icon2.2.png');
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchMetaCategories } from '../../../redux/slice/metaSlice';
import { fetchHomeFeed, fetchJobs, filterJobs } from '../../../redux/slice/jobSlice';
import { fetchProfile } from '../../../redux/slice/profileSlice';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useProfileSetup } from '../../../context/ProfileSetupContext';
import { useTheme } from '../../../context/ThemeContext';
import type { HomeStackParamList, MainTabParamList } from '../../../navigation/types';
import type { ThemeColors } from '../../../theme/colors';
import { components } from '../../../theme/components';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import ProfileStrengthAssistant from '../../../components/ProfileStrengthAssistant';
import HeaderFilterGrid from '../../../components/HeaderFilterGrid';
import HeroBanner from '../../../components/HeroBanner';
import SkeletonPulse from '../../../components/SkeletonPulse';
import type { HomeJob } from './homeMockData';
import {
  HOME_CATEGORIES,
} from './homeMockData';

const H_CARD_W = Math.min(Dimensions.get('window').width * 0.78, 300);

type HomeNav = StackNavigationProp<HomeStackParamList, 'HomeFeed'>;



function greetingLine(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) {
    return 'Good morning';
  }
  if (h >= 12 && h < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function getCategoryIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('it') || n.includes('tech')) return 'laptop';
  if (n.includes('sales')) return 'line-chart';
  if (n.includes('hr') || n.includes('people')) return 'users';
  if (n.includes('finance') || n.includes('account')) return 'money';
  if (n.includes('ops') || n.includes('operation')) return 'cogs';
  if (n.includes('health')) return 'heartbeat';
  if (n.includes('edu')) return 'book';
  if (n.includes('hospitality')) return 'hotel';
  return 'briefcase';
}

function SectionHeader({
  title,
  icon,
  iconColor,
  colors,
  onPress,
}: {
  title: string;
  icon?: string;
  iconColor?: string;
  colors: ThemeColors;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      {icon ? (
        <Icon name={icon} size={18} color={iconColor ?? colors.primary} style={styles.sectionIcon} />
      ) : null}
      <Text style={[typography.sectionTitle, { color: colors.textPrimary, flex: 1 }]}>{title}</Text>
      <Pressable hitSlop={8} onPress={onPress}>
        <Text style={[typography.labelMedium, { color: colors.primary }]}>See all</Text>
      </Pressable>
    </View>
  );
}

function JobTrendCard({
  job,
  colors,
  onPress,
}: {
  job: any;
  colors: ThemeColors;
  onPress?: () => void;
}) {
  const companyName = job.employer?.company?.company_name || job.company || 'Unknown Company';
  const locationLabel = job.location?.label || job.location || 'Remote';
  const salaryLabel = job.salary || (job.salary_min && job.salary_max ? `₹${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` : 'Negotiable');
  const jobType = job.job_type_label || job.employmentType || job.job_type || 'Full Time';
  const postedLabel = job.created_at ? new Date(job.created_at).toLocaleDateString() : (job.postedLabel || 'Recently');

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.trendCard,
        {
          width: H_CARD_W,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}>
      {job.tags && job.tags.length > 0 && (
        <View style={[
          styles.hotBadge,
          { backgroundColor: colors.primary + '15' }
        ]}>
          <Icon name="tag" size={11} color={colors.primary} />
          <Text style={[
            typography.small,
            {
              color: colors.primary,
              fontFamily: typography.labelMedium.fontFamily,
              marginLeft: 4
            }
          ]}>
            {job.tags[0]}
          </Text>
        </View>
      )}
      <Text style={[typography.jobTitle, styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={2}>
        {job.title}
      </Text>
      <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={1}>
        {companyName}
      </Text>
      <View style={styles.cardMetaRow}>
        <Icon name="map-marker" size={12} color={colors.textPlaceholder} />
        <Text style={[typography.small, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>
          {locationLabel}
        </Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={[typography.labelMedium, { color: colors.success }]}>{salaryLabel}</Text>
        <Text style={[typography.small, { color: colors.textPlaceholder }]}>{postedLabel}</Text>
      </View>
      <View style={[styles.typePill, { backgroundColor: colors.surfaceHighlight }]}>
        <Text style={[typography.small, { color: colors.primary, fontFamily: typography.labelMedium.fontFamily }]}>
          {jobType}
        </Text>
      </View>
    </Pressable>
  );
}

function JobListCard({
  job,
  colors,
  onPress,
}: {
  job: any;
  colors: ThemeColors;
  onPress?: () => void;
}) {
  const companyName = job.employer?.company?.company_name || job.company || 'Unknown Company';
  const locationLabel = job.location?.label || job.location || 'Remote';
  const salaryLabel = job.salary || (job.salary_min && job.salary_max ? `₹${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` : 'Negotiable');
  const jobType = job.job_type_label || job.employmentType || job.job_type || 'Full Time';
  const postedLabel = job.created_at ? new Date(job.created_at).toLocaleDateString() : (job.postedLabel || 'Recently');

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.listCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}>
      <View style={styles.listCardTop}>
        <View style={[styles.listIconWrap, { backgroundColor: colors.surfaceHighlight }]}>
          <Icon name="briefcase" size={18} color={colors.primary} />
        </View>
        <View style={styles.listCardText}>
          <Text style={[typography.jobTitle, { color: colors.textPrimary }]} numberOfLines={2}>
            {job.title}
          </Text>
          <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
            {companyName}
          </Text>
        </View>
      </View>
      <View style={styles.listMeta}>
        <View style={styles.metaItem}>
          <Icon name="map-marker" size={13} color={colors.textPlaceholder} />
          <Text style={[typography.small, { color: colors.textSecondary }]} numberOfLines={1}>
            {locationLabel}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="clock-o" size={13} color={colors.textPlaceholder} />
          <Text style={[typography.small, { color: colors.textPlaceholder }]} numberOfLines={1}>
            {postedLabel}
          </Text>
        </View>
      </View>
      <View style={styles.listFooter}>
        <Text style={[typography.labelMedium, { color: colors.success }]}>{salaryLabel}</Text>
        <View style={[styles.typePillSm, { backgroundColor: colors.badgeBackground }]}>
          <Text style={[typography.small, { color: colors.badgeText, fontFamily: typography.labelMedium.fontFamily }]}>
            {jobType}
          </Text>
        </View>
      </View>
    </Pressable>
  );
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
      // Slide up and out
      Animated.timing(translateY, {
        toValue: -30,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        // Change text
        setIndex((prev) => (prev + 1) % suggestions.length);
        // Reset position to bottom
        translateY.setValue(30);
        // Slide up and in
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

const HomeSkeleton: React.FC = () => {
  return (
    <View style={{ gap: spacing.lg }}>
      {/* Hero Skeleton */}
      <SkeletonPulse style={styles.heroSkeleton} />

      <View style={{ gap: spacing.md }}>
        <SkeletonPulse style={styles.sectionTitleSkeleton} />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {[1, 2, 3].map(i => <SkeletonPulse key={i} style={styles.chipSkeleton} />)}
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <SkeletonPulse style={styles.sectionTitleSkeleton} />
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          {[1, 2].map(i => <SkeletonPulse key={i} style={styles.trendSkeleton} />)}
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <SkeletonPulse style={styles.sectionTitleSkeleton} />
        {[1, 2, 3].map(i => <SkeletonPulse key={i} style={styles.listSkeleton} />)}
      </View>
    </View>
  );
};

const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HomeNav>();
  const { draft } = useProfileSetup();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { categories, loading: metaLoading } = useSelector((state: RootState) => state.meta);
  const { trending, nearby, recommended, latest, loading: jobsLoading } = useSelector((state: RootState) => state.jobs);
  const { data: profileData } = useSelector((state: RootState) => state.profile);
  const isAnyLoading = jobsLoading || metaLoading;

  const [showNotifyHint, setShowNotifyHint] = useState(false);
  const notifyHintAnim = useRef(new Animated.Value(0)).current;
  const bellAnim = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(1)).current;

  // Filter Grid States
  const [showFilterGrid, setShowFilterGrid] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // List Visibility States
  const [showAllNearby, setShowAllNearby] = useState(false);
  const [showAllRecommended, setShowAllRecommended] = useState(false);

  const scrollY = useMemo(() => new Animated.Value(0), []);
  const lastScrollY = useRef(0);
  const isTabBarVisible = useRef(true);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    
    // Header animation
    scrollY.setValue(currentOffset);

    // Tab bar hide/show logic
    const diff = currentOffset - lastScrollY.current;
    if (currentOffset <= 0) {
      // At the top
      if (!isTabBarVisible.current) {
        isTabBarVisible.current = true;
        navigation.setParams({ tabBarHidden: false });
      }
    } else if (Math.abs(diff) > 15) {
      if (diff > 0 && isTabBarVisible.current && currentOffset > 100) {
        // Scrolling down
        isTabBarVisible.current = false;
        navigation.setParams({ tabBarHidden: true });
      } else if (diff < 0 && !isTabBarVisible.current) {
        // Scrolling up
        isTabBarVisible.current = true;
        navigation.setParams({ tabBarHidden: false });
      }
      lastScrollY.current = currentOffset;
    }
  };



  const shakeBell = useCallback(() => {
    // Shake the bell
    Animated.sequence([
      Animated.timing(bellAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(bellAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
      Animated.timing(bellAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(bellAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
      Animated.timing(bellAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();

    // Pulse the badge
    Animated.sequence([
      Animated.timing(badgeAnim, { toValue: 1.5, duration: 200, useNativeDriver: true }),
      Animated.timing(badgeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(badgeAnim, { toValue: 1.5, duration: 200, useNativeDriver: true }),
      Animated.timing(badgeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [bellAnim, badgeAnim]);

  useEffect(() => {
    // Show hint initially after 3 seconds
    const timer = setTimeout(() => {
      setShowNotifyHint(true);
      shakeBell();
      Animated.spring(notifyHintAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Auto-hide after 5 seconds
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
    // Repeat shake every 8 seconds
    const interval = setInterval(() => {
      shakeBell();
    }, 8000);

    return () => clearInterval(interval);
  }, [shakeBell]);

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchMetaCategories());
    if (recommended.length === 0 && trending.length === 0) dispatch(fetchHomeFeed());
    if (!profileData) dispatch(fetchProfile());
  }, [dispatch, categories.length, recommended.length, trending.length, profileData]);

  const displayName = useMemo(() => {
    const n = user?.name || draft.fullName.trim();
    return n.length > 0 ? n : 'Job seeker';
  }, [user?.name, draft.fullName]);

  const avatarInitials = useMemo(() => profileInitials(displayName), [displayName]);

  const goSearch = () => {
    navigation.navigate('SearchHome');
  };

  const goProfile = () => {
    const tab = navigation.getParent() as BottomTabNavigationProp<MainTabParamList> | undefined;
    tab?.navigate('Profile');
  };

  const openJob = (job: any) => {
    navigation.navigate('JobDetail', { jobId: job.slug || job.id });
  };

  const applyAdvancedFilters = (filters: any) => {
    setShowFilterGrid(false);
    // Navigate directly to JobListing with filters
    navigation.navigate('JobListing', { filters });
  };

  const onRefresh = useCallback(() => {
    dispatch(fetchMetaCategories());
    dispatch(fetchHomeFeed());
    dispatch(fetchProfile());
  }, [dispatch]);

  const handleRefer = async () => {
    try {
      await Share.share({
        message: 'Hey! Join JobIndia and find your dream job quickly. Download now: https://jobindia.app/refer',
        title: 'Refer JobIndia',
      });
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const COLLAPSE_DISTANCE = 80;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [0, -COLLAPSE_DISTANCE + 10], // Reduced from 40 to 10 to move it higher
    extrapolate: 'clamp',
  });

  const topRowOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <Animated.View
        style={[
          styles.fixedHeader,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
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
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollMain}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 120 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isAnyLoading && recommended.length > 0}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            progressViewOffset={140}
          />
        }>
        {isAnyLoading && recommended.length === 0 ? (
          <HomeSkeleton />
        ) : (
          <>
            <HeroBanner
              colors={colors}
              onPress={goSearch}
            />

            <SectionHeader
              title="Categories"
              colors={colors}
              onPress={() => navigation.navigate('JobCategories')}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
              decelerationRate="fast">
              {categories.map(cat => (
                <Pressable
                  key={cat.id}
                  onPress={() => navigation.navigate('IndustryCategory', { categoryId: cat.id, categoryName: cat.name })}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      shadowColor: colors.shadow,
                    },
                  ]}>
                  <View style={[styles.categoryIcon, { backgroundColor: colors.surfaceHighlight }]}>
                    <Icon name={getCategoryIcon(cat.name)} size={16} color={colors.primary} />
                  </View>
                  <Text style={[typography.small, { color: colors.textPrimary, fontFamily: typography.labelMedium.fontFamily }]} numberOfLines={1}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
              {categories.length === 0 && HOME_CATEGORIES.map(cat => (
                <Pressable
                  key={cat.id}
                  onPress={() => navigation.navigate('JobListing', { filters: { category_id: undefined }, categoryName: cat.label })}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      shadowColor: colors.shadow,
                    },
                  ]}>
                  <View style={[styles.categoryIcon, { backgroundColor: colors.surfaceHighlight }]}>
                    <Icon name={cat.icon} size={16} color={colors.primary} />
                  </View>
                  <Text style={[typography.small, { color: colors.textPrimary, fontFamily: typography.labelMedium.fontFamily }]}>
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {latest && latest.length > 0 && (
              <>
                <SectionHeader
                  title="Latest jobs"
                  icon="clock-o"
                  iconColor={colors.success}
                  colors={colors}
                  onPress={() => navigation.navigate('CategoryJobs', { section: 'latest' })}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.trendingScroll}
                  decelerationRate="fast">
                  {latest.map((job: any) => (
                    <JobTrendCard
                      key={job.id}
                      job={{ ...job, isLatest: true }}
                      colors={colors}
                      onPress={() => openJob(job)}
                    />
                  ))}
                </ScrollView>
              </>
            )}

            {trending && trending.length > 0 && (
              <>
                <SectionHeader
                  title="Trending jobs"
                  icon="fire"
                  iconColor={colors.warning}
                  colors={colors}
                  onPress={() => navigation.navigate('CategoryJobs', { section: 'trending' })}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.trendingScroll}
                  decelerationRate="fast">
                  {trending.map((job: any) => (
                    <JobTrendCard
                      key={job.id}
                      job={job}
                      colors={colors}
                      onPress={() => openJob(job)}
                    />
                  ))}
                </ScrollView>
              </>
            )}

            {nearby && nearby.length > 0 && (
              <>
                <SectionHeader
                  title="Nearby jobs"
                  icon="map-marker"
                  colors={colors}
                  onPress={() => navigation.navigate('CategoryJobs', { section: 'nearby' })}
                />
                <View style={styles.verticalList}>
                  {(showAllNearby ? nearby : nearby.slice(0, 5)).map((job: any) => (
                    <JobListCard key={job.id} job={job} colors={colors} onPress={() => openJob(job)} />
                  ))}
                </View>
                {nearby.length > 5 && !showAllNearby && (
                  <TouchableOpacity
                    onPress={() => setShowAllNearby(true)}
                    style={styles.viewMoreVertical}
                  >
                    <Text style={[typography.labelMedium, { color: colors.primary }]}>View {nearby.length - 5} More Nearby Jobs</Text>
                    <Icon name="chevron-down" size={14} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </>
            )}

            {recommended && recommended.length > 0 && (
              <>
                <SectionHeader
                  title="Recommended for you"
                  icon="bullseye"
                  iconColor={colors.primary}
                  colors={colors}
                  onPress={() => navigation.navigate('CategoryJobs', { section: 'recommended' })}
                />
                <View style={styles.verticalList}>
                  {(showAllRecommended ? recommended : recommended.slice(0, 5)).map((job: any) => (
                    <JobListCard key={job.id} job={job} colors={colors} onPress={() => openJob(job)} />
                  ))}
                </View>
                {recommended.length > 5 && !showAllRecommended && (
                  <TouchableOpacity
                    onPress={() => setShowAllRecommended(true)}
                    style={styles.viewMoreVertical}
                  >
                    <Text style={[typography.labelMedium, { color: colors.primary }]}>View {recommended.length - 5} More Recommendations</Text>
                    <Icon name="chevron-down" size={14} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </>
            )}

            {!jobsLoading && trending.length === 0 && nearby.length === 0 && recommended.length === 0 && latest.length === 0 && (
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginVertical: spacing.md }]}>
                No jobs found at the moment.
              </Text>
            )}
          </>
        )}
      </Animated.ScrollView>

      {user && (
        <ProfileStrengthAssistant
          profile={profileData}
          colors={colors}
          navigation={navigation}
          scrollY={scrollY}
        />
      )}

      <HeaderFilterGrid
        visible={showFilterGrid}
        onClose={() => setShowFilterGrid(false)}
        onFilterSelect={applyAdvancedFilters}
        activeFilter={activeFilter}
        colors={colors}
        headerTranslateY={headerTranslateY}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  fixedHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xs, // Reduced even more
    maxWidth: '100%',
    width: '100%',
    alignSelf: 'stretch',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100, // Increased to be on top of everything
  },
  scrollMain: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 136,
    maxWidth: '100%',
    width: '100%',
    alignSelf: 'stretch',
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
    right: 54, // Positioned to the left of the 46px bell icon
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
    minHeight: 46, // Reduced from 52
    overflow: 'hidden',
    ...components.jobCard,
    shadowOpacity: 0.06,
    elevation: 2,
    zIndex: 10, // Higher than HeaderFilterGrid
  },
  searchBarMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs, // Reduced from sm
    paddingHorizontal: spacing.md,
    minWidth: 0,
  },
  searchPlaceholderWide: {
    flex: 1,
    fontSize: 15,
    fontFamily: typography.body.fontFamily,
  },
  searchDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: spacing.sm,
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
  filterLabelText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 4,
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  categoriesScroll: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    paddingRight: spacing.md,
  },
  categoryChip: {
    minWidth: 84,
    maxWidth: 104,
    paddingVertical: spacing.sm,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 4,
    ...components.jobCard,
    shadowOpacity: 0.04,
    elevation: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingScroll: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
    paddingRight: spacing.md,
  },
  trendCard: {
    padding: 8,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    ...components.jobCard,
  },
  hotBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginBottom: 6,
  },
  cardTitle: {
    minHeight: 44,
  },
  tickerContainer: {
    flex: 1,
    height: 30,
    overflow: 'hidden',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  typePill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  verticalList: {
    gap: spacing.md,
    marginBottom: 0,
  },
  listCard: {
    padding: 10,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    ...components.jobCard,
  },
  listCardTop: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  listIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCardText: {
    flex: 1,
    minWidth: 0,
  },
  listMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  typePillSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  // Skeleton Styles
  heroSkeleton: {
    height: 160,
    borderRadius: radius.xl,
    width: '100%',
    marginBottom: spacing.lg,
  },
  sectionTitleSkeleton: {
    height: 24,
    width: 150,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  chipSkeleton: {
    height: 44,
    width: 100,
    borderRadius: radius.card,
  },
  trendSkeleton: {
    height: 180,
    width: H_CARD_W,
    borderRadius: radius.card,
  },
  listSkeleton: {
    height: 140,
    width: '100%',
    borderRadius: radius.card,
    marginBottom: spacing.md,
  },
  viewMoreVertical: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: 8,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
});

export default HomeScreen;
