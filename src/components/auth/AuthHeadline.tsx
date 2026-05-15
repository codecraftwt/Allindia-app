import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import type { ThemeColors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import Icon from 'react-native-vector-icons/FontAwesome';

type Props = {
  title: string;
  subtitle?: string;
  colors: ThemeColors;
  /** Optional icon or illustration above the title */
  decor?: React.ReactNode;
  /** Center the decor (e.g. hero icon on sign-in) */
  centerDecor?: boolean;
  /** Optional back action */
  onBack?: () => void;
};

export const AuthHeadline: React.FC<Props> = ({
  title,
  subtitle,
  colors,
  decor,
  centerDecor,
  onBack,
}) => (
  <View style={styles.wrap}>
    {decor ? (
      <View style={[styles.decor, centerDecor && styles.decorCenter]}>{decor}</View>
    ) : null}
    <View style={styles.titleContainer}>
      {onBack && (
        <Pressable onPress={onBack} style={styles.backButton}>
          <Icon name="chevron-left" size={24} color={colors.textPrimary} />
        </Pressable>
      )}
      <Text style={[typography.appTitle, { color: colors.textPrimary, flex: 1 }]}>{title}</Text>
    </View>
    {subtitle ? (
      <Text style={[typography.body, styles.subtitle, { color: colors.textSecondary, marginLeft: onBack ? 36 : 0 }]}>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.sm,
    padding: 4,
    marginLeft: -4,
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
