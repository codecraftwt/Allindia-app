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
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { logoutCandidate } from '../../../redux/slice/authSlice';
import { fetchProfile, updateProfilePicture, deleteProfilePicture, fetchProfileCompletion, fetchSkills } from '../../../redux/slice/profileSlice';
import { fetchMetaCategories, fetchMetaCities, fetchMetaQualifications } from '../../../redux/slice/metaSlice';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useProfileSetup } from '../../../context/ProfileSetupContext';
import type { ProfileStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { typography, moderateScale } from '../../../theme/typography';
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
  const { categories, cities, qualifications } = useSelector((state: RootState) => state.meta);
  const profile = profileData;
  const { t, i18n } = useTranslation();

  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [imageError, setImageError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const loadProfileData = React.useCallback(async (isPullToRefresh = false) => {
    if (!isLoggedIn) return;
    if (isPullToRefresh) setRefreshing(true);
    try {
      const promises: Promise<any>[] = [
        dispatch(fetchProfile()).unwrap().catch(() => {}),
        dispatch(fetchProfileCompletion()).unwrap().catch(() => {}),
        dispatch(fetchSkills()).unwrap().catch(() => {}),
      ];

      if (isPullToRefresh || !categories || categories.length === 0) {
        promises.push(dispatch(fetchMetaCategories()).unwrap().catch(() => {}));
      }
      if (isPullToRefresh || !cities || cities.length === 0) {
        promises.push(dispatch(fetchMetaCities()).unwrap().catch(() => {}));
      }
      if (isPullToRefresh || !qualifications || qualifications.length === 0) {
        promises.push(dispatch(fetchMetaQualifications()).unwrap().catch(() => {}));
      }

      await Promise.all(promises);
    } finally {
      if (isPullToRefresh) setRefreshing(false);
    }
  }, [dispatch, isLoggedIn, categories, cities, qualifications]);

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle('light-content');
      loadProfileData(false);
    }, [loadProfileData])
  );

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

  const formatName = (nameString: string | null | undefined) => {
    if (!nameString) return 'User';
    const parts = nameString.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} ${parts[1]}`;
    if (parts.length >= 3) return `${parts[0]} ${parts[parts.length - 1]}`;
    return nameString;
  };

  const rawName = profile?.personal?.name || user?.name || draft.fullName;
  const displayName = formatName(rawName);
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

  const getSelectedCategory = () => {
    if (!profile?.preferences) return 'Software Engineer';
    const pref = profile.preferences;

    if (Array.isArray(pref.job_categories) && pref.job_categories.length > 0) {
      const first = pref.job_categories[0];
      const name = typeof first === 'string' ? first : (first?.name || first?.job_title || first?.display_label || first?.job_category);
      if (typeof name === 'string' && name.trim()) return name.trim();
    }

    let catIds: number[] = [];
    const rawCatIds = pref.job_category_ids || pref.job_category_id;
    if (Array.isArray(rawCatIds)) {
      catIds = rawCatIds.map(Number).filter(n => !isNaN(n));
    } else if (typeof rawCatIds === 'number') {
      catIds = [rawCatIds];
    } else if (typeof rawCatIds === 'string' && rawCatIds.trim()) {
      catIds = rawCatIds.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    }

    if (catIds.length === 0) return 'Selected Role';
    let selectedName = '';
    if (Array.isArray(categories)) {
      for (const cat of categories) {
        if (catIds.includes(Number(cat?.id))) {
          selectedName = cat?.name || cat?.display_label || cat?.job_title || '';
          break;
        }
        if (Array.isArray(cat?.subcategories)) {
          const sub = cat.subcategories.find((s: any) => catIds.includes(Number(s?.id)));
          if (sub) {
            selectedName = sub?.name || sub?.display_label || sub?.job_title || '';
            break;
          }
        }
      }
    }
    return selectedName || 'Selected Role';
  };

  const getJobPrefBottomText = () => {
    if (!profile?.preferences) return 'Pune • ₹6-8 LPA';
    const pref = profile.preferences;

    const uniqueCityNames: string[] = [];

    // Safely parse preferred_city_ids
    let cityIds: number[] = [];
    if (Array.isArray(pref.preferred_city_ids)) {
      cityIds = pref.preferred_city_ids.map((n: any) => Number(n)).filter((n: number) => !isNaN(n));
    } else if (typeof pref.preferred_city_ids === 'number') {
      cityIds = [pref.preferred_city_ids];
    } else if (typeof pref.preferred_city_ids === 'string' && pref.preferred_city_ids.trim()) {
      cityIds = pref.preferred_city_ids.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
    }

    if (cityIds.length > 0 && Array.isArray(cities)) {
      cityIds.forEach((id: number) => {
        const cityData = cities.find((c: any) => Number(c?.id) === id);
        if (cityData) {
          let cName = '';
          if (typeof cityData.city === 'string' && cityData.city.trim()) {
            cName = cityData.city.trim();
          } else if (typeof cityData.name === 'string' && cityData.name.trim()) {
            cName = cityData.name.trim();
          } else if (typeof cityData.area === 'string' && cityData.area.trim()) {
            const parts = cityData.area.split(',');
            cName = parts[parts.length - 1].trim();
          } else if (typeof cityData.area === 'object' && cityData.area !== null) {
            cName = cityData.area.city || cityData.area.name || '';
          } else if (typeof cityData.label === 'string' && cityData.label.trim()) {
            const parts = cityData.label.split(',');
            cName = parts[0].trim();
          }
          if (cName && !uniqueCityNames.includes(cName)) {
            uniqueCityNames.push(cName);
          }
        }
      });
    }

    // Safely parse preferred_cities if no IDs matched
    if (uniqueCityNames.length === 0 && pref.preferred_cities) {
      const rawCities = Array.isArray(pref.preferred_cities)
        ? pref.preferred_cities
        : typeof pref.preferred_cities === 'string'
        ? pref.preferred_cities.split(',')
        : [];

      rawCities.forEach((rawCity: any) => {
        let cName = '';
        if (typeof rawCity === 'string' && rawCity.trim()) {
          const parts = rawCity.split(',');
          cName = parts[parts.length - 1].trim();
        } else if (typeof rawCity === 'object' && rawCity !== null) {
          cName = rawCity.city || rawCity.name || rawCity.label || '';
        }
        if (cName && !uniqueCityNames.includes(cName)) {
          uniqueCityNames.push(cName);
        }
      });
    }

    // Fallback to current_city_id
    if (uniqueCityNames.length === 0 && pref.current_city_id && Array.isArray(cities)) {
      const cityData = cities.find((c: any) => Number(c?.id) === Number(pref.current_city_id));
      if (cityData) {
        let cName = '';
        if (typeof cityData.city === 'string' && cityData.city.trim()) {
          cName = cityData.city.trim();
        } else if (typeof cityData.name === 'string' && cityData.name.trim()) {
          cName = cityData.name.trim();
        } else if (typeof cityData.label === 'string' && cityData.label.trim()) {
          cName = cityData.label.trim();
        }
        if (cName && !uniqueCityNames.includes(cName)) {
          uniqueCityNames.push(cName);
        }
      }
    }

    const cityText = uniqueCityNames.slice(0, 2).join(', ');

    let salaryText = '';
    const minSalary = Number(pref.expected_salary_min);
    const maxSalary = Number(pref.expected_salary_max);
    if ((!isNaN(minSalary) && minSalary > 0) || (!isNaN(maxSalary) && maxSalary > 0)) {
      const min = (minSalary || 0) / 100000;
      const max = (maxSalary || 0) / 100000;
      if (min > 0 || max > 0) {
        salaryText = `₹${min.toFixed(1)}-${max.toFixed(1)} LPA`;
      }
    }

    if (cityText && salaryText) return `${cityText} • ${salaryText}`;
    if (cityText) return cityText;
    if (salaryText) return salaryText;

    return 'Any Location';
  };

  const getExperienceSubtitle = () => {
    const exp = profile?.experience;
    if (!exp) return t('profileDetails.addPastJobs', 'Add your past jobs');
    const type = exp.experience_type || 'Experienced';
    if (type.toLowerCase() === 'fresher') return 'Fresher';
    const years = exp.total_experience_years || 0;
    return `${years} ${years === 1 ? 'Year' : 'Years'} Experience`;
  };

  const getEducationSubtitle = () => {
    const edu = profile?.education;
    if (!edu) return t('profileDetails.addEducation', 'Add your degree/college');
    if (edu.qualification_id && qualifications) {
      const qual = qualifications.find((q: any) => Number(q.id) === Number(edu.qualification_id));
      if (qual) return qual.name || qual.label || 'Education added';
    }
    return edu.degree || 'Education added';
  };

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

  const SettingsRow = ({ title, subtitle, icon, onPress, isMissing, color, isLast, bottomText, bottomTextColor = '#10B981', tags, subtitleColor }: any) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        pressed && { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' },
        !isLast && { borderBottomWidth: 1, borderBottomColor: mode === 'dark' ? colors.border : 'rgba(0,0,0,0.04)' }
      ]}
    >
      <View style={[styles.settingsIconBox, { backgroundColor: (color || colors.primary) + '15' }]}>
        <MaterialIcon name={icon} size={moderateScale(22)} color={color || colors.primary} />
      </View>
      <View style={styles.settingsText}>
        <Text style={[typography.labelMedium, { color: colors.textPrimary, fontSize: moderateScale(16), fontWeight: '600' }]}>{title}</Text>
        {(isMissing || subtitle) ? (
          <Text style={[typography.small, { color: isMissing ? colors.error : (subtitleColor || colors.textSecondary), marginTop: moderateScale(3), fontSize: moderateScale(12) }]}>
            {isMissing ? t('profileDetails.notAddedYet', 'Not added yet') : subtitle}
          </Text>
        ) : null}
        {!isMissing && bottomText ? (
          <Text style={[typography.small, { color: bottomTextColor, marginTop: moderateScale(3), fontSize: moderateScale(12), fontWeight: '500' }]}>
            {bottomText}
          </Text>
        ) : null}
        {!isMissing && tags && tags.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: moderateScale(6), gap: moderateScale(6) }}>
            {tags.map((tag: string, index: number) => (
              <View key={index} style={{ backgroundColor: color + '15', paddingHorizontal: moderateScale(8), paddingVertical: moderateScale(3), borderRadius: moderateScale(12) }}>
                <Text style={{ color: color, fontSize: moderateScale(11), fontWeight: '600' }}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      {isMissing ? (
        <View style={[styles.statusBadge, { backgroundColor: colors.error + '10' }]}>
          <Text style={[typography.tiny, { color: colors.error, fontWeight: '700', letterSpacing: 0.5, fontSize: moderateScale(10) }]}>{t('profileDetails.addBadge', 'ADD')}</Text>
        </View>
      ) : (
        <Icon name="chevron-right" size={moderateScale(18)} color={colors.textPlaceholder} />
      )}
    </Pressable>
  );

  const ProfileSkeleton = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <View style={[styles.headerBackground, { height: moderateScale(340) }]}>
        <SkeletonPulse style={{ flex: 1, borderBottomLeftRadius: moderateScale(40), borderBottomRightRadius: moderateScale(40) }} />
      </View>
      <View style={{ paddingHorizontal: spacing.md, marginTop: moderateScale(-20) }}>
        <SkeletonPulse style={{ height: moderateScale(100), borderRadius: moderateScale(24), marginBottom: moderateScale(20) }} />
        <SkeletonPulse style={{ height: moderateScale(300), borderRadius: moderateScale(24) }} />
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
        <View style={[styles.headerBackground, { backgroundColor: mode === 'dark' ? '#1E293B' : colors.primary, position: 'relative', height: 'auto', paddingBottom: moderateScale(16) }]}>
          {/* Subtle gradient / decorative circles */}
          <View style={[styles.decorativeCircle, { top: -50, left: -50, backgroundColor: '#FFFFFF', opacity: 0.05 }]} />
          <View style={[styles.decorativeCircle, { top: 100, right: -80, width: moderateScale(250), height: moderateScale(250), backgroundColor: '#FFFFFF', opacity: 0.03 }]} />

          <View style={{ paddingTop: insets.top > 20 ? insets.top - 10 : insets.top, zIndex: 10 }} />

          <View style={[styles.profileSummaryHorizontal, { paddingHorizontal: moderateScale(16), alignItems: 'center', paddingBottom: 0, paddingTop: moderateScale(4) }]}>
            <View style={styles.avatarContainer}>
              <Pressable
                onPress={() => profilePic ? setShowImageViewer(true) : setShowImagePicker(true)}
                style={[styles.avatarCircleHuge, { width: moderateScale(68), height: moderateScale(68), borderRadius: moderateScale(34), borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.8)' }]}
              >
                {profilePic && !imageError ? (
                  <Image source={{ uri: profilePic }} style={styles.avatarImage} onError={() => setImageError(true)} />
                ) : (
                  <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary + '20' }]}>
                    {displayName && displayName !== 'User' ? (
                      <Text style={[typography.h3, { color: colors.primary, fontSize: moderateScale(24), fontWeight: 'bold' }]}>
                        {profileInitials(displayName)}
                      </Text>
                    ) : (
                      <Icon name="user" size={moderateScale(28)} color={colors.primary} />
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
                style={[styles.cameraIconBtnPremium, { width: moderateScale(22), height: moderateScale(22), borderRadius: moderateScale(11), bottom: -2, right: -2, borderWidth: 1.5, borderColor: mode === 'dark' ? '#1E293B' : colors.primary }]}
              >
                <Icon name="camera" size={moderateScale(10)} color={colors.primary} />
              </Pressable>
            </View>

            <View style={[styles.summaryTextLeft, { marginLeft: moderateScale(14), flex: 1 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[typography.h3, { color: '#FFFFFF', fontSize: moderateScale(18), fontWeight: '700', letterSpacing: 0.3, flexShrink: 1 }]} numberOfLines={1}>{displayName}</Text>
                <MaterialIcon name="check-decagram" size={moderateScale(18)} color="#60A5FA" style={{ marginLeft: moderateScale(6) }} />
              </View>
              <Text style={[typography.body, { color: 'rgba(255,255,255,0.85)', marginTop: moderateScale(2), fontSize: moderateScale(12) }]} numberOfLines={1}>{displayEmail}</Text>
              <View style={[styles.phoneRow, { justifyContent: 'flex-start', marginTop: moderateScale(3) }]}>
                <Icon name="phone" size={moderateScale(11)} color="rgba(255,255,255,0.7)" />
                <Text style={[typography.small, { color: 'rgba(255,255,255,0.85)', marginLeft: moderateScale(5), fontSize: moderateScale(11) }]} numberOfLines={1}>{profile?.personal?.phone || profile?.personal?.mobile || user?.phone || user?.mobile || 'Add phone number'}</Text>
              </View>
            </View>

            {completion && completion.percentage < 100 && (
              <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: translateYAnim }, { scale: pulseAnim }], width: moderateScale(105), backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: moderateScale(16), padding: moderateScale(12), marginLeft: moderateScale(8), borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#FFF', fontSize: moderateScale(10), fontWeight: '700', letterSpacing: 0.2 }}>Profile Score</Text>
                  <Icon name="info" size={moderateScale(12)} color="rgba(255,255,255,0.7)" />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: moderateScale(6) }}>
                  <Text style={{ color: '#FFF', fontSize: moderateScale(24), fontWeight: '800' }}>{completion?.percentage || 0}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: moderateScale(10), fontWeight: '600', marginLeft: moderateScale(2) }}>/100</Text>
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: moderateScale(9), marginTop: moderateScale(2), fontWeight: '500' }} numberOfLines={1}>Almost there 🚀</Text>
                <View style={{ height: moderateScale(4), backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2, marginTop: moderateScale(8), overflow: 'hidden' }}>
                  <View style={{ width: `${completion?.percentage || 0}%`, height: '100%', backgroundColor: '#4ADE80', borderRadius: 2 }} />
                </View>
              </Animated.View>
            )}
          </View>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: moderateScale(16), paddingBottom: moderateScale(100), paddingTop: moderateScale(16) }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProfileData(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >


          <GroupedSection title={t('profileDetails.personalDetails', 'PERSONAL DETAILS')}>
            <SettingsRow
              title={t('profileDetails.personalInfo', 'Personal Info')}
              subtitle={t('profileDetails.nameDobGender', 'Name, DOB, Gender, Language')}
              icon="account-outline"
              color="#F97316"
              onPress={() => navigation.navigate('ProfilePersonalInfo')}
              isMissing={isSectionMissing('personal')}
              isLast={true}
            />
          </GroupedSection>

          <GroupedSection title={t('profileDetails.professionalDetails', 'PROFESSIONAL DETAILS')}>
            <SettingsRow
              title={t('profileDetails.workExperience', 'Work Experience')}
              subtitle={!isSectionMissing('experience') ? getExperienceSubtitle() : t('profileDetails.addPastJobs', 'Add your past jobs')}
              subtitleColor={!isSectionMissing('experience') ? '#10B981' : undefined}
              icon="briefcase-variant-outline"
              color="#3B82F6"
              onPress={() => navigation.navigate('ProfileExperience')}
              isMissing={isSectionMissing('experience')}
              isLast={false}
            />
            <SettingsRow
              title={t('profileDetails.education', 'Education')}
              subtitle={!isSectionMissing('education') ? getEducationSubtitle() : t('profileDetails.addEducation', 'Add your degree/college')}
              subtitleColor={!isSectionMissing('education') ? '#10B981' : undefined}
              icon="school-outline"
              color="#3B82F6"
              onPress={() => navigation.navigate('ProfileEducation')}
              isMissing={isSectionMissing('education')}
              isLast={false}
            />
            <SettingsRow
              title={t('profileDetails.jobPreferences', 'Job Preferences')}
              subtitle={!isSectionMissing('preferences') ? getSelectedCategory() : t('profileDetails.preferredRoles', 'Preferred roles & locations')}
              subtitleColor={!isSectionMissing('preferences') ? '#10B981' : undefined}
              bottomText={!isSectionMissing('preferences') ? getJobPrefBottomText() : undefined}
              icon="bullseye-arrow"
              color="#3B82F6"
              onPress={() => navigation.navigate('ProfileJobPreferences')}
              isMissing={isSectionMissing('preferences')}
              isLast={false}
            />
            <SettingsRow
              title={t('profileDetails.skills', 'Skills')}
              subtitle={profile?.skills?.length ? undefined : t('profileDetails.addSkills', 'Add your key skills')}
              tags={profile?.skills?.length ? profile.skills.map((s:any) => typeof s === 'string' ? s : (s.name || s.title || 'Skill')).slice(0, 4) : undefined}
              icon="lightning-bolt-outline"
              color="#3B82F6"
              onPress={() => navigation.navigate('ProfileSkills')}
              isMissing={isSectionMissing('skills')}
              isLast={false}
            />
            <SettingsRow
              title={t('profileDetails.resumeCv', 'Resume / CV')}
              subtitle={!isSectionMissing('resume') ? 'Resume_Pramod.pdf' : t('profileDetails.uploadResume', 'Upload your resume to get hired fast')}
              bottomText={!isSectionMissing('resume') ? 'Updated today • 1.2 MB' : undefined}
              icon="file-document-outline"
              color="#3B82F6"
              onPress={() => navigation.navigate('ProfileResume')}
              isMissing={isSectionMissing('resume')}
              isLast={true}
            />
          </GroupedSection>

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
                <Icon name="play-circle" size={moderateScale(24)} color="#EC4899" />
              </View>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginLeft: moderateScale(16), flex: 1, fontSize: moderateScale(16), fontWeight: '700' }]} numberOfLines={1}>{t('profileOverview.reels', 'Job Bites')}</Text>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>{t('profileOverview.reelsTag', 'NEW')}</Text>
              </View>
            </Pressable>
          </Animated.View>

          <GroupedSection title={t('profileDetails.settingsTitle', 'SETTINGS')}>
            <SettingsRow
              title={t('profileDetails.settings', 'Settings')}
              subtitle={t('profileDetails.settingsDesc', 'App preferences and account settings')}
              icon="cog-outline"
              color="#3B82F6"
              onPress={() => navigation.navigate('ProfileSettings')}
              isMissing={false}
              isLast={true}
            />
          </GroupedSection>

          <Animated.View style={[styles.proTipPremium, { backgroundColor: colors.surfaceHighlight, borderColor: colors.primary + '20', opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
            <MaterialIcon name="lightbulb-on-outline" size={moderateScale(24)} color={colors.primary} />
            <View style={styles.proTipText}>
              <Text style={[typography.labelMedium, { color: colors.primary, fontWeight: '700', fontSize: moderateScale(14) }]}>{t('profileDetails.proTipTitle', 'Pro Tip')}</Text>
              <Text style={[typography.small, { color: colors.textSecondary, marginTop: moderateScale(4), lineHeight: moderateScale(20), fontSize: moderateScale(12) }]}>
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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

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
    height: moderateScale(280),
    borderBottomLeftRadius: moderateScale(36),
    borderBottomRightRadius: moderateScale(36),
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    width: moderateScale(200),
    height: moderateScale(200),
    borderRadius: moderateScale(100),
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    height: moderateScale(52),
  },
  settingsBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  profileSummaryHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(4),
    paddingBottom: moderateScale(20),
  },
  avatarContainer: {
    position: 'relative',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  avatarCircleHuge: {
    width: moderateScale(68),
    height: moderateScale(68),
    borderRadius: moderateScale(34),
    borderWidth: 3,
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
    bottom: -2,
    right: -2,
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  summaryTextLeft: {
    flex: 1,
    marginLeft: moderateScale(16),
    alignItems: 'flex-start',
  },
  openToWorkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'flex-start',
  },
  openToWorkDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#10B981',
    marginRight: moderateScale(6),
  },
  openToWorkText: {
    color: '#FFF',
    fontSize: moderateScale(11),
    fontWeight: '600',
    marginRight: moderateScale(6),
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(4),
  },
  contentBody: {
    paddingHorizontal: moderateScale(16),
    marginTop: moderateScale(-16),
  },
  strengthCardPremium: {
    padding: moderateScale(14),
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: moderateScale(14),
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
    marginBottom: moderateScale(14),
  },
  percentageCircle: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(26),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  strengthBarBase: {
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: moderateScale(4),
  },
  reelsCardPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(14),
    borderRadius: radius.card,
    marginBottom: moderateScale(20),
    elevation: 1,
  },
  reelsIconBox: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(8),
  },
  newBadgeText: {
    color: '#FFF',
    fontSize: moderateScale(10),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  groupContainer: {
    marginBottom: moderateScale(20),
  },
  groupTitle: {
    marginLeft: moderateScale(8),
    marginBottom: moderateScale(8),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  groupCard: {
    borderRadius: radius.card,
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
    padding: moderateScale(14),
  },
  settingsIconBox: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
    flex: 1,
    marginLeft: moderateScale(14),
    marginRight: moderateScale(10),
  },
  statusBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: radius.sm,
  },
  proTipPremium: {
    flexDirection: 'row',
    padding: moderateScale(16),
    borderRadius: radius.card,
    borderWidth: 1,
    marginTop: moderateScale(8),
    marginBottom: moderateScale(24),
    alignItems: 'flex-start',
  },
  proTipText: {
    flex: 1,
    marginLeft: moderateScale(14),
  },
  uploadingOverlay: { backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerContainer: { borderTopLeftRadius: moderateScale(28), borderTopRightRadius: moderateScale(28), padding: moderateScale(20), paddingBottom: moderateScale(36) },
  pickerLine: { width: moderateScale(36), height: moderateScale(4), borderRadius: moderateScale(2), alignSelf: 'center', marginBottom: moderateScale(20) },
  pickerMenuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: moderateScale(14) },
  pickerIconWrapSmall: { width: moderateScale(34), height: moderateScale(34), borderRadius: moderateScale(8), alignItems: 'center', justifyContent: 'center' },
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
    padding: moderateScale(20),
    borderRadius: radius.card,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  guestIconCircle: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestActionBox: {
    width: '100%',
    marginTop: moderateScale(28),
    gap: moderateScale(14),
  },
  guestLoginBtn: {
    alignItems: 'center',
    paddingVertical: moderateScale(8),
  },
  guestBenefits: {
    marginTop: moderateScale(32),
    gap: moderateScale(10),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContainer: { borderTopLeftRadius: moderateScale(28), borderTopRightRadius: moderateScale(28), maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: moderateScale(20), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.05)' },
  modalContent: { padding: moderateScale(20), paddingBottom: moderateScale(36) },
  languageItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: moderateScale(14), paddingHorizontal: moderateScale(14), borderWidth: 1, borderRadius: radius.md },
  languageItemIcon: { alignItems: 'center' },
  languageItemText: { flex: 1, marginLeft: moderateScale(10) },
});

export default ProfileOverviewScreen;
