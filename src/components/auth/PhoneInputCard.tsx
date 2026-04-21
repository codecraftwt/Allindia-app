import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { ThemeColors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  colors: ThemeColors;
  error?: string;
  inputRef?: React.RefObject<TextInput | null>;
} & Pick<TextInputProps, 'onSubmitEditing' | 'returnKeyType'>;

export const PhoneInputCard: React.FC<Props> = ({
  value,
  onChangeText,
  colors,
  error,
  inputRef,
  onSubmitEditing,
  returnKeyType,
}) => {
  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    onChangeText(digits);
  };

  return (
    <View style={styles.outer}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
            shadowColor: colors.shadow,
          },
        ]}>
        <View
          style={[
            styles.prefix,
            {
              backgroundColor: colors.surfaceHighlight,
              borderRightColor: colors.border,
            },
          ]}>
          <Icon name="phone" size={20} color={colors.primary} />
          <Text style={[typography.labelMedium, styles.code, { color: colors.textPrimary }]}>
            +91
          </Text>
        </View>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          keyboardType="phone-pad"
          placeholder="98765 43210"
          placeholderTextColor={colors.textPlaceholder}
          style={[styles.input, { color: colors.textPrimary }]}
          maxLength={10}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
        />
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <Icon name="exclamation-circle" size={16} color={colors.error} />
          <Text style={[typography.small, { color: colors.error, flex: 1 }]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 56,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  code: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 17,
    letterSpacing: 0.3,
    fontFamily: typography.body.fontFamily,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    marginLeft: 4,
  },
});
