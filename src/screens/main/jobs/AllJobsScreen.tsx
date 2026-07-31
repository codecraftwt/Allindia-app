import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,

  ActivityIndicator,
  Dimensions,
  ScrollView,
  Animated,
  Image,
  Share,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchJobs, filterJobs, searchJobs } from '../../../redux/slice/jobSlice';
import { fetchMetaCategories } from '../../../redux/slice/metaSlice';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { radius } from '../../../theme/radius';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import SideFilterHub from '../../../components/SideFilterHub';
import SkeletonPulse from '../../../components/SkeletonPulse';
import JobActionModal from '../../../components/JobActionModal';
import { AuthHeadline } from '../../../components/auth';
import HomeCategoriesSection from '../home/components/HomeCategoriesSection';
import { HOME_CATEGORIES } from '../home/components/homeMockData';

const { width } = Dimensions.get('window');

const QUICK_FILTERS_DATA = [
  { id: 'Full Time', label: 'Full Time', icon: 'briefcase', color: '#3B82F6' },
  { id: 'Work from Home', label: 'WFH', icon: 'home', color: '#10B981' },
  { id: 'Internship', label: 'Internship', icon: 'graduation-cap', color: '#8B5CF6' },
  { id: 'High Salary', label: 'High Pay', icon: 'money', color: '#F59E0B' },
  { id: 'Immediate', label: 'Immediate', icon: 'bolt', color: '#EF4444' },
  { id: 'Freshers', label: 'Freshers', icon: 'star', color: '#EC4899' },
  { id: 'Part Time', label: 'Part Time', icon: 'clock-o', color: '#06B6D4' },
  { id: 'Contract', label: 'Contract', icon: 'file-text', color: '#6366F1' },
];

const formatJobType = (type: string) => {
  if (!type) return 'Full Time';
  return type
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const cleanIconName = (icon: string) => {
  if (!icon) return 'check-circle';
  // Remove 'fas fa-', 'fa-', etc.
  return icon.replace(/fas fa-|fa-|fab fa-|far fa-/g, '').trim();
};

const getTagConfigLocal = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes('urgent') || t.includes('hot')) return { icon: 'bolt', color: '#F59E0B' };
  if (t.includes('salary') || t.includes('high')) return { icon: 'money', color: '#16A34A' };
  if (t.includes('nearby') || t.includes('km')) return { icon: 'map-marker', color: '#2563EB' };
  if (t.includes('verified') || t.includes('trust')) return { icon: 'check-circle', color: '#10b981' };
  return { icon: 'tag', color: '#2563EB' };
};

