import React, { useMemo, useState, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Image,
  Animated,
  Easing,
  ActivityIndicator,
  Modal,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { logoutCandidate } from '../../../redux/slice/authSlice';
import { fetchProfile, updateProfilePicture, deleteProfilePicture, fetchProfileCompletion } from '../../../redux/slice/profileSlice';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useProfileSetup } from '../../../context/ProfileSetupContext';
import type { ProfileStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { logoutToLogin } from './logoutToLogin';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../../api/axiosInstance';
import LogoutModal from '../../../components/LogoutModal';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { PrimaryButton } from '../../../components/auth';
import GuestView from '../../../components/GuestView';
import SkeletonPulse from '../../../components/SkeletonPulse';
import JobIndiaIcon from '../../../assets/Job india Icon & logo file/Icon Job india.jpg';

type Nav = StackNavigationProp<ProfileStackParamList, 'ProfileOverview'>;

const { width, height } = Dimensions.get('window');

function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

const ProfileOverviewScreen: React.FC = () => {
  const { colors, mode, setMode } = useTheme();
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { draft } = useProfileSetup();
  const { user, loading: authLoading, isLoggedIn } = useSelector((state: RootState) => state.auth);
  const { data: profileData, completion, loading: profileLoading } = useSelector((state: RootState) => state.profile);
  const profile = profileData;
  const { t, i18n } = useTranslation();

  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [imageError, setImageError] = useState(false);

  const scrollY = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateYAnim = React.useRef(new Animated.Value(40)).current;

  useEffect(() => {
    setImageError(false);
  }, [profile?.personal?.profile_picture_url, user?.profile_picture_url]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.out(Easing.exp) }),
      Animated.timing(translateYAnim, { toValue: 0, duration: 800, useNativeDriver: true, easing: Easing.out(Easing.exp) }),
    ]).start();
  }, [fadeAnim, translateYAnim]);

  // Optimized Animation Values (Native Driver Compatible)
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;
  const floatAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const rippleScale = React.useRef(new Animated.Value(1)).current;
  const rippleOpacity = React.useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Shimmer Loop
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 2200, easing: Easing.linear, useNativeDriver: true })
    );
    shimmerLoop.start();

    // Floating Icon Loop
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    floatLoop.start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    const rippleLoop = Animated.loop(
      Animated.parallel([
        Animated.timing(rippleScale, { toValue: 1.6, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(rippleOpacity, { toValue: 0, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ])
    );
    rippleLoop.start();

    return () => {
      shimmerLoop.stop();
      floatLoop.stop();
      pulseLoop.stop();
      rippleLoop.stop();
    };
  }, [shimmerAnim, floatAnim, pulseAnim, rippleScale, rippleOpacity]);

  const getNextActionText = () => {
    if (!completion?.missing_sections || completion.missing_sections.length === 0) return t('profileOverview.allDone', 'Profile Complete!');
    const firstMissing = completion.missing_sections[0];
    switch (firstMissing) {
      case 'education': return t('profileOverview.addEducation', 'Add Education to boost your profile!');
      case 'experience': return t('profileOverview.addExperience', 'Add Experience to stand out!');
      case 'skills': return t('profileOverview.addSkills', 'Add Skills to get better matches!');
      case 'resume': return t('profileOverview.addResume', 'Upload your Resume to reach 100%!');
      default: return t('profileOverview.completeProfile', 'Complete your profile to unlock more jobs!');
    }
  };

  React.useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchProfile());
      dispatch(fetchProfileCompletion());
    }
  }, [dispatch, isLoggedIn]);

  const { resetDraft } = useProfileSetup();

  const processImage = async (type: 'camera' | 'gallery') => {
    setShowImagePicker(false);
    try {
      const options = { mediaType: 'photo' as const, quality: 0.8, saveToPhotos: true };
      const result = type === 'camera' ? await launchCamera(options as any) : await launchImageLibrary(options as any);
      if (result.didCancel || !result.assets || result.assets.length === 0) return;
      const asset = result.assets[0];
      if (asset.uri) {
        setIsUploading(true);
        await dispatch(updateProfilePicture({
          uri: asset.uri,
          name: asset.fileName || 'profile.jpg',
          type: asset.type || 'image/jpeg',
        })).unwrap();
        setIsUploading(false);
        setImageTimestamp(Date.now());
      }
    } catch (error) {
      setIsUploading(false);
      Alert.alert('Error', 'Failed to update picture');
    }
  };

  const handleDeletePicture = () => {
    setShowImagePicker(false);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePicture = async () => {
    try {
      setIsUploading(true);
      await dispatch(deleteProfilePicture()).unwrap();
      setIsUploading(false);
      setShowDeleteConfirm(false);
      setImageTimestamp(Date.now());
    } catch (error) {
      setIsUploading(false);
      Alert.alert('Error', 'Failed to remove picture');
    }
  };

  const getProfileImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    const cleanPath = path.trim();
    if (cleanPath === '' || cleanPath === 'null' || cleanPath === 'undefined') return null;
    const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    if (cleanPath.startsWith('http')) return cleanPath;
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `${baseUrl}${normalizedPath}?t=${imageTimestamp}`;
  };

  const displayName = profile?.personal?.name || user?.name || draft.fullName || 'User';
  const displayEmail = profile?.personal?.email || user?.email || '';
  const isValidPhotoUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase().trim();
    if (
      lowerUrl === '' ||
      lowerUrl === 'null' ||
      lowerUrl === 'undefined' ||
      lowerUrl.includes('default') ||
      lowerUrl.includes('placeholder') ||
      lowerUrl.includes('avatar') ||
      lowerUrl.includes('no-image') ||
      lowerUrl.includes('noimage') ||
      lowerUrl.includes('faces') ||
      lowerUrl.includes('face1') ||
      lowerUrl.includes('admin-assets')
    ) {
      return false;
    }
    const hasExtension =
      lowerUrl.includes('.jpg') ||
      lowerUrl.includes('.jpeg') ||
      lowerUrl.includes('.png') ||
      lowerUrl.includes('.webp') ||
      lowerUrl.includes('.gif');

    return hasExtension;
  };

  const hasUploadedPhoto = !!(
    (profile?.personal?.profile_picture_url && isValidPhotoUrl(profile.personal.profile_picture_url)) ||
    (user?.profile_picture_url && isValidPhotoUrl(user.profile_picture_url))
  );

  const profilePic = getProfileImageUrl(profile?.personal?.profile_picture_url || user?.profile_picture_url);

  const isSectionMissing = (key: string) => completion?.missing_sections?.includes(key);

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -40],
    extrapolate: 'clamp',
  });

  const GroupedSection = ({ title, children }: any) => (
    <Animated.View style={[styles.groupContainer, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
      {title && <Text style={[typography.labelMedium, styles.groupTitle, { color: colors.textSecondary }]}>{title}</Text>}
      <View style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: mode === 'dark' ? colors.border : 'rgba(0,0,0,0.04)' }]}>
        {children}
      </View>
    </Animated.View>
  );

  const SettingsRow = ({ title, subtitle, icon, onPress, isMissing, color, isLast }: any) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        pressed && { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' },
        !isLast && { borderBottomWidth: 1, borderBottomColor: mode === 'dark' ? colors.border : 'rgba(0,0,0,0.04)' }
      ]}
    >
      <View style={[styles.settingsIconBox, { backgroundColor: (color || colors.primary) + '15' }]}>
        <MaterialIcon name={icon} size={22} color={color || colors.primary} />
      </View>
      <View style={styles.settingsText}>
        <Text style={[typography.labelMedium, { color: colors.textPrimary, fontSize: 16, fontWeight: '600' }]}>{title}</Text>
        <Text style={[typography.small, { color: isMissing ? colors.error : colors.textSecondary, marginTop: 3 }]}>
          {isMissing ? t('profileDetails.notAddedYet', 'Not added yet') : subtitle}
        </Text>
      </View>
      {isMissing ? (
        <View style={[styles.statusBadge, { backgroundColor: colors.error + '10' }]}>
          <Text style={[typography.tiny, { color: colors.error, fontWeight: '700', letterSpacing: 0.5 }]}>{t('profileDetails.addBadge', 'ADD')}</Text>
        </View>
      ) : (
        <Icon name="chevron-right" size={18} color={colors.textPlaceholder} />
      )}
    </Pressable>
  );

  const ProfileSkeleton = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <View style={[styles.headerBackground, { height: 340 }]}>
        <SkeletonPulse style={{ flex: 1, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }} />
      </View>
      <View style={{ paddingHorizontal: spacing.md, marginTop: -20 }}>
        <SkeletonPulse style={{ height: 100, borderRadius: 24, marginBottom: 20 }} />
        <SkeletonPulse style={{ height: 300, borderRadius: 24 }} />
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    if (!isLoggedIn) {
      return (
        <GuestView
          title="Unlock Your Potential"
          subtitle="Register now to apply for jobs, track your applications, and get personalized recommendations."
          image={JobIndiaIcon}
        />
      );
    }

    if (!profileData) {
      return <ProfileSkeleton />;
    }

    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.headerBackground, { backgroundColor: mode === 'dark' ? '#1E293B' : colors.primary }]}>
          {/* Subtle gradient / decorative circles */}
          <View style={[styles.decorativeCircle, { top: -50, left: -50, backgroundColor: '#FFFFFF', opacity: 0.05 }]} />
          <View style={[styles.decorativeCircle, { top: 100, right: -80, width: 250, height: 250, backgroundColor: '#FFFFFF', opacity: 0.03 }]} />
        </View>

        <View style={[styles.topNav, { paddingTop: insets.top + 8, paddingHorizontal: 20, justifyContent: 'space-between', zIndex: 10 }]}>
          <Text style={[typography.h4, { color: '#FFFFFF', fontWeight: 'bold', fontSize: 22, letterSpacing: 0.5 }]}>{t('profileDetails.myProfile', 'My Profile')}</Text>
          <Pressable onPress={() => navigation.navigate('ProfileSettings')} style={({ pressed }) => [styles.settingsBtn, pressed && { opacity: 0.7 }]}>
            <Icon name="settings" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.profileSummaryCentered}>
          <View style={styles.avatarContainer}>
            <Pressable
              onPress={() => profilePic ? setShowImageViewer(true) : setShowImagePicker(true)}
              style={[styles.avatarCircleHuge, { backgroundColor: '#FFFFFF' }]}
            >
              {profilePic && !imageError ? (
                <Image source={{ uri: profilePic }} style={styles.avatarImage} onError={() => setImageError(true)} />
              ) : (
                <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary + '20' }]}>
                  {displayName && displayName !== 'User' ? (
                    <Text style={[typography.h3, { color: colors.primary, fontSize: 36, fontWeight: 'bold' }]}>
                      {profileInitials(displayName)}
                    </Text>
                  ) : (
                    <Icon name="user" size={40} color={colors.primary} />
                  )}
                </View>
              )}
              {isUploading && (
                <View style={[StyleSheet.absoluteFill, styles.uploadingOverlay]}>
                  <ActivityIndicator color="#FFF" size="large" />
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() => setShowImagePicker(true)}
              style={styles.cameraIconBtnPremium}
            >
              <Icon name="camera" size={14} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.summaryTextCentered}>
            <View style={[styles.nameVerifiedRow, { justifyContent: 'center', gap: 6 }]}>
              <Text style={[typography.h3, { color: '#FFFFFF', fontSize: 24, fontWeight: '700', letterSpacing: 0.3 }]} numberOfLines={1}>{displayName}</Text>
              <MaterialIcon name="check-decagram" size={24} color="#60A5FA" />
            </View>
            <Text style={[typography.body, { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 14 }]} numberOfLines={1}>{displayEmail}</Text>
            <View style={[styles.phoneRow, { justifyContent: 'center' }]}>
              <Icon name="phone" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={[typography.small, { color: 'rgba(255,255,255,0.85)', marginLeft: 6, fontSize: 13 }]}>{profile?.personal?.phone || user?.phone || 'Add phone number'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentBody}>
          {completion && completion.percentage < 100 && (
            <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
              <View style={[styles.strengthCardPremium, { backgroundColor: mode === 'dark' ? '#1E293B' : '#FFFFFF', borderColor: mode === 'dark' ? colors.border : 'rgba(0,0,0,0.04)' }]}>
                <View style={styles.strengthHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.labelMedium, { color: colors.textPrimary, fontSize: 16, fontWeight: '700' }]}>{t('profileOverview.boostProfile', 'Boost Your Profile')}</Text>
                    <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4 }]}>{t('profileOverview.completeToUnlock', 'Complete your profile to unlock more jobs!')}</Text>
                  </View>
                  <View style={{ alignItems: 'center', justifyContent: 'center', width: 56, height: 56 }}>
                    <Animated.View style={[
                      StyleSheet.absoluteFill,
                      {
                        backgroundColor: colors.primary,
                        borderRadius: 28,
                        opacity: rippleOpacity,
                        transform: [{ scale: rippleScale }],
                      }
                    ]} />
                    <View style={[styles.percentageCircle, { borderColor: colors.primary + '20', borderWidth: 4 }]} />
                    <View style={[styles.percentageCircle, {
                      position: 'absolute',
                      borderColor: colors.primary,
                      borderWidth: 4,
                      borderTopColor: colors.primary,
                      borderRightColor: ((completion?.percentage || 0) / 100) * 360 > 90 ? colors.primary : 'transparent',
                      borderBottomColor: ((completion?.percentage || 0) / 100) * 360 > 180 ? colors.primary : 'transparent',
                      borderLeftColor: ((completion?.percentage || 0) / 100) * 360 > 270 ? colors.primary : 'transparent',
                      transform: [{ rotate: `${((completion?.percentage || 0) / 100) * 360}deg` }]
                    }]} />
                    <Text style={[typography.labelSmall, { color: colors.primary, fontWeight: '900', fontSize: 14, position: 'absolute' }]}>{completion?.percentage || 0}%</Text>
                  </View>
                </View>
                <View style={[styles.strengthBarBase, { backgroundColor: mode === 'dark' ? '#334155' : '#F1F5F9' }]}>
                  <View style={[styles.strengthBarFill, { backgroundColor: colors.primary, width: `${completion?.percentage || 0}%` }]} />
                </View>
              </View>
            </Animated.View>
          )}
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
            <Pressable
              onPress={() => navigation.getParent()?.navigate('JobReels', { screen: 'ReelsMain', params: { from: 'Profile' } })}
              style={({ pressed }) => [
                styles.reelsCardPremium,
                { backgroundColor: mode === 'dark' ? '#EC489915' : '#FDF2F8' },
                pressed && { transform: [{ scale: 0.98 }] }
              ]}
            >
              <View style={[styles.reelsIconBox, { backgroundColor: mode === 'dark' ? '#EC489925' : '#FCE7F3' }]}>
                <Icon name="play-circle" size={24} color="#EC4899" />
              </View>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginLeft: 16, flex: 1, fontSize: 16, fontWeight: '700' }]} numberOfLines={1}>{t('profileOverview.reels', 'Job Reels')}</Text>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>{t('profileOverview.reelsTag', 'NEW')}</Text>
              </View>
            </Pressable>
          </Animated.View>

          <GroupedSection title={t('profileDetails.personalDetails', 'PERSONAL DETAILS')}>
            <SettingsRow
              title={t('profileDetails.personalInfo', 'Personal Info')}
              subtitle={t('profileDetails.nameDobGender', 'Name, DOB, Gender, Language')}
              icon="account-outline"
              color="#EC4899"
              onPress={() => navigation.navigate('ProfilePersonalInfo')}
              isMissing={isSectionMissing('personal')}
              isLast={true}
            />
          </GroupedSection>

          <GroupedSection title={t('profileDetails.professionalDetails', 'PROFESSIONAL DETAILS')}>
            <SettingsRow
              title={t('profileDetails.workExperience', 'Work Experience')}
              subtitle={profile?.experience?.length ? `${profile.experience.length} ${t('profileDetails.experienceAdded', 'Experience added')}` : t('profileDetails.addPastJobs', 'Add your past jobs')}
              icon="briefcase-variant-outline"
              color="#3B82F6"
              onPress={() => navigation.navigate('ProfileExperience')}
              isMissing={isSectionMissing('experience')}
              isLast={false}
            />
            <SettingsRow
              title={t('profileDetails.education', 'Education')}
              subtitle={profile?.education?.length ? `${profile.education.length} ${t('profileDetails.educationAdded', 'Education added')}` : t('profileDetails.addEducation', 'Add your degree/college')}
              icon="school-outline"
              color="#10B981"
              onPress={() => navigation.navigate('ProfileEducation')}
              isMissing={isSectionMissing('education')}
              isLast={false}
            />
            <SettingsRow
              title={t('profileDetails.jobPreferences', 'Job Preferences')}
              subtitle={t('profileDetails.preferredRoles', 'Preferred roles & locations')}
              icon="bullseye-arrow"
              color="#F59E0B"
              onPress={() => navigation.navigate('ProfileJobPreferences')}
              isMissing={isSectionMissing('preferences')}
              isLast={false}
            />
            <SettingsRow
              title={t('profileDetails.resumeCv', 'Resume / CV')}
              subtitle={t('profileDetails.uploadResume', 'Upload your resume to get hired fast')}
              icon="file-document-outline"
              color="#8B5CF6"
              onPress={() => navigation.navigate('ProfileResume')}
              isMissing={isSectionMissing('resume')}
              isLast={true}
            />
          </GroupedSection>

          <Animated.View style={[styles.proTipPremium, { backgroundColor: colors.surfaceHighlight, borderColor: colors.primary + '20', opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
            <MaterialIcon name="lightbulb-on-outline" size={24} color={colors.primary} />
            <View style={styles.proTipText}>
              <Text style={[typography.labelMedium, { color: colors.primary, fontWeight: '700' }]}>{t('profileDetails.proTipTitle', 'Pro Tip')}</Text>
              <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4, lineHeight: 20 }]}>
                {t('profileDetails.proTipDesc', 'Profiles with photos and resumes get 5x more attention from employers.')}
              </Text>
            </View>
          </Animated.View>
        </Animated.ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {renderContent()}

      {/* Modals placed outside main content for stability */}
      <Modal visible={showImagePicker} transparent animationType="fade" onRequestClose={() => setShowImagePicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowImagePicker(false)}>
          <View style={[styles.pickerContainer, { backgroundColor: colors.surface }]}>
            <View style={[styles.pickerLine, { backgroundColor: colors.border }]} />
            <Text style={[typography.labelMedium, { color: colors.textPrimary, marginBottom: 24 }]}>{t('profileOverview.profilePicture', 'Profile Picture')}</Text>
            {hasUploadedPhoto && (
              <Pressable style={styles.pickerMenuRow} onPress={() => { setShowImagePicker(false); setShowImageViewer(true); }}>
                <View style={[styles.pickerIconWrapSmall, { backgroundColor: colors.primary + '10' }]}><Icon name="eye" size={18} color={colors.primary} /></View>
                <Text style={[typography.labelMedium, { color: colors.textPrimary, marginLeft: 16 }]}>{t('profileOverview.viewProfilePicture', 'View Profile Picture')}</Text>
              </Pressable>
            )}
            <Pressable style={styles.pickerMenuRow} onPress={() => processImage('camera')}>
              <View style={[styles.pickerIconWrapSmall, { backgroundColor: colors.primary + '10' }]}><Icon name="camera" size={18} color={colors.primary} /></View>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginLeft: 16 }]}>{t('profileOverview.takePhoto', 'Take Photo')}</Text>
            </Pressable>
            <Pressable style={styles.pickerMenuRow} onPress={() => processImage('gallery')}>
              <View style={[styles.pickerIconWrapSmall, { backgroundColor: '#8B5CF610' }]}><Icon name="image" size={18} color="#8B5CF6" /></View>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginLeft: 16 }]}>{t('profileOverview.chooseGallery', 'Choose from Gallery')}</Text>
            </Pressable>
            {hasUploadedPhoto && (
              <Pressable style={styles.pickerMenuRow} onPress={handleDeletePicture}>
                <View style={[styles.pickerIconWrapSmall, { backgroundColor: colors.error + '10' }]}><Icon name="trash-2" size={18} color={colors.error} /></View>
                <Text style={[typography.labelMedium, { color: colors.error, marginLeft: 16 }]}>{t('profileOverview.removePhoto', 'Remove Photo')}</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showImageViewer} transparent animationType="slide" onRequestClose={() => setShowImageViewer(false)}>
        <View style={styles.viewerBackground}>
          <Pressable style={styles.viewerClose} onPress={() => setShowImageViewer(false)}>
            <Icon name="x" size={24} color="#FFF" />
          </Pressable>
          {profilePic && <Image source={{ uri: profilePic }} style={styles.fullImage} resizeMode="contain" />}
          <View style={styles.viewerFooter}><Text style={[typography.labelMedium, { color: '#FFF' }]}>{displayName}</Text></View>
        </View>
      </Modal>

      <Modal visible={showImageViewer} transparent animationType="slide" onRequestClose={() => setShowImageViewer(false)}>
        <View style={styles.viewerBackground}>
          <Pressable style={styles.viewerClose} onPress={() => setShowImageViewer(false)}>
            <Icon name="x" size={24} color="#FFF" />
          </Pressable>
          {profilePic && <Image source={{ uri: profilePic }} style={styles.fullImage} resizeMode="contain" />}
          <View style={styles.viewerFooter}><Text style={[typography.labelMedium, { color: '#FFF' }]}>{displayName}</Text></View>
        </View>
      </Modal>

      <ConfirmationModal
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeletePicture}
        title={t('profileOverview.removePhotoTitle', 'Remove Photo')}
        message={t('profileOverview.removePhotoMsg', 'Are you sure you want to remove your profile picture? This action cannot be undone.')}
        confirmText={t('profileOverview.removeConfirm', 'Remove')}
        cancelText={t('profileOverview.removeCancel', 'Keep Photo')}
        colors={colors}
        loading={isUploading}
        type="danger"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  profileSummaryCentered: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  avatarCircleHuge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraIconBtnPremium: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  summaryTextCentered: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  contentBody: {
    paddingHorizontal: 20,
    marginTop: -16,
  },
  strengthCardPremium: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  percentageCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  strengthBarBase: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  reelsCardPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    elevation: 1,
  },
  reelsIconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  newBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  groupContainer: {
    marginBottom: 24,
  },
  groupTitle: {
    marginLeft: 8,
    marginBottom: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  groupCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  proTipPremium: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  proTipText: {
    flex: 1,
    marginLeft: 16,
  },
  uploadingOverlay: { backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerContainer: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  pickerLine: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  pickerMenuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  pickerIconWrapSmall: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  viewerBackground: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  viewerClose: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 10 },
  fullImage: { width: width, height: height * 0.8 },
  viewerFooter: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  guestContainer: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestCard: {
    width: '100%',
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  guestIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestActionBox: {
    width: '100%',
    marginTop: 32,
    gap: 16,
  },
  guestLoginBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestBenefits: {
    marginTop: 40,
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContainer: { borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.05)' },
  modalContent: { padding: 24, paddingBottom: 40 },
  languageItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderWidth: 1, borderRadius: 16 },
  languageItemIcon: { alignItems: 'center' },
  languageItemText: { flex: 1, marginLeft: 12 },
});

export default ProfileOverviewScreen;
