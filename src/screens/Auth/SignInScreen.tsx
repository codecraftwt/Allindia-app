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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { StackScreenProps } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  AuthHeadline,
  AuthScreenHeader,
  PrimaryButton,
} from '../../components/auth';
import type { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { registerCandidate } from '../../redux/slice/authSlice';
import type { RootState, AppDispatch } from '../../redux/store';

type Props = StackScreenProps<AuthStackParamList, 'SignIn'>;

const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { loading } = useSelector((state: RootState) => state.auth);

  // Status Modal State
  const [statusModal, setStatusModal] = useState({
    visible: false,
    type: 'error' as 'error' | 'success',
    title: '',
    message: '',
  });

  const showStatus = (type: 'error' | 'success', title: string, message: string) => {
    setStatusModal({
      visible: true,
      type,
      title,
      message,
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onRegister = async () => {
    const { name, email, password, password_confirmation } = formData;

    if (!name || !email || !password || !password_confirmation) {
      showStatus('error', t('auth.requiredFields'), t('auth.fillRequiredFields'));
      return;
    }

    if (password !== password_confirmation) {
      showStatus('error', t('auth.passwordMismatch'), t('auth.passwordsDoNotMatch'));
      return;
    }

    const resultAction = await dispatch(registerCandidate(formData));

    if (registerCandidate.fulfilled.match(resultAction)) {
      showStatus('success', t('auth.success'), t('auth.accountCreated'));
      setTimeout(() => {
        setStatusModal(prev => ({ ...prev, visible: false }));
        navigation.replace('Main');
      }, 1500);
    } else {
      showStatus('error', t('auth.registrationFailed'), (resultAction.payload as string) || t('auth.somethingWentWrong'));
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, { backgroundColor: `${colors.primary}0D`, top: -36, right: -48 }]} />
        <View style={[styles.blob, { backgroundColor: `${colors.primary}0A`, bottom: 80, left: -40 }]} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <AuthScreenHeader
            title={t('auth.createAccountHeader')}
            onBack={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Login' as never);
              }
            }}
            colors={colors}
          />

          <View style={styles.content}>
            <AuthHeadline
              colors={colors}
              title={t('auth.joinTitle')}
              subtitle={t('auth.joinSubtitle')}
              centerDecor
              decor={
                <View style={[styles.heroCircle, { backgroundColor: colors.surface, borderColor: `${colors.primary}33`, shadowColor: colors.shadow }]}>
                  <Icon name="user-plus" size={34} color={colors.primary} />
                </View>
              }
            />

            <View style={styles.inputContainer}>
              {/* Name */}
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Icon name="user" size={18} color={colors.textPlaceholder} style={styles.inputIcon} />
                <TextInput
                  placeholder={t('auth.namePlaceholder')}
                  placeholderTextColor={colors.textPlaceholder}
                  style={[styles.input, { color: colors.textPrimary }]}
                  value={formData.name}
                  onChangeText={(val) => handleInputChange('name', val)}
                />
              </View>

              {/* Email */}
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Icon name="at" size={18} color={colors.textPlaceholder} style={styles.inputIcon} />
                <TextInput
                  placeholder={t('auth.emailPlaceholder')}
                  placeholderTextColor={colors.textPlaceholder}
                  style={[styles.input, { color: colors.textPrimary }]}
                  value={formData.email}
                  onChangeText={(val) => handleInputChange('email', val)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Phone (Optional) */}
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Icon name="phone" size={18} color={colors.textPlaceholder} style={styles.inputIcon} />
                <TextInput
                  placeholder={t('auth.phonePlaceholder')}
                  placeholderTextColor={colors.textPlaceholder}
                  style={[styles.input, { color: colors.textPrimary }]}
                  value={formData.phone}
                  onChangeText={(val) => handleInputChange('phone', val)}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              {/* Password */}
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Icon name="lock" size={18} color={colors.textPlaceholder} style={styles.inputIcon} />
                <TextInput
                  placeholder={t('auth.passwordPlaceholder')}
                  placeholderTextColor={colors.textPlaceholder}
                  style={[styles.input, { color: colors.textPrimary }]}
                  value={formData.password}
                  onChangeText={(val) => handleInputChange('password', val)}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={12}>
                  <Icon
                    name={showPassword ? "eye" : "eye-slash"}
                    size={18}
                    color={colors.textPlaceholder}
                  />
                </Pressable>
              </View>

              {/* Confirm Password */}
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Icon name="shield" size={18} color={colors.textPlaceholder} style={styles.inputIcon} />
                <TextInput
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  placeholderTextColor={colors.textPlaceholder}
                  style={[styles.input, { color: colors.textPrimary }]}
                  value={formData.password_confirmation}
                  onChangeText={(val) => handleInputChange('password_confirmation', val)}
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

            <PrimaryButton
              title={loading ? t('auth.creatingAccount') : t('auth.registerBtn')}
              onPress={onRegister}
              disabled={loading}
              colors={colors}
              iconRight={!loading && <Icon name="arrow-right" size={18} color={colors.onPrimary} />}
            />

            <View style={styles.footer}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                {t('auth.alreadyHaveAccount')}{' '}
              </Text>
              <Pressable onPress={() => navigation.navigate('EmailLogin')}>
                <Text style={[typography.body, { color: colors.primary, fontWeight: '700' }]}>
                  {t('auth.loginLink')}
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
        animationType="fade"
      >
        <View style={styles.statusOverlay}>
          <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statusIcon, { backgroundColor: statusModal.type === 'success' ? colors.success + '20' : colors.error + '20' }]}>
              <Icon
                name={statusModal.type === 'success' ? "check-circle" : "exclamation-circle"}
                size={36}
                color={statusModal.type === 'success' ? colors.success : colors.error}
              />
            </View>
            <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: 8 }]}>{statusModal.title}</Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }]}>{statusModal.message}</Text>

            <TouchableOpacity
              onPress={() => setStatusModal(prev => ({ ...prev, visible: false }))}
              style={[styles.statusBtn, { backgroundColor: statusModal.type === 'success' ? colors.success : colors.primary }]}
            >
              <Text style={[typography.labelMedium, { color: '#fff' }]}>{t('auth.gotIt')}</Text>
            </TouchableOpacity>
          </View>
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
  inputContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: spacing.sm,
    width: 20,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: typography.body.fontFamily,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
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
  },
});

export default SignInScreen;
