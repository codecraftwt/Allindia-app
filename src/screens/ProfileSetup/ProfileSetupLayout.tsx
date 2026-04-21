import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AuthHeadline, AuthScreenHeader } from '../../components/auth';
import type { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { PROFILE_SETUP_TOTAL_STEPS } from './profileSetupConstants';

type Nav = StackNavigationProp<AuthStackParamList>;

type Props = {
  step: number;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
};

export const ProfileSetupLayout: React.FC<Props> = ({ step, title, subtitle, children }) => {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, { backgroundColor: `${colors.primary}0D`, top: -28, right: -40 }]} />
        <View style={[styles.blob, { backgroundColor: `${colors.primary}0A`, bottom: 72, left: -32 }]} />
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
            title="Profile setup"
            onBack={handleBack}
            colors={colors}
          />

          <Text style={[typography.small, styles.stepLabel, { color: colors.textPlaceholder }]}>
            Step {step} of {PROFILE_SETUP_TOTAL_STEPS}
          </Text>

          <AuthHeadline colors={colors} title={title} subtitle={subtitle} />

          <View style={styles.body}>{children}</View>
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
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  stepLabel: {
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
    marginTop: -spacing.xs,
  },
  body: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    gap: spacing.md,
  },
});
