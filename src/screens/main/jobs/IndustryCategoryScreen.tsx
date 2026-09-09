import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchJobsByCategory, filterJobs } from '../../../redux/slice/jobSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
  isDark,
}: {
  job: any;
  colors: ThemeColors;
  onPress: () => void;
  isDark: boolean;
}) {
  const company = job.employer?.company || {};
  const companyName = company.company_name || job.company_name || 'Hiring Company';
  const location = job.location?.label || (typeof job.location === 'string' ? job.location : job.location?.city) || 'Remote';
  const salary = job.salary_label || (job.salary_min && job.salary_max ? `₹${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` : 'Negotiable');
  const tags = job.tags || [];
  const isVerified = job.employer?.company?.verification_status === 'approved' || job.employer?.verification_status === 'approved';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: isDark ? '#000000' : '#0F172A',
        },
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={styles.cardTop}>
        <View
          style={[
            styles.logoBox,
            {
              backgroundColor: colors.surfaceHighlight,
              borderColor: colors.border + '90',
            },
          ]}
        >
          {company.company_logo_url ? (
            <Image source={{ uri: company.company_logo_url }} style={styles.logoImage} />
          ) : (
            <Icon name="briefcase" size={20} color={colors.primary} />
          )}
        </View>
        <View style={styles.titleInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={[styles.jobTitleText, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {job.title}
            </Text>
            {isVerified && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={15}
                color="#3B82F6"
                style={{ marginLeft: 4, flexShrink: 0 }}
              />
            )}
          </View>
          <Text
            style={[styles.companyText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {companyName}
          </Text>
        </View>
        <View style={[styles.arrowBox, { backgroundColor: colors.primary + '12' }]}>
          <FeatherIcon name="chevron-right" size={16} color={colors.primary} />
        </View>
      </View>

      <View style={[styles.cardDivider, { backgroundColor: colors.border + '60' }]} />

      <View style={styles.cardFooter}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <FeatherIcon name="map-pin" size={12} color={colors.textPlaceholder} />
            <Text
              style={[styles.metaText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {location}
            </Text>
          </View>
          <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
          <View style={styles.metaItem}>
            <Icon name="money" size={12} color={colors.success} />
            <Text
              style={[styles.metaText, { color: colors.textSecondary, fontWeight: '600' }]}
              numberOfLines={1}
            >
              {salary}
            </Text>
          </View>
        </View>

        {tags.length > 0 && (
          <View style={[styles.tagPill, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
            <Text
              style={[styles.tagPillText, { color: colors.primary }]}
              numberOfLines={1}
            >
              {typeof tags[0] === 'string' ? tags[0] : tags[0].name}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const IndustryJobsSkeleton: React.FC = () => {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';
  return (
    <View style={{ gap: spacing.md, paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: isDark ? '#000000' : '#0F172A',
            },
          ]}
        >
          <View style={styles.cardTop}>
            <SkeletonPulse style={{ width: 44, height: 44, borderRadius: 12 }} />
            <View style={{ flex: 1, gap: 8, marginLeft: 12 }}>
              <SkeletonPulse style={{ height: 16, width: i % 2 === 0 ? '70%' : '82%', borderRadius: 6 }} />
              <SkeletonPulse style={{ height: 12, width: '45%', borderRadius: 4 }} />
            </View>
            <SkeletonPulse style={{ width: 28, height: 28, borderRadius: 14 }} />
          </View>
          <View style={[styles.cardDivider, { backgroundColor: colors.border + '50' }]} />
          <View style={styles.cardFooter}>
            <View style={styles.metaRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <SkeletonPulse style={{ height: 12, width: 85, borderRadius: 4 }} />
              </View>
              <View style={[styles.metaDivider, { backgroundColor: colors.border + '60' }]} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <SkeletonPulse style={{ height: 12, width: 75, borderRadius: 4 }} />
              </View>
            </View>
            <SkeletonPulse style={{ height: 22, width: 68, borderRadius: 6 }} />
          </View>
        </View>
      ))}
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
const IndustryCategoryScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const categoryId: number = route.params?.categoryId;
  const categoryName: string = route.params?.categoryName || 'Category';

  const { jobsByCategory, filteredJobs, categoryLoading: loading } = useSelector(
    (state: RootState) => state.jobs
  );
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    dispatch(
      fetchJobsByCategory({
        category_id: categoryId,
        jobs_per_category: 50,
      })
    );
  }, [dispatch, categoryId]);

  const jobs = useMemo(() => {
    if (isFiltered) return filteredJobs;
    if (jobsByCategory.length > 0) {
      return jobsByCategory[0].jobs || [];
    }
    return [];
  }, [jobsByCategory, filteredJobs, isFiltered]);

  return (
    <View
      style={[
        styles.safe,
        { backgroundColor: isDark ? colors.background : colors.surfaceSecondary },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: colors.surfaceHighlight, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <FeatherIcon name="arrow-left" size={20} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={[typography.h3, { color: colors.textPrimary, fontWeight: '700' }]} numberOfLines={1}>
            {categoryName}
          </Text>
          <Text style={[typography.small, { color: colors.textSecondary, marginTop: 1 }]}>
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
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: colors.surfaceHighlight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.md,
                }}
              >
                <FeatherIcon name="briefcase" size={28} color={colors.primary} />
              </View>
              <Text
                style={[
                  typography.labelLarge,
                  { color: colors.textPrimary, fontWeight: '700', textAlign: 'center' },
                ]}
              >
                No jobs found in {categoryName}
              </Text>
              <Text
                style={[
                  typography.small,
                  { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
                ]}
              >
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
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  card: {
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  titleInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  jobTitleText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
    flexShrink: 1,
  },
  companyText: {
    fontSize: 13,
    marginTop: 2,
  },
  arrowBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 10,
  },
  metaText: {
    fontSize: 12,
  },
  metaDivider: {
    width: 1,
    height: 10,
    marginRight: 10,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: spacing.xl,
  },
});

export default IndustryCategoryScreen;
