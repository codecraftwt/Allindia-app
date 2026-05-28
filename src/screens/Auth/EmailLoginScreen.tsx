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
import { loginCandidate } from '../../redux/slice/authSlice';
import type { RootState, AppDispatch } from '../../redux/store';

type Props = StackScreenProps<AuthStackParamList, 'EmailLogin'>;

const EmailLoginScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loading } = useSelector((state: RootState) => state.auth);

  // Status Modal State
  const [statusModal, setStatusModal] = useState({
    visible: false,
    type: 'error' as 'error' | 'success',
    title: '',
    message: '',
  });

  const scaleAnim = React.useRef(new Animated.Value(0)).current;

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

  const onLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showStatus('error', t('auth.requiredField'), t('auth.enterEmailPass'));
      return;
    }

    const resultAction = await dispatch(loginCandidate({ 
      email: email.trim(), 
      password: password.trim() 
    }));
    console.log("resultAction ", resultAction)

    if (loginCandidate.fulfilled.match(resultAction)) {
      showStatus('success', t('auth.success'), t('auth.redirectingJob'));
      setTimeout(() => {
        navigation.replace('Main');
      }, 1500);
    } else {
      showStatus('error', t('auth.loginFailed'), (resultAction.payload as string) || t('auth.invalidCredentials'));
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <AuthScreenHeader
            title={t('auth.loginHeader')}
            onBack={() => navigation.goBack()}
            colors={colors}
          />

          <View style={styles.content}>
            <AuthHeadline
              colors={colors}
              title={t('auth.welcomeBack')}
              subtitle={t('auth.welcomeSubtitle')}
              centerDecor
              decor={
                <View style={[styles.heroCircle, { backgroundColor: colors.surface, borderColor: `${colors.primary}40` }]}>
                  <Icon name="user-circle" size={44} color={colors.primary} />
                </View>
              }
            />

            <View style={styles.inputContainer}>
              <View style={[styles.inputGroup]}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('auth.emailLabel')}</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                  <Icon name="envelope-o" size={16} color={colors.primary} style={styles.inputIcon} />
                  <TextInput
                    placeholder={t('auth.emailPlaceholder')}
                    placeholderTextColor={colors.textPlaceholder}
                    style={[styles.input, { color: colors.textPrimary }]}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup]}>
                <View style={styles.passwordHeader}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('auth.passwordLabel')}</Text>
                  <Pressable onPress={() => navigation.navigate('ForgotPass')}>
                    <Text style={[styles.forgotText, { color: colors.primary }]}>{t('auth.forgotPassword')}</Text>
                  </Pressable>
                </View>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                  <Icon name="lock" size={16} color={colors.primary} style={styles.inputIcon} />
                  <TextInput
                    placeholder={t('auth.passwordPlaceholder')}
                    placeholderTextColor={colors.textPlaceholder}
                    style={[styles.input, { color: colors.textPrimary }]}
                    value={password}
                    onChangeText={setPassword}
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
              </View>
            </View>

            <PrimaryButton
              title={loading ? t('auth.authenticating') : t('auth.signInBtn')}
              onPress={onLogin}
              disabled={loading}
              colors={colors}
              style={styles.loginBtn}
              iconRight={!loading && <Icon name="arrow-right" size={16} color={colors.onPrimary} />}
            />

            <View style={styles.footer}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                {t('auth.newHere')}{' '}
              </Text>
              <Pressable onPress={() => navigation.navigate('SignIn')}>
                <Text style={[typography.body, { color: colors.primary, fontWeight: '800' }]}>
                  {t('auth.createAccountLink')}
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
            <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: 8 }]}>{statusModal.title}</Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: statusModal.type === 'success' ? 0 : 24 }]}>
              {statusModal.message}
            </Text>

            {statusModal.type === 'error' && (
              <TouchableOpacity
                onPress={() => setStatusModal(prev => ({ ...prev, visible: false }))}
                style={[styles.statusBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={[typography.labelMedium, { color: '#fff' }]}>{t('auth.gotIt')}</Text>
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
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
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
  loginBtn: {
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

export default EmailLoginScreen;
