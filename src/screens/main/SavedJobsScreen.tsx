import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { PrimaryButton } from '../../components/auth/PrimaryButton';
import { useTheme } from '../../context/ThemeContext';
import type { SavedStackParamList } from '../../navigation/types';
import type { ThemeColors } from '../../theme/colors';
import { components } from '../../theme/components';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { HomeJob } from './homeMockData';
import { SAVED_JOBS_SEED } from './savedJobsMockData';

type SavedNav = StackNavigationProp<SavedStackParamList, 'SavedJobs'>;

function SavedJobCard({
  job,
  colors,
  onRemove,
  onApply,
  onOpenDetail,
}: {
  job: HomeJob;
  colors: ThemeColors;
  onRemove: () => void;
  onApply: () => void;
  onOpenDetail: () => void;
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}>
      <View style={styles.cardHeader}>
        <Pressable onPress={onOpenDetail} style={styles.cardHeaderMain} accessibilityRole="button">
          <View style={[styles.iconWrap, { backgroundColor: colors.surfaceHighlight }]}>
            <Icon name="briefcase" size={18} color={colors.primary} />
          </View>
          <View style={styles.cardText}>
            <Text style={[typography.jobTitle, { color: colors.textPrimary }]} numberOfLines={2}>
              {job.title}
            </Text>
            <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={1}>
              {job.company}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          style={[styles.removeBtn, { backgroundColor: colors.surfaceSecondary }]}
          accessibilityLabel={`Remove ${job.title} from saved`}>
          <Icon name="trash-o" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>
      <Pressable onPress={onOpenDetail} accessibilityRole="button">
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Icon name="map-marker" size={13} color={colors.textPlaceholder} />
            <Text style={[typography.small, { color: colors.textSecondary }]} numberOfLines={1}>
              {job.location}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="money" size={13} color={colors.textPlaceholder} />
            <Text style={[typography.small, { color: colors.success }]} numberOfLines={1}>
              {job.salary}
            </Text>
          </View>
        </View>
        <View style={[styles.typeRow, { borderTopColor: colors.border }]}>
          <View style={[styles.typePill, { backgroundColor: colors.badgeBackground }]}>
            <Text style={[typography.small, { color: colors.badgeText, fontFamily: typography.labelMedium.fontFamily }]}>
              {job.employmentType}
            </Text>
          </View>
          <Text style={[typography.small, { color: colors.textPlaceholder }]} numberOfLines={1}>
            {job.postedLabel}
          </Text>
        </View>
      </Pressable>
      <PrimaryButton title="Apply" onPress={onApply} colors={colors} style={styles.applyBtn} />
    </View>
  );
}

const SavedJobsScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SavedNav>();
  const [jobs, setJobs] = useState<HomeJob[]>(SAVED_JOBS_SEED);

  const removeJob = useCallback((id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  }, []);

  const applyToJob = useCallback((_job: HomeJob) => {
    void _job;
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={[typography.appTitle, { color: colors.textPrimary }]}>Saved jobs</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          Jobs you have bookmarked
        </Text>
      </View>
      <FlatList
        data={jobs}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          jobs.length === 0 && styles.listEmpty,
          { paddingBottom: spacing.xxl + Math.max(insets.bottom, spacing.md) },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
            No saved jobs yet. Save roles from search or home to see them here.
          </Text>
        }
        renderItem={({ item }) => (
          <SavedJobCard
            job={item}
            colors={colors}
            onRemove={() => removeJob(item.id)}
            onApply={() => applyToJob(item)}
            onOpenDetail={() => navigation.navigate('JobDetail', { jobId: item.id })}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  card: {
    ...components.jobCard,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardHeaderMain: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minWidth: 0,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  removeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
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
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  typePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  applyBtn: {
    marginTop: spacing.md,
  },
});

export default SavedJobsScreen;
