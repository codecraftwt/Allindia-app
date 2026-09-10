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
  BackHandler,
  Alert,
  ToastAndroid,
  Keyboard,
  StatusBar,
  FlatList,
  InteractionManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  runOnJS,
  interpolate as reInterpolate,
  Easing,
} from 'react-native-reanimated';
const BRAND_ICON = require('../../../assets/icons/icon2.2.png');
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchMetaCategories } from '../../../redux/slice/metaSlice';
import { fetchHomeFeed, fetchJobs, filterJobs } from '../../../redux/slice/jobSlice';
import { fetchProfile, fetchHRInvites, dismissHRInvite } from '../../../redux/slice/profileSlice';
import { fetchAdminMedia } from '../../../redux/slice/mediaSlice';
import { fetchNotifications } from '../../../redux/slice/notificationSlice';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useProfileSetup } from '../../../context/ProfileSetupContext';
import { useTheme } from '../../../context/ThemeContext';
import type { HomeStackParamList, MainTabParamList } from '../../../navigation/types';
import type { ThemeColors } from '../../../theme/colors';
import { components } from '../../../theme/components';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography, moderateScale } from '../../../theme/typography';
import ProfileStrengthAssistant from '../../../components/ProfileStrengthAssistant';
import HeaderFilterGrid from '../../../components/HeaderFilterGrid';
import HeroBanner from '../../../components/HeroBanner';
import AppRate from '../../../components/AppRate';
import ActionForYou from '../../../components/ActionForYou';
import SkeletonPulse from '../../../components/SkeletonPulse';
import { QuickFilterCards } from './components/QuickFilterCards';
import { HomeApplicationStatus } from './components/HomeApplicationStatus';
import { HomeHRInviteStatus } from './components/HomeHRInviteStatus';
import HomescreenHeader from './components/HomescreenHeader';
import HomeCategoriesSection from './components/HomeCategoriesSection';
import type { HomeJob } from './components/homeMockData';
import {
  HOME_CATEGORIES,
} from './components/homeMockData';

const formatJobType = (type: string) => {
  if (!type) return 'Full Time';
  return type
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const H_CARD_W = Math.min(Dimensions.get('window').width * 0.68, 260);

type HomeNav = StackNavigationProp<HomeStackParamList, 'HomeFeed'>;

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

import { getCategoryColor, getCategoryIcon } from '../../../utils/categoryUtils';

function getTagConfig(tag: string, colors: any) {
  const t = tag.toLowerCase();
  if (t.includes('bolt') || t.includes('urgent') || t.includes('hot')) return { icon: 'bolt', color: colors?.warning || '#F59E0B' };
  if (t.includes('fire') || t.includes('trending') || t.includes('spotlight')) return { icon: 'fire', color: '#EF4444' };
  if (t.includes('star') || t.includes('premium')) return { icon: 'star', color: '#D4AF37' };
  if (t.includes('crown') || t.includes('vip')) return { icon: 'star', color: '#D4AF37' }; // FontAwesome 4 fallback
  if (t.includes('briefcase') || t.includes('job') || t.includes('work')) return { icon: 'briefcase', color: colors?.primary || '#2563EB' };
  if (t.includes('gem') || t.includes('valuable')) return { icon: 'diamond', color: '#8B5CF6' }; // FontAwesome 4 fallback
  if (t.includes('rocket') || t.includes('boost')) return { icon: 'rocket', color: colors?.accent || '#3B82F6' };
  if (t.includes('check') || t.includes('verified') || t.includes('trust')) return { icon: 'check-circle', color: '#10B981' };
  
  return { icon: 'check-circle', color: colors?.primary || '#2563EB' };
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
  const { t } = useTranslation();
  return (
    <View style={styles.sectionHeader}>
      {icon ? (
        <Icon name={icon} size={moderateScale(16)} color={iconColor ?? colors.primary} style={styles.sectionIcon} />
      ) : null}
      <Text style={[typography.sectionTitle, { color: colors.textPrimary, flex: 1 }]}>{title}</Text>
      <Pressable hitSlop={8} onPress={onPress}>
        <Text style={[typography.labelMedium, { color: colors.primary }]}>{t('home.seeAll', 'See all')}</Text>
      </Pressable>
    </View>
  );
}

const cleanIconName = (iconStr: string) => {
  if (!iconStr) return 'info-circle';
  // Remove 'fas fa-', 'far fa-', etc.
  let cleaned = iconStr.replace(/fa[srlb]? fa-/, '').replace(/^fa-/, '').trim();
  
  // Fallbacks for FontAwesome 4
  if (cleaned === 'crown') return 'star';
  if (cleaned === 'gem') return 'diamond';
  if (cleaned === 'medal') return 'certificate';
  if (cleaned === 'award') return 'trophy';
  
  return cleaned;
};

const TagCycling = ({ tags, colors, tagRotationStyle, isSmall = false }: { tags: any[], colors: any, tagRotationStyle: any, isSmall?: boolean }) => {
  const [index, setIndex] = useState(0);
  const fade = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (tags.length <= 1) return;
    const interval = setInterval(() => {
      fade.value = withTiming(0, { duration: 400 }, () => {
        runOnJS(setIndex)((index + 1) % tags.length);
        translateY.value = 10;
        fade.value = withTiming(1, { duration: 400 });
        translateY.value = withTiming(0, { duration: 400 });
      });
      translateY.value = withTiming(-10, { duration: 400 });
    }, 2800);
    return () => clearInterval(interval);
  }, [tags.length, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: translateY.value }]
  }));

  const tag = tags[index];
  const isApplied = typeof tag !== 'string';
  const tagName = isApplied ? tag.name : tag;
  const tagIcon = isApplied ? cleanIconName(tag.icon) : getTagConfig(tag, colors).icon;
  let tagColor = isApplied ? (tag.icon_color || colors.primary) : getTagConfig(tag, colors).color;

  let customBg = undefined;
  let customText = undefined;

  if (tagName.toLowerCase().includes('spotlight')) {
    customBg = '#D4AF37'; // Golden color
    customText = '#FFFFFF';
  } else if (tagName.toLowerCase().includes('boost')) {
    customBg = '#DC2626'; // Red color
    customText = '#FFFFFF';
  }

  const finalBgColor = customBg || (isSmall ? colors.surface : (isApplied ? colors.surface : tagColor + '15'));
  const finalBorderColor = customBg ? 'transparent' : (isSmall ? tagColor + '60' : (isApplied ? tagColor + '80' : 'transparent'));
  const finalBorderWidth = customBg ? 0 : (isSmall || isApplied ? 1 : 0);
  const finalTextColor = customText || tagColor;

  return (
    <ReAnimated.View style={[
      isSmall ? styles.tagBadgeSm : styles.hotBadge,
      {
        backgroundColor: finalBgColor,
        borderColor: finalBorderColor,
        borderWidth: finalBorderWidth,
      },
      animatedStyle
    ]}>
      <ReAnimated.View style={tagRotationStyle}>
        <Icon name={tagIcon} size={isSmall ? moderateScale(12) : moderateScale(14)} color={finalTextColor} />
      </ReAnimated.View>
      <Text style={[
        isSmall ? styles.tagTextSm : typography.small,
        { color: finalTextColor, fontSize: isSmall ? moderateScale(11) : moderateScale(10), fontWeight: 'bold', marginLeft: 4 }
      ]}>
        {tagName}
      </Text>
    </ReAnimated.View>
  );
};

