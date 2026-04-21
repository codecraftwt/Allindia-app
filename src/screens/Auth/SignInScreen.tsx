import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
  PhoneInputCard,
  PrimaryButton,
} from '../../components/auth';
import type { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

type Props = StackScreenProps<AuthStackParamList, 'SignIn'>;

const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);

  const error = useMemo(() => {
    if (phone.length === 0) {
      return touched ? 'Enter your mobile number' : undefined;
    }
    if (!INDIAN_MOBILE.test(phone)) {
      return 'Enter a valid 10-digit mobile number';
    }
    return undefined;
  }, [phone, touched]);

  const showError = Boolean(error && (touched || phone.length === 10));
  const canContinue = phone.length > 0 && INDIAN_MOBILE.test(phone);

  const onContinue = () => {
    setTouched(true);
    if (!INDIAN_MOBILE.test(phone)) {
      return;
    }
    navigation.navigate('OtpVerification', { phoneDigits: phone });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, { backgroundColor: `${colors.primary}0D`, top: -36, right: -48 }]} />
        <View style={[styles.blob, { backgroundColor: `${colors.primary}0A`, bottom: 80, left: -40 }]} />
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
            title="Sign in"
            onBack={() => navigation.goBack()}
            colors={colors}
          />

          <View style={styles.content}>
            <AuthHeadline
              colors={colors}
              title="Enter your mobile number"
              subtitle="We'll text a 6-digit code to verify it's you. Standard SMS charges may apply."
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
                  <Icon name="mobile" size={34} color={colors.primary} />
                </View>
              }
            />

            <PhoneInputCard
              value={phone}
              onChangeText={setPhone}
              colors={colors}
              error={showError ? error : undefined}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (canContinue) {
                  onContinue();
                }
              }}
            />

            <PrimaryButton
              title="Continue"
              onPress={onContinue}
              disabled={phone.length === 0}
              colors={colors}
              iconRight={<Icon name="arrow-right" size={18} color={colors.onPrimary} />}
            />

            <View style={styles.trustRow}>
              <Icon name="lock" size={14} color={colors.textPlaceholder} />
              <Text style={[typography.small, styles.trustText, { color: colors.textPlaceholder }]}>
                Your number is only used for sign-in and job alerts — never sold.
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
  trustRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  trustText: {
    flex: 1,
    lineHeight: 18,
  },
});

export default SignInScreen;
