import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchJobs, filterJobs, searchJobs } from '../../../redux/slice/jobSlice';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { radius } from '../../../theme/radius';
import { useNavigation, useRoute } from '@react-navigation/native';
import SideFilterHub from '../../../components/SideFilterHub';
import SkeletonPulse from '../../../components/SkeletonPulse';
import JobActionModal from '../../../components/JobActionModal';
import { AuthHeadline } from '../../../components/auth';

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

const AllJobsScreen = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { searchResults, filteredJobs, loading } = useSelector((state: RootState) => state.jobs);
  const [search, setSearch] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string | null>(null);

  useEffect(() => {
    // Handle incoming filters from navigation
    if (route.params?.filters) {
      dispatch(filterJobs(route.params?.filters));
      setIsFiltered(true);
      // Clear params after applying so it doesn't re-apply on every render
      navigation.setParams({ filters: undefined });
      return;
    }

    // Use 0ms delay for initial load, 500ms for search/filter debounce
    const isInitial = !search && !selectedQuickFilter;
    const timer = setTimeout(() => {
      const params: any = { per_page: 20 };
      if (activeTab === 'Nearest') params.section = 'nearby';

      // Format quick filter for API (snake_case)
      const quickFilterValue = selectedQuickFilter ? selectedQuickFilter.toLowerCase().replace(/\s+/g, '_') : null;

      if (search) {
        setIsFiltered(false);
        dispatch(searchJobs(search));
      } else if (quickFilterValue) {
        setIsFiltered(true);
        dispatch(filterJobs({ ...params, job_type: quickFilterValue }));
      } else if (isFiltered) {
        // If we were filtered but cleared quick filter, and no side filters active
        setIsFiltered(false);
        dispatch(fetchJobs(params));
      } else {
        dispatch(fetchJobs(params));
      }
    }, isInitial ? 0 : 500);
    return () => clearTimeout(timer);
  }, [dispatch, search, activeTab, selectedQuickFilter]);

  const jobsToShow = isFiltered ? filteredJobs : searchResults;

  const renderJobItem = ({ item }: { item: any }) => {
    const companyName = item.employer?.company?.company_name || item.company_name || item.company || 'Hiring Company';
    const locationLabel = item.location?.label || item.location_name || item.location || 'India';
    const salaryLabel = item.salary || (item.salary_min && item.salary_max ? `₹${item.salary_min.toLocaleString()} - ${item.salary_max.toLocaleString()}` : 'Negotiable');
    const jobType = item.job_type_label || item.employmentType || item.job_type || 'Full Time';

    const primaryTagColor = item.applied_tags?.[0]?.icon_color || colors.primary;
    const hasAppliedTags = item.applied_tags && item.applied_tags.length > 0;

    return (
      <Pressable
        onPress={() => navigation.navigate('JobDetail', { jobId: item.slug || item.id })}
        style={[
          styles.jobCard,
          {
            backgroundColor: hasAppliedTags ? primaryTagColor + '10' : colors.surface,
            borderColor: colors.border,
            borderWidth: hasAppliedTags ? 0 : 1,
            shadowOpacity: hasAppliedTags ? 0 : 0.05,
            elevation: hasAppliedTags ? 0 : 2,
          }
        ]}
      >
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
            <Text style={[typography.small, { color: colors.textSecondary }]}>
              {companyName}
            </Text>
          </View>
          <View style={{ position: 'absolute', top: 0, right: 0 }}>
            <Text style={[typography.tiny, { color: colors.textPlaceholder, fontWeight: 'bold' }]}>
              Recently
            </Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Icon name="map-marker" size={14} color={colors.textSecondary} />
            <Text style={[typography.small, { color: colors.textSecondary, marginLeft: 6 }]}>
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

          <View style={{ alignItems: 'flex-end' }}>
            {hasAppliedTags ? (
              <TagCycling tags={item.applied_tags} colors={colors} />
            ) : item.tags && item.tags.length > 0 ? (
              <TagCycling tags={item.tags} colors={colors} />
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

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
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <AuthHeadline
          colors={colors}
          title="All jobs"
          style={{ marginBottom: 4 }}
        />
      </View>
      <View style={[styles.searchBar, { backgroundColor: colors.surfaceHighlight, marginTop: 4 }]}>
        <Icon name="search" size={18} color={colors.textPlaceholder} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search jobs, companies..."
          placeholderTextColor={colors.textPlaceholder}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {(activeTab === 'All' || activeTab === 'Nearest' || activeTab === 'Other Cities') && (
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => { setActiveTab('Nearest'); setSelectedQuickFilter(null); setIsFiltered(false); }}
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
              <Text style={[styles.actionTitle, { color: activeTab === 'Nearest' ? '#1E1B4B' : '#4B5563' }]}>Nearest</Text>
              <Text style={styles.actionSub}>Near you</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => { setActiveTab('Other Cities'); setSelectedQuickFilter(null); setIsFiltered(false); }}
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
              <Text style={[styles.actionTitle, { color: activeTab === 'Other Cities' ? '#082F49' : '#4B5563' }]}>Other Cities</Text>
              <Text style={styles.actionSub}>Explore India</Text>
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
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <JobSkeleton />
      ) : (
        <FlatList
          data={jobsToShow}
          renderItem={renderJobItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Icon name="briefcase" size={60} color={colors.border} />
              <Text style={[typography.h4, { color: colors.textSecondary, marginTop: 16 }]}>
                No jobs available yet
              </Text>
            </View>
          )}
        />
      )}

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
  titleBox: { flex: 1 },
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
