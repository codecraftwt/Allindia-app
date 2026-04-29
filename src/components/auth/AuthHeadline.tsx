import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ThemeColors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = {
  title: string;
  subtitle?: string;
  colors: ThemeColors;
  /** Optional icon or illustration above the title */
  decor?: React.ReactNode;
  /** Center the decor (e.g. hero icon on sign-in) */
  centerDecor?: boolean;
};

export const AuthHeadline: React.FC<Props> = ({
  title,
  subtitle,
  colors,
  decor,
  centerDecor,
}) => (
  <View style={styles.wrap}>
    {decor ? (
      <View style={[styles.decor, centerDecor && styles.decorCenter]}>{decor}</View>
    ) : null}
    <Text style={[typography.appTitle, { color: colors.textPrimary }]}>{title}</Text>
    {subtitle ? (
      <Text style={[typography.body, styles.subtitle, { color: colors.textSecondary }]}>
        {subtitle}
      </Text>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  decor: {
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  decorCenter: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 2,
    lineHeight: 22,
  },
});
