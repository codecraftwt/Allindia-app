import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchMetaCategories } from '../../redux/slice/metaSlice';
import { fetchJobs } from '../../redux/slice/jobSlice';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useProfileSetup } from '../../context/ProfileSetupContext';
import { useTheme } from '../../context/ThemeContext';
import type { HomeStackParamList, MainTabParamList } from '../../navigation/types';
import type { ThemeColors } from '../../theme/colors';
import { components } from '../../theme/components';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { HomeJob } from './homeMockData';
import {
  HOME_CATEGORIES,
  NEARBY_JOBS,
  RECOMMENDED_JOBS,
  TRENDING_JOBS,
} from './homeMockData';

const H_CARD_W = Math.min(Dimensions.get('window').width * 0.78, 300);

type HomeNav = StackNavigationProp<HomeStackParamList, 'HomeFeed'>;

function greetingLine(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) {
    return 'Good morning';
  }
  if (h >= 12 && h < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function getCategoryIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('it') || n.includes('tech')) return 'laptop';
  if (n.includes('sales')) return 'line-chart';
  if (n.includes('hr') || n.includes('people')) return 'users';
  if (n.includes('finance') || n.includes('account')) return 'money';
  if (n.includes('ops') || n.includes('operation')) return 'cogs';
  if (n.includes('health')) return 'heartbeat';
  if (n.includes('edu')) return 'book';
  if (n.includes('hospitality')) return 'hotel';
  return 'briefcase';
}

function SectionHeader({
  title,
  icon,
  iconColor,
  colors,
}: {
  title: string;
  icon?: string;
  iconColor?: string;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.sectionHeader}>
      {icon ? (
        <Icon name={icon} size={18} color={iconColor ?? colors.primary} style={styles.sectionIcon} />
      ) : null}
      <Text style={[typography.sectionTitle, { color: colors.textPrimary, flex: 1 }]}>{title}</Text>
      <Pressable hitSlop={8}>
        <Text style={[typography.labelMedium, { color: colors.primary }]}>See all</Text>
      </Pressable>
    </View>
  );
}

