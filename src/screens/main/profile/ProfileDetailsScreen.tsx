import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Easing, Image, ActivityIndicator, Modal, Dimensions, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { fetchProfile, fetchProfileCompletion, updateProfilePicture, deleteProfilePicture } from '../../../redux/slice/profileSlice';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ProfileStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { radius } from '../../../theme/radius';
import { BASE_URL } from '../../../api/axiosInstance';
import { useProfileSetup } from '../../../context/ProfileSetupContext';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import ConfirmationModal from '../../../components/ConfirmationModal';

type Nav = StackNavigationProp<ProfileStackParamList, 'ProfileDetails'>;

const { width, height } = Dimensions.get('window');

function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

const ProfileDetailsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { draft } = useProfileSetup();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: profile, completion } = useSelector((state: RootState) => state.profile);

  const [imageError, setImageError] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [profile?.personal?.profile_picture_url, user?.profile_picture_url]);

  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 2200, easing: Easing.linear, useNativeDriver: true })
    );
    shimmerLoop.start();
    return () => shimmerLoop.stop();
  }, [shimmerAnim]);

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

  const isSectionMissing = (key: string) => completion?.missing_sections?.includes(key);

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
        <View style={[
          styles.tileIconContainer,
          { backgroundColor: (isMissing ? colors.error : (color || colors.primary)) + '15' },
        ]}>
          <Icon name={icon} size={20} color={isMissing ? colors.error : (color || colors.primary)} />
        </View>
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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>Profile Details</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
        {/* Profile Header in Details Screen */}
        <View style={styles.profileHeader}>
          <View style={styles.headerTop}>
            <View style={styles.avatarWrapper}>
              <Pressable
                onPress={() => profilePic ? setShowImageViewer(true) : setShowImagePicker(true)}
                style={[styles.avatarCircle, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
              >
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
              </Pressable>
              <Pressable
                onPress={() => setShowImagePicker(true)}
                style={[styles.cameraBadge, { backgroundColor: colors.primary }]}
              >
                <Icon name="camera" size={12} color="#FFF" />
              </Pressable>
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={[typography.appTitle, { color: colors.textPrimary, fontSize: 20 }]} numberOfLines={1}>{displayName}</Text>
                <Icon name="check-circle" size={14} color={colors.success} style={{ marginLeft: 4 }} />
              </View>
              <Text style={[typography.body, { color: colors.textSecondary }]} numberOfLines={1}>{displayEmail}</Text>
            </View>
          </View>

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

        <View style={styles.sectionHeader}>
          <Text style={[typography.labelMedium, { color: colors.textSecondary, letterSpacing: 1 }]}>PROFESSIONAL INFO</Text>
        </View>

        <View style={styles.tilesRow}>
          <ProfileTile title="Experience" subtitle="Work History" icon="briefcase" color="#3B82F6" onPress={() => navigation.navigate('ProfileExperience')} isMissing={isSectionMissing('experience')} />
          <ProfileTile title="Education" subtitle="Degree/College" icon="book-open" color="#10B981" onPress={() => navigation.navigate('ProfileEducation')} isMissing={isSectionMissing('education')} />
        </View>

        <View style={styles.tilesRow}>
          <ProfileTile title="Job Preferences" subtitle="Role & Location" icon="target" color="#F59E0B" onPress={() => navigation.navigate('ProfileJobPreferences')} isMissing={isSectionMissing('preferences')} />
          <ProfileTile title="Resume" subtitle="CV/Documents" icon="file-text" color="#8B5CF6" onPress={() => navigation.navigate('ProfileResume')} isMissing={isSectionMissing('resume')} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[typography.labelMedium, { color: colors.textSecondary, letterSpacing: 1, marginTop: 24 }]}>PERSONAL INFO</Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('ProfilePersonalInfo')}
          style={[styles.wideItem, { backgroundColor: colors.surface, borderColor: isSectionMissing('personal') ? colors.error : colors.border }]}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: (isSectionMissing('personal') ? colors.error : colors.primary) + '15' }]}>
            <Icon name="user" size={18} color={isSectionMissing('personal') ? colors.error : colors.primary} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Personal Details</Text>
            <Text style={[typography.small, { color: colors.textSecondary }]}>Email, Phone, Bio, and more</Text>
          </View>
          <Icon name="chevron-right" size={16} color={colors.textPlaceholder} />
        </Pressable>

      </ScrollView>

      {/* Image Management Modals */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: 16,
  },
  backBtn: {
    padding: 4,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    flexGrow: 1,
    paddingBottom: 40,
  },
  profileHeader: {
    marginBottom: 12,
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF'
  },
  uploadingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  pickerContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40
  },
  pickerLine: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24
  },
  pickerMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16
  },
  pickerIconWrapSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  viewerBackground: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  viewerClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10
  },
  fullImage: {
    width: width,
    height: height * 0.8
  },
  viewerFooter: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center'
  },
  headerInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  strengthContainer: {
    marginTop: 16,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  strengthBarBase: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  tile: {
    flex: 1,
    padding: 16,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileAddBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileDoneBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  shimmerBeam: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    zIndex: 1,
  },
  tipCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  }
});

export default ProfileDetailsScreen;
