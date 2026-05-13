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
  Modal,
  TextInput,
  Easing,
} from 'react-native';
const BRAND_ICON = require('../../../assets/icons/icon2.2.png');
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchMetaCategories } from '../../../redux/slice/metaSlice';
import { fetchHomeFeed, fetchJobs, filterJobs } from '../../../redux/slice/jobSlice';
import { fetchProfile } from '../../../redux/slice/profileSlice';
import { fetchAdminMedia } from '../../../redux/slice/mediaSlice';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import IonIcon from 'react-native-vector-icons/Ionicons';
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

const getCategoryColor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('beauty')) return '#FDE2E4'; // Soft Pink
  if (n.includes('construction')) return '#E2E2E2'; // Gray
  if (n.includes('content') || n.includes('journalism')) return '#FFF1E6'; // Cream
  if (n.includes('data science') || n.includes('analytics')) return '#E0FBFC'; // Light Blue
  if (n.includes('delivery') || n.includes('driver')) return '#FFDDD2'; // Peach
  if (n.includes('design') || n.includes('architecture')) return '#EAF4F4'; // Mint
  if (n.includes('hardware') || n.includes('network')) return '#D8E2DC'; // Sage
  if (n.includes('fashion') || n.includes('tailoring')) return '#FAD2E1'; // Rose
  if (n.includes('healthcare') || n.includes('doctor') || n.includes('hospital')) return '#FFADAD'; // Soft Red
  if (n.includes('hospitality') || n.includes('restaurant') || n.includes('tourism')) return '#FFE5B4'; // Peach/Yellow
  if (n.includes('house help') || n.includes('worker')) return '#ECE4DB'; // Sand
  if (n.includes('human resources') || n.includes('hr')) return '#B9FBC0'; // Soft Green
  if (n.includes('it services') || n.includes('development')) return '#A0C4FF'; // Blue
  if (n.includes('labour') || n.includes('factory')) return '#D7E3FC'; // Sky
  if (n.includes('legal')) return '#E2ECE9'; // Pale Green
  if (n.includes('marketing')) return '#FDFFB6'; // Lemon
  if (n.includes('media') || n.includes('entertainment')) return '#BDB2FF'; // Purple
  if (n.includes('operations')) return '#D0F4DE'; // Mint Green
  if (n.includes('purchase') || n.includes('supply chain')) return '#FFC6FF'; // Magenta/Pink
  if (n.includes('sales')) return '#CAFFBF'; // Lime
  if (n.includes('security')) return '#E5E5E5'; // Silver
  if (n.includes('sport') || n.includes('fitness')) return '#FFD6A5'; // Orange
  if (n.includes('technician') || n.includes('vehicle')) return '#CFBCFF'; // Violet
  return '#F1F5F9';
};

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('beauty')) return 'magic';
  if (n.includes('construction')) return 'building';
  if (n.includes('content') || n.includes('journalism')) return 'pencil';
  if (n.includes('data science') || n.includes('analytics')) return 'database';
  if (n.includes('delivery') || n.includes('driver')) return 'truck';
  if (n.includes('design') || n.includes('architecture')) return 'paint-brush';
  if (n.includes('hardware') || n.includes('network')) return 'server';
  if (n.includes('fashion') || n.includes('tailoring')) return 'scissors';
  if (n.includes('healthcare') || n.includes('doctor') || n.includes('hospital')) return 'user-md';
  if (n.includes('hospitality') || n.includes('restaurant') || n.includes('tourism')) return 'coffee';
  if (n.includes('house help') || n.includes('worker')) return 'home';
  if (n.includes('human resources') || n.includes('hr')) return 'users';
  if (n.includes('it services') || n.includes('development')) return 'code';
  if (n.includes('labour') || n.includes('factory')) return 'industry';
  if (n.includes('legal')) return 'balance-scale';
  if (n.includes('marketing')) return 'bullhorn';
  if (n.includes('media') || n.includes('entertainment')) return 'film';
  if (n.includes('operations')) return 'cogs';
  if (n.includes('purchase') || n.includes('supply chain')) return 'shopping-cart';
  if (n.includes('sales')) return 'line-chart';
  if (n.includes('security')) return 'shield';
  if (n.includes('sport') || n.includes('fitness')) return 'heartbeat';
  if (n.includes('technician') || n.includes('vehicle')) return 'wrench';
  return 'briefcase';
}