function JobTrendCard({
  job,
  colors,
  onPress,
}: {
  job: HomeJob;
  colors: ThemeColors;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.trendCard,
        {
          width: H_CARD_W,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}>
      <View style={[styles.hotBadge, { backgroundColor: colors.warningBackground }]}>
        <Icon name="fire" size={11} color={colors.warning} />
        <Text style={[typography.small, { color: colors.warning, fontFamily: typography.labelMedium.fontFamily }]}>
          Trending
        </Text>
      </View>
      <Text style={[typography.jobTitle, styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={2}>
        {job.title}
      </Text>
      <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={1}>
        {job.company}
      </Text>
      <View style={styles.cardMetaRow}>
        <Icon name="map-marker" size={12} color={colors.textPlaceholder} />
        <Text style={[typography.small, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>
          {job.location}
        </Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={[typography.labelMedium, { color: colors.success }]}>{job.salary}</Text>
        <Text style={[typography.small, { color: colors.textPlaceholder }]}>{job.postedLabel}</Text>
      </View>
      <View style={[styles.typePill, { backgroundColor: colors.surfaceHighlight }]}>
        <Text style={[typography.small, { color: colors.primary, fontFamily: typography.labelMedium.fontFamily }]}>
          {job.employmentType}
        </Text>
      </View>
    </Pressable>
  );
}

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

const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HomeNav>();
  const { draft } = useProfileSetup();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { categories } = useSelector((state: RootState) => state.meta);
  const { recommended, loading: jobsLoading } = useSelector((state: RootState) => state.jobs);

  useEffect(() => {
    dispatch(fetchMetaCategories());
    dispatch(fetchJobs({ sort: 'recommended' }));
  }, [dispatch]);

  const displayName = useMemo(() => {
    const n = user?.name || draft.fullName.trim();
    return n.length > 0 ? n : 'Job seeker';
  }, [user?.name, draft.fullName]);

  const avatarInitials = useMemo(() => profileInitials(displayName), [displayName]);

  const goSearch = () => {
    const tab = navigation.getParent() as BottomTabNavigationProp<MainTabParamList> | undefined;
    tab?.navigate('Search');
  };

  const goProfile = () => {
    const tab = navigation.getParent() as BottomTabNavigationProp<MainTabParamList> | undefined;
    tab?.navigate('Profile');
  };

  const openJob = (jobId: string) => {
    navigation.navigate('JobDetail', { jobId });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View
        style={[
          styles.fixedHeader,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}>
        <View style={styles.headerBlock}>
          <View style={styles.headerTopRow}>
            <Pressable
              onPress={goProfile}
              style={styles.headerLeft}
              accessibilityRole="button"
              accessibilityLabel="Open profile">
              <View style={[styles.headerAvatar, { backgroundColor: colors.surfaceHighlight }]}>
                {draft.fullName.trim() ? (
                  <Text style={[typography.labelMedium, { color: colors.primary, fontSize: 16 }]}>
                    {avatarInitials}
                  </Text>
                ) : (
                  <Icon name="user" size={22} color={colors.primary} />
                )}
              </View>
              <View style={styles.headerGreeting}>
                <Text style={[typography.small, { color: colors.textSecondary }]}>
                  {greetingLine()} 👋
                </Text>
                <Text style={[typography.appTitle, { color: colors.textPrimary, marginTop: 2 }]} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={[typography.small, { color: colors.primary, marginTop: 4 }]} numberOfLines={2}>
                  {"Let's find your dream job"}
                </Text>
              </View>
            </Pressable>
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => navigation.navigate('Notifications')}
                hitSlop={8}
                style={[
                  styles.notifyBtnCircle,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Notifications">
                <Icon name="bell-o" size={20} color={colors.textPrimary} />
                <View style={[styles.notifyBadge, { backgroundColor: colors.accent, borderColor: colors.surface }]} />
              </Pressable>
            </View>
          </View>

          <View
            style={[
              styles.searchBarOuter,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}>
            <Pressable
              onPress={goSearch}
              style={styles.searchBarMain}
              accessibilityRole="search"
              accessibilityLabel="Search for a job or company">
              <Icon name="search" size={18} color={colors.textPlaceholder} />
              <Text style={[styles.searchPlaceholderWide, { color: colors.textPlaceholder }]} numberOfLines={1}>
                Search for a job or company
              </Text>
            </Pressable>
            <View style={[styles.searchDivider, { backgroundColor: colors.border }]} />
            <Pressable
              onPress={goSearch}
              style={styles.searchFilterBtn}
              accessibilityRole="button"
              accessibilityLabel="Open search and filters">
              <Icon name="sliders" size={18} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollMain}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.md },
        ]}>
        <Pressable
          onPress={goSearch}
          style={[
            styles.heroBanner,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primaryDark,
            },
          ]}
          accessibilityRole="button"
          accessibilityHint="Opens search">
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View
              style={[
                styles.heroBlob,
                { backgroundColor: colors.onPrimary, opacity: 0.12, top: -24, right: -32 },
              ]}
            />
            <View
              style={[
                styles.heroBlob,
                { backgroundColor: colors.onPrimary, opacity: 0.08, bottom: -28, left: -16 },
              ]}
            />
          </View>
          <View style={styles.heroInner}>
            <View style={styles.heroCopy}>
              <Text style={[typography.sectionTitle, { color: colors.onPrimary, fontSize: 20, lineHeight: 26 }]}>
                See how you can find a job quickly!
              </Text>
              <Text
                style={[
                  typography.small,
                  {
                    color: colors.onPrimary,
                    opacity: 0.92,
                    marginTop: spacing.sm,
                    lineHeight: 18,
                  },
                ]}>
                Discover roles that match your skills and apply in minutes.
              </Text>
              <Pressable
                onPress={goSearch}
                style={[
                  styles.heroCta,
                  {
                    backgroundColor: colors.onPrimary,
                    marginTop: spacing.md,
                  },
                ]}>
                <Text style={[typography.labelMedium, { color: colors.primary }]}>Read more</Text>
              </Pressable>
            </View>
            <View style={styles.heroVisual}>
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: colors.onPrimary,
                    opacity: 0.2,
                    borderRadius: radius.lg,
                  },
                ]}
              />
              <Icon name="briefcase" size={42} color={colors.onPrimary} />
            </View>
          </View>
        </Pressable>

        <SectionHeader title="Categories" colors={colors} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
          decelerationRate="fast">
          {categories.map(cat => (
            <Pressable
              key={cat.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}>
              <View style={[styles.categoryIcon, { backgroundColor: colors.surfaceHighlight }]}>
                <Icon name={getCategoryIcon(cat.name)} size={16} color={colors.primary} />
              </View>
              <Text style={[typography.small, { color: colors.textPrimary, fontFamily: typography.labelMedium.fontFamily }]} numberOfLines={1}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
          {categories.length === 0 && HOME_CATEGORIES.map(cat => (
            <Pressable
              key={cat.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}>
              <View style={[styles.categoryIcon, { backgroundColor: colors.surfaceHighlight }]}>
                <Icon name={cat.icon} size={16} color={colors.primary} />
              </View>
              <Text style={[typography.small, { color: colors.textPrimary, fontFamily: typography.labelMedium.fontFamily }]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <SectionHeader title="Trending jobs" icon="fire" iconColor={colors.warning} colors={colors} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingScroll}
          decelerationRate="fast">
          {TRENDING_JOBS.map(job => (
            <JobTrendCard
              key={job.id}
              job={job}
              colors={colors}
              onPress={() => openJob(job.id)}
            />
          ))}
        </ScrollView>

        <SectionHeader title="Nearby jobs" icon="map-marker" colors={colors} />

        <View style={styles.verticalList}>
          {NEARBY_JOBS.map(job => (
            <JobListCard key={job.id} job={job} colors={colors} onPress={() => openJob(job.id)} />
          ))}
        </View>

        <SectionHeader title="Recommended for you" icon="bullseye" iconColor={colors.primary} colors={colors} />

        <View style={styles.verticalList}>
          {jobsLoading && recommended.length === 0 ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
          ) : (
            recommended.map((job: any) => (
              <JobListCard key={job.id} job={job} colors={colors} onPress={() => openJob(job.id)} />
            ))
          )}
          {!jobsLoading && recommended.length === 0 && (
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginVertical: spacing.md }]}>
              No recommendations found yet.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  fixedHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scrollMain: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  headerBlock: {
    gap: spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 0,
  },
  headerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGreeting: {
    flex: 1,
    minWidth: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notifyBtnCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    ...components.jobCard,
    shadowOpacity: 0.08,
    elevation: 2,
  },
  notifyBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
  },
  searchBarOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
    overflow: 'hidden',
    ...components.jobCard,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  searchBarMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 0,
  },
  searchPlaceholderWide: {
    flex: 1,
    fontSize: 15,
    fontFamily: typography.body.fontFamily,
  },
  searchDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: spacing.sm,
  },
  searchFilterBtn: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    paddingVertical: spacing.sm,
  },
  heroBanner: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...components.jobCard,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  heroBlob: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  heroInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroCta: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
  },
  heroVisual: {
    width: 88,
    height: 88,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  categoriesScroll: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    paddingRight: spacing.lg,
  },
  categoryChip: {
    minWidth: 84,
    maxWidth: 104,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: spacing.sm,
    ...components.jobCard,
    shadowOpacity: 0.04,
    elevation: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingScroll: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
    paddingRight: spacing.lg,
  },
  trendCard: {
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    ...components.jobCard,
  },
  hotBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    minHeight: 44,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  typePill: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  verticalList: {
    gap: spacing.md,
    marginBottom: 0,
  },
  listCard: {
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    ...components.jobCard,
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
});

export default HomeScreen;