const TagCycling = ({ tags, colors }: { tags: any[], colors: any }) => {
  const [index, setIndex] = React.useState(0);
  const fade = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (tags.length <= 1) return;
    const interval = setInterval(() => {
      // Exit animation
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -10, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        setIndex((prev) => (prev + 1) % tags.length);
        translateY.setValue(10);
        Animated.parallel([
          Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [tags.length, index]);

  const tag = tags[index];
  const isApplied = typeof tag !== 'string';
  const tagName = isApplied ? tag.name : tag;
  const tagIcon = isApplied ? cleanIconName(tag.icon) : getTagConfigLocal(tag).icon;
  const tagColor = isApplied ? (tag.icon_color || colors.primary) : getTagConfigLocal(tag).color;

  let customBg = undefined;
  let customText = undefined;

  if (tagName.toLowerCase().includes('spotlight')) {
    customBg = '#D4AF37'; // Golden color
    customText = '#FFFFFF';
  } else if (tagName.toLowerCase().includes('boost')) {
    customBg = '#DC2626'; // Red color
    customText = '#FFFFFF';
  }

  return (
    <Animated.View style={[
      styles.cornerBadge,
      {
        backgroundColor: customBg || colors.surface,
        borderColor: customBg ? 'transparent' : (tagColor + '60'),
        opacity: fade,
        transform: [{ translateY }]
      }
    ]}>
      <Icon name={tagIcon} size={12} color={customText || tagColor} />
      <Text style={[styles.cornerBadgeText, { color: customText || tagColor }]}>
        {tagName}
      </Text>
    </Animated.View>
  );
};

const AllJobsScreen = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { searchResults, filteredJobs, nearby, loading } = useSelector((state: RootState) => state.jobs);
  const { categories, loading: metaLoading } = useSelector((state: RootState) => state.meta);
  const [search, setSearch] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);
  const [isPending, setIsPending] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchMetaCategories());
    }
  }, [dispatch, categories.length]);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
    }, [])
  );

  useEffect(() => {
    // Handle incoming filters from navigation
    if (route.params?.quickFilterId || route.params?.filters) {
      const qfId = route.params.quickFilterId;
      if (qfId === 'high_paying') {
        setSelectedQuickFilter('High Salary');
      } else if (qfId === 'wfh') {
        setSelectedQuickFilter('Work from Home');
      } else if (qfId === 'nearby') {
        setActiveTab('Nearest');
        setSelectedQuickFilter(null);
      } else if (qfId === 'all_jobs') {
        setSelectedQuickFilter(null);
        setActiveTab('All');
        setActiveFilters(null);
        setIsFiltered(false);
      } else if (route.params?.filters) {
        setActiveFilters(route.params.filters);
        setIsFiltered(true);
      }
      // Clear params after applying so it doesn't re-apply on every render
      navigation.setParams({ filters: undefined, quickFilterId: undefined });
      setPage(1);
      return;
    }

    setIsPending(page === 1);

    // Use 0ms delay for initial load, 500ms for search/filter debounce
    const isInitial = !search;
    const timer = setTimeout(async () => {
      if (page > 1) {
        setLoadingMore(true);
      }
      const params: any = { per_page: 20, page };
      if (activeTab === 'Nearest') params.section = 'nearby';

      // Format quick filter for API
      let quickFilterParams: any = {};
      if (selectedQuickFilter) {
        if (selectedQuickFilter === 'High Salary') {
          quickFilterParams = { salary_min: 600000 };
        } else if (selectedQuickFilter === 'Work from Home') {
          quickFilterParams = { job_type: 'remote' };
        } else if (selectedQuickFilter === 'Immediate') {
          quickFilterParams = { freshness: 'today' };
        } else {
          quickFilterParams = { job_type: selectedQuickFilter.toLowerCase().replace(/\s+/g, '_') };
        }
      }

      const hasQuickFilter = selectedQuickFilter !== null;
      const hasActiveFilters = activeFilters !== null && Object.keys(activeFilters).length > 0;
      const hasSearch = search.trim().length > 0;
      
      let actionResult;

      if (hasSearch || hasQuickFilter || hasActiveFilters) {
        setIsFiltered(true);
        actionResult = await dispatch(
          filterJobs({
            ...params,
            ...activeFilters,
            ...quickFilterParams,
            q: search || undefined,
          })
        );
      } else {
        setIsFiltered(false);
        actionResult = await dispatch(fetchJobs(params));
      }
      
      const resPayload: any = actionResult?.payload;
      const jobsReturned = resPayload?.data?.jobs || resPayload?.jobs || [];
      if (jobsReturned.length < 20) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setLoadingMore(false);
      setTimeout(() => setIsPending(false), 100);
    }, isInitial ? 0 : 500);
    return () => {
      clearTimeout(timer);
      setIsPending(false);
      setLoadingMore(false);
    };
  }, [dispatch, search, activeTab, selectedQuickFilter, route.params, activeFilters, page]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      const state = navigation.getState();
      // If routes length is 1, it means we are switching tabs or leaving the screen entirely,
      // and not pushing JobDetail onto the stack (which would make routes.length > 1)
      if (state && state.routes.length <= 1) {
        setActiveFilters(null);
        setIsFiltered(false);
        setActiveTab('All');
        setSelectedQuickFilter(null);
        setSearch('');
        setPage(1);
      }
    });
    return unsubscribe;
  }, [navigation]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, activeTab, selectedQuickFilter, activeFilters]);

  const jobsToShow = isFiltered ? filteredJobs : (activeTab === 'Nearest' ? nearby : searchResults);

  const loadMoreJobs = () => {
    if (!loading && !loadingMore && hasMore && jobsToShow.length > 0) {
      setPage(prev => prev + 1);
    }
  };

  const handleJobPress = useCallback((jobId: string) => {
    navigation.navigate('JobDetail', { jobId });
  }, [navigation]);

  const renderJobItem = useCallback(({ item }: { item: any }) => (
    <MemoizedJobCard
      item={item}
      colors={colors}
      isDark={isDark}
      t={t}
      onPress={handleJobPress}
    />
  ), [colors, isDark, t, handleJobPress]);

