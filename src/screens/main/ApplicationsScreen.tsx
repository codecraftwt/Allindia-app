import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { components } from '../../theme/components';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchAppliedJobs, fetchApplicationCounts } from '../../redux/slice/profileSlice';
import { typography } from '../../theme/typography';
import { AuthHeadline } from '../../components/auth';

function AppliedJobCard({ job, colors }: { job: any; colors: ThemeColors }) {
  const application = job.application || {};
  const status = application.status || 'submitted';
  const isContacted = status === 'contacted';
  const statusBg = isContacted ? colors.successBackground : colors.badgeBackground;
  const statusFg = isContacted ? colors.success : colors.badgeText;

  const company = job.employer?.company || {};
  const location = job.location?.label || 'Remote';

  const appliedDate = application.applied_at
    ? new Date(application.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '';

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}>
      <View style={styles.cardHeader}>
        <View style={[styles.logoContainer, { backgroundColor: colors.surfaceHighlight }]}>
          {company.company_logo_url ? (
            <Image source={{ uri: company.company_logo_url }} style={styles.logo} />
          ) : (
            <Icon name="briefcase" size={20} color={colors.primary} />
          )}
        </View>
        <View style={styles.headerInfo}>
          <Text style={[typography.labelMedium, { color: colors.textPrimary }]} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={[typography.small, { color: colors.textSecondary }]} numberOfLines={1}>
            {company.company_name || 'Anonymous Company'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={[typography.tiny, { color: statusFg, textTransform: 'capitalize' }]}>
            {status}
          </Text>
        </View>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <View style={styles.footerItem}>
          <Icon name="map-marker" size={12} color={colors.textPlaceholder} />
          <Text style={[typography.small, { color: colors.textSecondary }]}>{location}</Text>
        </View>
        <View style={styles.footerItem}>
          <Icon name="money" size={12} color={colors.textPlaceholder} />


        </View>
        {appliedDate ? (
          <Text style={[typography.small, { color: colors.textPlaceholder, marginLeft: 'auto' }]}>
            Applied {appliedDate}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const StatShimmer = ({ colors }: { colors: ThemeColors }) => {
  const shimmerValue = useSharedValue(0.3);

  React.useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: shimmerValue.value,
  }));

  return (
    <View style={styles.statItemHorizontal}>
      <Animated.View style={[styles.squircleBadge, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border + '40' }, animatedStyle]}>
        <Animated.View style={[{ width: 30, height: 20, backgroundColor: colors.border + '30', borderRadius: 4 }, animatedStyle]} />
      </Animated.View>
      <View style={{ marginTop: 8, alignItems: 'center' }}>
        <Animated.View style={[{ width: 50, height: 10, backgroundColor: colors.border + '30', borderRadius: 2 }, animatedStyle]} />
      </View>
    </View>
  );
};
const ApplicationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { appliedJobs, applicationCounts, loading, countsLoading } = useSelector((state: RootState) => state.profile);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAppliedJobs = React.useMemo(() => {
    if (!searchQuery) return appliedJobs;
    return appliedJobs.filter((job: any) => 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.employer?.company?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [appliedJobs, searchQuery]);

  const onRefresh = React.useCallback(() => {
    dispatch(fetchAppliedJobs());
    dispatch(fetchApplicationCounts());
  }, [dispatch]);

  React.useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        <AuthHeadline
          colors={colors}
          title="Applications"
          subtitle="Track the status of your job applications"
        />

        {/* Job Application Stats Dashboard - Horizontal Scroll */}
        <View style={[styles.dashboardCard, { backgroundColor: colors.surface, shadowColor: colors.primary }]}>
          <View style={styles.dashboardHeader}>
            <Text style={[styles.dashboardTitle, { color: colors.textSecondary }]}>APPLICATION STATS</Text>
            <View style={styles.swipeHint}>
              <Text style={[styles.swipeText, { color: colors.textPlaceholder }]}>Swipe</Text>
              <Icon name="chevron-right" size={8} color={colors.textPlaceholder} />
            </View>
          </View>

          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsHorizontalScroll}
            snapToInterval={90 + spacing.md}
            decelerationRate="fast"
          >
            {countsLoading || !applicationCounts ? (
              Array(6).fill(0).map((_, i) => <StatShimmer key={i} colors={colors} />)
            ) : (
              <>
                <View style={styles.statItemHorizontal}>
                  <View style={[styles.squircleBadge, { backgroundColor: colors.surfaceHighlight, borderColor: colors.primary + '40' }]}>
                    <View style={[styles.floatingIcon, { backgroundColor: colors.primary }]}>
                      <Icon name="briefcase" size={10} color={colors.onPrimary} />
                    </View>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {String(applicationCounts.total_applied).padStart(2, '0')}
                    </Text>
                  </View>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Applied</Text>
                </View>

                <View style={styles.statItemHorizontal}>
                  <View style={[styles.squircleBadge, { backgroundColor: colors.surfaceHighlight, borderColor: colors.warning + '40' }]}>
                    <View style={[styles.floatingIcon, { backgroundColor: colors.warning }]}>
                      <Icon name="clock-o" size={10} color="#000" />
                    </View>
                    <Text style={[styles.statValue, { color: colors.warning }]}>
                      {String(applicationCounts.pending).padStart(2, '0')}
                    </Text>
                  </View>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
                </View>

                <View style={styles.statItemHorizontal}>
                  <View style={[styles.squircleBadge, { backgroundColor: colors.surfaceHighlight, borderColor: (colors.info || colors.primary) + '40' }]}>
                    <View style={[styles.floatingIcon, { backgroundColor: colors.info || colors.primary }]}>
                      <Icon name="check-circle-o" size={10} color="#fff" />
                    </View>
                    <Text style={[styles.statValue, { color: colors.info || colors.primary }]}>
                      {String(applicationCounts.shortlisted).padStart(2, '0')}
                    </Text>
                  </View>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Shortlisted</Text>
                </View>

                <View style={styles.statItemHorizontal}>
                  <View style={[styles.squircleBadge, { backgroundColor: colors.surfaceHighlight, borderColor: '#6366f1' + '40' }]}>
                    <View style={[styles.floatingIcon, { backgroundColor: '#6366f1' }]}>
                      <Icon name="calendar-check-o" size={10} color="#fff" />
                    </View>
                    <Text style={[styles.statValue, { color: '#6366f1' }]}>
                      {String(applicationCounts.interview_scheduled).padStart(2, '0')}
                    </Text>
                  </View>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Interview</Text>
                </View>

                <View style={styles.statItemHorizontal}>
                  <View style={[styles.squircleBadge, { backgroundColor: colors.surfaceHighlight, borderColor: colors.success + '40' }]}>
                    <View style={[styles.floatingIcon, { backgroundColor: colors.success }]}>
                      <Icon name="trophy" size={10} color="#fff" />
                    </View>
                    <Text style={[styles.statValue, { color: colors.success }]}>
                      {String(applicationCounts.selected).padStart(2, '0')}
                    </Text>
                  </View>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Selected</Text>
                </View>

                <View style={styles.statItemHorizontal}>
                  <View style={[styles.squircleBadge, { backgroundColor: colors.surfaceHighlight, borderColor: colors.error + '40' }]}>
                    <View style={[styles.floatingIcon, { backgroundColor: colors.error }]}>
                      <Icon name="times-circle-o" size={10} color="#fff" />
                    </View>
                    <Text style={[styles.statValue, { color: colors.error }]}>
                      {String(applicationCounts.rejected).padStart(2, '0')}
                    </Text>
                  </View>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rejected</Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>{appliedJobs.length} Jobs</Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Icon name="search" size={16} color={colors.textPlaceholder} />
          <TextInput
            placeholder="Search applications..."
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="times-circle" size={16} color={colors.textPlaceholder} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.list}>
          {filteredAppliedJobs.length > 0 ? (
            filteredAppliedJobs.map((job: any) => (
              <AppliedJobCard key={job.id} job={job} colors={colors} />
            ))
          ) : !loading ? (
            <View style={styles.emptyContainer}>
              <Icon name={searchQuery ? "search-minus" : "file-text-o"} size={48} color={colors.border} />
              <Text style={[typography.labelMedium, { color: colors.textSecondary, marginTop: spacing.md }]}>
                {searchQuery ? "No matching applications" : "No applications yet"}
              </Text>
              <Text style={[typography.small, { color: colors.textPlaceholder }]}>
                {searchQuery ? "Try a different search term" : "Applied jobs will appear here"}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 0,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    ...components.jobCard,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  // Dashboard Styles
  dashboardCard: {
    paddingVertical: spacing.md,
    paddingLeft: spacing.md, // Start items from left
    paddingRight: 0, // Allow scroll to edge
    borderRadius: radius.xl,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  dashboardTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 0,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingRight: spacing.md, // Keep title away from right edge
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.6,
  },
  swipeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statsHorizontalScroll: {
    paddingRight: spacing.xl,
    gap: spacing.md,
  },
  statItemHorizontal: {
    width: 90,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  squircleBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  floatingIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 0,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statDivider: {
    width: 1,
    height: 40,
    opacity: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    padding: 0,
  },
});

export default ApplicationsScreen;
