import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../components/auth';
import type { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const LOGO = require('../../assets/mainlogo.png');

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

type FeatureItem = {
  icon: string;
  title: string;
  subtitle: string;
  /** Temporary: skip auth and open main tabs (Home) */
  opensMain?: boolean;
};

const FEATURES: FeatureItem[] = [
  {
    icon: 'check-circle',
    title: 'Verified employers',
    subtitle: 'Real companies, less risk',
  },
  {
    icon: 'bolt',
    title: 'Apply in seconds',
    subtitle: 'Short forms, quick updates',
    opensMain: true,
  },
  {
    icon: 'money',
    title: 'See pay upfront',
    subtitle: 'Salary shown on listings',
  },
];

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, { backgroundColor: `${colors.primary}0D`, top: -40, right: -60 }]} />
        <View style={[styles.blob, { backgroundColor: `${colors.primary}0A`, bottom: 120, left: -50 }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={styles.topBrand}>
          <Image source={LOGO} style={styles.smallLogo} resizeMode="contain" />
          <Text style={[typography.small, { color: colors.textSecondary, letterSpacing: 1.2 }]}>
            JOBINDIA
          </Text>
        </View>

        <Text style={[typography.appTitle, styles.headline, { color: colors.textPrimary }]}>
          Find your next job
        </Text>
        <Text style={[typography.body, styles.lead, { color: colors.textSecondary }]}>
          Daily openings near you. Sign in with your mobile number—we'll text you a secure code.
        </Text>

        <View style={styles.featureList}>
          {FEATURES.map(item => {
            const cardColors = {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            };
            const inner = (
              <>
                <View style={[styles.featureIcon, { backgroundColor: colors.surfaceHighlight }]}>
                  <Icon name={item.icon} size={22} color={colors.primary} />
                </View>
                <View style={styles.featureText}>
                  <Text style={[typography.jobTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                  <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]}>
                    {item.subtitle}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={colors.tabInactive} />
              </>
            );

            if (item.opensMain) {
              return (
                <Pressable
                  key={item.title}
                  accessibilityRole="button"
                  accessibilityLabel="Apply in seconds, go to home"
                  onPress={() =>
                    navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
                  }
                  style={({ pressed }) => [
                    styles.featureCard,
                    cardColors,
                    pressed && { opacity: 0.92 },
                  ]}>
                  {inner}
                </Pressable>
              );
            }

            return (
              <View key={item.title} style={[styles.featureCard, cardColors]}>
                {inner}
              </View>
            );
          })}
        </View>

        <View style={styles.ctaBlock}>
          <PrimaryButton
            title="Sign in with mobile"
            onPress={() => navigation.navigate('SignIn')}
            colors={colors}
            iconLeft={
              <Icon name="mobile" size={22} color={colors.onPrimary} />
            }
            iconRight={
              <Icon name="arrow-right" size={20} color={colors.onPrimary} />
            }
          />
          <PrimaryButton
            title="Login"
            onPress={() => navigation.navigate('EmailLogin')}
            colors={colors}
            iconLeft={
              <Icon name="mobile" size={22} color={colors.onPrimary} />
            }
            iconRight={
              <Icon name="arrow-right" size={20} color={colors.onPrimary} />
            }
          />
          <View style={styles.trustRow}>
            <Icon name="lock" size={16} color={colors.textPlaceholder} />
            <Text style={[typography.small, { color: colors.textPlaceholder, flex: 1 }]}>
              OTP verification — no password to remember
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  blob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  topBrand: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  smallLogo: {
    width: 52,
    height: 52,
    marginBottom: spacing.sm,
  },
  headline: {
    fontSize: 26,
    letterSpacing: -0.4,
    marginBottom: spacing.sm,
  },
  lead: {
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  featureList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  ctaBlock: {
    gap: spacing.md,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    justifyContent: 'center',
  },
});

export default LoginScreen;
