import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { components } from '../../theme/components';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchAppliedJobs } from '../../redux/slice/profileSlice';
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
            <Text style={[typography.tiny, { color: colors.textSecondary }]}>{location}</Text>
          </View>
          <View style={styles.footerItem}>
            <Icon name="money" size={12} color={colors.textPlaceholder} />
            <Text style={[typography.tiny, { color: colors.textSecondary }]}>
              ₹{job.salary_min?.toLocaleString()} - ₹{job.salary_max?.toLocaleString()}
            </Text>
          </View>
          {appliedDate ? (
            <Text style={[typography.tiny, { color: colors.textPlaceholder, marginLeft: 'auto' }]}>
              Applied {appliedDate}
            </Text>
          ) : null}
        </View>
    </Pressable>
  );
}

const ApplicationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { appliedJobs, loading } = useSelector((state: RootState) => state.profile);

  React.useEffect(() => {
    dispatch(fetchAppliedJobs());
  }, [dispatch]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
       <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={() => dispatch(fetchAppliedJobs())} 
            colors={[colors.primary]}
          />
        }
      >
        <AuthHeadline
          colors={colors}
          title="Applications"
          subtitle="Track the status of your job applications"
        />

        <View style={styles.list}>
          {appliedJobs.length > 0 ? (
            appliedJobs.map((job: any) => (
              <AppliedJobCard key={job.id} job={job} colors={colors} />
            ))
          ) : !loading ? (
            <View style={styles.emptyContainer}>
              <Icon name="file-text-o" size={48} color={colors.border} />
              <Text style={[typography.labelMedium, { color: colors.textSecondary, marginTop: spacing.md }]}>
                No applications yet
              </Text>
              <Text style={[typography.small, { color: colors.textPlaceholder }]}>
                Applied jobs will appear here
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
    paddingBottom: spacing.xxl,
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
});

export default ApplicationsScreen;
