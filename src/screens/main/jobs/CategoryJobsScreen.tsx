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
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';
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

  return (
    <Animated.View style={[
      styles.cornerBadge,
      {
        backgroundColor: colors.surface,
        borderColor: tagColor + '60',
        opacity: fade,
        transform: [{ translateY }]
      }
    ]}>
      <Icon name={tagIcon} size={12} color={tagColor} />
      <Text style={[styles.cornerBadgeText, { color: tagColor }]}>
        {tagName}
      </Text>
    </Animated.View>
  );
};

const { width } = Dimensions.get('window');

function JobCard({ job, colors, onPress }: { job: any; colors: ThemeColors; onPress: () => void }) {
  const companyName = job.employer?.company?.company_name || job.company_name || job.company || 'Hiring Company';
  const locationLabel = job.location?.label || job.location_name || job.location || 'India';
  const salaryLabel = job.salary || (job.salary_min && job.salary_max ? `₹${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` : 'Negotiable');
  const jobType = formatJobType(job.job_type_label || job.employmentType || job.job_type || 'Full Time');

  return (
    <Pressable
      onPress={onPress}
      style={[styles.premiumCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
          <View style={[styles.iconBox, { backgroundColor: colors.surfaceHighlight }]}>
            {job.employer?.company?.company_logo_url ? (
              <Image source={{ uri: job.employer.company.company_logo_url }} style={styles.logoImage} />
            ) : (
              <Icon name="briefcase" size={20} color={colors.primary} />
            )}
          </View>
          <View style={styles.titleBox}>
            <Text style={[typography.jobTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {job.title}
            </Text>
            <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
              {companyName}
            </Text>
          </View>
        </View>

        <View style={{ position: 'absolute', top: 0, right: 0, alignItems: 'flex-end' }}>
          <Text style={[typography.tiny, { color: colors.textPlaceholder, fontWeight: 'bold' }]}>
            Recently
          </Text>
        </View>
      </View>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Icon name="map-marker" size={12} color={colors.textPlaceholder} style={{ marginRight: 4 }} />
          <Text style={[typography.small, { color: colors.textSecondary }]}>{locationLabel}</Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="money" size={12} color={colors.success} style={{ marginRight: 4 }} />
          <Text style={[typography.small, { color: colors.textSecondary }]}>{salaryLabel}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.typeBadge, { backgroundColor: colors.badgeBackground }]}>
          <Text style={[typography.tiny, { color: colors.badgeText, fontWeight: 'bold' }]}>
            {jobType}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
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
    <View style={{ gap: spacing.md, paddingHorizontal: 6 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={[styles.premiumCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardTop}>
            <SkeletonPulse style={styles.skeletonLogo} />
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonPulse style={{ height: 16, width: '70%', borderRadius: 4 }} />
              <SkeletonPulse style={{ height: 12, width: '50%', borderRadius: 4 }} />
            </View>
            <SkeletonPulse style={{ height: 24, width: 24, borderRadius: 12 }} />
          </View>
          <View style={{ height: 1, backgroundColor: colors.border + '30', marginVertical: 12 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SkeletonPulse style={{ height: 12, width: 80, borderRadius: 4 }} />
              <SkeletonPulse style={{ height: 12, width: 80, borderRadius: 4 }} />
            </View>
            <SkeletonPulse style={{ height: 18, width: 60, borderRadius: 6 }} />
          </View>
        </View>
      ))}
    </View>
  );
};

const CategoryJobsScreen: React.FC = () => {
  const { colors } = useTheme();
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
          <Icon name="chevron-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.appTitle, { color: colors.textPrimary, flex: 1, textAlign: 'center', marginRight: 40 }]}>
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
          <Icon name="search" size={16} color={colors.textPlaceholder} />
          <TextInput
            placeholder="Search within these jobs..."
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="times-circle" size={16} color={colors.textPlaceholder} />
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
              onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Icon name="search" size={48} color={colors.border} />
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsWrapper: {
    paddingVertical: spacing.sm,
    backgroundColor: 'transparent',
  },
  searchWrapper: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    paddingVertical: 8,
  },
  tabsContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.lg, // More gap between text tabs
  },
  tabContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeIndicator: {
    width: 24,
    height: 3,
    borderRadius: 1.5,
    marginTop: 6,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 6, // Minimum padding
    paddingTop: spacing.xs,
  },
  premiumCard: {
    padding: 12,
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
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  titleBox: { flex: 1 },
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
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
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
    marginTop: 12,
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
    marginTop: 100,
  },
  skeletonLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
});

export default CategoryJobsScreen;
