import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { StackScreenProps } from '@react-navigation/stack';
import {
  AuthHeadline,
  AuthScreenHeader,
  OTP_LENGTH,
  OtpDigitInputs,
  PrimaryButton,
} from '../../components/auth';
import type { AuthStackParamList } from '../../navigation/types';
import { useProfileSetup } from '../../context/ProfileSetupContext';
import { useTheme } from '../../context/ThemeContext';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const RESEND_SECONDS = 30;

type Props = StackScreenProps<AuthStackParamList, 'OtpVerification'>;

function maskPhone(digits: string) {
  if (digits.length < 4) {
    return `+91 ${digits}`;
  }
  return `+91 ••••••${digits.slice(-4)}`;
}

const OtpVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { resetDraft } = useProfileSetup();
  const { phoneDigits } = route.params;
  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const canResend = secondsLeft === 0;
  const otpComplete = otp.length === OTP_LENGTH;

  const handleResend = useCallback(() => {
    if (!canResend) {
      return;
    }
    setSecondsLeft(RESEND_SECONDS);
    setOtp('');
  }, [canResend]);

  const handleVerify = useCallback(() => {
    if (!otpComplete) {
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      resetDraft();
      navigation.reset({ index: 0, routes: [{ name: 'ProfileBasicInfo' }] });
    }, 600);
  }, [navigation, otpComplete, resetDraft]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, { backgroundColor: `${colors.primary}0D`, top: -32, right: -44 }]} />
        <View style={[styles.blob, { backgroundColor: `${colors.primary}0A`, bottom: 100, left: -36 }]} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <AuthScreenHeader
            title="Verification"
            onBack={() => navigation.goBack()}
            colors={colors}
          />

          <View style={styles.content}>
            <AuthHeadline
              colors={colors}
              title="Enter OTP"
              subtitle="Use the 6-digit code from your SMS. It expires in a few minutes — request a new one if needed."
              centerDecor
              decor={
                <View
                  style={[
                    styles.heroCircle,
                    {
                      backgroundColor: colors.surface,
                      borderColor: `${colors.primary}33`,
                      shadowColor: colors.shadow,
                    },
                  ]}>
                  <Icon name="shield" size={32} color={colors.primary} />
                </View>
              }
            />

            <View
              style={[
                styles.phoneChip,
                {
                  backgroundColor: colors.surfaceHighlight,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}>
              <Icon name="comment" size={16} color={colors.primary} />
              <Text style={[typography.labelMedium, styles.phoneText, { color: colors.textPrimary }]}>
                {maskPhone(phoneDigits)}
              </Text>
            </View>

            <Text style={[typography.small, styles.otpLabel, { color: colors.textSecondary }]}>
              6-digit code
            </Text>
            <View style={styles.otpBlock}>
              <OtpDigitInputs value={otp} onChange={setOtp} colors={colors} />
            </View>

            <PrimaryButton
              title="Verify & continue"
              onPress={handleVerify}
              disabled={!otpComplete}
              loading={verifying}
              colors={colors}
              iconLeft={<Icon name="check-circle" size={20} color={colors.onPrimary} />}
              iconRight={<Icon name="arrow-right" size={16} color={colors.onPrimary} />}
            />

            <View style={styles.resendRow}>
              {canResend ? (
                <Pressable
                  onPress={handleResend}
                  hitSlop={12}
                  style={({ pressed }) => [
                    styles.resendBtn,
                    {
                      backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}>
                  <Icon name="refresh" size={16} color={colors.primary} />
                  <Text style={[typography.labelMedium, { color: colors.primary }]}>Resend OTP</Text>
                </Pressable>
              ) : (
                <View
                  style={[
                    styles.timerRow,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
                    },
                  ]}>
                  <Icon name="clock-o" size={14} color={colors.textPlaceholder} />
                  <Text style={[typography.small, { color: colors.textSecondary }]}>
                    Resend in {secondsLeft}s
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.trustRow}>
              <Icon name="lock" size={14} color={colors.textPlaceholder} />
              <Text style={[typography.small, styles.trustText, { color: colors.textPlaceholder }]}>
                Codes are for your eyes only. JobIndia never asks for OTPs over a phone call.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  blob: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  content: {
    flex: 1,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  heroCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  phoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  phoneText: {
    fontSize: 16,
    letterSpacing: 0.3,
  },
  otpLabel: {
    marginBottom: spacing.sm,
    marginLeft: 2,
  },
  otpBlock: {
    marginBottom: spacing.xl,
  },
  resendRow: {
    marginTop: spacing.lg,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.button,
    borderWidth: StyleSheet.hairlineWidth,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.button,
    borderWidth: StyleSheet.hairlineWidth,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  trustText: {
    flex: 1,
    lineHeight: 18,
  },
});

export default OtpVerificationScreen;
