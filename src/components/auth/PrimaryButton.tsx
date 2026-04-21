import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import type { ThemeColors } from '../../theme/colors';
import { components } from '../../theme/components';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  colors: ThemeColors;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

export const PrimaryButton: React.FC<Props> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  colors,
  variant = 'primary',
  style,
  iconLeft,
  iconRight,
}) => {
  const isPrimary = variant === 'primary';
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        isPrimary
          ? {
              backgroundColor: inactive ? colors.muted : colors.primary,
              shadowColor: colors.primary,
            }
          : {
              backgroundColor: colors.surface,
              borderWidth: components.buttonSecondary.borderWidth,
              borderColor: inactive ? colors.border : colors.primary,
              shadowColor: 'transparent',
            },
        isPrimary && !inactive && styles.primaryShadow,
        pressed && !inactive && isPrimary && { backgroundColor: colors.primaryDark },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.primary} />
      ) : (
        <View style={styles.row}>
          {iconLeft ? <View style={styles.iconSlot}>{iconLeft}</View> : null}
          <Text
            style={[
              typography.labelMedium,
              isPrimary
                ? { color: colors.onPrimary }
                : { color: inactive ? colors.textSecondary : colors.primary },
            ]}>
            {title}
          </Text>
          {iconRight ? <View style={styles.iconSlotRight}>{iconRight}</View> : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    ...components.button,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryShadow: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  iconSlot: {
    marginRight: 2,
  },
  iconSlotRight: {
    marginLeft: 2,
  },
});
