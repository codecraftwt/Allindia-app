import React, { useRef } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import type { ThemeColors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const OTP_LENGTH = 6;

type Props = {
  value: string;
  onChange: (next: string) => void;
  colors: ThemeColors;
};

export const OtpDigitInputs: React.FC<Props> = ({ value, onChange, colors }) => {
  const refs = useRef<Array<TextInput | null>>([]);
  const [focused, setFocused] = React.useState<number | null>(null);

  const chars = value.split('');
  while (chars.length < OTP_LENGTH) {
    chars.push('');
  }

  const focusAt = (i: number) => {
    const clamped = Math.max(0, Math.min(OTP_LENGTH - 1, i));
    refs.current[clamped]?.focus();
  };

  const applyFullOtp = (digits: string) => {
    onChange(digits.slice(0, OTP_LENGTH));
    focusAt(OTP_LENGTH - 1);
  };

  const handleChange = (index: number, text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= OTP_LENGTH && index === 0) {
      applyFullOtp(cleaned);
      return;
    }
    if (cleaned.length === 0) {
      const next = value.split('');
      while (next.length < OTP_LENGTH) {
        next.push('');
      }
      next[index] = '';
      onChange(next.join(''));
      return;
    }
    const digit = cleaned.slice(-1);
    const next = value.split('');
    while (next.length < OTP_LENGTH) {
      next.push('');
    }
    next[index] = digit;
    onChange(next.join('').slice(0, OTP_LENGTH));
    if (digit && index < OTP_LENGTH - 1) {
      focusAt(index + 1);
    }
  };

  const onKeyPress = (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (e.nativeEvent.key !== 'Backspace') {
      return;
    }
    if (chars[index]) {
      handleChange(index, '');
      return;
    }
    if (index > 0) {
      focusAt(index - 1);
      handleChange(index - 1, '');
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length: OTP_LENGTH }).map((_, i) => {
        const isActive = focused === i;
        const char = chars[i] || '';
        return (
          <TextInput
            key={i}
            ref={r => {
              refs.current[i] = r;
            }}
            value={char}
            onChangeText={t => handleChange(i, t)}
            onKeyPress={e => onKeyPress(i, e)}
            keyboardType="number-pad"
            maxLength={i === 0 ? OTP_LENGTH : 1}
            selectTextOnFocus
            onFocus={() => setFocused(i)}
            onBlur={() => setFocused(null)}
            style={[
              styles.cell,
              {
                color: colors.textPrimary,
                borderColor: isActive ? colors.primary : colors.border,
                borderWidth: isActive ? 2 : 1,
                backgroundColor: colors.surface,
                shadowColor: isActive ? colors.primary : colors.shadow,
                shadowOpacity: isActive ? 0.18 : 0.04,
                shadowRadius: isActive ? 10 : 4,
                elevation: isActive ? 3 : 1,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
  },
  cell: {
    flex: 1,
    minWidth: 44,
    maxWidth: 52,
    height: 54,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: typography.jobTitle.fontFamily,
    paddingVertical: 0,
    paddingHorizontal: 0,
    shadowOffset: { width: 0, height: 2 },
  },
});