const MemoizedJobCard = React.memo(({ item, colors, isDark, t, onPress }: any) => {
  const companyName = item.employer?.company?.company_name || item.company_name || item.company || t('allJobs.hiringCompany', 'Hiring Company');
  const locationLabel = item.location?.label || item.location_name || (typeof item.location === 'string' ? item.location : item.location?.city) || t('allJobs.india', 'India');
  const salaryLabel = item.salary || (item.salary_min && item.salary_max ? `₹${item.salary_min.toLocaleString()} - ${item.salary_max.toLocaleString()}` : t('allJobs.negotiable', 'Negotiable'));
  const jobType = formatJobType(item.job_type_label || item.employmentType || item.job_type || 'Full Time');

  const primaryTagColor = item.applied_tags?.[0]?.icon_color || colors.primary;
  const hasAppliedTags = item.applied_tags && item.applied_tags.length > 0;

  const checkTag = (tagNameMatch: string) => {
    const checkArray = (arr: any[]) => arr?.some((t: any) => {
      const name = typeof t === 'string' ? t : t.name;
      return name && name.toLowerCase().includes(tagNameMatch);
    });
    return checkArray(item.applied_tags) || checkArray(item.tags);
  };
  const isSpotlight = checkTag('spotlight');
  const isBoost = checkTag('boost');

  let cardBgColor = colors.surface;
  let cardBorderColor = colors.border;
  let cardBorderWidth = 1;
  let cardShadowColor = colors.shadow;
  let cardElevation = 2;

  let locationTextColor = colors.textSecondary;
  let locationIconColor = colors.textSecondary;

  if (isSpotlight) {
    cardBgColor = isDark ? '#2D2714' : '#FDE68A';
    cardBorderColor = isDark ? '#F59E0B' : '#F59E0B';
    cardBorderWidth = 1;
    cardShadowColor = isDark ? 'transparent' : '#D4AF37';
    cardElevation = isDark ? 0 : 4;
  } else if (isBoost) {
    cardBgColor = isDark ? '#3F1616' : '#FCA5A5';
    cardBorderColor = isDark ? '#EF4444' : '#EF4444';
    cardBorderWidth = 1;
    cardShadowColor = isDark ? 'transparent' : '#DC2626';
    cardElevation = isDark ? 0 : 4;
  }

  return (
    <Pressable
      onPress={() => onPress(item.slug || item.id)}
      style={[
        styles.jobCard,
        {
          backgroundColor: cardBgColor,
          borderColor: cardBorderColor,
          borderWidth: cardBorderWidth,
          shadowColor: cardShadowColor,
          shadowOpacity: (isSpotlight || isBoost) ? 0.2 : 0.05,
          elevation: cardElevation,
        }
      ]}
    >
      {(hasAppliedTags || (item.tags && item.tags.length > 0)) ? (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 12 }}>
          {hasAppliedTags ? (
            <TagCycling tags={item.applied_tags} colors={colors} />
          ) : item.tags && item.tags.length > 0 ? (
            <TagCycling tags={item.tags} colors={colors} />
          ) : null}
        </View>
      ) : null}

      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: hasAppliedTags ? primaryTagColor + '20' : colors.surfaceHighlight }]}>
          {item.employer?.company?.company_logo_url ? (
            <Image
              source={{ uri: item.employer.company.company_logo_url }}
              style={{ width: 44, height: 44, borderRadius: 12 }}
            />
          ) : (
            <Icon name="briefcase" size={20} color={hasAppliedTags ? primaryTagColor : colors.primary} />
          )}
        </View>
        <View style={styles.titleBox}>
          <Text style={[typography.jobTitle, { color: colors.textPrimary }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
            {companyName}
          </Text>
        </View>
        {(item.employer?.company?.verification_status === 'approved' || item.employer?.verification_status === 'approved') && (
          <View style={{ position: 'absolute', right: 0, top: 0 }}>
            <MaterialCommunityIcons name="check-decagram" size={18} color="#3B82F6" />
          </View>
        )}
      </View>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Icon name="map-marker" size={14} color={locationIconColor} />
          <Text style={[typography.small, { color: locationTextColor, marginLeft: 6 }]}>
            {locationLabel}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.labelMedium, { color: colors.success }]}>
            {salaryLabel}
          </Text>
          <View style={[styles.typeBadge, { borderColor: colors.primary + '40', borderWidth: 1, alignSelf: 'flex-start', marginTop: 4 }]}>
            <Text style={[typography.tiny, { color: colors.primary, fontWeight: 'bold' }]}>
              {jobType}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

  const JobSkeleton = () => (
    <View style={{ gap: spacing.md, padding: spacing.lg }}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={[styles.jobCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <SkeletonPulse style={styles.iconBox} />
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonPulse style={{ height: 16, width: '60%', borderRadius: 4 }} />
              <SkeletonPulse style={{ height: 12, width: '40%', borderRadius: 4 }} />
            </View>
          </View>
          <View style={{ marginTop: 12 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <SkeletonPulse style={{ height: 16, width: 80, borderRadius: 4 }} />
            <SkeletonPulse style={{ height: 20, width: 60, borderRadius: 6 }} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <AuthHeadline
          colors={colors}
          title={t('allJobs.title', 'All jobs')}
          style={{ marginBottom: 4 }}
        />
      </View>
      <View style={[styles.searchBar, { backgroundColor: colors.surfaceHighlight, marginTop: 4 }]}>
        <Icon name="search" size={18} color={colors.textPlaceholder} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder={t('allJobs.searchPlaceholder', 'Search jobs, companies...')}
          placeholderTextColor={colors.textPlaceholder}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {(activeTab === 'All' || activeTab === 'Nearest' || activeTab === 'Other Cities') && (
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => { setActiveTab('Nearest'); setSelectedQuickFilter(null); setIsFiltered(false); setPage(1); }}
            style={[
              styles.bigActionCard,
              {
                backgroundColor: activeTab === 'Nearest' ? '#E0E7FF' : '#F8F7FF',
                borderColor: activeTab === 'Nearest' ? '#6366F1' : '#E5E7EB'
              }
            ]}
          >
            <View style={[styles.actionIconBox, { backgroundColor: activeTab === 'Nearest' ? '#6366F1' : '#EEF2FF' }]}>
              <Icon name="map-marker" size={18} color={activeTab === 'Nearest' ? '#fff' : '#6366F1'} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.actionTitle, { color: activeTab === 'Nearest' ? '#1E1B4B' : '#4B5563' }]}>{t('allJobs.nearest', 'Nearest')}</Text>
              <Text style={styles.actionSub}>{t('allJobs.nearYou', 'Near you')}</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => { setActiveTab('Other Cities'); setSelectedQuickFilter(null); setIsFiltered(false); setPage(1); }}
            style={[
              styles.bigActionCard,
              {
                backgroundColor: activeTab === 'Other Cities' ? '#E0F2FE' : '#F0F9FF',
                borderColor: activeTab === 'Other Cities' ? '#0284C7' : '#E5E7EB'
              }
            ]}
          >
            <View style={[styles.actionIconBox, { backgroundColor: activeTab === 'Other Cities' ? '#0284C7' : '#E0F2FE' }]}>
              <Icon name="globe" size={18} color={activeTab === 'Other Cities' ? '#fff' : '#0284C7'} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.actionTitle, { color: activeTab === 'Other Cities' ? '#082F49' : '#4B5563' }]}>{t('allJobs.otherCities', 'Other Cities')}</Text>
              <Text style={styles.actionSub}>{t('allJobs.exploreIndia', 'Explore India')}</Text>
            </View>
          </Pressable>
        </View>
      )}

      <View style={styles.quickFilterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFilterScroll}>
          {QUICK_FILTERS_DATA.map(filter => {
            const isSelected = selectedQuickFilter === filter.id;
            const filterColor = isSelected ? filter.color : colors.textSecondary;
            const bgColor = isSelected ? filter.color + '20' : colors.surface;

            return (
              <Pressable
                key={filter.id}
                onPress={() => setSelectedQuickFilter(isSelected ? null : filter.id)}
                style={[
                  styles.quickFilterChip,
                  {
                    backgroundColor: bgColor,
                    borderColor: isSelected ? filter.color : colors.border,
                  }
                ]}
              >
                <View style={[styles.filterIconCircle, { backgroundColor: isSelected ? filter.color : colors.surfaceHighlight }]}>
                  <Icon
                    name={filter.icon}
                    size={10}
                    color={isSelected ? '#fff' : colors.textPlaceholder}
                  />
                </View>
                <Text style={[
                  styles.quickFilterText,
                  { color: isSelected ? filter.color : colors.textPrimary }
                ]}>
                  {t(`allJobs.quickFilters.${filter.label.replace(/\s+/g, '')}`, filter.label)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isPending && page === 1 ? (
        <View style={{ flex: 1 }}>
          <View style={{ marginBottom: spacing.sm, paddingHorizontal: spacing.lg }}>
            <HomeCategoriesSection
              categories={categories}
              colors={colors}
              navigation={navigation}
              homeCategoriesMock={HOME_CATEGORIES}
              isDark={isDark}
              loading={true}
            />
          </View>
          <JobSkeleton />
        </View>
      ) : (
        <FlatList
          data={jobsToShow}
          ListHeaderComponent={
            <View style={{ marginBottom: spacing.md }}>
              <HomeCategoriesSection
                categories={categories}
                colors={colors}
                navigation={navigation}
                homeCategoriesMock={HOME_CATEGORIES}
                isDark={isDark}
                loading={metaLoading}
              />
            </View>
          }
          renderItem={renderJobItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreJobs}
          onEndReachedThreshold={0.5}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={11}
          removeClippedSubviews={true}
          ListFooterComponent={() => loadingMore ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Icon name="briefcase" size={60} color={colors.border} />
              <Text style={[typography.h4, { color: colors.textSecondary, marginTop: 16 }]}>
                {t('allJobs.noJobs', 'No jobs available yet')}
              </Text>
              {isFiltered && (
                <Pressable
                  onPress={() => {
                    setActiveFilters(null);
                    setIsFiltered(false);
                    setActiveTab('All');
                    setSelectedQuickFilter(null);
                    setSearch('');
                    setPage(1);
                  }}
                  style={{
                    marginTop: 24,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    backgroundColor: colors.primary,
                    borderRadius: radius.md,
                  }}
                >
                  <Text style={[typography.button, { color: '#fff' }]}>
                    {t('allJobs.clearFilters', 'Clear Filters')}
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        />
      )}

      <SideFilterHub
        colors={colors}
        onFilterSelect={(f) => {
          setActiveFilters(Object.keys(f).length > 0 ? f : null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: 0,
    marginBottom: 12,
    paddingHorizontal: spacing.md,
    height: 46,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: 4,
    gap: 10,
  },
  jobCard: {
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  cornerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cornerBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: { flex: 1, paddingRight: 56 },
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  tabBar: {
    paddingVertical: spacing.md,
  },
  tabScroll: {
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  tabItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#f5f5f5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: 12,
    marginBottom: 4,
  },
  bigActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  cardInfo: {
    flex: 1,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  actionSub: {
    fontSize: 10,
    color: '#666',
    marginTop: 1,
  },
  quickFilterBar: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  quickFilterScroll: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 6,
    paddingRight: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
  },
  filterIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  quickFilterText: {
    fontSize: 12,
    fontWeight: '800',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default AllJobsScreen;
