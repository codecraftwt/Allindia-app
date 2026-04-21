import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { components } from '../../theme/components';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { AppliedJob } from './applicationsMockData';
import { APPLIED_JOBS } from './applicationsMockData';

function statusLabel(status: AppliedJob['status']): string {
  return status === 'contacted' ? 'Contacted' : 'Applied';
}

function AppliedJobCard({ job, colors }: { job: AppliedJob; colors: ThemeColors }) {
  const isContacted = job.status === 'contacted';
  const statusBg = isContacted ? colors.successBackground : colors.badgeBackground;
  const statusFg = isContacted ? colors.success : colors.badgeText;

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
      <View style={styles.cardTop}>
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
      </View>
      <View style={[styles.statusRow, { borderTopColor: colors.border }]}>
        <Text style={[typography.small, { color: colors.textPlaceholder }]}>Status</Text>
        <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
          <Icon
            name={isContacted ? 'comments-o' : 'paper-plane-o'}
            size={12}
            color={statusFg}
            style={styles.statusIcon}
          />
          <Text style={[typography.small, { color: statusFg, fontFamily: typography.labelMedium.fontFamily }]}>
            {statusLabel(job.status)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const ApplicationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={[typography.appTitle, { color: colors.textPrimary }]}>Applications</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          Jobs you have applied to
        </Text>
      </View>
      <FlatList
        data={APPLIED_JOBS}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: spacing.xxl + Math.max(insets.bottom, spacing.md) },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }) => <AppliedJobCard job={item} colors={colors} />}
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
  card: {
    ...components.jobCard,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardTop: {
    flexDirection: 'row',
    gap: spacing.md,
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  statusIcon: {
    marginRight: 0,
  },
});

export default ApplicationsScreen;
