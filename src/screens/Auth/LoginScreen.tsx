import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../components/auth';
import type { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const LOGO = require('../../assets/Job india Icon & logo file/Final logo Job india-02.png');

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
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, { backgroundColor: `${colors.primary}12`, top: -60, right: -80, width: 300, height: 300 }]} />
        <View style={[styles.blob, { backgroundColor: `${colors.primary}08`, bottom: -40, left: -60, width: 250, height: 250 }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={styles.header}>
          <Image source={LOGO} style={styles.smallLogo} resizeMode="contain" />
        </View>


        <View style={styles.content}>
          <Text style={[typography.appTitle, styles.headline, { color: colors.textPrimary }]}>
            {t('auth.landingTitle')}
          </Text>
        </View>

        <View style={styles.ctaBlock}>
          <PrimaryButton
            title={t('auth.loginWithEmail')}
            onPress={() => navigation.navigate('EmailLogin')}
            colors={colors}
            iconLeft={<Icon name="envelope" size={18} color={colors.onPrimary} />}
          />
          <PrimaryButton
            title={t('auth.createNewAccount')}
            onPress={() => navigation.navigate('SignIn')}
            colors={colors}
            variant="outline"
            iconLeft={<Icon name="user-plus" size={18} color={colors.primary} />}
          />

          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[typography.small, { color: colors.textPlaceholder, marginHorizontal: spacing.md }]}>{t('auth.orDivider')}</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          <Pressable
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
            style={({ pressed }) => [
              styles.guestBtn,
              { borderColor: colors.border },
              pressed && { backgroundColor: colors.surfaceHighlight }
            ]}>
            <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>{t('auth.browseAsGuest')}</Text>
          </Pressable>

          <View style={styles.trustRow}>
            <Icon name="shield" size={14} color={colors.success} />
            <Text style={[typography.small, { color: colors.textPlaceholder }]}>
              {t('auth.trustBadgeText')}
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
    borderRadius: 150,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  smallLogo: {
    width: 220,
    height: 110,
    marginBottom: spacing.md,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headline: {
    fontSize: 28,
    letterSpacing: -0.8,
    marginBottom: spacing.md,
    textAlign: 'center',
    lineHeight: 34,
  },
  lead: {
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
    opacity: 0.8,
  },
  ctaBlock: {
    gap: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    opacity: 0.5,
  },
  guestBtn: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.sm,
    opacity: 0.7,
  },
});

export default LoginScreen;
