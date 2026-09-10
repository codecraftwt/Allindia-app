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
  Keyboard,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchJobs, searchJobs, filterJobs } from '../../../redux/slice/jobSlice';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import type { SearchStackParamList } from '../../../navigation/types';
import type { ThemeColors } from '../../../theme/colors';
import { components } from '../../../theme/components';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography, moderateScale } from '../../../theme/typography';
import SideFilterHub from '../../../components/SideFilterHub';
import SkeletonPulse from '../../../components/SkeletonPulse';
import type { HomeJob } from '../home/components/homeMockData';
import { ALL_LISTED_JOBS } from '../home/components/homeMockData';

type JobListingNav = StackNavigationProp<SearchStackParamList, 'JobListing'>;
type JobListingRoute = RouteProp<SearchStackParamList, 'JobListing'>;

const formatJobType = (type: string) => {
  if (!type) return 'Full Time';
  return type
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const cleanIconName = (iconStr: string) => {
  if (!iconStr) return 'check-circle';
  let cleaned = iconStr.replace(/fa[srlb]? fa-/, '').replace(/^fa-/, '').trim();
  
  // Fallbacks for FontAwesome 4
  if (cleaned === 'crown') return 'star';
  if (cleaned === 'gem') return 'diamond';
  if (cleaned === 'medal') return 'certificate';
  if (cleaned === 'award') return 'trophy';
  
  return cleaned;
};

const getTagConfig = (tag: string, colors: any) => {
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
};

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
  const locationLabel = job.location?.label || (typeof job.location === 'string' ? job.location : job.location?.city) || 'Remote';
  const salaryLabel = job.salary || (job.salary_min && job.salary_max ? `₹${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` : 'Negotiable');
  const jobType = formatJobType(job.job_type_label || job.employmentType || job.job_type || 'Full Time');
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
      <View style={styles.listCardTags}>
        {job.applied_tags && job.applied_tags.length > 0 ? (
          job.applied_tags.slice(0, 2).map((tag: any, idx: number) => (
            <View key={idx} style={[styles.tagBadgeSm, { backgroundColor: (tag.icon_color || colors.primary) + '10' }]}>
              <Icon name={cleanIconName(tag.icon)} size={moderateScale(10)} color={tag.icon_color || colors.primary} />
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
                <Icon name={config.icon} size={moderateScale(10)} color={config.color} />
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
          <Icon name="briefcase" size={moderateScale(16)} color={colors.primary} />
        </View>
        <View style={[styles.listCardText, { paddingRight: moderateScale(20) }]}>
          <Text style={[typography.jobTitle, { color: colors.textPrimary }]} numberOfLines={2}>
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
      <View style={styles.listMeta}>
        <View style={styles.metaItem}>
          <Icon name="map-marker" size={moderateScale(11)} color={colors.textPlaceholder} />
          <Text style={[typography.small, { color: colors.textSecondary }]}>{locationLabel}</Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="clock-o" size={moderateScale(11)} color={colors.textPlaceholder} />
          <Text style={[typography.small, { color: colors.textPlaceholder }]}>{postedLabel}</Text>
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

const JobListingSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={{ gap: moderateScale(10), paddingHorizontal: moderateScale(12), paddingTop: moderateScale(10) }}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={[styles.listCard, { backgroundColor: colors.surface }]}>
          <View style={styles.listCardTop}>
            <SkeletonPulse style={styles.listIconWrap} />
            <View style={{ flex: 1, gap: moderateScale(6) }}>
              <SkeletonPulse style={{ height: moderateScale(14), width: '70%', borderRadius: moderateScale(4) }} />
              <SkeletonPulse style={{ height: moderateScale(10), width: '50%', borderRadius: moderateScale(4) }} />
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: colors.border + '30', marginVertical: moderateScale(10) }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', gap: moderateScale(10) }}>
              <SkeletonPulse style={{ height: moderateScale(10), width: moderateScale(70), borderRadius: moderateScale(4) }} />
              <SkeletonPulse style={{ height: moderateScale(10), width: moderateScale(70), borderRadius: moderateScale(4) }} />
            </View>
            <SkeletonPulse style={{ height: moderateScale(18), width: moderateScale(50), borderRadius: moderateScale(6) }} />
          </View>
        </View>
      ))}
    </View>
  );
};

const JobListingScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<JobListingNav>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { searchResults, recommended, filteredJobs, loading, searchLoading } = useSelector((state: RootState) => state.jobs);
  const isLoading = loading || searchLoading;
  const query = route.params?.query;
  const filters = route.params?.filters;

  const [loadingMore, setLoadingMore] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  const openJob = (job: any) => {
    navigation.navigate('JobDetail', { jobId: job.slug || job.id });
  };

  React.useEffect(() => {
    Keyboard.dismiss();
    if (query) {
      dispatch(searchJobs(query));
    } else if (filters) {
      dispatch(filterJobs(filters));
    } else {
      dispatch(fetchJobs({}));
    }
  }, [dispatch, query, filters]);

  const jobsData = query ? searchResults : (isFiltered || filters ? filteredJobs : recommended);

  const headerTitle = query ? `"${query}"` : (route.params?.categoryName || (filters ? 'Filtered results' : 'All jobs'));

  return (
    <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={colors.background === '#FFFFFF' ? 'dark-content' : 'light-content'} backgroundColor="transparent" translucent />
      <View style={styles.centerWrapper}>
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn} accessibilityLabel="Go back">
            <Icon name="chevron-left" size={moderateScale(18)} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.topTitleWrap}>
            <Text style={[typography.small, { color: colors.textPlaceholder }]}>Results</Text>
            <Text style={[typography.labelMedium, { color: colors.textPrimary }]} numberOfLines={1}>
              {headerTitle}
            </Text>
          </View>
          <View style={{ width: moderateScale(36) }} />
        </View>

        {isLoading ? (
          <JobListingSkeleton />
        ) : (
          <FlatList
            data={jobsData}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: spacing.xxl + Math.max(insets.bottom, spacing.md) + 90 },
            ]}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            renderItem={({ item }) => (
              <JobListCard job={item} colors={colors} onPress={() => openJob(item)} />
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Icon name="search" size={moderateScale(42)} color={colors.border} />
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

      <SideFilterHub
        colors={colors}
        onFilterSelect={(f) => {
          setIsFiltered(Object.keys(f).length > 0);
          dispatch(filterJobs(f));
        }}
      />
    </View>
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
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
  backBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitleWrap: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: spacing.sm,
  },
  filterBtn: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: moderateScale(12),
    paddingTop: moderateScale(8),
    width: '100%',
  },
  listCard: {
    ...components.jobCard,
    padding: moderateScale(10),
    borderRadius: moderateScale(12),
    borderWidth: StyleSheet.hairlineWidth,
  },
  listCardTop: {
    flexDirection: 'row',
    gap: moderateScale(10),
  },
  listIconWrap: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
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
    gap: moderateScale(10),
    marginTop: moderateScale(8),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    maxWidth: '100%',
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: moderateScale(8),
  },
  typePillSm: {
    paddingHorizontal: moderateScale(7),
    paddingVertical: moderateScale(3),
    borderRadius: radius.sm,
  },
  listCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(6),
    marginBottom: moderateScale(6),
  },
  tagBadgeSm: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(7),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(5),
    gap: moderateScale(4),
  },
  tagTextSm: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    fontFamily: typography.labelMedium.fontFamily,
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
    paddingVertical: moderateScale(60),
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
