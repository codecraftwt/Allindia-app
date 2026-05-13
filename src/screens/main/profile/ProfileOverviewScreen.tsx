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
import { fetchProfile, updateProfilePicture, deleteProfilePicture, fetchProfileCompletion } from '../../../redux/slice/profileSlice';
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
import { BASE_URL } from '../../../api/axiosInstance';
import LogoutModal from '../../../components/LogoutModal';
import ConfirmationModal from '../../../components/ConfirmationModal';
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
  const insets = useSafeAreaInsets();
  const { draft } = useProfileSetup();
  const { user, loading: authLoading, isLoggedIn } = useSelector((state: RootState) => state.auth);
  const { data: profileData, completion, loading: profileLoading } = useSelector((state: RootState) => state.profile);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [profile?.personal?.profile_picture_url, user?.profile_picture_url]);

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

  const getProfileImageUrl = (path: string | null) => {
    if (!path) return null;
    const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    if (path.startsWith('http')) return path;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}?t=${imageTimestamp}`;
  };

  const displayName = profile?.personal?.name || user?.name || draft.fullName || 'User';
  const displayEmail = profile?.personal?.email || user?.email || draft.email || '';
  const profilePic = (profile?.personal?.profile_picture_url || user?.profile_picture_url)
    ? getProfileImageUrl(profile?.personal?.profile_picture_url || user?.profile_picture_url)
    : null;

  const isSectionMissing = (key: string) => completion?.missing_sections?.includes(key);

  const SectionHeader = ({ title }: { title: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={[typography.labelMedium, { color: colors.textSecondary, letterSpacing: 1 }]}>{title.toUpperCase()}</Text>
      <View style={[styles.headerLine, { backgroundColor: colors.border }]} />
    </View>
  );

  const ProfileTile = ({ title, subtitle, icon, onPress, isMissing, color }: any) => {
    const shimmerTranslate = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-150, 150] });

    const handlePress = () => {
      requestAnimationFrame(() => {
        onPress();
      });
    };

    return (
      <Pressable
        onPress={handlePress}
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

    const handlePress = () => {
      requestAnimationFrame(() => {
        onPress();
      });
    };

    return (
      <Pressable
        onPress={handlePress}
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
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={[styles.avatarCircle, { width: 74, height: 74, borderRadius: 37, backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center' }]}>
            <Icon name="user" size={32} color={colors.border} />
          </View>
          <View style={styles.headerInfo}>
            <SkeletonPulse style={{ height: 24, width: '60%', borderRadius: 4, marginBottom: 8 }} />
            <SkeletonPulse style={{ height: 16, width: '40%', borderRadius: 4 }} />
            <SkeletonPulse style={{ height: 28, width: 80, borderRadius: 14, marginTop: 12 }} />
          </View>
        </View>
        <View style={styles.strengthContainer}>
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
    </ScrollView>
  );

  const renderContent = () => {
    if (!isLoggedIn) {
      return (
        <GuestView
          title="Unlock Your Potential"
          subtitle="Register now to apply for jobs, track your applications, and get personalized recommendations."
          icon="user-plus"
        />
      );
    }

    if (profileLoading && !profileData) {
      return <ProfileSkeleton />;
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.navigate('ProfileDetails')}
            style={({ pressed }) => [
              styles.headerTop,
              pressed && { opacity: 0.7 }
            ]}
          >
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                {profilePic && !imageError ? (
                  <Image
                    source={{ uri: profilePic }}
                    style={styles.avatarImage}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary + '10' }]}>
                    {displayName && displayName !== 'User' ? (
                      <Text style={[typography.h3, { color: colors.primary, fontSize: 24, fontWeight: 'bold' }]}>
                        {profileInitials(displayName)}
                      </Text>
                    ) : (
                      <Icon name="user" size={36} color={colors.primary} />
                    )}
                  </View>
                )}
                {isUploading && (
                  <View style={[StyleSheet.absoluteFill, styles.uploadingOverlay]}>
                    <ActivityIndicator color="#FFF" size="small" />
                  </View>
                )}
              </View>
              <Pressable onPress={() => setShowImagePicker(true)} style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
                <Icon name="camera" size={12} color="#FFF" />
              </Pressable>
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={[typography.appTitle, { color: colors.textPrimary, fontSize: 22 }]} numberOfLines={1}>{displayName}</Text>
                <Icon name="check-circle" size={14} color={colors.success} style={{ marginLeft: 4 }} />
              </View>
              <Text style={[typography.body, { color: colors.textSecondary }]} numberOfLines={1}>{displayEmail}</Text>
              <View style={[styles.editBadge, { backgroundColor: colors.primary + '10' }]}>
                <Text style={[typography.small, { color: colors.primary, fontWeight: 'bold' }]}>View Profile Details</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textPlaceholder} />
          </Pressable>

          {completion && completion.percentage < 100 && (
            <View style={[styles.strengthContainer, { marginTop: 20 }]}>
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

        {/* Action Dashboard - Modern Dynamic Layout */}
        <View style={styles.dashboardGrid}>
          {/* Left Large Card: Applied Jobs */}
          <Pressable
            onPress={() => navigation.navigate('Applications' as any)}
            style={({ pressed }) => [
              styles.dashboardCardLarge,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.9, scale: 0.98 }
            ]}
          >
            <View style={[styles.dashboardIconBoxLarge, { backgroundColor: '#3B82F615' }]}>
              <Icon name="briefcase" size={28} color="#3B82F6" />
            </View>
            <View style={styles.dashboardCardContent}>
              <Text style={[typography.h4, { color: colors.textPrimary, fontSize: 18 }]}>Applied</Text>
              <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4 }]}>Track your job status</Text>
            </View>
            <View style={[styles.cardTag, { backgroundColor: '#3B82F610' }]}>
              <Text style={{ color: '#3B82F6', fontSize: 10, fontWeight: 'bold' }}>ACTIVITY</Text>
            </View>
          </Pressable>

          {/* Right Stack: Saved & Reels */}
          <View style={styles.dashboardStack}>
            <Pressable
              onPress={() => navigation.navigate('Home' as any, { screen: 'Saved' })}
              style={({ pressed }) => [
                styles.dashboardCardSmall,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.9 }
              ]}
            >
              <View style={[styles.dashboardIconBoxSmall, { backgroundColor: '#F59E0B15' }]}>
                <Icon name="heart" size={18} color="#F59E0B" />
              </View>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginLeft: 10 }]}>Saved</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('JobReels' as any)}
              style={({ pressed }) => [
                styles.dashboardCardSmall,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.9 }
              ]}
            >
              <View style={[styles.dashboardIconBoxSmall, { backgroundColor: '#EC489915' }]}>
                <Icon name="play-circle" size={18} color="#EC4899" />
              </View>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginLeft: 10 }]}>Reels</Text>
            </Pressable>
          </View>
        </View>
        {/* Referral Section */}
        <View style={styles.menuContainer}>
          <SectionHeader title="Earn Rewards" />
          <Pressable
            style={[styles.wideItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#8B5CF615' }]}>
              <Icon name="gift" size={18} color="#8B5CF6" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Refer and Earn</Text>
              <Text style={[typography.small, { color: colors.textSecondary }]}>Invite your friends and earn rewards</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.textPlaceholder} />
          </Pressable>

          <SectionHeader title="Support" />
          <Pressable
            style={[styles.wideItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#10B98115' }]}>
              <Icon name="help-circle" size={18} color="#10B981" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Help & Support</Text>
              <Text style={[typography.small, { color: colors.textSecondary }]}>Contact us for any queries or issues</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.textPlaceholder} />
          </Pressable>

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
    );
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      {renderContent()}

      {/* Modals placed outside main content for stability */}
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
            {profilePic && (
              <Pressable style={styles.pickerMenuRow} onPress={handleDeletePicture}>
                <View style={[styles.pickerIconWrapSmall, { backgroundColor: colors.error + '10' }]}><Icon name="trash-2" size={18} color={colors.error} /></View>
                <Text style={[typography.labelMedium, { color: colors.error, marginLeft: 16 }]}>Remove Photo</Text>
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

      <LogoutModal visible={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={confirmLogout} colors={colors} loading={authLoading} />

      <ConfirmationModal
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeletePicture}
        title="Remove Photo"
        message="Are you sure you want to remove your profile picture? This action cannot be undone."
        confirmText="Remove"
        cancelText="Keep Photo"
        colors={colors}
        loading={isUploading}
        type="danger"
      />
    </View>
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
  dashboardGrid: { flexDirection: 'row', gap: 12, paddingHorizontal: spacing.md, marginBottom: 25, marginTop: 15 },
  dashboardCardLarge: { flex: 1.2, padding: 16, borderRadius: 24, borderWidth: 1, minHeight: 140, justifyContent: 'space-between', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  dashboardIconBoxLarge: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dashboardCardContent: { marginTop: 12 },
  cardTag: { position: 'absolute', top: 16, right: 16, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  dashboardStack: { flex: 1, gap: 12 },
  dashboardCardSmall: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 20, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  dashboardIconBoxSmall: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
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