function getTagConfig(tag: string, colors: any) {
  const t = tag.toLowerCase();
  if (t.includes('urgent') || t.includes('hot')) return { icon: 'bolt', color: colors.warning };
  if (t.includes('salary') || t.includes('high')) return { icon: 'money', color: colors.success };
  if (t.includes('nearby') || t.includes('km')) return { icon: 'map-marker', color: colors.primary };
  if (t.includes('verified') || t.includes('trust')) return { icon: 'check-circle', color: '#10b981' };
  if (t.includes('new') || t.includes('recent')) return { icon: 'clock-o', color: colors.accent };
  return { icon: 'tag', color: colors.primary };
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

const cleanIconName = (iconStr: string) => {
  if (!iconStr) return 'info-circle';
  // Remove 'fas fa-', 'far fa-', etc.
  return iconStr.replace(/fa[srlb]? fa-/, '').trim();
};

function JobTrendCard({
  job,
  colors,
  onPress,
  tagRotation,
}: {
  job: any;
  colors: ThemeColors;
  onPress?: () => void;
  tagRotation?: any;
}) {
  const companyName = job.employer?.company?.company_name || job.company || 'Unknown Company';
  const locationLabel = job.location?.label || job.location || 'Remote';
  const salaryLabel = job.salary || (job.salary_min && job.salary_max ? `₹${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` : 'Negotiable');
  const jobType = job.job_type_label || job.employmentType || job.job_type || 'Full Time';
  const postedLabel = job.created_at ? new Date(job.created_at).toLocaleDateString() : (job.postedLabel || 'Recently');

  const primaryTagColor = job.applied_tags?.[0]?.icon_color || colors.primary;
  const hasAppliedTags = job.applied_tags && job.applied_tags.length > 0;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.trendCard,
        {
          width: H_CARD_W,
          backgroundColor: hasAppliedTags ? primaryTagColor + '08' : colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}>
      <View style={styles.trendTagsRow}>
        {job.applied_tags && job.applied_tags.length > 0 ? (
          job.applied_tags.map((tag: any, idx: number) => (
            <View key={idx} style={[
              styles.hotBadge,
              {
                backgroundColor: (tag.icon_color || colors.primary) + '20',
                marginBottom: 4,
              }
            ]}>
              <Animated.View style={{ transform: [{ rotate: tagRotation || '0deg' }] }}>
                <Icon name={cleanIconName(tag.icon)} size={11} color={tag.icon_color || colors.primary} />
              </Animated.View>
              <Text style={[
                typography.small,
                {
                  color: tag.icon_color || colors.primary,
                  fontSize: 10,
                  fontWeight: '700',
                  marginLeft: 4,
                },
              ]}>
                {tag.name}
              </Text>
            </View>
          ))
        ) : (
          job.tags && job.tags.length > 0 && job.tags.slice(0, 2).map((tag: string, idx: number) => {
            const config = getTagConfig(tag, colors);
            return (
              <View key={idx} style={[
                styles.hotBadge,
                { backgroundColor: config.color + '15' }
              ]}>
                <Icon name={config.icon} size={11} color={config.color} />
                <Text style={[
                  typography.small,
                  {
                    color: config.color,
                    fontSize: 10,
                    fontWeight: '700',
                    marginLeft: 4,
                  },
                ]}>
                  {tag}
                </Text>
              </View>
            );
          })
        )}
      </View>
      <View style={[styles.cardTitle, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }]}>
        <Text style={[typography.jobTitle, { color: colors.textPrimary, flex: 1, marginRight: 8 }]} numberOfLines={2}>
          {job.title}
        </Text>
        {job.employer?.company?.company_logo_url && (
          <Image
            source={{ uri: job.employer.company.company_logo_url }}
            style={{ width: 32, height: 32, borderRadius: 8, marginTop: 2 }}
          />
        )}
      </View>
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
  tagRotation,
}: {
  job: any;
  colors: ThemeColors;
  onPress?: () => void;
  tagRotation?: any;
}) {
  const companyName = job.employer?.company?.company_name || job.company || 'Unknown Company';
  const locationLabel = job.location?.label || job.location || 'Remote';
  const salaryLabel = job.salary || (job.salary_min && job.salary_max ? `₹${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` : 'Negotiable');
  const jobType = job.job_type_label || job.employmentType || job.job_type || 'Full Time';
  const postedLabel = job.created_at ? new Date(job.created_at).toLocaleDateString() : (job.postedLabel || 'Recently');

  const primaryTagColor = job.applied_tags?.[0]?.icon_color || colors.primary;
  const hasAppliedTags = job.applied_tags && job.applied_tags.length > 0;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.listCard,
        {
          backgroundColor: hasAppliedTags ? primaryTagColor + '08' : colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}>
      <View style={styles.listCardTags}>
        {job.applied_tags && job.applied_tags.length > 0 ? (
          job.applied_tags.slice(0, 2).map((tag: any, idx: number) => (
            <View key={idx} style={[
              styles.tagBadgeSm,
              {
                backgroundColor: (tag.icon_color || colors.primary) + '15',
              }
            ]}>
              <Animated.View style={{ transform: [{ rotate: tagRotation || '0deg' }] }}>
                <Icon name={cleanIconName(tag.icon)} size={10} color={tag.icon_color || colors.primary} />
              </Animated.View>
              <Text style={[styles.tagTextSm, { color: tag.icon_color || colors.primary }]}>
                {tag.name}
              </Text>
            </View>
          ))
        ) : (
          job.tags && job.tags.length > 0 && job.tags.slice(0, 2).map((tag: string, idx: number) => {
            const config = getTagConfig(tag, colors);
            return (
              <View key={idx} style={[styles.tagBadgeSm, { backgroundColor: config.color + '10' }]}>
                <Icon name={config.icon} size={10} color={config.color} />
                <Text style={[styles.tagTextSm, { color: config.color }]}>
                  {tag}
                </Text>
              </View>
            );
          })
        )}
      </View>
      <View style={styles.listCardTop}>
        <View style={[styles.listIconWrap, { backgroundColor: colors.surfaceHighlight }]}>
          <Icon name="briefcase" size={18} color={colors.primary} />
        </View>
        <View style={styles.listCardText}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={[typography.jobTitle, { color: colors.textPrimary, flex: 1, marginRight: 8 }]} numberOfLines={2}>
              {job.title}
            </Text>
            {job.employer?.company?.company_logo_url && (
              <Image
                source={{ uri: job.employer.company.company_logo_url }}
                style={{ width: 32, height: 32, borderRadius: 8 }}
              />
            )}
          </View>
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
  const { homeMedia = [] } = useSelector((state: RootState) => state.media || {});
  const { selectedCity, selectedArea } = useSelector((state: RootState) => state.address || {});
  const isAnyLoading = jobsLoading || metaLoading;

  const [showNotifyHint, setShowNotifyHint] = useState(false);
  const notifyHintAnim = useRef(new Animated.Value(0)).current;
  const bellAnim = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(1)).current;
  const tagShakeAnim = useRef(new Animated.Value(0)).current;

  // Filter Grid States
  const [showFilterGrid, setShowFilterGrid] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filterTop, setFilterTop] = useState(130);

  // List Visibility States
  const [showAllNearby, setShowAllNearby] = useState(false);
  const [showAllRecommended, setShowAllRecommended] = useState(false);

  const scrollY = useMemo(() => new Animated.Value(0), []);
  const lastScrollY = useRef(0);
  const isTabBarVisible = useRef(true);
  const [headerHeight, setHeaderHeight] = useState(130);
  const frozenScrollY = useRef(0);
  const COLLAPSE_DISTANCE = 80;

  // Search Overlay States
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState(profileData?.preferences?.current_city?.city || '');

  const handleScroll = (event: any) => {
    // Don't update scroll position when filter is open
    if (showFilterGrid) return;

    const currentOffset = event.nativeEvent.contentOffset.y;

    // Header animation
    scrollY.setValue(currentOffset);
    frozenScrollY.current = currentOffset;

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
    // Shared tag shake animation (swinging like a bell)
    Animated.loop(
      Animated.sequence([
        Animated.timing(tagShakeAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(tagShakeAnim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [tagShakeAnim]);

  const tagRotation = tagShakeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-12deg', '12deg'],
  });

  // 1. Initial Load Effect (Static/Main Data) - Only run once or when categories missing
  useEffect(() => {
    if (categories.length === 0) dispatch(fetchMetaCategories());
    dispatch(fetchHomeFeed()); // Keep feed fresh
    dispatch(fetchAdminMedia({ media_section: 'home page', limit: 10 }));
  }, [dispatch]);

  // 2. Profile Data Effect
  useEffect(() => {
    if (!profileData) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profileData]);

  const displayName = useMemo(() => {
    const n = user?.name || draft.fullName.trim();
    return n.length > 0 ? n : 'Job seeker';
  }, [user?.name, draft.fullName]);

  const avatarInitials = useMemo(() => profileInitials(displayName), [displayName]);

  const goSearch = () => {
    setShowSearchOverlay(true);
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
    // Restore scroll animation to frozen position when filter closes
    scrollY.setValue(frozenScrollY.current);
    // Navigate directly to JobListing with filters
    navigation.navigate('JobListing', { filters });
  };

  const handleCloseFilter = () => {
    setShowFilterGrid(false);
    // Restore scroll animation to frozen position when filter closes
    scrollY.setValue(frozenScrollY.current);
  };

  const handleFilterOpen = () => {
    if (!showFilterGrid) {
      // Compute the actual visible bottom of the header at this scroll position
      // headerTranslateY interpolates: scrollY [0,80] -> translateY [0,-70]
      const COLLAPSE_MAX_SHIFT = COLLAPSE_DISTANCE - 10; // = 70
      const clamped = Math.min(frozenScrollY.current, COLLAPSE_DISTANCE);
      const headerShift = (clamped / COLLAPSE_DISTANCE) * COLLAPSE_MAX_SHIFT;
      const computedTop = Math.max(0, headerHeight - headerShift);
      setFilterTop(computedTop);
    }
    setShowFilterGrid(prev => !prev);
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

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [0, -COLLAPSE_DISTANCE + 26], // Increased from 10 to 22 to move it lower when collapsed
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
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
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
              <View style={styles.headerGreeting}>
                <Pressable
                  onPress={() => navigation.navigate('LocationSelection')}
                  style={styles.locationSelector}
                >
                  <View style={[styles.locationIconBox, { backgroundColor: colors.primary + '12' }]}>
                    <Icon name="map-marker" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.locationTextStack}>
                    <View style={styles.cityRow}>
                      <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: '900' }]}>
                        {selectedCity || 'Mumbai'}
                      </Text>
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

      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        scrollEnabled={!showFilterGrid}
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
                      backgroundColor: getCategoryColor(cat.name),
                      borderColor: 'rgba(0,0,0,0.05)',
                      shadowColor: colors.shadow,
                    },
                  ]}>
                  <View style={[styles.categoryIcon]}>
                    <Icon name={getCategoryIcon(cat.name)} size={16} color="rgba(0,0,0,0.6)" />
                  </View>
                  <Text style={[typography.small, { color: 'rgba(0,0,0,0.7)', fontFamily: typography.labelMedium.fontFamily }]} numberOfLines={1}>
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
                      backgroundColor: getCategoryColor(cat.label),
                      borderColor: 'rgba(0,0,0,0.05)',
                      shadowColor: colors.shadow,
                    },
                  ]}>
                  <View style={[styles.categoryIcon]}>
                    <Icon name={cat.icon} size={16} color="rgba(0,0,0,0.6)" />
                  </View>
                  <Text style={[typography.small, { color: 'rgba(0,0,0,0.7)', fontFamily: typography.labelMedium.fontFamily }]}>
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
                      tagRotation={tagRotation}
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
                      tagRotation={tagRotation}
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
                    <JobListCard key={job.id} job={job} colors={colors} onPress={() => openJob(job)} tagRotation={tagRotation} />
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
                    <JobListCard key={job.id} job={job} colors={colors} onPress={() => openJob(job)} tagRotation={tagRotation} />
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
        onClose={handleCloseFilter}
        onFilterSelect={applyAdvancedFilters}
        activeFilter={activeFilter}
        colors={colors}
        top={filterTop}
      />

      {showSearchOverlay && (
        <Modal
          visible={showSearchOverlay}
          animationType="fade"
          transparent
          onRequestClose={() => setShowSearchOverlay(false)}>
          <View style={[styles.overlayContainer, { backgroundColor: colors.background }]}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={[styles.overlayHeader, { borderBottomColor: colors.border }]}>
                <Pressable onPress={() => setShowSearchOverlay(false)} style={styles.backBtn}>
                  <Icon name="arrow-left" size={24} color={colors.textPrimary} />
                </Pressable>
                <View style={styles.dualInputContainer}>
                  <View style={[styles.overlayInputRow, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                    <Icon name="search" size={18} color={colors.primary} />
                    <TextInput
                      autoFocus
                      placeholder='Search "Delivery", "Sales"...'
                      placeholderTextColor={colors.textPlaceholder}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      style={[typography.body, { color: colors.textPrimary, flex: 1, marginLeft: 8, paddingVertical: 10 }]}
                    />
                  </View>
                  <View style={[styles.overlayInputRow, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, marginTop: 12 }]}>
                    <Icon name="map-pin" size={18} color={colors.textSecondary} />
                    <TextInput
                      placeholder="In which city?"
                      placeholderTextColor={colors.textPlaceholder}
                      value={searchLocation}
                      onChangeText={setSearchLocation}
                      style={[typography.body, { color: colors.textPrimary, flex: 1, marginLeft: 8, paddingVertical: 10 }]}
                    />
                  </View>
                </View>
              </View>

              <ScrollView style={{ flex: 1, padding: spacing.md }}>
                <Text style={[typography.labelMedium, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
                  RECENT SEARCHES
                </Text>
                {['Delivery Boy', 'Graphic Designer', 'Ahmedabad'].map((item, index) => (
                  <Pressable key={index} style={styles.recentItem} onPress={() => setSearchQuery(item)}>
                    <Icon name="clock" size={16} color={colors.textPlaceholder} />
                    <Text style={[typography.body, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
                      {item}
                    </Text>
                  </Pressable>
                ))}

                <Text style={[typography.labelMedium, { color: colors.textSecondary, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
                  POPULAR ROLES
                </Text>
                <View style={styles.popularTags}>
                  {['Telecaller', 'Back Office', 'Sales', 'Driver', 'Cook'].map((tag, idx) => (
                    <Pressable key={idx} onPress={() => setSearchQuery(tag)} style={[styles.popularTag, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[typography.small, { color: colors.textPrimary }]}>{tag}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              <View style={[styles.searchFooter, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => {
                    setShowSearchOverlay(false);
                    navigation.navigate('JobListing', {
                      filters: {
                        q: searchQuery,
                        city: searchLocation
                      }
                    });
                  }}
                  style={[styles.mainSearchBtn, { backgroundColor: colors.primary }]}>
                  <Text style={[typography.button, { color: colors.onPrimary }]}>Search Jobs</Text>
                  <Icon name="arrow-right" size={18} color={colors.onPrimary} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      )}
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
    paddingTop: 118,
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
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#fff',
    overflow: 'visible',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    padding: 12,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    ...components.jobCard,
    width: H_CARD_W,
    marginRight: spacing.md,
  },
  trendTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  hotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    gap: 4,
  },
  cardTitle: {
    minHeight: 44,
  },
  tickerContainer: {
    flex: 1,
    height: 30,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
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
  listCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tagBadgeSm: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  tagTextSm: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: typography.labelMedium.fontFamily,
  },
  tagTextSm: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: typography.labelMedium.fontFamily,
  },
  overlayContainer: {
    flex: 1,
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  backBtn: {
    padding: 4,
    marginTop: 8,
  },
  dualInputContainer: {
    flex: 1,
  },
  overlayInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  popularTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  searchFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
  mainSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
  },
});

export default HomeScreen;
