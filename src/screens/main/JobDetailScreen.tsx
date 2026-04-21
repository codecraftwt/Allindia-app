import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  type NavigationProp,
  type ParamListBase,
  type RouteProp,
} from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { PrimaryButton } from '../../components/auth';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { components } from '../../theme/components';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { findJobById } from './findJobById';
import { getJobDetailExtras } from './jobDetailMockData';

export type JobDetailRouteParams = { jobId: string };

type JobDetailRoute = RouteProp<{ JobDetail: JobDetailRouteParams }, 'JobDetail'>;

function SectionTitle({ title, colors }: { title: string; colors: ThemeColors }) {
  return (
    <Text style={[typography.sectionTitle, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
      {title}
    </Text>
  );
}

const JobDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<JobDetailRoute>();
  const jobId = route.params?.jobId ?? '';

  const job = useMemo(() => findJobById(jobId), [jobId]);
  const extras = useMemo(() => (job ? getJobDetailExtras(job) : null), [job]);

  const [saved, setSaved] = useState(false);

  const telHref = useMemo(() => {
    if (!extras?.employerPhoneDigits) {
      return '';
    }
    const raw = extras.employerPhoneDigits.replace(/\s/g, '');
    return raw.startsWith('+') ? `tel:${raw}` : `tel:+${raw.replace(/^\+/, '')}`;
  }, [extras]);

  const callEmployer = useCallback(() => {
    if (!telHref) {
      return;
    }
    Linking.openURL(telHref).catch(() => {
      Alert.alert('Could not start call', 'Try again or dial the number manually.');
    });
  }, [telHref]);

  const applyNow = useCallback(() => {
    Alert.alert('Apply', 'Application flow can be connected here.');
  }, []);

  if (!job || !extras) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconBtn}>
            <Icon name="chevron-left" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>This job could not be found.</Text>
          <PrimaryButton title="Go back" onPress={() => navigation.goBack()} colors={colors} style={styles.emptyBtn} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconBtn} accessibilityLabel="Go back">
          <Icon name="chevron-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.labelMedium, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]} numberOfLines={1}>
          Job details
        </Text>
        <Pressable
          onPress={() => setSaved(s => !s)}
          hitSlop={10}
          style={[styles.iconBtn, { backgroundColor: colors.surfaceHighlight }]}
          accessibilityLabel={saved ? 'Remove from saved' : 'Save job'}>
          <Icon name={saved ? 'heart' : 'heart-o'} size={20} color={saved ? colors.accent : colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.lg + Math.max(insets.bottom, spacing.md) },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={[typography.appTitle, { color: colors.textPrimary }]}>{job.title}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>{job.company}</Text>

        <View style={styles.metaRow}>
          <View style={[styles.metaPill, { backgroundColor: colors.successBackground }]}>
            <Icon name="money" size={14} color={colors.success} />
            <Text style={[typography.labelMedium, { color: colors.success }]}>{job.salary}</Text>
          </View>
          <View style={[styles.metaPill, { backgroundColor: colors.surfaceHighlight }]}>
            <Icon name="map-marker" size={14} color={colors.primary} />
            <Text style={[typography.small, { color: colors.textPrimary, flexShrink: 1 }]} numberOfLines={2}>
              {job.location}
            </Text>
          </View>
        </View>
        <View style={[styles.typePill, { backgroundColor: colors.badgeBackground, alignSelf: 'flex-start' }]}>
          <Text style={[typography.small, { color: colors.badgeText, fontFamily: typography.labelMedium.fontFamily }]}>
            {job.employmentType} · {job.postedLabel}
          </Text>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <SectionTitle title="Description" colors={colors} />
          <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 22 }]}>{extras.description}</Text>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <SectionTitle title="Requirements" colors={colors} />
          {extras.requirements.map((line, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
              <Text style={[typography.body, { color: colors.textSecondary, flex: 1, lineHeight: 22 }]}>{line}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, spacing.md),
          },
        ]}>
        <PrimaryButton title="Apply now" onPress={applyNow} colors={colors} />
        <View style={styles.footerRow}>
          <PrimaryButton
            title="Call employer"
            onPress={callEmployer}
            colors={colors}
            variant="secondary"
            style={styles.callBtn}
          />
          <Pressable
            onPress={() => setSaved(s => !s)}
            style={[
              styles.saveBtn,
              {
                borderColor: colors.border,
                backgroundColor: saved ? colors.surfaceHighlight : colors.surface,
              },
            ]}
            accessibilityLabel="Save job">
            <Icon name={saved ? 'heart' : 'heart-o'} size={22} color={saved ? colors.accent : colors.primary} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.button,
    maxWidth: '100%',
  },
  typePill: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  footer: {
    ...components.jobCard,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    shadowOpacity: 0.08,
    elevation: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  callBtn: {
    flex: 1,
  },
  saveBtn: {
    width: 52,
    height: 48,
    borderRadius: radius.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyBtn: {
    maxWidth: 200,
  },
});

export default JobDetailScreen;
