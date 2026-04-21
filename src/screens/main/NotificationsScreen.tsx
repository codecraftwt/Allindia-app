import React, { useMemo } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { HomeStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { components } from '../../theme/components';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { AppNotification } from './notificationsMockData';
import {
  EMPLOYER_ACTIVITY_NOTIFICATIONS,
  JOB_ALERT_NOTIFICATIONS,
} from './notificationsMockData';

type Props = StackScreenProps<HomeStackParamList, 'Notifications'>;

function kindLabel(kind: AppNotification['kind']): string {
  return kind === 'job_alert' ? 'Job alert' : 'Employer activity';
}

function NotificationRow({ item, colors }: { item: AppNotification; colors: ThemeColors }) {
  const isJob = item.kind === 'job_alert';
  const iconBg = isJob ? colors.surfaceHighlight : colors.successBackground;
  const iconColor = isJob ? colors.primary : colors.success;
  const pillBg = isJob ? colors.badgeBackground : colors.successBackground;
  const pillFg = isJob ? colors.badgeText : colors.success;

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
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Icon name={isJob ? 'briefcase' : 'building-o'} size={18} color={iconColor} />
      </View>
      <View style={styles.cardBody}>
        <Text style={[typography.labelMedium, { color: colors.textPrimary }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={3}>
          {item.body}
        </Text>
        <View style={styles.cardFooter}>
          <View style={[styles.typePill, { backgroundColor: pillBg }]}>
            <Text style={[typography.small, { color: pillFg, fontFamily: typography.labelMedium.fontFamily }]}>
              {kindLabel(item.kind)}
            </Text>
          </View>
          <Text style={[typography.small, { color: colors.textPlaceholder }]}>{item.timeLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const sections = useMemo(
    () => [
      { title: 'Job alerts', data: JOB_ALERT_NOTIFICATIONS },
      { title: 'Employer activity', data: EMPLOYER_ACTIVITY_NOTIFICATIONS },
    ],
    [],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn} accessibilityLabel="Go back">
          <Icon name="chevron-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.appTitle, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]}>
          Notifications
        </Text>
        <View style={styles.backBtn} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[typography.sectionTitle, styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
        )}
        renderItem={({ item }) => <NotificationRow item={item} colors={colors} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        SectionSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: spacing.xxl + Math.max(insets.bottom, spacing.md) },
        ]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
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
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  card: {
    ...components.jobCard,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  typePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
});

export default NotificationsScreen;
