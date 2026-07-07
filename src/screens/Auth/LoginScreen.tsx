import * as React from 'react';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../components/auth';
import type { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSkip = () => {
    setIsSkipping(true);
    setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }, 50);
  };

  const changeLanguage = async (lng: string) => {
    try {
      await i18n.changeLanguage(lng);
      await AsyncStorage.setItem('settings.lang', lng);
    } catch (e) {
      console.error('Failed to save language to storage:', e);
    }
    setShowLanguageModal(false);
  };

  const getLanguageLabel = (lngCode: string) => {
    switch (lngCode) {
      case 'hi': return 'Hindi (हिंदी)';
      case 'mr': return 'Marathi (मराठी)';
      case 'kn': return 'Kannada (ಕನ್ನಡ)';
      case 'en': default: return 'English';
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, { backgroundColor: `${colors.primary}12`, top: -60, right: -80, width: 300, height: 300 }]} />
        <View style={[styles.blob, { backgroundColor: `${colors.primary}08`, bottom: -40, left: -60, width: 250, height: 250 }]} />
      </View>

      <View style={[styles.languageHeader, { top: Math.max(insets.top, spacing.md) }]}>
        <TouchableOpacity
          onPress={() => setShowLanguageModal(true)}
          style={[styles.languageBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Icon name="language" size={14} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[typography.small, { color: colors.textPrimary, fontWeight: 'bold' }]}>
            {getLanguageLabel(i18n.language)}
          </Text>
          <Icon name="chevron-down" size={10} color={colors.textPlaceholder} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
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
            {t('auth.landingTitle', 'Find your dream job in India')}
          </Text>
          <Text style={[typography.body, styles.lead, { color: colors.textSecondary }]}>
            {t('auth.landingSubtitle', 'Join thousands of professionals finding their next career move with JobIndia AI.')}
          </Text>
        </View>

        <View style={styles.ctaBlock}>
          {/* Register Card (Primary Action) */}
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.primary, borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.3 }]} 
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SignIn')}
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Icon name="user-plus" size={20} color="#FFF" />
              </View>
              <View style={styles.textContainer}>
                <Text style={[typography.h4, { color: '#FFF', fontWeight: 'bold' }]}>{t('auth.register', 'Create Account')}</Text>
                <Text style={[typography.small, { color: 'rgba(255,255,255,0.85)' }]}>via WhatsApp or Email</Text>
              </View>
            </View>
            <View style={[styles.arrowCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Icon name="arrow-right" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>

          {/* Login Card (Secondary Action) */}
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.04 }]} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EmailLogin')}
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconBox, { backgroundColor: colors.surfaceHighlight }]}>
                <Icon name="sign-in" size={22} color={colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[typography.h4, { color: colors.textPrimary, fontWeight: 'bold' }]}>{t('auth.login', 'Login')}</Text>
                <Text style={[typography.small, { color: colors.textSecondary }]}>via WhatsApp or Email</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={16} color={colors.textPlaceholder} />
          </TouchableOpacity>

          {/* Skip & Explore Jobs First */}
          <Pressable
            onPress={handleSkip}
            disabled={isSkipping}
            style={({ pressed }) => [
              styles.skipBtn,
              pressed && { opacity: 0.6 }
            ]}>
            {isSkipping ? (
              <ActivityIndicator color={colors.textSecondary} size="small" />
            ) : (
              <>
                <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>
                  {t('auth.skipExplore', 'Skip & Explore Jobs First')}
                </Text>
                <Icon name="long-arrow-right" size={14} color={colors.textSecondary} style={{ marginLeft: 8 }} />
              </>
            )}
          </Pressable>

          <View style={styles.trustRow}>
            <Icon name="shield" size={14} color={colors.success} />
            <Text style={[typography.small, { color: colors.textPlaceholder }]}>
              {t('auth.trustBadgeText')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowLanguageModal(false)} />
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[typography.h4, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                {t('profile.chooseLanguage', 'Choose your preferred language')}
              </Text>
              <Pressable onPress={() => setShowLanguageModal(false)} hitSlop={12}>
                <Icon name="times" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'Hindi (हिंदी)' },
                { code: 'mr', label: 'Marathi (मराठी)' },
                { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
              ].map((lang) => {
                const isSelected = i18n.language === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => changeLanguage(lang.code)}
                    style={[
                      styles.langItem,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.surfaceHighlight : colors.surface,
                      }
                    ]}
                  >
                    <Icon name="language" size={18} color={isSelected ? colors.primary : colors.textSecondary} style={{ marginRight: 12 }} />
                    <Text style={[typography.body, { color: isSelected ? colors.primary : colors.textPrimary, fontWeight: isSelected ? 'bold' : 'normal', flex: 1 }]}>
                      {lang.label}
                    </Text>
                    {isSelected && (
                      <Icon name="check-circle" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    borderRadius: 999,
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
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    justifyContent: 'center',
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },

  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.xl,
    opacity: 0.6,
  },
  languageHeader: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    zIndex: 10,
  },
  languageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});

export default LoginScreen;
