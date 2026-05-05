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
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { logoutCandidate } from '../../../redux/slice/authSlice';
import { fetchProfile, updateProfilePicture, fetchProfileCompletion } from '../../../redux/slice/profileSlice';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useProfileSetup } from '../../../context/ProfileSetupContext';
import type { ProfileStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { logoutToLogin } from './logoutToLogin';
import LogoutModal from '../../../components/LogoutModal';
import { PrimaryButton } from '../../../components/auth';
import GuestView from '../../../components/GuestView';
import SkeletonPulse from '../../../components/SkeletonPulse';

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
  const { draft } = useProfileSetup();
  const { user, loading: authLoading, isLoggedIn } = useSelector((state: RootState) => state.auth);
  const { data: profileData, completion, loading: profileLoading } = useSelector((state: RootState) => state.profile);
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

  // Optimized Animation Values (Native Driver Compatible)
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;
  const floatAnim = React.useRef(new Animated.Value(0)).current;

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

    return () => {
      shimmerLoop.stop();
      floatLoop.stop();
    };
  }, [shimmerAnim, floatAnim]);

  const profile = profileData;

  React.useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchProfile());
      dispatch(fetchProfileCompletion());
    }
  }, [dispatch, isLoggedIn]);

  const { resetDraft } = useProfileSetup();

  const confirmLogout = () => {
    dispatch(logoutCandidate());
    resetDraft();
    setShowLogoutModal(false);
    logoutToLogin(navigation);
  };

  const processImage = async (type: 'camera' | 'gallery') => {
    setShowImagePicker(false);
    try {
      const options = { mediaType: 'photo' as const, quality: 0.8, saveToPhotos: true };
      const result = type === 'camera' ? await launchCamera(options) : await launchImageLibrary(options);
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

  const getProfileImageUrl = (path: string | null) => {
    if (!path) return null;
    const baseUrl = 'https://jobindia.ai';
    let normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (!normalizedPath.startsWith('/storage/') && !normalizedPath.startsWith('/public/')) {
      normalizedPath = `/storage${normalizedPath}`;
    }
    return `${baseUrl}${normalizedPath}?t=${imageTimestamp}`;
  };

  const displayName = profile?.personal?.name || user?.name || draft.fullName || 'User';
  const displayEmail = profile?.personal?.email || user?.email || draft.email || '';
  const profilePic = profile?.personal?.profile_picture_url ? getProfileImageUrl(profile.personal.profile_picture_url) : null;

  const isSectionMissing = (key: string) => completion?.missing_sections?.includes(key);

  const SectionHeader = ({ title }: { title: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={[typography.labelMedium, { color: colors.textSecondary, letterSpacing: 1 }]}>{title.toUpperCase()}</Text>
      <View style={[styles.headerLine, { backgroundColor: colors.border }]} />
    </View>
  );

  const ProfileTile = ({ title, subtitle, icon, onPress, isMissing, color }: any) => {
    const shimmerTranslate = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-150, 150] });
    return (
      <Pressable 
        onPress={onPress}
        style={({ pressed }) => [
          styles.tile,
          { backgroundColor: colors.surface, borderColor: isMissing ? colors.error : colors.border },
          pressed && { opacity: 0.8 }
        ]}
      >
        {isMissing && (
          <Animated.View style={[styles.shimmerBeam, { backgroundColor: colors.primary + '25', transform: [{ translateX: shimmerTranslate }, { skewX: '-20deg' }] }]} />
        )}
        <Animated.View style={[
          styles.tileIconContainer, 
          { backgroundColor: (isMissing ? colors.error : (color || colors.primary)) + '15' },
          isMissing && { transform: [{ translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }] }
        ]}>
          <Icon name={icon} size={20} color={isMissing ? colors.error : (color || colors.primary)} />
        </Animated.View>
        <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: 12 }]} numberOfLines={1}>{title}</Text>
        <Text style={[typography.small, { color: isMissing ? colors.error : colors.textSecondary, marginTop: 4 }]} numberOfLines={1}>
          {isMissing ? 'Missing' : subtitle}
        </Text>
        {isMissing ? (
          <View style={[styles.tileAddBadge, { backgroundColor: colors.error }]}><Icon name="plus" size={10} color="#FFF" /></View>
        ) : (
          <View style={[styles.tileDoneBadge, { backgroundColor: colors.success + '20' }]}><Icon name="check" size={10} color={colors.success} /></View>
        )}
      </Pressable>
    );
  };

  const WideMenuItem = ({ title, subtitle, icon, onPress, isMissing, color }: any) => {
    const shimmerTranslate = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-width, width] });
    return (
      <Pressable 
        onPress={onPress}
        style={({ pressed }) => [
          styles.wideItem,
          { backgroundColor: colors.surface, borderColor: isMissing ? colors.error : colors.border },
          pressed && { opacity: 0.8 }
        ]}
      >
        {isMissing && (
          <Animated.View style={[styles.shimmerBeam, { backgroundColor: colors.primary + '25', transform: [{ translateX: shimmerTranslate }, { skewX: '-20deg' }] }]} />
        )}
        <View style={[styles.menuIconContainer, { backgroundColor: (isMissing ? colors.error : (color || colors.primary)) + '15' }]}>
          <Icon name={icon} size={18} color={isMissing ? colors.error : (color || colors.primary)} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>{title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[typography.small, { color: isMissing ? colors.error : colors.textSecondary }]} numberOfLines={1}>
              {isMissing ? 'Missing! Add now to boost profile ' : subtitle}
            </Text>
            {isMissing && <Image source={require('../../../assets/rocket-bg.png')} style={{ width: 14, height: 14, marginLeft: 4, resizeMode: 'contain' }} />}
          </View>
        </View>
        <Icon name={isMissing ? "plus-circle" : "chevron-right"} size={16} color={isMissing ? colors.error : colors.textPlaceholder} />
      </Pressable>
    );
  };

  const ProfileSkeleton = () => (
    <View style={styles.scroll}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <SkeletonPulse style={[styles.avatarCircle, { width: 74, height: 74, borderRadius: 37 }]} />
          <View style={styles.headerInfo}>
            <SkeletonPulse style={{ height: 24, width: '60%', borderRadius: 4, marginBottom: 8 }} />
            <SkeletonPulse style={{ height: 16, width: '40%', borderRadius: 4 }} />
          </View>
        </View>
        <View style={{ marginTop: 20 }}>
          <SkeletonPulse style={{ height: 40, width: '100%', borderRadius: 12 }} />
        </View>
      </View>
      <View style={styles.menuContainer}>
        <SkeletonPulse style={{ height: 15, width: 100, borderRadius: 4, marginBottom: 15, marginTop: 10 }} />
        <View style={styles.tilesRow}>
          <SkeletonPulse style={{ flex: 1, height: 120, borderRadius: 20 }} />
          <SkeletonPulse style={{ flex: 1, height: 120, borderRadius: 20 }} />
        </View>
        <View style={styles.tilesRow}>
          <SkeletonPulse style={{ flex: 1, height: 120, borderRadius: 20 }} />
          <SkeletonPulse style={{ flex: 1, height: 120, borderRadius: 20 }} />
        </View>
        <SkeletonPulse style={{ height: 15, width: 100, borderRadius: 4, marginBottom: 15, marginTop: 20 }} />
        <SkeletonPulse style={{ height: 70, width: '100%', borderRadius: 20, marginBottom: 10 }} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {!isLoggedIn ? (
        <GuestView 
          title="Unlock Your Potential"
          subtitle="Register now to apply for jobs, track your applications, and get personalized recommendations."
          icon="user-plus"
        />
      ) : profileLoading && !profileData ? (
        <ProfileSkeleton />
      ) : (
        <>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable onPress={() => setShowImagePicker(true)} style={styles.avatarWrapper}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                {profilePic ? (
                  <Image source={{ uri: profilePic }} style={styles.avatarImage} />
                ) : (
                  <Text style={[typography.appTitle, { color: colors.primary, fontSize: 24 }]}>{profileInitials(displayName)}</Text>
                )}
                {isUploading && (
                  <View style={[StyleSheet.absoluteFill, styles.uploadingOverlay]}>
                    <ActivityIndicator color="#FFF" size="small" />
                  </View>
                )}
              </View>
              <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}><Icon name="camera" size={12} color="#FFF" /></View>
            </Pressable>
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={[typography.appTitle, { color: colors.textPrimary, fontSize: 22 }]} numberOfLines={1}>{displayName}</Text>
                <Icon name="check-circle" size={14} color={colors.success} style={{ marginLeft: 4 }} />
              </View>
              <Text style={[typography.body, { color: colors.textSecondary }]} numberOfLines={1}>{displayEmail}</Text>
              <Pressable onPress={() => navigation.navigate('ProfilePersonalInfo')} style={[styles.editBadge, { backgroundColor: colors.primary + '10' }]}>
                <Text style={[typography.small, { color: colors.primary, fontWeight: 'bold' }]}>Edit Profile</Text>
              </Pressable>
            </View>
          </View>
          {completion && completion.percentage < 100 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthHeader}>
                <Text style={[typography.small, { color: colors.textPrimary, fontWeight: 'bold' }]}>Profile Strength</Text>
                <Text style={[typography.small, { color: colors.primary }]}>{completion?.percentage || 0}%</Text>
              </View>
              <View style={[styles.strengthBarBase, { backgroundColor: colors.surfaceHighlight }]}>
                <View style={[styles.strengthBarFill, { backgroundColor: colors.primary, width: `${completion?.percentage || 0}%` }]} />
              </View>
            </View>
          )}
        </View>

        <View style={styles.menuContainer}>
          <SectionHeader title="Profile Details" />
          <View style={styles.tilesRow}>
            <ProfileTile title="Experience" subtitle="Work History" icon="briefcase" color="#3B82F6" onPress={() => navigation.navigate('ProfileExperience')} isMissing={isSectionMissing('experience')} />
            <ProfileTile title="Education" subtitle="Degree/College" icon="book-open" color="#10B981" onPress={() => navigation.navigate('ProfileEducation')} isMissing={isSectionMissing('education')} />
          </View>
          <View style={styles.tilesRow}>
            <ProfileTile title="Preferences" subtitle="Job & Salary" icon="target" color="#F59E0B" onPress={() => navigation.navigate('ProfileJobPreferences')} isMissing={isSectionMissing('preferences')} />
            <ProfileTile title="Resume" subtitle="CV/Documents" icon="file-text" color="#8B5CF6" onPress={() => navigation.navigate('ProfileResume')} isMissing={isSectionMissing('resume')} />
          </View>

          <SectionHeader title="Other Information" />
          <WideMenuItem title="Personal Info" subtitle="Email, Phone, Bio" icon="user" onPress={() => navigation.navigate('ProfilePersonalInfo')} isMissing={isSectionMissing('personal')} />

          <SectionHeader title="Settings" />
          <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingsRow}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#64748B15' }]}>
                <Icon name={mode === 'dark' ? 'moon' : 'sun'} size={18} color="#64748B" />
              </View>
              <View style={styles.menuTextContainer}><Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Dark Mode</Text></View>
              <Switch value={mode === 'dark'} onValueChange={v => setMode(v ? 'dark' : 'light')} trackColor={{ false: colors.border, true: colors.primaryLight }} thumbColor="#FFF" />
            </View>
            <Pressable onPress={() => navigation.navigate('ProfileAccountSetting')} style={styles.settingsRow}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#64748B15' }]}>
                <Icon name="lock" size={18} color="#64748B" />
              </View>
              <View style={styles.menuTextContainer}><Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Account Security</Text></View>
              <Icon name="chevron-right" size={16} color={colors.textPlaceholder} />
            </Pressable>
          </View>

          <Pressable onPress={() => setShowLogoutModal(true)} style={[styles.logoutBtn, { borderColor: colors.error + '30' }]}>
            <Icon name="log-out" size={18} color={colors.error} />
            <Text style={[typography.labelMedium, { color: colors.error, marginLeft: 12 }]}>Sign Out from App</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Modals same as before */}
      <Modal visible={showImagePicker} transparent animationType="fade" onRequestClose={() => setShowImagePicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowImagePicker(false)}>
          <View style={[styles.pickerContainer, { backgroundColor: colors.surface }]}>
            <View style={[styles.pickerLine, { backgroundColor: colors.border }]} />
            <Text style={[typography.labelMedium, { color: colors.textPrimary, marginBottom: 24 }]}>Profile Picture</Text>
            {profilePic && (
              <Pressable style={styles.pickerMenuRow} onPress={() => { setShowImagePicker(false); setShowImageViewer(true); }}>
                <View style={[styles.pickerIconWrapSmall, { backgroundColor: colors.primary + '10' }]}><Icon name="eye" size={18} color={colors.primary} /></View>
                <Text style={[typography.labelMedium, { color: colors.textPrimary, marginLeft: 16 }]}>View Profile Picture</Text>
              </Pressable>
            )}
            <Pressable style={styles.pickerMenuRow} onPress={() => processImage('camera')}>
              <View style={[styles.pickerIconWrapSmall, { backgroundColor: colors.primary + '10' }]}><Icon name="camera" size={18} color={colors.primary} /></View>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginLeft: 16 }]}>Take Photo</Text>
            </Pressable>
            <Pressable style={styles.pickerMenuRow} onPress={() => processImage('gallery')}>
              <View style={[styles.pickerIconWrapSmall, { backgroundColor: '#8B5CF610' }]}><Icon name="image" size={18} color="#8B5CF6" /></View>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginLeft: 16 }]}>Choose from Gallery</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showImageViewer} transparent animationType="slide" onRequestClose={() => setShowImageViewer(false)}>
        <View style={styles.viewerBackground}>
          <StatusBar barStyle="light-content" />
          <Pressable style={styles.viewerClose} onPress={() => setShowImageViewer(false)}>
            <Icon name="x" size={24} color="#FFF" />
          </Pressable>
          {profilePic && <Image source={{ uri: profilePic }} style={styles.fullImage} resizeMode="contain" />}
          <View style={styles.viewerFooter}><Text style={[typography.labelMedium, { color: '#FFF' }]}>{displayName}</Text></View>
        </View>
      </Modal>

      <LogoutModal visible={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={confirmLogout} colors={colors} loading={authLoading} />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 160 },
  header: { padding: spacing.md, paddingBottom: spacing.xs },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  avatarWrapper: { position: 'relative' },
  avatarCircle: { width: 74, height: 74, borderRadius: 37, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cameraBadge: { position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFF' },
  headerInfo: { marginLeft: spacing.md, flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 1 },
  editBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  strengthContainer: { marginTop: 16 },
  strengthHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  strengthBarBase: { height: 5, borderRadius: 2.5, overflow: 'hidden' },
  strengthBarFill: { height: '100%', borderRadius: 2.5 },
  menuContainer: { paddingHorizontal: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 12 },
  headerLine: { flex: 1, height: 1, marginLeft: 10, opacity: 0.3 },
  tilesRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  tile: { flex: 1, padding: 12, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  tileIconContainer: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tileAddBadge: { position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tileDoneBadge: { position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  wideItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 20, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  menuIconContainer: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuTextContainer: { flex: 1, marginLeft: 12 },
  settingsCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.05)' },
  logoutBtn: { marginTop: 24, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed' },
  shimmerBeam: { position: 'absolute', top: 0, bottom: 0, width: 100, zIndex: 1 },
  neonDot: { width: 4, height: 4, borderRadius: 2, marginLeft: 6 },
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
});

export default ProfileOverviewScreen;
