import React, { useMemo, useState } from 'react';
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
  DeviceEventEmitter,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { logoutCandidate } from '../../../redux/slice/authSlice';
import { fetchProfile, updateProfilePicture, fetchProfileCompletion } from '../../../redux/slice/profileSlice';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { PrimaryButton } from '../../../components/auth';
import { useProfileSetup } from '../../../context/ProfileSetupContext';
import type { ProfileStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { components } from '../../../theme/components';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import type { ThemeColors } from '../../../theme/colors';
import { JOB_CATEGORIES, SALARY_OPTIONS } from '../../ProfileSetup/profileSetupConstants';
import { logoutToLogin } from './logoutToLogin';
import LogoutModal from '../../../components/LogoutModal';

type Nav = StackNavigationProp<ProfileStackParamList, 'ProfileOverview'>;

function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function SectionRow({
  title,
  subtitle,
  colors,
  onPress,
}: {
  title: string;
  subtitle?: string;
  colors: ThemeColors;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.sectionRow,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}>
      <View style={styles.sectionRowText}>
        <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Icon name="chevron-right" size={14} color={colors.textPlaceholder} />
    </Pressable>
  );
}

const AnimatedProgressBar = ({ colors, progress }: { colors: ThemeColors; progress: number }) => {
  const widthAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 1500,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={[typography.small, { color: colors.textSecondary }]}>Profile Strength</Text>
        <Text style={[typography.small, { color: colors.primary, fontWeight: 'bold' }]}>{progress}%</Text>
      </View>
      <View style={[styles.progressBarBase, { backgroundColor: colors.surfaceHighlight }]}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: colors.primary,
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              })
            }
          ]}
        />
      </View>
    </View>
  );
};


