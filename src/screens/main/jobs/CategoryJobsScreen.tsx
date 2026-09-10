import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
  Animated,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchJobs, fetchHomeFeed, fetchJobsByCategory, filterJobs } from '../../../redux/slice/jobSlice';
import { fetchMetaCategories } from '../../../redux/slice/metaSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { typography, moderateScale } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import type { ThemeColors } from '../../../theme/colors';
import { components } from '../../../theme/components';
import SideFilterHub from '../../../components/SideFilterHub';
import SkeletonPulse from '../../../components/SkeletonPulse';

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
  return icon.replace(/fa[srlb]? fa-/, '').trim();
};

const TagCycling = ({ tags, colors }: { tags: any[], colors: any }) => {
  const [index, setIndex] = React.useState(0);
  const fade = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (tags.length <= 1) return;
    const interval = setInterval(() => {
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
  const tagIcon = isApplied ? cleanIconName(tag.icon) : 'tag';
  const tagColor = isApplied ? (tag.icon_color || colors.primary) : colors.primary;

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
      <Icon name={tagIcon} size={moderateScale(11)} color={customText || tagColor} />
      <Text style={[styles.cornerBadgeText, { color: customText || tagColor }]}>
        {tagName}
      </Text>
    </Animated.View>
  );
};

const { width } = Dimensions.get('window');

function JobCard({ job, colors, onPress, isDark }: { job: any; colors: ThemeColors; onPress: () => void; isDark?: boolean }) {
  const companyName = job.employer?.company?.company_name || job.company_name || job.company || 'Hiring Company';
  const locationLabel = job.location?.label || job.location_name || (typeof job.location === 'string' ? job.location : job.location?.city) || 'India';
  const salaryLabel = job.salary || (job.salary_min && job.salary_max ? `₹${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` : 'Negotiable');
  const jobType = formatJobType(job.job_type_label || job.employmentType || job.job_type || 'Full Time');

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
  let cardShadowColor = colors.shadow;
  let cardElevation = 2;

  if (isSpotlight) {
    cardBgColor = isDark ? '#2D2714' : '#FDE68A';
    cardBorderColor = isDark ? '#F59E0B' : '#F59E0B';
    cardShadowColor = isDark ? 'transparent' : '#D4AF37';
    cardElevation = isDark ? 0 : 4;
  } else if (isBoost) {
    cardBgColor = isDark ? '#3F1616' : '#FCA5A5';
    cardBorderColor = isDark ? '#EF4444' : '#EF4444';
    cardShadowColor = isDark ? 'transparent' : '#DC2626';
    cardElevation = isDark ? 0 : 4;
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.premiumCard,
        { backgroundColor: cardBgColor, borderColor: cardBorderColor, shadowColor: cardShadowColor, elevation: cardElevation, padding: moderateScale(12) },
        (isSpotlight || isBoost) && { shadowOpacity: 0.2, shadowRadius: moderateScale(8), shadowOffset: { width: 0, height: moderateScale(4) } }
      ]}
    >
      <View style={[styles.cardHeader, { marginBottom: moderateScale(8) }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: moderateScale(10) }}>
          <View style={[styles.iconBox, { backgroundColor: colors.surfaceHighlight }]}>
            {job.employer?.company?.company_logo_url ? (
              <Image source={{ uri: job.employer.company.company_logo_url }} style={styles.logoImage} resizeMode="contain" />
            ) : (
              <Icon name="briefcase" size={moderateScale(18)} color={colors.primary} />
            )}
          </View>
          <View style={[styles.titleBox, { paddingRight: moderateScale(22) }]}>
            <Text style={[typography.jobTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {job.title}
            </Text>
            <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
              {companyName}
            </Text>
          </View>
          {(job.employer?.company?.verification_status === 'approved' || job.employer?.verification_status === 'approved') && (
            <View style={{ position: 'absolute', right: 0, top: 0 }}>
              <MaterialCommunityIcons name="check-decagram" size={moderateScale(16)} color="#3B82F6" />
            </View>
          )}
        </View>
      </View>

      <View style={[styles.cardMeta, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(8), marginTop: 0, paddingTop: 0, borderTopWidth: 0 }]}>
        <View style={[styles.metaItem, { flex: 1, marginRight: moderateScale(8) }]}>
          <Icon name="map-marker" size={moderateScale(12)} color={colors.textPlaceholder} style={{ marginRight: moderateScale(4) }} />
          <Text style={[typography.small, { color: colors.textSecondary, flexShrink: 1 }]} numberOfLines={1}>{locationLabel}</Text>
        </View>
        <Text style={[typography.labelMedium, { color: colors.success, fontWeight: '700' }]}>{salaryLabel}</Text>
      </View>

      <View style={[styles.cardFooter, { marginTop: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <View style={[styles.typeBadge, { backgroundColor: colors.badgeBackground, paddingHorizontal: moderateScale(8), paddingVertical: moderateScale(3), borderRadius: moderateScale(6) }]}>
          <Text style={[typography.tiny, { color: colors.badgeText, fontWeight: '600', fontSize: moderateScale(10) }]}>
            {jobType}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(8) }}>
          {(job.applied_tags?.length > 0 || job.tags?.length > 0) && (
            <TagCycling tags={job.applied_tags?.length > 0 ? job.applied_tags : job.tags} colors={colors} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const CategoryJobsSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={{ gap: moderateScale(10), paddingHorizontal: moderateScale(6) }}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={[styles.premiumCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardTop}>
            <SkeletonPulse style={{ width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(10) }} />
            <View style={{ flex: 1, gap: moderateScale(6), marginLeft: moderateScale(10) }}>
              <SkeletonPulse style={{ height: moderateScale(14), width: i % 2 === 0 ? '70%' : '82%', borderRadius: moderateScale(4) }} />
              <SkeletonPulse style={{ height: moderateScale(10), width: '45%', borderRadius: moderateScale(4) }} />
            </View>
            <SkeletonPulse style={{ width: moderateScale(24), height: moderateScale(24), borderRadius: moderateScale(12) }} />
          </View>
          <View style={{ height: 1, backgroundColor: colors.border + '50', marginVertical: moderateScale(10) }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: moderateScale(10), alignItems: 'center' }}>
              <SkeletonPulse style={{ height: moderateScale(10), width: moderateScale(80), borderRadius: moderateScale(4) }} />
              <SkeletonPulse style={{ height: moderateScale(10), width: moderateScale(70), borderRadius: moderateScale(4) }} />
            </View>
            <SkeletonPulse style={{ height: moderateScale(20), width: moderateScale(60), borderRadius: moderateScale(6) }} />
          </View>
        </View>
      ))}
    </View>
  );
};

const CategoryJobsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const [showFilterGrid, setShowFilterGrid] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { latest, trending, nearby, recommended, filteredJobs, jobsByCategory, loading } = useSelector((state: RootState) => state.jobs);

  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName;

  const [selectedId, setSelectedId] = useState<string>(route.params?.section || (categoryId ? 'all' : 'latest'));
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    if (categoryId) {
      // Only fetch if we don't have jobs for this category yet
      if (jobsByCategory.length === 0) {
        dispatch(fetchJobsByCategory({ 
          category_id: categoryId,
          jobs_per_category: 50 
        }));
      }
    } else {
      if (selectedId === 'all') {
        if (recommended.length === 0) {
          dispatch(fetchJobs({ per_page: 100 }));
        }
      } else {
        // If we're missing any of the main feed lists, fetch them
        if (latest.length === 0 || trending.length === 0 || nearby.length === 0) {
          dispatch(fetchHomeFeed());
        }
      }
    }
  }, [dispatch, selectedId, categoryId, recommended.length, latest.length, trending.length, nearby.length, jobsByCategory.length]);

  const applyAdvancedFilters = (filters: any) => {
    setActiveFilter(filters);
    setIsFiltered(Object.keys(filters).length > 0);
    dispatch(filterJobs({ ...filters, category_id: categoryId }));
  };

  const jobsData = useMemo(() => {
    let data = [];
    if (isFiltered) {
      data = filteredJobs;
    } else if (categoryId && jobsByCategory.length > 0) {
      // If in category mode, extract jobs from the first category in jobsByCategory
      data = jobsByCategory[0].jobs || [];
    } else {
      switch (selectedId) {
        case 'all': data = recommended; break;
        case 'latest': data = latest; break;
        case 'trending': data = trending; break;
        case 'nearby': data = nearby; break;
        case 'recommended': data = recommended; break;
        default: data = recommended;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return data.filter((job: any) => 
        job.title?.toLowerCase().includes(q) || 
        job.employer?.company?.company_name?.toLowerCase().includes(q) ||
        job.location?.label?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [selectedId, isFiltered, latest, trending, nearby, recommended, categoryId, jobsByCategory, filteredJobs, searchQuery]);

  const allTabs = useMemo(() => [
    { id: 'all', name: 'All Jobs' },
    { id: 'latest', name: 'Latest' },
    { id: 'trending', name: 'Trending' },
    { id: 'nearby', name: 'Nearby' },
    { id: 'recommended', name: 'Recommended' },
  ], []);

  const renderTab = ({ item }: { item: any }) => {
    const isActive = selectedId === item.id;
    return (
      <Pressable
        onPress={() => {
          setSelectedId(item.id);
          setIsFiltered(false); // Clear filter view when switching tabs
        }}
        style={styles.tabContainer}>
        <Text style={[
          isActive ? typography.labelMedium : typography.body,
          {
            color: isActive ? colors.primary : colors.textSecondary,
            paddingHorizontal: spacing.sm,
          }
        ]}>
          {item.name}
        </Text>
        {isActive && (
          <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={moderateScale(18)} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.appTitle, { color: colors.textPrimary, flex: 1, textAlign: 'center', marginRight: moderateScale(36) }]}>
          {categoryName || allTabs.find(t => t.id === selectedId)?.name} Jobs
        </Text>
      </View>

      <View style={styles.tabsWrapper}>
        <FlatList
          data={allTabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={renderTab}
          contentContainerStyle={styles.tabsContent}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
          <Icon name="search" size={moderateScale(15)} color={colors.textPlaceholder} />
          <TextInput
            placeholder="Search within these jobs..."
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="times-circle" size={moderateScale(15)} color={colors.textPlaceholder} />
            </Pressable>
          )}
        </View>
      </View>

      {loading && jobsData.length === 0 ? (
        <CategoryJobsSkeleton />
      ) : (
        <FlatList
          data={jobsData}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.xl }
          ]}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              colors={colors}
              isDark={isDark}
              onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Icon name="search" size={moderateScale(42)} color={colors.border} />
              <Text style={[typography.labelMedium, { color: colors.textPlaceholder, marginTop: spacing.md }]}>
                No jobs found in this category
              </Text>
            </View>
          )}
        />
      )}

      <SideFilterHub
        colors={colors}
        activeFilter={activeFilter}
        onFilterSelect={applyAdvancedFilters}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsWrapper: {
    paddingVertical: spacing.sm,
    backgroundColor: 'transparent',
  },
  searchWrapper: {
    paddingHorizontal: moderateScale(12),
    paddingBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    height: moderateScale(42),
    borderRadius: moderateScale(10),
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: moderateScale(6),
    fontSize: moderateScale(13),
    paddingVertical: moderateScale(6),
  },
  tabsContent: {
    paddingHorizontal: moderateScale(12),
    gap: spacing.lg, // More gap between text tabs
  },
  tabContainer: {
    alignItems: 'center',
    paddingVertical: moderateScale(6),
  },
  activeIndicator: {
    width: moderateScale(20),
    height: moderateScale(3),
    borderRadius: moderateScale(1.5),
    marginTop: moderateScale(4),
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: moderateScale(6), // Minimum padding
    paddingTop: spacing.xs,
  },
  premiumCard: {
    padding: moderateScale(10),
    borderRadius: moderateScale(14),
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
    gap: moderateScale(10),
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  titleBox: { flex: 1, paddingRight: moderateScale(40) },
  cornerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(6),
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cornerBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: 'bold',
    marginLeft: moderateScale(3),
  },
  cardMeta: {
    flexDirection: 'row',
    gap: moderateScale(12),
    marginTop: moderateScale(10),
    paddingTop: moderateScale(10),
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
    marginTop: moderateScale(10),
  },
  typeBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(6),
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(60),
  },
  skeletonLogo: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
  },
});

export default CategoryJobsScreen;
