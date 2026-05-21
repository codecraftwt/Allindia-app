import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Modal,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { StackScreenProps } from '@react-navigation/stack';
import {
  AuthHeadline,
  AuthScreenHeader,
  PrimaryButton,
  OtpDigitInputs,
} from '../../components/auth';
import type { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

import { useDispatch } from 'react-redux';
import { forgotPasswordCandidate, resetPasswordCandidate } from '../../redux/slice/authSlice';

type Props = StackScreenProps<AuthStackParamList, 'ForgotPass'>;

const ForgotPassScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch<any>();
  
  // Multi-step wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Form states
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Status Modal State
  const [statusModal, setStatusModal] = useState({
    visible: false,
    type: 'error' as 'error' | 'success',
    title: '',
    message: '',
  });

  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  // Listen for deep link parameters from email reset link
  React.useEffect(() => {
    if (route.params?.token) {
      setVerificationCode(route.params.token);
      if (route.params.email) {
        setEmail(route.params.email);
      }
      setStep(3);
    }
  }, [route.params]);

  const showStatus = (type: 'error' | 'success', title: string, message: string) => {
    setStatusModal({
      visible: true,
      type,
      title,
      message,
    });
    
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleStep1Email = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      showStatus('error', 'Required Field', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showStatus('error', 'Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await dispatch(forgotPasswordCandidate(trimmedEmail)).unwrap();
      setLoading(false);
      
      showStatus(
        'success',
        'Reset Link Sent!',
        response?.message || 'We have sent a password reset link to your email address.'
      );
      
      setTimeout(() => {
        setStatusModal(prev => ({ ...prev, visible: false }));
        setStep(2);
      }, 2500);
    } catch (error: any) {
      setLoading(false);
      const errorMessage = error || 'Failed to send password reset link. Please try again.';
      showStatus('error', 'Error', errorMessage);
    }
  };

  const handleStep2Verify = () => {
    if (verificationCode.trim().length < 4) {
      showStatus('error', 'OTP Required', 'Please enter the 4-digit OTP from your email');
      return;
    }
    setStep(3);
  };

  const handleStep3Reset = async () => {
    if (!newPassword) {
      showStatus('error', 'Required Field', 'Please enter your new password');
      return;
    }
    if (newPassword.length < 6) {
      showStatus('error', 'Weak Password', 'Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      showStatus('error', 'Mismatch', 'New password and confirm password do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: email.trim(),
        otp: verificationCode.trim(),
        password: newPassword,
        password_confirmation: confirmPassword,
      };

      const response = await dispatch(resetPasswordCandidate(payload)).unwrap();
      setLoading(false);
      
      showStatus(
        'success',
        'Password Reset!',
        response?.message || 'Your password has been successfully reset. You can now login with your new password.'
      );
      
      setTimeout(() => {
        setStatusModal(prev => ({ ...prev, visible: false }));
        navigation.navigate('EmailLogin');
      }, 2500);
    } catch (error: any) {
      setLoading(false);
      const errorMessage = error || 'Failed to reset password. Please try again.';
      showStatus('error', 'Error', errorMessage);
    }
  };

  const getHeaderTitle = () => {
    if (step === 1) return 'Forgot Password';
    if (step === 2) return 'Verify Code';
    return 'Set New Password';
  };

  const handleBackPress = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      {/* Background Decorative Blobs */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, { backgroundColor: `${colors.primary}12`, top: -60, right: -80, width: 300, height: 300 }]} />
        <View style={[styles.blob, { backgroundColor: `${colors.primary}08`, bottom: -40, left: -60, width: 250, height: 250 }]} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Dynamic Title & Back action */}
          <AuthScreenHeader
            title={getHeaderTitle()}
            onBack={handleBackPress}
            colors={colors}
          />

          <View style={styles.content}>
            
            {/* STEP 1: ENTER EMAIL */}
            {step === 1 && (
              <>
                <AuthHeadline
                  colors={colors}
                  title="Forgot Password?"
                  subtitle="Enter your email address below and we'll send you a verification code."
                  centerDecor
                  decor={
                    <View style={[styles.heroCircle, { backgroundColor: colors.surface, borderColor: `${colors.primary}40` }]}>
                      <Icon name="lock" size={44} color={colors.primary} />
                    </View>
                  }
                />

                <View style={styles.inputContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email Address</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                      <Icon name="envelope-o" size={16} color={colors.primary} style={styles.inputIcon} />
                      <TextInput
                        placeholder="Enter your email"
                        placeholderTextColor={colors.textPlaceholder}
                        style={[styles.input, { color: colors.textPrimary }]}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoFocus
                      />
                    </View>
                  </View>
                </View>

                <PrimaryButton
                  title={loading ? "Sending..." : "Send Verification Code"}
                  onPress={handleStep1Email}
                  disabled={loading}
                  colors={colors}
                  style={styles.actionBtn}
                  iconRight={!loading && <Icon name="send-o" size={16} color={colors.onPrimary} />}
                />
              </>
            )}

            {/* STEP 2: VERIFICATION CODE */}
            {step === 2 && (
              <>
                <AuthHeadline
                  colors={colors}
                  title="Verification Code"
                  subtitle={`We have sent a 4-digit OTP to ${email}. Please enter it below.`}
                  centerDecor
                  decor={
                    <View style={[styles.heroCircle, { backgroundColor: colors.surface, borderColor: `${colors.primary}40` }]}>
                      <Icon name="shield" size={44} color={colors.primary} />
                    </View>
                  }
                />

                 <View style={styles.inputContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>4-Digit OTP</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                      <Icon name="key" size={16} color={colors.primary} style={styles.inputIcon} />
                      <TextInput
                        placeholder="Enter 4-digit OTP from email"
                        placeholderTextColor={colors.textPlaceholder}
                        style={[styles.input, { color: colors.textPrimary }]}
                        value={verificationCode}
                        onChangeText={(text) => setVerificationCode(text.replace(/[^0-9]/g, '').slice(0, 4))}
                        keyboardType="number-pad"
                        maxLength={4}
                        autoFocus
                      />
                    </View>
                  </View>
                </View>

                <PrimaryButton
                  title={loading ? "Verifying..." : "Verify Code / Token"}
                  onPress={handleStep2Verify}
                  disabled={loading || verificationCode.trim().length < 4}
                  colors={colors}
                  style={styles.actionBtn}
                  iconRight={!loading && <Icon name="check" size={16} color={colors.onPrimary} />}
                />

                <Pressable onPress={() => setVerificationCode('')} style={styles.resendLink}>
                  <Text style={[typography.labelMedium, { color: colors.primary, textAlign: 'center' }]}>
                    Clear Token
                  </Text>
                </Pressable>
              </>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === 3 && (
              <>
                <AuthHeadline
                  colors={colors}
                  title="Create New Password"
                  subtitle="Create a new, strong password to secure your candidate account."
                  centerDecor
                  decor={
                    <View style={[styles.heroCircle, { backgroundColor: colors.surface, borderColor: `${colors.primary}40` }]}>
                      <Icon name="key" size={44} color={colors.primary} />
                    </View>
                  }
                />

                <View style={styles.inputContainer}>
                  {/* New Password */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>New Password</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                      <Icon name="lock" size={16} color={colors.primary} style={styles.inputIcon} />
                      <TextInput
                        placeholder="Enter new password"
                        placeholderTextColor={colors.textPlaceholder}
                        style={[styles.input, { color: colors.textPrimary }]}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPassword}
                      />
                      <Pressable onPress={() => setShowNewPassword(!showNewPassword)} hitSlop={12}>
                        <Icon
                          name={showNewPassword ? "eye" : "eye-slash"}
                          size={18}
                          color={colors.textPlaceholder}
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Confirm Password</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                      <Icon name="lock" size={16} color={colors.primary} style={styles.inputIcon} />
                      <TextInput
                        placeholder="Re-enter new password"
                        placeholderTextColor={colors.textPlaceholder}
                        style={[styles.input, { color: colors.textPrimary }]}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                      />
                      <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={12}>
                        <Icon
                          name={showConfirmPassword ? "eye" : "eye-slash"}
                          size={18}
                          color={colors.textPlaceholder}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>

                <PrimaryButton
                  title={loading ? "Updating..." : "Save & Reset Password"}
                  onPress={handleStep3Reset}
                  disabled={loading}
                  colors={colors}
                  style={styles.actionBtn}
                  iconRight={!loading && <Icon name="check-circle" size={16} color={colors.onPrimary} />}
                />
              </>
            )}

            {/* Bottom Navigation Back to Login */}
            <View style={styles.footer}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                Remembered your password?{' '}
              </Text>
              <Pressable onPress={() => navigation.navigate('EmailLogin')}>
                <Text style={[typography.body, { color: colors.primary, fontWeight: '800' }]}>
                  Login
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Status Modal */}
      <Modal
        visible={statusModal.visible}
        transparent={true}
        animationType="none"
      >
        <View style={styles.statusOverlay}>
          <Animated.View 
            style={[
              styles.statusCard, 
              { 
                backgroundColor: colors.surface,
                transform: [{ scale: scaleAnim }],
                opacity: scaleAnim
              }
            ]}
          >
            <View style={[styles.statusIcon, { backgroundColor: statusModal.type === 'success' ? colors.success + '20' : colors.error + '20' }]}>
              <Icon
                name={statusModal.type === 'success' ? "check-circle" : "exclamation-circle"}
                size={42}
                color={statusModal.type === 'success' ? colors.success : colors.error}
              />
            </View>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary, marginBottom: 8 }]}>{statusModal.title}</Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: statusModal.type === 'success' ? 0 : 24 }]}>
              {statusModal.message}
            </Text>

            {statusModal.type === 'error' && (
              <TouchableOpacity
                onPress={() => setStatusModal(prev => ({ ...prev, visible: false }))}
                style={[styles.statusBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={[typography.labelMedium, { color: '#fff' }]}>Got it</Text>
              </TouchableOpacity>
            )}
            
            {statusModal.type === 'success' && (
              <View style={styles.successLoader}>
                <ActivityIndicator size="small" color={colors.success} style={{ marginTop: 16 }} />
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  blob: {
    position: 'absolute',
    borderRadius: 150,
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
    elevation: 5,
  },
  inputContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    height: 58,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: typography.body.fontFamily,
    fontWeight: '500',
  },
  actionBtn: {
    marginTop: spacing.md,
    height: 56,
    borderRadius: radius.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  otpSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  otpLabel: {
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  otpBlock: {
    alignItems: 'center',
  },
  resendLink: {
    marginTop: spacing.lg,
    padding: spacing.xs,
  },
  statusOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  statusCard: {
    width: '90%',
    maxWidth: 400,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  statusBtn: {
    width: '100%',
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginTop: 16,
  },
  successLoader: {
    paddingBottom: 8,
  },
});

export default ForgotPassScreen;
