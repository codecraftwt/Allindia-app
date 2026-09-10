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
import { typography, moderateScale } from '../../theme/typography';
import { useDispatch } from 'react-redux';
import { verifyRegisterOtp, resendRegisterOtp } from '../../redux/slice/authSlice';
import type { AppDispatch } from '../../redux/store';

const RESEND_SECONDS = 30;

type Props = StackScreenProps<AuthStackParamList, 'OtpVerification'>;

function maskEmail(email: string) {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

function maskPhone(phone?: string) {
  if (!phone || phone.length < 4) return phone || '';
  return `******${phone.slice(-4)}`;
}

const OtpVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { resetDraft } = useProfileSetup();
  const dispatch = useDispatch<AppDispatch>();
  const { email, verification_channel, phone } = route.params;
  const identifier = email || phone || '';
  const isWhatsApp = verification_channel === 'whatsapp';
  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const canResend = secondsLeft === 0;
  const otpComplete = otp.length === OTP_LENGTH;

  const handleResend = useCallback(async () => {
    if (!canResend) {
      return;
    }
    setErrorMsg('');
    const result = await dispatch(resendRegisterOtp(identifier));
    if (resendRegisterOtp.fulfilled.match(result)) {
      setSecondsLeft(RESEND_SECONDS);
      setOtp('');
    } else {
      setErrorMsg((result.payload as string) || 'Failed to resend OTP');
    }
  }, [canResend, dispatch, identifier]);

  const handleVerify = useCallback(async () => {
    if (!otpComplete) {
      return;
    }
    setVerifying(true);
    setErrorMsg('');
    
    const result = await dispatch(verifyRegisterOtp({ 
      email: email || '', 
      phone: phone || '', 
      otp, 
      verification_channel 
    }));
    setVerifying(false);
    
    if (verifyRegisterOtp.fulfilled.match(result)) {
      setSuccessMsg('OTP Verified Successfully!');
      setTimeout(() => {
        resetDraft();
        navigation.reset({ index: 0, routes: [{ name: 'ProfileBasicInfo' }] });
      }, 1500);
    } else {
      setErrorMsg((result.payload as string) || 'Invalid verification code');
    }
  }, [dispatch, identifier, otp, otpComplete, resetDraft, navigation]);

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
              subtitle={isWhatsApp 
                ? "Use the 4-digit code sent to your WhatsApp. It expires in a few minutes — request a new one if needed." 
                : "Use the 4-digit code sent to your email. It expires in a few minutes — request a new one if needed."}
              centerDecor
              decor={
                <View
                  style={[
                    styles.heroCircle,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isWhatsApp ? '#25D36633' : `${colors.primary}33`,
                      shadowColor: colors.shadow,
                    },
                  ]}>
                  <Icon
                    name={isWhatsApp ? 'whatsapp' : 'envelope-o'}
                    size={moderateScale(40)}
                    color={isWhatsApp ? '#25D366' : colors.primary}
                  />
                </View>
              }
            />

            <View
              style={[
                styles.phoneChip,
                {
                  backgroundColor: colors.surface,
                  borderColor: isWhatsApp ? '#25D36666' : colors.border,
                  shadowColor: colors.shadow,
                },
              ]}>
              <Icon
                name={isWhatsApp ? 'whatsapp' : 'envelope'}
                size={moderateScale(14)}
                color={isWhatsApp ? '#25D366' : colors.primary}
              />
              <Text style={[typography.labelMedium, styles.phoneText, { color: colors.textPrimary }]}>
                {isWhatsApp ? maskPhone(phone) : maskEmail(email || '')}
              </Text>
            </View>

            <View style={styles.otpBlock}>
              <Text style={[typography.labelMedium, styles.otpLabel, { color: colors.textSecondary }]}>
                4-digit Code
              </Text>
              <OtpDigitInputs value={otp} onChange={setOtp} colors={colors} />
            </View>

            {errorMsg ? (
              <View style={{ marginBottom: spacing.md, padding: spacing.sm, backgroundColor: colors.error + '15', borderRadius: radius.sm, borderWidth: 1, borderColor: colors.error }}>
                <Text style={[typography.small, { color: colors.error, textAlign: 'center' }]}>{errorMsg}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={{ marginBottom: spacing.md, padding: spacing.sm, backgroundColor: colors.success + '15', borderRadius: radius.sm, borderWidth: 1, borderColor: colors.success }}>
                <Text style={[typography.small, { color: colors.success, textAlign: 'center' }]}>{successMsg}</Text>
              </View>
            ) : null}

            <PrimaryButton
              title="Verify & Continue"
              onPress={handleVerify}
              disabled={!otpComplete}
              loading={verifying}
              colors={colors}
            />

            <View style={styles.resendRow}>
              {canResend ? (
                <Pressable
                  onPress={handleResend}
                  style={({ pressed }) => [
                    styles.resendBtn,
                    {
                      backgroundColor: pressed ? colors.surfaceHighlight : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}>
                  <Icon name="refresh" size={moderateScale(14)} color={colors.primary} />
                  <Text style={[typography.labelMedium, { color: colors.primary }]}>
                    Resend OTP
                  </Text>
                </Pressable>
              ) : (
                <View
                  style={[
                    styles.timerRow,
                    { backgroundColor: colors.surfaceHighlight, borderColor: colors.border },
                  ]}>
                  <Icon name="clock-o" size={moderateScale(14)} color={colors.textSecondary} />
                  <Text style={[typography.body, { color: colors.textSecondary }]}>
                    Resend in <Text style={{ color: colors.textPrimary, fontWeight: 'bold' }}>{secondsLeft}s</Text>
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.trustRow}>
              <Icon name="lock" size={moderateScale(15)} color={colors.textSecondary} style={{ marginTop: 2 }} />
              <Text style={[typography.small, styles.trustText, { color: colors.textSecondary }]}>
                We will only send verification codes — no spam or unsolicited messages.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(spacing.lg),
    paddingTop: moderateScale(spacing.sm),
    paddingBottom: moderateScale(spacing.xxl),
  },
  content: {
    flex: 1,
    maxWidth: moderateScale(440),
    width: '100%',
    alignSelf: 'center',
  },
  heroCircle: {
    width: moderateScale(96),
    height: moderateScale(96),
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
    gap: moderateScale(spacing.sm),
    paddingVertical: moderateScale(spacing.sm + 2),
    paddingHorizontal: moderateScale(spacing.md),
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: moderateScale(spacing.lg),
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
    minHeight: moderateScale(44),
    justifyContent: 'center',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(spacing.sm),
    paddingVertical: moderateScale(spacing.sm),
    paddingHorizontal: moderateScale(spacing.md),
    borderRadius: radius.button,
    borderWidth: StyleSheet.hairlineWidth,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(spacing.sm),
    paddingVertical: moderateScale(spacing.sm),
    paddingHorizontal: moderateScale(spacing.md),
    borderRadius: radius.button,
    borderWidth: StyleSheet.hairlineWidth,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(spacing.sm),
    marginTop: moderateScale(spacing.xl),
    paddingHorizontal: spacing.xs,
  },
  trustText: {
    flex: 1,
    lineHeight: 18,
  },
});

export default OtpVerificationScreen;
