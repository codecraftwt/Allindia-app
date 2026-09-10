import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import type { ThemeColors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography, moderateScale } from '../../theme/typography';
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
  style?: any;
};

export const AuthHeadline: React.FC<Props> = ({
  title,
  subtitle,
  colors,
  decor,
  centerDecor,
  onBack,
  style,
}) => (
  <View style={[styles.wrap, style]}>
    {decor ? (
      <View style={[styles.decor, centerDecor && styles.decorCenter]}>{decor}</View>
    ) : null}
    <View style={styles.titleContainer}>
      {onBack && (
        <Pressable onPress={onBack} style={styles.backButton}>
          <Icon name="chevron-left" size={moderateScale(22)} color={colors.textPrimary} />
        </Pressable>
      )}
      <Text style={[typography.appTitle, { color: colors.textPrimary, flex: 1 }]}>{title}</Text>
    </View>
    {subtitle ? (
      <Text style={[typography.body, styles.subtitle, { color: colors.textSecondary, marginLeft: onBack ? moderateScale(34) : 0 }]}>
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
    padding: moderateScale(4),
    marginLeft: moderateScale(-4),
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
    marginTop: moderateScale(2),
    lineHeight: moderateScale(22),
  },
});
