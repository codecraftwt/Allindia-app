import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { logoutCandidate } from '../../../redux/slice/authSlice';
import { useProfileSetup } from '../../../context/ProfileSetupContext';
import { logoutToLogin } from './logoutToLogin';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { typography, moderateScale } from '../../../theme/typography';
import LogoutModal from '../../../components/LogoutModal';
import type { ProfileStackParamList } from '../../../navigation/types';

type Nav = StackNavigationProp<ProfileStackParamList, 'ProfileSettings'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ProfileSettingsScreen: React.FC = () => {
  const { colors, mode, setMode } = useTheme();
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { resetDraft } = useProfileSetup();
  const { loading: authLoading } = useSelector((state: RootState) => state.auth);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const languageSlideAnim = useRef(new Animated.Value(350)).current;

  useEffect(() => {
    if (showLanguageModal) {
      languageSlideAnim.setValue(350);
      Animated.spring(languageSlideAnim, {
        toValue: 0,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
  }, [showLanguageModal, languageSlideAnim]);

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
      case 'hi': return t('profileAccountSetting.hindi', 'Hindi');
      case 'mr': return t('profileAccountSetting.marathi', 'Marathi');
      case 'kn': return t('profileAccountSetting.kannada', 'Kannada');
      case 'en': default: return t('profileAccountSetting.english', 'English');
    }
  };

  const confirmLogout = () => {
    dispatch(logoutCandidate());
    resetDraft();
    setShowLogoutModal(false);
    logoutToLogin(navigation);
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border + '40' }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
          ]}
          hitSlop={8}
        >
          <Icon name="arrow-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={[typography.h3, { color: colors.textPrimary, fontWeight: '700' }]}>
            {t('profileOverview.settings', 'Settings')}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) + 40 }]}
      >
        {/* SECTION 1: SETTINGS */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            {t('profileOverview.settings', 'Settings').toUpperCase()}
          </Text>

          {/* Dark Mode Card */}
          <View style={[styles.cardItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.iconBadge, { backgroundColor: colors.primary + '15' }]}>
              <Icon
                name={mode === 'dark' ? 'moon' : 'sun'}
                size={18}
                color={colors.primary}
              />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                {t('profileOverview.darkMode', 'Dark Mode')}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.textPlaceholder }]}>
                {mode === 'dark' ? 'Dark theme enabled' : 'Light theme enabled'}
              </Text>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={(val) => setMode(val ? 'dark' : 'light')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={colors.border}
            />
          </View>

          {/* Language Card */}
          <Pressable
            onPress={() => setShowLanguageModal(true)}
            style={({ pressed }) => [
              styles.cardItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] },
            ]}
          >
            <View style={[styles.iconBadge, { backgroundColor: colors.primary + '15' }]}>
              <Icon name="globe" size={18} color={colors.primary} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                {t('profile.language', 'Language')}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.textPlaceholder }]}>
                {getLanguageLabel(i18n.language)}
              </Text>
            </View>
            <View style={styles.rowRightBadge}>
              <Text style={[styles.languageChipText, { color: colors.primary }]}>
                {getLanguageLabel(i18n.language)}
              </Text>
              <Icon name="chevron-right" size={18} color={colors.textPlaceholder} style={{ marginLeft: 4 }} />
            </View>
          </Pressable>

          {/* Account Settings Card */}
          <Pressable
            onPress={() => navigation.navigate('ProfileAccountSetting')}
            style={({ pressed }) => [
              styles.cardItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] },
            ]}
          >
            <View style={[styles.iconBadge, { backgroundColor: colors.primary + '15' }]}>
              <Icon name="settings" size={18} color={colors.primary} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                {t('profileOverview.accountSettings', 'Account Settings')}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.textPlaceholder }]}>
                Change password & credentials
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.textPlaceholder} />
          </Pressable>
        </View>

        {/* SECTION 2: SUPPORT */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            {t('profileOverview.support', 'Support').toUpperCase()}
          </Text>

          {/* Help & Support Card */}
          <Pressable
            onPress={() => navigation.navigate('HelpAndSupport')}
            style={({ pressed }) => [
              styles.cardItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] },
            ]}
          >
            <View style={[styles.iconBadge, { backgroundColor: colors.primary + '15' }]}>
              <Icon name="help-circle" size={18} color={colors.primary} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                {t('profileOverview.helpSupport', 'Help & Support')}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.textPlaceholder }]}>
                {t('profileOverview.contactUs', 'Contact us for any queries or issues')}
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.textPlaceholder} />
          </Pressable>

          {/* Terms & Conditions Card */}
          <Pressable
            onPress={() => navigation.navigate('TermsAndConditions')}
            style={({ pressed }) => [
              styles.cardItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] },
            ]}
          >
            <View style={[styles.iconBadge, { backgroundColor: colors.primary + '15' }]}>
              <Icon name="file-text" size={18} color={colors.primary} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                {t('termsAndConditionsScreen.title', 'Terms & Conditions')}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.textPlaceholder }]}>
                Service terms and guidelines
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.textPlaceholder} />
          </Pressable>

          {/* Privacy Policy Card */}
          <Pressable
            onPress={() => navigation.navigate('PrivacyPolicy')}
            style={({ pressed }) => [
              styles.cardItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] },
            ]}
          >
            <View style={[styles.iconBadge, { backgroundColor: colors.primary + '15' }]}>
              <Icon name="shield" size={18} color={colors.primary} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                {t('privacyPolicyScreen.title', 'Privacy Policy')}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.textPlaceholder }]}>
                How we protect your data
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.textPlaceholder} />
          </Pressable>
        </View>

        {/* SIGN OUT BUTTON */}
        <View style={styles.logoutWrap}>
          <Pressable
            onPress={() => setShowLogoutModal(true)}
            style={({ pressed }) => [
              styles.logoutBtn,
              {
                backgroundColor: colors.error + '0C',
                borderColor: colors.error + '25',
              },
              pressed && { opacity: 0.75, transform: [{ scale: 0.99 }] },
            ]}
          >
            <View style={[styles.logoutIconCircle, { backgroundColor: colors.error + '15' }]}>
              <Icon name="log-out" size={16} color={colors.error} />
            </View>
            <Text style={[styles.logoutText, { color: colors.error }]}>
              {t('profileOverview.signOut', 'Sign Out from App')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        colors={colors}
        loading={authLoading}
      />

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowLanguageModal(false)} />
          <Animated.View
            style={[
              styles.modalContainer,
              {
                backgroundColor: colors.surface,
                paddingBottom: Math.max(insets.bottom, 24),
                transform: [{ translateY: languageSlideAnim }],
              },
            ]}
          >
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <View>
                <Text style={[typography.h3, { color: colors.textPrimary, fontWeight: '700' }]}>
                  {t('profile.chooseLanguage', 'Choose Language')}
                </Text>
                <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]}>
                  Select your preferred app language
                </Text>
              </View>
              <Pressable
                onPress={() => setShowLanguageModal(false)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.surfaceHighlight }]}
                hitSlop={8}
              >
                <Icon name="x" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.languageList}>
              {[
                { code: 'en', label: 'English', sub: 'English' },
                { code: 'hi', label: 'हिंदी', sub: 'Hindi' },
                { code: 'mr', label: 'मराठी', sub: 'Marathi' },
                { code: 'kn', label: 'ಕನ್ನಡ', sub: 'Kannada' },
              ].map((lang) => {
                const isSelected = i18n.language === lang.code;
                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => changeLanguage(lang.code)}
                    style={({ pressed }) => [
                      styles.languageItem,
                      {
                        borderColor: isSelected ? colors.primary : colors.border + '80',
                        backgroundColor: isSelected ? colors.primary + '0C' : colors.surface,
                      },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <View
                      style={[
                        styles.langRadio,
                        {
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? colors.primary : 'transparent',
                        },
                      ]}
                    >
                      {isSelected && <View style={styles.langRadioInner} />}
                    </View>

                    <View style={styles.languageItemText}>
                      <Text
                        style={[
                          styles.langLabel,
                          { color: isSelected ? colors.primary : colors.textPrimary, fontWeight: isSelected ? '700' : '600' },
                        ]}
                      >
                        {lang.label}
                      </Text>
                      <Text style={[styles.langSub, { color: colors.textPlaceholder }]}>
                        {lang.sub}
                      </Text>
                    </View>

                    {isSelected && (
                      <View style={[styles.selectedBadge, { backgroundColor: colors.primary + '18' }]}>
                        <Icon name="check" size={14} color={colors.primary} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(spacing.lg),
    paddingVertical: moderateScale(12),
  },
  backBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: moderateScale(spacing.lg),
    paddingTop: moderateScale(spacing.md),
  },
  sectionWrap: {
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(16),
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: moderateScale(10),
  },
  iconBadge: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextWrap: {
    flex: 1,
    marginLeft: moderateScale(14),
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rowRightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  logoutWrap: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(14),
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  logoutIconCircle: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(10),
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: moderateScale(28),
    borderTopRightRadius: moderateScale(28),
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(12),
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHandle: {
    width: moderateScale(36),
    height: moderateScale(4),
    borderRadius: moderateScale(2),
    backgroundColor: '#94A3B840',
    alignSelf: 'center',
    marginBottom: moderateScale(16),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(20),
  },
  modalCloseBtn: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageList: {
    gap: moderateScale(12),
    marginBottom: moderateScale(12),
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(14),
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  langRadio: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langRadioInner: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#FFFFFF',
  },
  languageItemText: {
    flex: 1,
    marginLeft: moderateScale(12),
  },
  langLabel: {
    fontSize: 16,
  },
  langSub: {
    fontSize: 12,
    marginTop: 1,
  },
  selectedBadge: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileSettingsScreen;
