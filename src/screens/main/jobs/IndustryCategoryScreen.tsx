import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchJobsByCategory, filterJobs } from '../../../redux/slice/jobSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import type { ThemeColors } from '../../../theme/colors';
import SideFilterHub from '../../../components/SideFilterHub';
import SkeletonPulse from '../../../components/SkeletonPulse';


// ─── Job Card ───────────────────────────────────────────────────────────────
function JobCard({
  job,
  colors,
  onPress,
}: {
  job: any;
  colors: ThemeColors;
  onPress: () => void;
}) {
  const company = job.employer?.company || {};
  const location = job.location?.label || 'Remote';
  const salary = job.salary_label || 'Negotiable';
  const tags = job.tags || [];

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
      <View style={styles.cardTop}>
        <View style={[styles.logoBox, { backgroundColor: colors.surfaceHighlight }]}>
          {company.company_logo_url ? (
            <Image source={{ uri: company.company_logo_url }} style={styles.logoImage} />
          ) : (
            <Icon name="briefcase" size={20} color={colors.primary} />
          )}
        </View>
        <View style={styles.titleInfo}>
          <Text
            style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: '700', fontSize: 15 }]}
            numberOfLines={1}>
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
            <Text
              style={[typography.tiny, { color: colors.textSecondary, flexShrink: 1 }]}
              numberOfLines={1}>
              {location}
            </Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Icon name="money" size={12} color={colors.success} />
            <Text style={[typography.tiny, { color: colors.textSecondary }]}>{salary}</Text>
          </View>
        </View>
        {tags.length > 0 && (
          <View style={[styles.tagPill, { backgroundColor: colors.primary + '15' }]}>
            <Text
              style={[typography.tiny, { color: colors.primary, fontWeight: 'bold' }]}
              numberOfLines={1}>
              {typeof tags[0] === 'string' ? tags[0] : tags[0].name}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const IndustryJobsSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.md, paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardTop}>
            <SkeletonPulse style={styles.logoBox} />
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonPulse style={{ height: 16, width: '70%', borderRadius: 4 }} />
              <SkeletonPulse style={{ height: 12, width: '50%', borderRadius: 4 }} />
            </View>
            <SkeletonPulse style={styles.arrowBox} />
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

// ─── Main Screen ─────────────────────────────────────────────────────────────
const IndustryCategoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const categoryId: number = route.params?.categoryId;
  const categoryName: string = route.params?.categoryName || 'Category';

  const { jobsByCategory, filteredJobs, categoryLoading: loading } = useSelector((state: RootState) => state.jobs);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    dispatch(
      fetchJobsByCategory({
        category_id: categoryId,
        jobs_per_category: 50,
      })
    );
  }, [dispatch, categoryId]);

  // by-category API returns: [{ category: { id, name }, jobs_count, jobs: [...] }]
  const jobs = useMemo(() => {
    if (isFiltered) return filteredJobs;
    if (jobsByCategory.length > 0) {
      return jobsByCategory[0].jobs || [];
    }
    return [];
  }, [jobsByCategory, filteredJobs, isFiltered]);

  return (
    <View
      style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={20} color={colors.textPrimary} />
        </Pressable>



        <View style={styles.headerText}>
          <Text style={[typography.appTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {categoryName}
          </Text>
          <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]}>
            {loading ? 'Finding jobs...' : `${jobs.length} jobs available`}
          </Text>
        </View>
      </View>

      {/* Job List */}
      {loading ? (
        <IndustryJobsSkeleton />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.xl },
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
              <Icon name="briefcase" size={48} color={colors.border} />
              <Text
                style={[
                  typography.labelMedium,
                  { color: colors.textPlaceholder, marginTop: spacing.md, textAlign: 'center' },
                ]}>
                No jobs found in {categoryName}
              </Text>
              <Text
                style={[
                  typography.small,
                  { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
                ]}>
                Check back later for new listings.
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
      <SideFilterHub
        colors={colors}
        hiddenSections={['category']}
        onFilterSelect={(filters) => {
          setIsFiltered(Object.keys(filters).length > 0);
          dispatch(filterJobs({ ...filters, category_id: categoryId }));
        }}
      />
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 64, // Ensure header has a minimum height to prevent jumping
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  headerLogoContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  headerText: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  titleInfo: { flex: 1 },
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
    paddingHorizontal: spacing.xl,
  },
});

export default IndustryCategoryScreen;
