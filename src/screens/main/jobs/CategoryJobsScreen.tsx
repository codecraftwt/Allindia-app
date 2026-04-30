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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchJobs, fetchHomeFeed, fetchJobsByCategory } from '../../../redux/slice/jobSlice';
import { fetchMetaCategories } from '../../../redux/slice/metaSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import type { ThemeColors } from '../../../theme/colors';
import { components } from '../../../theme/components';
import SideFilterHub from '../../../components/SideFilterHub';

const { width } = Dimensions.get('window');

function JobCard({ job, colors, onPress }: { job: any; colors: ThemeColors; onPress: () => void }) {
  const company = job.employer?.company || {};
  const location = job.location?.label || 'Remote';
  const salary = job.salary_label || 'Negotiable';
  const tags = job.tags || [];

  return (
    <Pressable
      onPress={onPress}
      style={[styles.premiumCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.logoBox, { backgroundColor: colors.surfaceHighlight }]}>
          {company.company_logo_url ? (
            <Image source={{ uri: company.company_logo_url }} style={styles.logoImage} />
          ) : (
            <Icon name="briefcase" size={20} color={colors.primary} />
          )}
        </View>
        <View style={styles.titleInfo}>
          <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: '700', fontSize: 15 }]} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]}>
            {company.company_name || 'Hiring Company'}
          </Text>
        </View>
        <View style={[styles.arrowBox, { backgroundColor: colors.primary + '10' }]}>
          <Icon name="chevron-right" size={12} color={colors.primary} />
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="map-marker" size={12} color={colors.textPlaceholder} />
            <Text style={[typography.tiny, { color: colors.textSecondary, flexShrink: 1 }]} numberOfLines={1}>{location}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Icon name="money" size={12} color={colors.success} />
            <Text style={[typography.tiny, { color: colors.textSecondary }]}>{salary}</Text>
          </View>
        </View>
        {tags.length > 0 && (
          <View style={[styles.tagPill, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[typography.tiny, { color: colors.primary, fontWeight: 'bold' }]} numberOfLines={1}>
              {typeof tags[0] === 'string' ? tags[0] : tags[0].name}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const CategoryJobsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const [showFilterGrid, setShowFilterGrid] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const { latest, trending, nearby, recommended, filteredJobs, jobsByCategory, loading } = useSelector((state: RootState) => state.jobs);

  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName;

  const [selectedId, setSelectedId] = useState<string>(route.params?.section || (categoryId ? 'all' : 'latest'));
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    if (categoryId) {
      // Use the specific by-category API for industry categories
      dispatch(fetchJobsByCategory({ 
        category_id: categoryId,
        jobs_per_category: 50 
      }));
    } else {
      if (selectedId === 'all') {
        dispatch(fetchJobs({ per_page: 100 }));
      } else {
        dispatch(fetchHomeFeed());
      }
    }
  }, [dispatch, selectedId, categoryId]);

  const applyAdvancedFilters = (filters: any) => {
    setActiveFilter(filters);
    setIsFiltered(true);
    dispatch(fetchJobs({
      ...filters,
      per_page: 50
    }));
  };

  const jobsData = useMemo(() => {
    if (isFiltered) return recommended;
    
    // If in category mode, extract jobs from the first category in jobsByCategory
    if (categoryId && jobsByCategory.length > 0) {
      return jobsByCategory[0].jobs || [];
    }

    switch (selectedId) {
      case 'all': return recommended;
      case 'latest': return latest;
      case 'trending': return trending;
      case 'nearby': return nearby;
      case 'recommended': return recommended;
      default: return recommended;
    }
  }, [selectedId, isFiltered, latest, trending, nearby, recommended, categoryId, jobsByCategory]);

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

      {loading && jobsData.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>Updating feed...</Text>
        </View>
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
    padding: spacing.md,
    borderRadius: radius.md, // Slightly less rounded for edge look
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    marginBottom: 0,
    marginHorizontal: 0,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleInfo: {
    flex: 1,
  },
  arrowBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
});

export default CategoryJobsScreen;
