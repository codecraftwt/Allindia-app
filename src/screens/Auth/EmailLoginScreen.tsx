import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { StackScreenProps } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
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
import { loginCandidate, clearError } from '../../redux/slice/authSlice';
import type { RootState, AppDispatch } from '../../redux/store';

type Props = StackScreenProps<AuthStackParamList, 'EmailLogin'>;

const EmailLoginScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    const resultAction = await dispatch(loginCandidate({ email, password }));
    if (loginCandidate.fulfilled.match(resultAction)) {
      navigation.replace('Main');
    } else {
      Alert.alert('Login Failed', resultAction.payload as string || 'Invalid credentials');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <AuthScreenHeader
            title="Login"
            onBack={() => navigation.goBack()}
            colors={colors}
          />

          <View style={styles.content}>
            <AuthHeadline
              colors={colors}
              title="Welcome Back"
              subtitle="Login with your email and password to continue your job search."
              centerDecor
              decor={
                <View style={[styles.heroCircle, { backgroundColor: colors.surface, borderColor: `${colors.primary}33` }]}>
                  <Icon name="envelope" size={34} color={colors.primary} />
                </View>
              }
            />

            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Icon name="at" size={18} color={colors.textPlaceholder} style={styles.inputIcon} />
                <TextInput
                  placeholder="Email Address"
                  placeholderTextColor={colors.textPlaceholder}
                  style={[styles.input, { color: colors.textPrimary }]}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Icon name="lock" size={18} color={colors.textPlaceholder} style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor={colors.textPlaceholder}
                  style={[styles.input, { color: colors.textPrimary }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <PrimaryButton
              title={loading ? "Logging in..." : "Login"}
              onPress={onLogin}
              disabled={loading}
              colors={colors}
              iconRight={!loading && <Icon name="sign-in" size={18} color={colors.onPrimary} />}
            />

            <View style={styles.footer}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <Pressable onPress={() => navigation.navigate('SignIn')}>
                <Text style={[typography.body, { color: colors.primary, fontWeight: '700' }]}>
                  Sign Up
                </Text>
              </Pressable>
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
});

export default EmailLoginScreen;