const ProfileOverviewScreen: React.FC = () => {
  const { colors, mode, setMode, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch<AppDispatch>();
  const { draft } = useProfileSetup();
  const { user, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { data: profileData, loading: profileLoading, error: profileError, completion } = useSelector((state: RootState) => state.profile);
  
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

  // Animation Values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const staggerAnims = React.useRef([...Array(6)].map(() => new Animated.Value(0))).current;

  const profile = profileData;

  React.useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchProfileCompletion());

    // Trigger Animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Staggered Entrance for rows
    const animations = staggerAnims.map((anim, i) =>
      Animated.spring(anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: i * 100 + 300,
        useNativeDriver: true,
      })
    );
    Animated.parallel(animations).start();
  }, [dispatch]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await dispatch(logoutCandidate()).unwrap();
      setShowLogoutModal(false);
      logoutToLogin(navigation);
    } catch (error) {
      setShowLogoutModal(false);
      logoutToLogin(navigation);
    }
  };

  const handleUpdatePicture = () => {
    setShowImagePicker(true);
  };

  const processImage = async (type: 'camera' | 'gallery') => {
    setShowImagePicker(false);
    try {
      const options = {
        mediaType: 'photo' as const,
        quality: 0.8,
        saveToPhotos: true,
      };

      const result = type === 'camera' 
        ? await launchCamera(options) 
        : await launchImageLibrary(options);

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
        setImageTimestamp(Date.now()); // Update timestamp after successful upload
      }
    } catch (error) {
      console.error('Failed to update picture:', error);
      setIsUploading(false);
      Alert.alert('Error', 'Failed to capture or select image');
    }
  };

  const getProfileImageUrl = (path: string | null) => {
    if (!path) return null;
    
    if (path.startsWith('http')) {
      return path.includes('?') ? `${path}&t=${imageTimestamp}` : `${path}?t=${imageTimestamp}`;
    }
    
    const baseUrl = 'https://arpeggioed-anaya-nonostensively.ngrok-free.dev';
    let normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Most Laravel/PHP backends serve files from the storage directory
    if (!normalizedPath.startsWith('/storage/') && !normalizedPath.startsWith('/public/')) {
      normalizedPath = `/storage${normalizedPath}`;
    }

    return `${baseUrl}${normalizedPath}?t=${imageTimestamp}`;
  };

  const displayName = profile?.personal?.name || user?.name || draft.fullName || 'Your profile';
  const displayEmail = profile?.personal?.email || user?.email || draft.email || '';
  const displayPhone = profile?.personal?.phone || user?.phone || draft.phone || '';

  const salaryLabel = useMemo(() => {
    const pref = profile?.preferences;
    if (pref?.expected_salary_min || pref?.expected_salary_max) {
      if (pref.expected_salary_min === 0 && pref.expected_salary_max === 0) {
        return 'Not set';
      }
      const min = pref.expected_salary_min ? `₹${pref.expected_salary_min.toLocaleString()}` : '0';
      const max = pref.expected_salary_max ? `₹${pref.expected_salary_max.toLocaleString()}` : 'Max';
      return `${min} - ${max}`;
    }
    return SALARY_OPTIONS.find(o => o.id === draft.expectedSalary)?.label ?? 'Not set';
  }, [profile?.preferences, draft.expectedSalary]);

  const job_category = useMemo(() => {
    const pref = profile?.preferences;
    if (pref?.job_category) {
      const cat = pref.job_category;
      return typeof cat === 'object' ? cat.name : cat;
    }
    const labels = draft.jobCategoryIds
      .map(id => JOB_CATEGORIES.find(c => c.id === id)?.label)
      .filter(Boolean) as string[];
    if (labels.length === 0) {
      return 'Not set';
    }
    return labels.slice(0, 3).join(' · ');
  }, [profile?.preferences, draft.jobCategoryIds]);

  const locationLine = useMemo(() => {
    const city = profile?.preferences?.current_city;
    if (city) {
      return typeof city === 'object' ? (city.label || city.city) : city;
    }
    return draft.city || draft.area
      ? [draft.city, draft.area].filter(Boolean).join(' · ')
      : 'Add your location';
  }, [profile?.preferences, draft.city, draft.area]);

  const qualificationText = useMemo(() => {
    const qual = profile?.education?.qualification;
    if (qual) {
      return typeof qual === 'object' ? qual.name : qual;
    }
    return draft.qualification || 'Qualification not set';
  }, [profile?.education, draft.qualification]);

  const experienceText = useMemo(() => {
    if (profile?.experience?.experience_type) {
      const type = profile.experience.experience_type;
      const years = profile.experience.total_experience_years;
      return type === 'fresher' ? 'Fresher' : `${years} years experience`;
    }
    return draft.isFresher
      ? 'Fresher'
      : draft.experienceYears
        ? `${draft.experienceYears} years`
        : 'Not set';
  }, [profile?.experience, draft.isFresher, draft.experienceYears]);

  const resumeText = useMemo(() => {
    if (profile?.resume?.has_resume) {
      return profile.resume.resume_original_name || 'Resume uploaded';
    }
    return draft.resumeName
      ? draft.resumeName
      : draft.resumeSkipped
        ? 'Skipped — add a file anytime'
        : 'No resume uploaded';
  }, [profile?.resume, draft.resumeName, draft.resumeSkipped]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: 'transparent' }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 80 },
        ]}>
        <Animated.View style={[
          styles.hero,
          {
            backgroundColor: 'transparent',
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
          }
        ]}>
          <View style={styles.avatarWrapper}>
            <Pressable
              onPress={handleUpdatePicture}
              disabled={isUploading}
              style={styles.avatarContainer}
            >
              <View style={[styles.avatarCircle, { backgroundColor: colors.surfaceHighlight }]}>
                {profile?.personal?.profile_picture_url ? (
                  <Image
                    source={{ uri: getProfileImageUrl(profile.personal.profile_picture_url) || '' }}
                    style={styles.avatarImage}
                  />
                ) : displayName.trim() ? (
                  <Text style={[typography.appTitle, { color: colors.primary, fontSize: 28 }]}>
                    {profileInitials(displayName)}
                  </Text>
                ) : (
                  <Icon name="user" size={40} color={colors.primary} />
                )}
                
                {isUploading && (
                  <View style={[StyleSheet.absoluteFill, styles.uploadingOverlay]}>
                    <ActivityIndicator color={colors.onPrimary} size="small" />
                  </View>
                )}
              </View>

              <View style={[styles.cameraOverlay, { backgroundColor: colors.primary }]}>
                <Icon name="camera" size={10} color={colors.onPrimary} />
              </View>
            </Pressable>
          </View>
          <Text style={[typography.appTitle, { color: colors.textPrimary, textAlign: 'center' }]}>
            {displayName}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
            {displayEmail}
          </Text>

          <AnimatedProgressBar colors={colors} progress={completion?.percentage || 0} />

          <PrimaryButton
            title="Edit profile"
            onPress={() => navigation.navigate('ProfilePersonalInfo')}
            colors={colors}
            variant="secondary"
            style={styles.editBtn}
          />
        </Animated.View>

        <Text style={[typography.sectionTitle, styles.sectionTitle, { color: colors.textPrimary }]}>
          Profile
        </Text>
        <View style={styles.sectionBlock}>
          <Animated.View style={{ opacity: staggerAnims[0], transform: [{ translateY: staggerAnims[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <SectionRow
              title="Personal info"
              subtitle={`${displayName} · ${displayPhone}`}
              colors={colors}
              onPress={() => navigation.navigate('ProfilePersonalInfo')}
            />
          </Animated.View>
          <Animated.View style={{ opacity: staggerAnims[1], transform: [{ translateY: staggerAnims[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <SectionRow
              title="Education"
              subtitle={qualificationText}
              colors={colors}
              onPress={() => navigation.navigate('ProfileEducation')}
            />
          </Animated.View>
          <Animated.View style={{ opacity: staggerAnims[2], transform: [{ translateY: staggerAnims[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <SectionRow
              title="Experience"
              subtitle={experienceText}
              colors={colors}
              onPress={() => navigation.navigate('ProfileExperience')}
            />
          </Animated.View>
          <Animated.View style={{ opacity: staggerAnims[3], transform: [{ translateY: staggerAnims[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <SectionRow
              title="Job preferences"
              subtitle={`${job_category} · ${salaryLabel}`}
              colors={colors}
              onPress={() => navigation.navigate('ProfileJobPreferences')}
            />
          </Animated.View>
          <Animated.View style={{ opacity: staggerAnims[4], transform: [{ translateY: staggerAnims[4].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <SectionRow
              title="Resume"
              subtitle={resumeText}
              colors={colors}
              onPress={() => navigation.navigate('ProfileResume')}
            />
          </Animated.View>
        </View>

        <Text style={[typography.sectionTitle, styles.sectionTitle, { color: colors.textPrimary }]}>
          Settings
        </Text>
        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}>
          <View style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingsRowText}>
              <Icon name="bell-o" size={18} color={colors.primary} style={styles.settingsIcon} />
              <View>
                <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Notifications</Text>
                <Text style={[typography.small, { color: colors.textSecondary }]}>
                  Job alerts and application updates
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsOn}
              onValueChange={setNotificationsOn}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationsOn ? colors.onPrimary : colors.surfaceSecondary}
            />
          </View>
          <View style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingsRowText}>
              <Icon
                name={mode === 'dark' ? 'moon-o' : 'sun-o'}
                size={18}
                color={colors.primary}
                style={styles.settingsIcon}
              />
              <View>
                <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Dark mode</Text>
                <Text style={[typography.small, { color: colors.textSecondary }]}>
                  Use dark theme across the app
                </Text>
              </View>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={v => setMode(v ? 'dark' : 'light')}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={mode === 'dark' ? colors.onPrimary : colors.surfaceSecondary}
            />
          </View>
          <Pressable
            onPress={() => navigation.navigate('ProfileAccountSetting')}
            style={({ pressed }) => [
              styles.settingsRow,
              { borderBottomColor: colors.border },
              pressed && { backgroundColor: colors.surfaceSecondary }
            ]}>
            <View style={styles.settingsRowText}>
              <Icon name="cog" size={18} color={colors.primary} style={styles.settingsIcon} />
              <View>
                <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Account Setting</Text>
                <Text style={[typography.small, { color: colors.textSecondary }]}>
                  Manage your personal information
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={14} color={colors.textPlaceholder} />
          </Pressable>

          <Pressable
            onPress={handleLogout}
            disabled={authLoading}
            style={[styles.logoutPress, authLoading && { opacity: 0.5 }]}
            accessibilityRole="button"
            accessibilityLabel="Log out">
            <Icon name="sign-out" size={18} color={colors.error} style={styles.settingsIcon} />
            <Text style={[typography.labelMedium, { color: colors.error }]}>Log out</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowImagePicker(false)}
        >
          <View style={[styles.pickerContainer, { backgroundColor: colors.surface }]}>
            <View style={[styles.pickerLine, { backgroundColor: colors.border }]} />
            <Text style={[typography.labelMedium, { color: colors.textPrimary, marginBottom: 20 }]}>
              Update Profile Picture
            </Text>
            
            <View style={styles.pickerOptions}>
              <Pressable 
                style={styles.pickerItem} 
                onPress={() => processImage('camera')}
              >
                <View style={[styles.pickerIconWrap, { backgroundColor: colors.primary + '15' }]}>
                  <Icon name="camera" size={24} color={colors.primary} />
                </View>
                <Text style={[typography.small, { color: colors.textPrimary }]}>Camera</Text>
              </Pressable>

              <Pressable 
                style={styles.pickerItem} 
                onPress={() => processImage('gallery')}
              >
                <View style={[styles.pickerIconWrap, { backgroundColor: '#8B5CF6' + '15' }]}>
                  <Icon name="image" size={24} color="#8B5CF6" />
                </View>
                <Text style={[typography.small, { color: colors.textPrimary }]}>Gallery</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        colors={colors}
        loading={authLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editBtn: {
    marginTop: spacing.md,
    width: '100%',
    maxWidth: 280,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionBlock: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionRow: {
    ...components.jobCard,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sectionRowText: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.sm,
  },
  settingsCard: {
    ...components.jobCard,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  settingsRowText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  settingsIcon: {
    marginTop: 2,
  },
  logoutPress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  // Animation Styles
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  pulseCircle: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  uploadingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    width: '100%',
    maxWidth: 280,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBarBase: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  bubble: {
    position: 'absolute',
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },
  pickerLine: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
  },
  pickerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  pickerItem: {
    alignItems: 'center',
    gap: 8,
  },
  pickerIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});

export default ProfileOverviewScreen;
