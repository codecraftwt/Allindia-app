import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchJobs, searchJobs, filterJobs } from '../../../redux/slice/jobSlice';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../../context/ThemeContext';
import type { SearchStackParamList } from '../../../navigation/types';
import type { ThemeColors } from '../../../theme/colors';
import { components } from '../../../theme/components';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import HeaderFilterGrid from '../../../components/HeaderFilterGrid';
import type { HomeJob } from '../home/homeMockData';
import { ALL_LISTED_JOBS } from '../home/homeMockData';

type JobListingNav = StackNavigationProp<SearchStackParamList, 'JobListing'>;
type JobListingRoute = RouteProp<SearchStackParamList, 'JobListing'>;

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

function FilterSelectRow({
  label,
  value,
  colors,
  onPress,
}: {
  label: string;
  value: string;
  colors: ThemeColors;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterRow, { borderBottomColor: colors.border }]}
      disabled={!onPress}>
      <Text style={[typography.body, { color: colors.textPrimary }]}>{label}</Text>
      <View style={styles.filterRowRight}>
        <Text style={[typography.small, { color: colors.textSecondary }]} numberOfLines={1}>
          {value}
        </Text>
        <Icon name="chevron-right" size={12} color={colors.textPlaceholder} />
      </View>
    </Pressable>
  );
}

const JobListingScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<JobListingNav>();
  const route = useRoute<JobListingRoute>();
  const dispatch = useDispatch<AppDispatch>();
  const { searchResults, recommended, filteredJobs, loading } = useSelector((state: RootState) => state.jobs);
  const query = route.params?.query;
  const filters = route.params?.filters;

  const [filtersOpen, setFiltersOpen] = useState(false);

  const openJob = (job: any) => {
    navigation.navigate('JobDetail', { jobId: job.slug || job.id });
  };

  React.useEffect(() => {
    if (query) {
      dispatch(searchJobs(query));
    } else if (filters) {
      dispatch(filterJobs(filters));
    } else {
      dispatch(fetchJobs({}));
    }
  }, [dispatch, query, filters]);

  const jobsData = query ? searchResults : (filters ? filteredJobs : recommended);

  const headerTitle = query ? `"${query}"` : (route.params?.categoryName || (filters ? 'Filtered results' : 'All jobs'));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.centerWrapper}>
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn} accessibilityLabel="Go back">
            <Icon name="chevron-left" size={22} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.topTitleWrap}>
            <Text style={[typography.small, { color: colors.textPlaceholder }]}>Results</Text>
            <Text style={[typography.labelMedium, { color: colors.textPrimary }]} numberOfLines={1}>
              {headerTitle}
            </Text>
          </View>
          <Pressable
            onPress={() => setFiltersOpen(true)}
            hitSlop={8}
            style={[styles.filterBtn, { backgroundColor: colors.surfaceHighlight }]}
            accessibilityLabel="Open filters">
            <Icon name="sliders" size={18} color={colors.primary} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
              Finding the best jobs for you...
            </Text>
          </View>
        ) : (
          <FlatList
            data={jobsData}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: spacing.xxl + Math.max(insets.bottom, spacing.md) },
            ]}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            renderItem={({ item }) => (
              <JobListCard job={item} colors={colors} onPress={() => openJob(item)} />
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Icon name="search" size={48} color={colors.border} />
                <Text style={[typography.sectionTitle, { color: colors.textPrimary, marginTop: spacing.md }]}>
                  No jobs found
                </Text>
                <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
                  We couldn't find any jobs matching "{query || 'your criteria'}". Try adjusting your filters or search terms.
                </Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <HeaderFilterGrid
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onFilterSelect={(f) => {
          setFiltersOpen(false);
          dispatch(filterJobs(f));
        }}
        activeFilter={null}
        colors={colors}
        top={50}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitleWrap: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: spacing.sm,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    width: '100%',
  },
  listCard: {
    ...components.jobCard,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
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
    gap: spacing.md,
    marginTop: spacing.md,
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
    marginTop: spacing.md,
  },
  typePillSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  centerWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
  },
});

export default JobListingScreen;
