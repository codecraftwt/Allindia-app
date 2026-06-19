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
import { typography } from '../../../theme/typography';
import LogoutModal from '../../../components/LogoutModal';
import type { ProfileStackParamList } from '../../../navigation/types';

type Nav = StackNavigationProp<ProfileStackParamList, 'ProfileSettings'>;

const { width } = Dimensions.get('window');

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

  const SectionHeader = ({ title }: { title: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={[typography.labelMedium, { color: colors.textSecondary, letterSpacing: 0.5, fontWeight: 'bold', marginLeft: 8 }]}>{title.toUpperCase()}</Text>
    </View>
  );

  return (
    <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.topHeader}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.h1, { color: colors.textPrimary, marginLeft: 16, fontWeight: 'bold', fontSize: 28 }]}>
          {t('profileOverview.settings', 'Settings')}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.menuContainer}>
          <SectionHeader title={t('profileOverview.settings', 'Settings')} />
          
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.sectionIconBox, { backgroundColor: '#64748B15' }]}>
              <Icon name={mode === 'dark' ? 'moon' : 'sun'} size={20} color="#64748B" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, fontSize: 16 }]}>{t('profileOverview.darkMode', 'Dark Mode')}</Text>
            </View>
            <Switch value={mode === 'dark'} onValueChange={v => setMode(v ? 'dark' : 'light')} trackColor={{ false: colors.border, true: colors.primaryLight }} thumbColor="#FFF" />
          </View>

          <Pressable onPress={() => setShowLanguageModal(true)} style={({ pressed }) => [styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}>
            <View style={[styles.sectionIconBox, { backgroundColor: colors.primary + '15' }]}>
              <Icon name="globe" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, fontSize: 16 }]}>{t('profile.language', 'Language')}</Text>
              <Text style={[typography.small, { color: colors.textSecondary }]}>{getLanguageLabel(i18n.language)}</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textPlaceholder} />
          </Pressable>

          <Pressable onPress={() => navigation.navigate('ProfileAccountSetting')} style={({ pressed }) => [styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}>
            <View style={[styles.sectionIconBox, { backgroundColor: '#64748B15' }]}>
              <Icon name="settings" size={20} color="#64748B" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, fontSize: 16 }]}>{t('profileOverview.accountSettings', 'Account Settings')}</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textPlaceholder} />
          </Pressable>

          <SectionHeader title={t('profileOverview.support', 'Support')} />
          <Pressable
            onPress={() => navigation.navigate('HelpAndSupport')}
            style={({ pressed }) => [
              styles.sectionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
            ]}
          >
            <View style={[styles.sectionIconBox, { backgroundColor: '#10B98115' }]}>
              <Icon name="help-circle" size={20} color="#10B981" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, fontSize: 16 }]}>{t('profileOverview.helpSupport', 'Help & Support')}</Text>
              <Text style={[typography.small, { color: colors.textSecondary }]}>{t('profileOverview.contactUs', 'Contact us for any queries or issues')}</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textPlaceholder} />
          </Pressable>

          <Pressable onPress={() => setShowLogoutModal(true)} style={({ pressed }) => [styles.logoutBtn, { borderColor: colors.error + '30', backgroundColor: colors.error + '05' }, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}>
            <Icon name="log-out" size={18} color={colors.error} />
            <Text style={[typography.labelMedium, { color: colors.error, marginLeft: 12, fontWeight: 'bold' }]}>{t('profileOverview.signOut', 'Sign Out from App')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <LogoutModal visible={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={confirmLogout} colors={colors} loading={authLoading} />

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowLanguageModal(false)} />
          <Animated.View style={[styles.modalContainer, { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, 24), transform: [{ translateY: languageSlideAnim }] }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[typography.h3, { color: colors.textPrimary }]}>{t('profile.chooseLanguage', 'Choose your preferred language')}</Text>
              </View>
              <Pressable onPress={() => setShowLanguageModal(false)} hitSlop={12}>
                <Icon name="x" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={[styles.modalContent, { gap: 16 }]} keyboardShouldPersistTaps="handled">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'Hindi (हिंदी)' },
                { code: 'mr', label: 'Marathi (मराठी)' },
                { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
              ].map((lang) => (
                <Pressable
                  key={lang.code}
                  onPress={() => changeLanguage(lang.code)}
                  style={[
                    styles.languageItem,
                    {
                      borderColor: i18n.language === lang.code ? colors.primary : colors.border,
                      backgroundColor: i18n.language === lang.code ? colors.surfaceHighlight : colors.surface,
                    }
                  ]}
                >
                  <View style={[styles.languageItemIcon, { width: 40 }]}>
                    <Icon name="globe" size={20} color={i18n.language === lang.code ? colors.primary : colors.textSecondary} />
                  </View>
                  <View style={styles.languageItemText}>
                    <Text style={[typography.labelMedium, { color: i18n.language === lang.code ? colors.primary : colors.textPrimary, fontSize: 16 }]}>
                      {lang.label}
                    </Text>
                  </View>
                  {i18n.language === lang.code && (
                    <Icon name="check-circle" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: 16, paddingBottom: 12 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#00000008', borderRadius: 22 },
  scroll: { paddingBottom: 40 },
  menuContainer: { paddingHorizontal: spacing.md, paddingTop: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 16 },
  headerLine: { flex: 1, height: 1, marginLeft: 10, opacity: 0.3 },
  sectionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, borderWidth: 1, marginBottom: 12 },
  sectionIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuTextContainer: { flex: 1, marginLeft: 16 },
  logoutBtn: { marginTop: 24, marginBottom: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 20, borderWidth: 1.5, borderStyle: 'solid' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: Dimensions.get('window').height * 0.85, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalContent: { paddingBottom: 20 },
  languageItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1.5 },
  languageItemIcon: { alignItems: 'center', justifyContent: 'center' },
  languageItemText: { flex: 1, marginLeft: 12 },
});

export default ProfileSettingsScreen;