const JobTrendCard = React.memo(function JobTrendCard({
  job,
  colors,
  onPress,
  tagRotationStyle,
  isDark,
}: {
  job: any;
  colors: ThemeColors;
  onPress?: () => void;
  tagRotationStyle?: any;
  isDark: boolean;
}) {
  const companyName = job.employer?.company?.company_name || job.company || 'Unknown Company';
  const locationLabel = job.location?.label || (typeof job.location === 'string' ? job.location : job.location?.city) || 'Remote';
  const salaryLabel = job.salary || (job.salary_min && job.salary_max ? `₹${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` : 'Negotiable');
  const jobType = formatJobType(job.job_type_label || job.employmentType || job.job_type || 'Full Time');
  const postedLabel = job.created_at ? new Date(job.created_at).toLocaleDateString() : (job.postedLabel || 'Recently');

  const primaryTagColor = job.applied_tags?.[0]?.icon_color || colors.primary;
  const hasAppliedTags = job.applied_tags && job.applied_tags.length > 0;

    const checkTag = (tagNameMatch: string) => {
      const checkArray = (arr: any[]) => arr?.some((t: any) => {
        const name = typeof t === 'string' ? t : t.name;
        return name && name.toLowerCase().includes(tagNameMatch);
      });
      return checkArray(job.applied_tags) || checkArray(job.tags);
    };
    const isSpotlight = checkTag('spotlight');
    const isBoost = checkTag('boost');

  let cardBgColor = colors.surface;
  let cardBorderColor = colors.border;
  let cardBorderWidth = StyleSheet.hairlineWidth;
  let cardShadowColor = '#000';
  let cardElevation = undefined;

  let companyTextColor = colors.textSecondary;
  let locationTextColor = colors.textSecondary;
  let locationIconColor = colors.textPlaceholder;
  let salaryTextColor = colors.success;
  let pillBgColor = colors.surfaceHighlight;
  let pillTextColor = colors.primary;

  if (isSpotlight) {
    cardBgColor = isDark ? '#2D2714' : '#FDE68A'; // Slightly darker yellow
    cardBorderColor = isDark ? '#F59E0B' : '#F59E0B';
    cardBorderWidth = 1;
    cardShadowColor = isDark ? 'transparent' : '#D4AF37';
    cardElevation = isDark ? 0 : 6;

    pillBgColor = isDark ? '#451A03' : 'rgba(255,255,255,0.6)';
    pillTextColor = isDark ? '#FDE68A' : colors.textPrimary;
  } else if (isBoost) {
    cardBgColor = isDark ? '#3F1616' : '#FCA5A5'; // Darker red background
    cardBorderColor = isDark ? '#EF4444' : '#EF4444';
    cardBorderWidth = 1;
    cardShadowColor = isDark ? 'transparent' : '#DC2626';
    cardElevation = isDark ? 0 : 6;

    pillBgColor = isDark ? '#450A0A' : 'rgba(255,255,255,0.6)';
    pillTextColor = isDark ? '#FECACA' : colors.textPrimary;
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.trendCard,
        {
          width: H_CARD_W,
          backgroundColor: cardBgColor,
          borderWidth: cardBorderWidth,
          borderColor: cardBorderColor,
          shadowColor: cardShadowColor,
          elevation: cardElevation,
          padding: moderateScale(12),
        },
        (isSpotlight || isBoost) && { shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }
      ]}>

      {(hasAppliedTags || (job.tags && job.tags.length > 0)) ? (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: moderateScale(8) }}>
          {hasAppliedTags ? (
            <TagCycling tags={job.applied_tags} colors={colors} tagRotationStyle={tagRotationStyle} />
          ) : job.tags && job.tags.length > 0 ? (
            <TagCycling tags={job.tags} colors={colors} tagRotationStyle={tagRotationStyle} />
          ) : null}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: moderateScale(8) }}>
        {job.employer?.company?.company_logo_url ? (
          <Image
            source={{ uri: job.employer.company.company_logo_url }}
            style={{ width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(8), marginRight: moderateScale(10), resizeMode: 'contain' }}
          />
        ) : (
          <View style={{ width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(8), backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center', marginRight: moderateScale(10) }}>
            <Icon name="briefcase" size={moderateScale(18)} color={colors.primary} />
          </View>
        )}
        <View style={{ flex: 1, paddingRight: moderateScale(22) }}>
          <Text style={[typography.jobTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={[typography.small, { color: companyTextColor, marginTop: 2 }]} numberOfLines={1}>
            {companyName}
          </Text>
        </View>
        {(job.employer?.company?.verification_status === 'approved' || job.employer?.verification_status === 'approved') && (
          <View style={{ position: 'absolute', right: 0, top: 0 }}>
            <MaterialCommunityIcons name="check-decagram" size={moderateScale(16)} color="#3B82F6" />
          </View>
        )}
      </View>

      <View style={[styles.cardMetaRow, { marginBottom: moderateScale(6) }]}>
        <Icon name="map-marker" size={moderateScale(12)} color={locationIconColor} />
        <Text style={[typography.small, { color: locationTextColor, flex: 1, marginLeft: moderateScale(4) }]} numberOfLines={1}>
          {locationLabel}
        </Text>
      </View>

      <View style={[styles.cardFooter, { marginTop: moderateScale(6), alignItems: 'center', justifyContent: 'space-between' }]}>
        <Text style={[typography.labelMedium, { color: salaryTextColor, fontWeight: '700' }]}>{salaryLabel}</Text>
        <View style={[styles.typePill, { backgroundColor: pillBgColor, marginTop: 0 }]}>
          <Text style={[typography.small, { color: pillTextColor, fontFamily: typography.labelMedium.fontFamily, fontSize: moderateScale(10), fontWeight: '600' }]}>
            {jobType}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

const JobListCard = React.memo(function JobListCard({
  job,
  colors,
  onPress,
  tagRotationStyle,
  isDark,
}: {
  job: any;
  colors: ThemeColors;
  onPress?: () => void;
  tagRotationStyle?: any;
  isDark: boolean;
}) {
  const companyName = job.employer?.company?.company_name || job.company || 'Unknown Company';
  const locationLabel = job.location?.label || (typeof job.location === 'string' ? job.location : job.location?.city) || 'Remote';
  const salaryLabel = job.salary || (job.salary_min && job.salary_max ? `₹${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` : 'Negotiable');
  const jobType = formatJobType(job.job_type_label || job.employmentType || job.job_type || 'Full Time');
  const postedLabel = job.created_at ? new Date(job.created_at).toLocaleDateString() : (job.postedLabel || 'Recently');

  const primaryTagColor = job.applied_tags?.[0]?.icon_color || colors.primary;
  const hasAppliedTags = job.applied_tags && job.applied_tags.length > 0;

    const checkTag = (tagNameMatch: string) => {
      const checkArray = (arr: any[]) => arr?.some((t: any) => {
        const name = typeof t === 'string' ? t : t.name;
        return name && name.toLowerCase().includes(tagNameMatch);
      });
      return checkArray(job.applied_tags) || checkArray(job.tags);
    };
    const isSpotlight = checkTag('spotlight');
    const isBoost = checkTag('boost');

  let cardBgColor = colors.surface;
  let cardBorderColor = colors.border;
  let cardBorderWidth = StyleSheet.hairlineWidth;
  let cardShadowColor = colors.shadow;
  let cardElevation = undefined;

  let companyTextColor = colors.textSecondary;
  let locationTextColor = colors.textSecondary;
  let locationIconColor = colors.textPlaceholder;
  let salaryTextColor = colors.success;
  let pillBgColor = colors.badgeBackground;
  let pillTextColor = colors.badgeText;

  if (isSpotlight) {
    cardBgColor = isDark ? '#2D2714' : '#FDE68A'; // Slightly darker yellow
    cardBorderColor = isDark ? '#F59E0B' : '#F59E0B';
    cardBorderWidth = 1;
    cardShadowColor = isDark ? 'transparent' : '#D4AF37';
    cardElevation = isDark ? 0 : 4;

    pillBgColor = isDark ? '#451A03' : 'rgba(255,255,255,0.6)';
    pillTextColor = isDark ? '#FDE68A' : colors.textPrimary;
  } else if (isBoost) {
    cardBgColor = isDark ? '#3F1616' : '#FCA5A5'; // Darker red background
    cardBorderColor = isDark ? '#EF4444' : '#EF4444';
    cardBorderWidth = 1;
    cardShadowColor = isDark ? 'transparent' : '#DC2626';
    cardElevation = isDark ? 0 : 4;

    pillBgColor = isDark ? '#450A0A' : 'rgba(255,255,255,0.6)';
    pillTextColor = isDark ? '#FECACA' : colors.textPrimary;
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.listCard,
        {
          backgroundColor: cardBgColor,
          borderWidth: cardBorderWidth,
          borderColor: cardBorderColor,
          shadowColor: cardShadowColor,
          elevation: cardElevation,
          padding: moderateScale(12),
        },
        (isSpotlight || isBoost) && { shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }
      ]}>
      {(hasAppliedTags || (job.tags && job.tags.length > 0)) ? (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: moderateScale(8) }}>
          {hasAppliedTags ? (
            <TagCycling tags={job.applied_tags} colors={colors} tagRotationStyle={tagRotationStyle} isSmall />
          ) : job.tags && job.tags.length > 0 ? (
            <TagCycling tags={job.tags} colors={colors} tagRotationStyle={tagRotationStyle} isSmall />
          ) : null}
        </View>
      ) : null}

      <View style={[styles.listCardTop, { alignItems: 'center', marginBottom: moderateScale(8) }]}>
        <View style={styles.listIconWrap}>
          {job.employer?.company?.company_logo_url ? (
            <Image
              source={{ uri: job.employer.company.company_logo_url }}
              style={{ width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(8), resizeMode: 'contain' }}
            />
          ) : (
            <View style={[styles.listIconWrap, { backgroundColor: colors.surfaceHighlight }]}>
              <Icon name="briefcase" size={moderateScale(16)} color={colors.primary} />
            </View>
          )}
        </View>
        <View style={[styles.listCardText, { flex: 1, paddingRight: moderateScale(22) }]}>
          <Text style={[typography.jobTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={[typography.small, { color: companyTextColor, marginTop: 2 }]} numberOfLines={1}>
            {companyName}
          </Text>
        </View>
        {(job.employer?.company?.verification_status === 'approved' || job.employer?.verification_status === 'approved') && (
          <View style={{ position: 'absolute', right: 0, top: 0 }}>
            <MaterialCommunityIcons name="check-decagram" size={moderateScale(16)} color="#3B82F6" />
          </View>
        )}
      </View>

      <View style={[styles.listMeta, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(8) }]}>
        <View style={[styles.metaItem, { flex: 1, marginRight: moderateScale(8) }]}>
          <Icon name="map-marker" size={moderateScale(12)} color={locationIconColor} />
          <Text style={[typography.small, { color: locationTextColor, flexShrink: 1, marginLeft: moderateScale(4) }]} numberOfLines={1}>
            {locationLabel}
          </Text>
        </View>
        <Text style={[typography.labelMedium, { color: salaryTextColor, fontWeight: '700' }]}>{salaryLabel}</Text>
      </View>

      <View style={[styles.listFooter, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <View style={[styles.typePillSm, { backgroundColor: pillBgColor, marginTop: 0 }]}>
          <Text style={[typography.small, { color: pillTextColor, fontFamily: typography.labelMedium.fontFamily, fontSize: moderateScale(10), fontWeight: '600' }]}>
            {jobType}
          </Text>
        </View>
        {postedLabel ? (
          <Text style={[typography.tiny, { color: colors.textPlaceholder }]}>{postedLabel}</Text>
        ) : null}
      </View>
    </Pressable>
  );
});

const SearchTicker: React.FC<{ colors: ThemeColors }> = ({ colors }) => {
  const { t } = useTranslation();
  const suggestions = [
    t('home.searchSuggestion1', 'a job or company'),
    t('home.searchSuggestion2', 'Graphic Designer'),
    t('home.searchSuggestion3', 'Software Engineer'),
    t('home.searchSuggestion4', 'Sales Executive'),
    t('home.searchSuggestion5', 'Part-time jobs'),
    t('home.searchSuggestion6', 'Remote opportunities')
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
      <Text style={[styles.searchPlaceholderWide, { color: colors.textPlaceholder, flex: 0 }]}>{t('home.searchFor', 'Search for')}</Text>
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

const JobReelsBanner = ({ colors, onPress }: { colors: ThemeColors, onPress: () => void }) => {
  const { t } = useTranslation();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 1500, useNativeDriver: true, isInteraction: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true, isInteraction: false }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }], marginHorizontal: spacing.md, marginBottom: moderateScale(16), marginTop: 4 }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          {
            backgroundColor: colors.surface,
            padding: moderateScale(14),
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: radius.xl,
            borderWidth: 1.5,
            borderColor: '#EC489930',
            elevation: 4,
            shadowColor: '#EC4899',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            overflow: 'hidden'
          },
          pressed && { opacity: 0.9 }
        ]}
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#EC489908' }]} />

        <View style={{ width: moderateScale(50), height: moderateScale(50), borderRadius: moderateScale(18), backgroundColor: '#EC489915', alignItems: 'center', justifyContent: 'center', marginRight: moderateScale(14), borderWidth: 1, borderColor: '#EC489930' }}>
          <Icon name="play" size={moderateScale(22)} color="#EC4899" style={{ marginLeft: 3 }} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={[typography.h4, { color: colors.textPrimary, fontSize: moderateScale(16), marginRight: 8 }]}>{t('home.watchReels', 'Job Bites')}</Text>
            <View style={{ backgroundColor: '#EC4899', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
              <Text style={{ color: '#FFF', fontSize: moderateScale(9), fontWeight: 'bold' }}>{t('home.reelsTag', 'NEW')}</Text>
            </View>
          </View>
          <Text style={[typography.small, { color: colors.textSecondary, fontSize: moderateScale(11) }]}>{t('home.reelsDesc', 'Swipe through short job videos')}</Text>
        </View>

        <View style={{ width: moderateScale(32), height: moderateScale(32), borderRadius: moderateScale(16), backgroundColor: '#EC4899', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="arrow-right" size={moderateScale(13)} color="#FFF" />
        </View>
      </Pressable>
    </Animated.View>
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

const MemoizedHomeContent = React.memo(({
  isAnyLoading,
  homeLoading,
  recommended,
  trending,
  latest,
  nearby,
  categories,
  colors,
  isDark,
  scrollY,
  handleScroll,
  onRefresh,
  showFilterGrid,
  insets,
  showAllNearby,
  setShowAllNearby,
  showAllRecommended,
  setShowAllRecommended,
  openJob,
  goSearch,
  tagRotationStyle,
  navigation,
  homeMedia,
  hrInvites,
  isLoggedIn,
}: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [showAppStatus, setShowAppStatus] = useState(false);
  const currentStatusId = 'mock_status_1';

  const [hiddenInviteIds, setHiddenInviteIds] = useState<string[]>([]);
  const [hasLoadedHiddenInvites, setHasLoadedHiddenInvites] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        const hiddenStatusId = await AsyncStorage.getItem('hiddenAppStatusId');
        if (isMounted && hiddenStatusId !== currentStatusId) {
          setShowAppStatus(true);
        }

        const storedHiddenInvites = await AsyncStorage.getItem('hidden_hr_invite_ids');
        if (isMounted) {
          if (storedHiddenInvites) {
            const parsed = JSON.parse(storedHiddenInvites);
            if (Array.isArray(parsed)) {
              setHiddenInviteIds(parsed.map(String));
            }
          } else {
            const oldSingle = await AsyncStorage.getItem('hiddenHRInviteId');
            if (oldSingle) {
              setHiddenInviteIds([String(oldSingle)]);
            }
          }
        }
      } catch (e) {
        if (isMounted) setShowAppStatus(true);
      } finally {
        if (isMounted) setHasLoadedHiddenInvites(true);
      }
    };
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, [currentStatusId]);

  const latestInvite = useMemo(() => {
    if (!isLoggedIn || !hasLoadedHiddenInvites || !Array.isArray(hrInvites) || hrInvites.length === 0) return null;
    return hrInvites.find((inv: any) => {
      if (!inv || !inv.id) return false;
      const invIdStr = String(inv.id);
      if (hiddenInviteIds.includes(invIdStr)) return false;
      if (inv.is_read === true || inv.is_read === 1 || inv.is_read === '1') return false;
      if (inv.read_at != null && inv.read_at !== '') return false;
      if (inv.status === 'read' || inv.status === 'dismissed' || inv.status === 'viewed') return false;
      return true;
    }) || null;
  }, [isLoggedIn, hasLoadedHiddenInvites, hrInvites, hiddenInviteIds]);

  const handleHideAppStatus = async () => {
    setShowAppStatus(false);
    try {
      await AsyncStorage.setItem('hiddenAppStatusId', currentStatusId);
    } catch (e) {
      console.log('Error hiding status', e);
    }
  };

  const handleHideInvite = async (inviteId: number | string) => {
    const idStr = String(inviteId);
    const nextHidden = [...hiddenInviteIds.filter(id => id !== idStr), idStr];
    setHiddenInviteIds(nextHidden);
    dispatch(dismissHRInvite(inviteId));
    try {
      await AsyncStorage.setItem('hidden_hr_invite_ids', JSON.stringify(nextHidden));
    } catch (e) {
      console.log('Error hiding invite', e);
    }
  };

  const handleSlidePress = (slide?: any) => {
    if (!slide || !slide.target_action) {
      goSearch();
      return;
    }
    
    switch (slide.target_action) {
      case 'REFER_APP':
        import('react-native').then(({ Share }) => {
          Share.share({
            message: '🚀 Looking for a new job or better career opportunities?\n\nGet JobIndia today! Thousands of verified jobs, direct HR connections, and quick applications—all in one app.\n\n👉 Download now: https://play.google.com/store/apps/details?id=com.jobsindia',
          });
        });
        break;
      case 'AI_SECTIONS':
        const aiTab = navigation.getParent() as any;
        aiTab?.navigate('AIAssistant');
        break;
      case 'CHOOSE_LOCATION':
        navigation.navigate('LocationSelection');
        break;
      case 'PROFILE_UPDATE':
        const profileTab = navigation.getParent() as any;
        profileTab?.navigate('Profile');
        break;
      case 'UPCOMING_EVENT':
        // Do nothing
        break;
      default:
        goSearch();
        break;
    }
  };

  return (
    <Animated.ScrollView
      onScroll={handleScroll}
      scrollEventThrottle={16}
      scrollEnabled={!showFilterGrid}
      style={styles.scrollMain}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: 80, paddingTop: 140 + (insets.top || 40) },
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
          <HeroBanner media={homeMedia} colors={colors} onPress={handleSlidePress} />
          {latestInvite && (
            <HomeHRInviteStatus
              colors={colors}
              invite={latestInvite}
              onHide={() => handleHideInvite(latestInvite.id)}
            />
          )}
          {showAppStatus && (
            <HomeApplicationStatus colors={colors} onHide={handleHideAppStatus} />
          )}
          <QuickFilterCards colors={colors} />
          {/* <HomeCategoriesSection
            categories={categories}
            colors={colors}
            navigation={navigation}
            homeCategoriesMock={HOME_CATEGORIES}
            isDark={isDark}
          /> */}
          {latest && latest.length > 0 && (
            <>
              <SectionHeader
                title={t('home.latestJobs', 'Latest jobs')}
                icon="clock-o"
                iconColor={colors.success}
                colors={colors}
                onPress={() => navigation.navigate('CategoryJobs', { section: 'latest' })}
              />
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendingScroll}
                decelerationRate="fast"
                data={latest}
                keyExtractor={item => item.id.toString()}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={5}
                renderItem={({ item: job }) => (
                  <JobTrendCard
                    job={{ ...job, isLatest: true }}
                    colors={colors}
                    onPress={() => openJob(job)}
                    tagRotationStyle={tagRotationStyle}
                    isDark={isDark}
                  />
                )}
              />
            </>
          )}
          {trending && trending.length > 0 && (
            <>
              <SectionHeader
                title={t('home.trendingJobs', 'Trending jobs')}
                icon="fire"
                iconColor={colors.warning}
                colors={colors}
                onPress={() => navigation.navigate('CategoryJobs', { section: 'trending' })}
              />
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendingScroll}
                decelerationRate="fast"
                data={trending}
                keyExtractor={item => item.id.toString()}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={5}
                renderItem={({ item: job }) => (
                  <JobTrendCard
                    job={job}
                    colors={colors}
                    onPress={() => openJob(job)}
                    tagRotationStyle={tagRotationStyle}
                    isDark={isDark}
                  />
                )}
              />
            </>
          )}
          <JobReelsBanner colors={colors} onPress={() => navigation.getParent()?.navigate('JobReels', { screen: 'ReelsMain', params: { from: 'Home' } })} />
          {nearby && nearby.length > 0 && (
            <>
              <SectionHeader
                title={t('home.nearbyJobs', 'Nearby jobs')}
                icon="map-marker"
                colors={colors}
                onPress={() => navigation.navigate('CategoryJobs', { section: 'nearby' })}
              />
              <View style={styles.verticalList}>
                {(showAllNearby ? nearby : nearby.slice(0, 5)).map((job: any) => (
                  <JobListCard key={job.id} job={job} colors={colors} onPress={() => openJob(job)} tagRotationStyle={tagRotationStyle} isDark={isDark} />
                ))}
              </View>
              {nearby.length > 5 && !showAllNearby && (
                <TouchableOpacity
                  onPress={() => setShowAllNearby(true)}
                  style={styles.viewMoreVertical}
                >
                  <Text style={[typography.labelMedium, { color: colors.primary }]}>{t('home.viewMoreNearby', 'View {{count}} More Nearby Jobs', { count: nearby.length - 5 })}</Text>
                  <Icon name="chevron-down" size={14} color={colors.primary} />
                </TouchableOpacity>
              )}
            </>
          )}
          <AppRate colors={colors} />

          {recommended && recommended.length > 0 && (
            <>
              <View style={{ height: spacing.md }} />
              <SectionHeader
                title={t('home.recommendedJobs', 'Recommended for you')}
                icon="bullseye"
                iconColor={colors.primary}
                colors={colors}
                onPress={() => navigation.navigate('CategoryJobs', { section: 'recommended' })}
              />
              <View style={styles.verticalList}>
                {(showAllRecommended ? recommended : recommended.slice(0, 5)).map((job: any) => (
                  <JobListCard key={job.id} job={job} colors={colors} onPress={() => openJob(job)} tagRotationStyle={tagRotationStyle} isDark={isDark} />
                ))}
              </View>
              {recommended.length > 5 && !showAllRecommended && (
                <TouchableOpacity
                  onPress={() => setShowAllRecommended(true)}
                  style={styles.viewMoreVertical}
                >
                  <Text style={[typography.labelMedium, { color: colors.primary }]}>{t('home.viewMoreRecommendations', 'View {{count}} More Recommendations', { count: recommended.length - 5 })}</Text>
                  <Icon name="chevron-down" size={14} color={colors.primary} />
                </TouchableOpacity>
              )}
            </>
          )}
          {!homeLoading && trending.length === 0 && nearby.length === 0 && recommended.length === 0 && latest.length === 0 && (
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginVertical: spacing.md }]}>
              {t('home.noJobsFound', 'No jobs found at the moment.')}
            </Text>
          )}
          <ActionForYou colors={colors} />
        </>
      )}
    </Animated.ScrollView>
  );
});

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<HomeNav>();
  const { draft } = useProfileSetup();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);
  const { categories, loading: metaLoading } = useSelector((state: RootState) => state.meta);
  const { trending, nearby, recommended, latest, homeLoading } = useSelector((state: RootState) => state.jobs);
  const { data: profileData, hrInvites } = useSelector((state: RootState) => state.profile);
  const { homeMedia = [] } = useSelector((state: RootState) => state.media || {});
  const { selectedCity, selectedArea } = useSelector((state: RootState) => state.address || {});
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const isAnyLoading = homeLoading || metaLoading;
  const { t } = useTranslation();

  const [showNotifyHint, setShowNotifyHint] = useState(false);
  const notifyHintAnim = useRef(new Animated.Value(0)).current;
  const bellAnim = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;
  const tagShakeAnim = useSharedValue(0);

  // Filter Grid States
  const [showFilterGrid, setShowFilterGrid] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filterTop, setFilterTop] = useState(0);
  const headerHeightRef = useRef(0);
  const [filterBgVisible, setFilterBgVisible] = useState(false);
  const filterBgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // List Visibility States
  const [showAllNearby, setShowAllNearby] = useState(false);
  const [showAllRecommended, setShowAllRecommended] = useState(false);

  const scrollY = useMemo(() => new Animated.Value(0), []);
  const lastScrollY = useRef(0);
  const isTabBarVisible = useRef(true);
  const frozenScrollY = useRef(0);
  const COLLAPSE_DISTANCE = 80;

  // Search Overlay States
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState(profileData?.preferences?.current_city?.city || '');
  const [overlayRecent, setOverlayRecent] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      InteractionManager.runAfterInteractions(() => {
        if (isLoggedIn) {
          dispatch(fetchNotifications());
        }
      });
      StatusBar.setBarStyle('light-content');
    }, [dispatch, isLoggedIn])
  );

  useEffect(() => {
    Animated.timing(badgeAnim, {
      toValue: isLoggedIn && unreadCount > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [unreadCount, badgeAnim, isLoggedIn]);

  // Load recent searches from AsyncStorage on screen focus
  useFocusEffect(
    useCallback(() => {
      InteractionManager.runAfterInteractions(() => {
        const loadRecent = async () => {
          try {
            const stored = await AsyncStorage.getItem('recent_searches');
            if (stored) {
              setOverlayRecent(JSON.parse(stored));
            } else {
              setOverlayRecent(['Product Manager', 'Hyderabad IT jobs', 'Customer support']);
            }
          } catch (e) {
            console.warn('Failed to load recent searches:', e);
          }
        };
        loadRecent();
      });
    }, [])
  );

  const saveOverlaySearch = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const next = [trimmed, ...overlayRecent.filter(x => x.toLowerCase() !== trimmed.toLowerCase())];
    const sliced = next.slice(0, 8);
    setOverlayRecent(sliced);
    try {
      await AsyncStorage.setItem('recent_searches', JSON.stringify(sliced));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleScroll = useMemo(() => Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        frozenScrollY.current = currentOffset;

        // Tab bar hide/show logic
        const diff = currentOffset - lastScrollY.current;
        if (currentOffset <= 0) {
          if (!isTabBarVisible.current) {
            isTabBarVisible.current = true;
            navigation.setParams({ tabBarHidden: false });
          }
        } else if (Math.abs(diff) > 15) {
          if (diff > 0 && isTabBarVisible.current && currentOffset > 100) {
            isTabBarVisible.current = false;
            navigation.setParams({ tabBarHidden: true });
          } else if (diff < 0 && !isTabBarVisible.current) {
            isTabBarVisible.current = true;
            navigation.setParams({ tabBarHidden: false });
          }
          lastScrollY.current = currentOffset;
        }
      },
    }
  ), [scrollY, navigation]);

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
      Animated.timing(badgeAnim, { toValue: unreadCount > 0 ? 1 : 0, duration: 200, useNativeDriver: true }),
      Animated.timing(badgeAnim, { toValue: 1.5, duration: 200, useNativeDriver: true }),
      Animated.timing(badgeAnim, { toValue: unreadCount > 0 ? 1 : 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [bellAnim, badgeAnim, unreadCount]);

  const dismissNotifyHint = useCallback(() => {
    Animated.timing(notifyHintAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowNotifyHint(false);
    });
  }, [notifyHintAnim]);

  useEffect(() => {
    if (!isLoggedIn || unreadCount === 0) {
      setShowNotifyHint(false);
      return;
    }

    let hideTimer: ReturnType<typeof setTimeout>;
    const timer = setTimeout(() => {
      setShowNotifyHint(true);
      shakeBell();
      Animated.spring(notifyHintAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      hideTimer = setTimeout(() => {
        dismissNotifyHint();
      }, 3000);
    }, 3000);

    return () => {
      clearTimeout(timer);
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
    };
  }, [notifyHintAnim, shakeBell, dismissNotifyHint, unreadCount, isLoggedIn]);

  useEffect(() => {
    tagShakeAnim.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const lastBackPressTime = useRef<number>(0);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const currentTime = Date.now();
        if (currentTime - lastBackPressTime.current < 2000) {
          BackHandler.exitApp();
          return true;
        }

        lastBackPressTime.current = currentTime;
        ToastAndroid.show('Press back again to exit Job India', ToastAndroid.SHORT);
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const tagRotationStyle = useAnimatedStyle(() => {
    const rotate = reInterpolate(tagShakeAnim.value, [0, 1], [-12, 12]);
    return { transform: [{ rotate: `${rotate}deg` }] };
  });

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchMetaCategories());
    const hasFeedData = trending.length > 0 || latest.length > 0 || recommended.length > 0;
    if (!hasFeedData) {
      dispatch(fetchHomeFeed());
    }
    dispatch(fetchAdminMedia({ media_section: 'slide', limit: 10 }));
    if (isLoggedIn) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      if (!profileData) {
        dispatch(fetchProfile());
      }
      dispatch(fetchHRInvites());
    }
  }, [dispatch, isLoggedIn, profileData]);

  const displayName = useMemo(() => {
    const n = user?.name || draft.fullName.trim();
    return n.length > 0 ? n : 'Job seeker';
  }, [user?.name, draft.fullName]);

  const goSearch = () => setShowSearchOverlay(true);
  const goProfile = () => {
    const tab = navigation.getParent() as BottomTabNavigationProp<MainTabParamList> | undefined;
    tab?.navigate('Profile');
  };
  const openJob = (job: any) => navigation.navigate('JobDetail', { jobId: job.slug || job.id });

  const applyAdvancedFilters = (filters: any) => {
    setShowFilterGrid(false);
    navigation.navigate('JobListing', { filters });
  };

  const handleCloseFilter = () => {
    setShowFilterGrid(false);
    if (filterBgTimer.current) clearTimeout(filterBgTimer.current);
    filterBgTimer.current = setTimeout(() => setFilterBgVisible(false), 350);
  };

  const handleFilterOpen = () => {
    if (filterBgTimer.current) clearTimeout(filterBgTimer.current);
    setFilterBgVisible(true);
    const maxTranslate = -COLLAPSE_DISTANCE + 26;
    const rawScrollOffset = frozenScrollY.current;
    const clampedTranslateY = Math.max(
      maxTranslate,
      Math.min(0, (rawScrollOffset / COLLAPSE_DISTANCE) * maxTranslate)
    );
    const baseHeight = headerHeightRef.current > 0 ? headerHeightRef.current : 155;
    setFilterTop(baseHeight + clampedTranslateY - 8);
    setShowFilterGrid(prev => !prev);
  };

  const onRefresh = useCallback(() => {
    dispatch(fetchMetaCategories());
    dispatch(fetchHomeFeed());
    if (isLoggedIn) {
      dispatch(fetchProfile());
      dispatch(fetchHRInvites());
      dispatch(fetchNotifications());
    }
  }, [dispatch, isLoggedIn]);

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]} >
      <HomescreenHeader
        scrollY={scrollY}
        colors={colors}
        navigation={navigation}
        displayName={displayName}
        selectedCity={selectedCity}
        selectedArea={selectedArea}
        showNotifyHint={showNotifyHint}
        notifyHintAnim={notifyHintAnim}
        bellAnim={bellAnim}
        badgeAnim={badgeAnim}
        showFilterGrid={filterBgVisible}
        activeFilter={activeFilter}
        handleFilterOpen={handleFilterOpen}
        goSearch={goSearch}
        goProfile={goProfile}
        onHeaderLayout={(h) => {
          if (headerHeightRef.current !== h) {
            headerHeightRef.current = h;
          }
        }}
        onPressNotifyHint={dismissNotifyHint}
      />

      <MemoizedHomeContent
        isAnyLoading={isAnyLoading}
        homeLoading={homeLoading}
        recommended={recommended}
        trending={trending}
        latest={latest}
        nearby={nearby}
        categories={categories}
        colors={colors}
        isDark={isDark}
        scrollY={scrollY}
        handleScroll={handleScroll}
        onRefresh={onRefresh}
        showFilterGrid={showFilterGrid}
        insets={insets}
        showAllNearby={showAllNearby}
        setShowAllNearby={setShowAllNearby}
        showAllRecommended={showAllRecommended}
        setShowAllRecommended={setShowAllRecommended}
        openJob={openJob}
        goSearch={goSearch}
        tagRotationStyle={tagRotationStyle}
        navigation={navigation}
        homeMedia={homeMedia}
        hrInvites={hrInvites}
        isLoggedIn={isLoggedIn}
      />

      {user && (
        <ProfileStrengthAssistant
          profile={profileData}
          colors={colors}
          navigation={navigation}
          scrollY={scrollY}
          showFilterGrid={showFilterGrid}
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

            <Pressable onPress={() => setShowSearchOverlay(false)} style={styles.backBtn}>
              <Icon name="arrow-left" size={24} color={colors.textPrimary} />
            </Pressable>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={[styles.overlayHeader, { borderBottomColor: colors.border }]}>

                <View style={styles.dualInputContainer}>
                  <View style={[styles.overlayInputRow, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                    <Icon name="search" size={18} color={colors.primary} />
                    <TextInput
                      autoFocus
                      placeholder={t('home.searchPlaceholder', 'Search "Delivery", "Sales"...')}
                      placeholderTextColor={colors.textPlaceholder}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      style={[typography.body, { color: colors.textPrimary, flex: 1, marginLeft: 8, paddingVertical: 10 }]}
                    />
                  </View>
                  <View style={[styles.overlayInputRow, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, marginTop: 12 }]}>
                    <Icon name="map-pin" size={18} color={colors.textSecondary} />
                    <TextInput
                      placeholder={t('home.cityPlaceholder', 'In which city?')}
                      placeholderTextColor={colors.textPlaceholder}
                      value={searchLocation}
                      onChangeText={setSearchLocation}
                      style={[typography.body, { color: colors.textPrimary, flex: 1, marginLeft: 8, paddingVertical: 10 }]}
                    />
                  </View>
                </View>
              </View>

              <ScrollView style={{ flex: 1, padding: spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Text style={[typography.labelMedium, { color: colors.textSecondary, textTransform: 'uppercase' }]}>
                    {t('home.recentSearches', 'RECENT SEARCHES')}
                  </Text>
                  {overlayRecent.length > 0 && (
                    <Pressable
                      onPress={async () => {
                        setOverlayRecent([]);
                        try {
                          await AsyncStorage.setItem('recent_searches', JSON.stringify([]));
                        } catch (err) {
                          console.warn(err);
                        }
                      }}
                      style={{ paddingVertical: 2, paddingHorizontal: 6 }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>{t('home.clearAll', 'Clear All')}</Text>
                    </Pressable>
                  )}
                </View>
                {overlayRecent.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 10,
                    }}
                  >
                    <Pressable
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                      onPress={async () => {
                        Keyboard.dismiss();
                        setSearchQuery(item);
                        setShowSearchOverlay(false);
                        await saveOverlaySearch(item);
                        navigation.navigate('JobListing', {
                          filters: {
                            q: item,
                            city: searchLocation
                          }
                        });
                      }}
                    >
                      <Icon name="clock-o" size={14} color={colors.textPlaceholder} style={{ marginRight: spacing.sm }} />
                      <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                        {item}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={async () => {
                        const next = overlayRecent.filter(x => x !== item);
                        setOverlayRecent(next);
                        try {
                          await AsyncStorage.setItem('recent_searches', JSON.stringify(next));
                        } catch (err) {
                          console.warn(err);
                        }
                      }}
                      style={{ padding: 6, marginLeft: 8 }}
                    >
                      <Icon name="times" size={14} color={colors.textPlaceholder} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>

              <View style={[styles.searchFooter, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  onPress={async () => {
                    Keyboard.dismiss();
                    const finalQuery = searchQuery.trim() || searchLocation.trim();
                    if (finalQuery) {
                      await saveOverlaySearch(finalQuery);
                    }
                    setShowSearchOverlay(false);
                    navigation.navigate('JobListing', {
                      filters: {
                        q: searchQuery,
                        city: searchLocation
                      }
                    });
                  }}
                  style={[styles.mainSearchBtn, { backgroundColor: colors.primary }]}>
                  <Text style={[typography.labelMedium, { color: colors.onPrimary, fontWeight: '600' }]}>{t('home.searchJobs', 'Search Jobs')}</Text>
                  <Icon name="arrow-right" size={18} color={colors.onPrimary} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      )}
    </View>
  );
};



const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  fixedHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: 10, // Base padding, will be combined with insets if needed
    paddingBottom: spacing.xs,
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
    paddingTop: 0, // Handled dynamically in render
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
    width: moderateScale(46),
    height: moderateScale(46),
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
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: 9,
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
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
    borderRadius: radius.pill,
    gap: moderateScale(5),
    marginRight: moderateScale(4),
  },
  referText: {
    fontSize: moderateScale(11),
    fontWeight: 'bold',
  },
  notifyBtnCircle: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
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
    top: moderateScale(10),
    right: moderateScale(10),
    width: moderateScale(9),
    height: moderateScale(9),
    borderRadius: moderateScale(5),
    borderWidth: 2,
  },
  headerNotifyHint: {
    position: 'absolute',
    right: moderateScale(50),
    top: moderateScale(6),
    paddingHorizontal: spacing.sm,
    paddingVertical: moderateScale(6),
    borderRadius: radius.sm,
    zIndex: 100,
    elevation: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    minWidth: moderateScale(110),
    alignItems: 'center',
  },
  hintArrowRight: {
    position: 'absolute',
    right: -6,
    top: moderateScale(10),
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  searchBarOuter: {
    ...components.jobCard,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: moderateScale(44),
    overflow: 'hidden',
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
    fontSize: moderateScale(13),
    fontFamily: typography.body.fontFamily,
  },
  searchDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: spacing.sm,
  },
  searchFilterBtnPremium: {
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(7),
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
    gap: moderateScale(6),
  },
  filterLabelText: {
    fontSize: moderateScale(11),
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
    marginBottom: moderateScale(10),
    marginTop: spacing.sm,
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  categoriesScroll: {
    gap: moderateScale(10),
    paddingBottom: spacing.md,
    paddingRight: spacing.md,
  },
  categoryChip: {
    ...components.jobCard,
    minWidth: moderateScale(80),
    maxWidth: moderateScale(100),
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(8),
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 4,
    shadowOpacity: 0.04,
    elevation: 1,
  },
  categoryIcon: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingScroll: {
    gap: moderateScale(12),
    paddingBottom: spacing.md,
    paddingRight: spacing.md,
  },

  trendCard: {
    padding: moderateScale(12),
    borderRadius: radius.md,
    width: H_CARD_W,
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  trendTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  hotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: radius.sm,
    gap: 4,
  },
  cardTitle: {
    minHeight: moderateScale(36),
  },
  tickerContainer: {
    flex: 1,
    height: moderateScale(30),
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: moderateScale(6),
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
    marginTop: 6,
  },
  typePill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: moderateScale(4),
    borderRadius: radius.sm,
  },
  verticalList: {
    gap: moderateScale(12),
    marginBottom: 0,
  },
  listCard: {
    ...components.jobCard,
    padding: moderateScale(8),
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  listCardTop: {
    flexDirection: 'row',
    gap: moderateScale(10),
  },
  listIconWrap: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: radius.sm,
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
    gap: moderateScale(8),
    marginTop: 6,
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
    marginTop: 6,
  },
  typePillSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: moderateScale(4),
    borderRadius: radius.sm,
  },
  // Skeleton Styles
  heroSkeleton: {
    height: moderateScale(160),
    borderRadius: radius.xl,
    width: '100%',
    marginBottom: spacing.lg,
  },
  sectionTitleSkeleton: {
    height: moderateScale(24),
    width: moderateScale(150),
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  chipSkeleton: {
    height: moderateScale(44),
    width: moderateScale(100),
    borderRadius: radius.card,
  },
  trendSkeleton: {
    height: moderateScale(180),
    width: H_CARD_W,
    borderRadius: radius.card,
  },
  listSkeleton: {
    height: moderateScale(140),
    width: '100%',
    borderRadius: radius.card,
    marginBottom: spacing.md,
  },
  viewMoreVertical: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: moderateScale(8),
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  listCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  tagBadgeSm: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
    borderRadius: radius.sm,
    gap: 3,
  },
  tagTextSm: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    fontFamily: typography.labelMedium.fontFamily,
  },
  overlayContainer: {
    flex: 1,
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: 4,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  backBtn: {
    padding: moderateScale(4),
    marginTop: 4,
  },
  dualInputContainer: {
    flex: 1,
  },
  overlayInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: moderateScale(48),
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
    paddingVertical: moderateScale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  popularTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(8),
  },
  popularTag: {
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(7),
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
    paddingVertical: moderateScale(13),
    borderRadius: radius.md,
  },
});

export default HomeScreen;
