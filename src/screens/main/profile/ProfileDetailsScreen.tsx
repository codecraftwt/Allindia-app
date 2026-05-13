import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Easing, Image, ActivityIndicator, Modal, Dimensions, Alert, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
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

const { width } = Dimensions.get('window');

function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

const ProfileDetailsScreen = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { draft } = useProfileSetup();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: profile, completion, loading } = useSelector((state: RootState) => state.profile);

  const [imageError, setImageError] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchProfile()),
      dispatch(fetchProfileCompletion())
    ]);
    setRefreshing(false);
  }, [dispatch]);

  useEffect(() => {
    onRefresh();
  }, []);

  useEffect(() => {
    setImageError(false);
  }, [profile?.personal?.profile_picture_url, user?.profile_picture_url]);

  const getProfileImageUrl = (path: string | null) => {
    if (!path) return null;
    const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    if (path.startsWith('http')) return path;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}?t=${imageTimestamp}`;
  };

  const displayName = profile?.personal?.name || user?.name || draft.fullName || 'User';
  const displayEmail = profile?.personal?.email || user?.email || draft.email || '';
  const displayPhone = profile?.personal?.phone || user?.phone || 'Add phone number';
  const profilePic = (profile?.personal?.profile_picture_url || user?.profile_picture_url)
    ? getProfileImageUrl(profile?.personal?.profile_picture_url || user?.profile_picture_url)
    : null;

  const isSectionMissing = (key: string) => completion?.missing_sections?.includes(key);

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

  const SectionItem = ({ title, subtitle, icon, onPress, isMissing, color }: any) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sectionCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.7, backgroundColor: colors.surfaceHighlight }
      ]}
    >
      <View style={[styles.sectionIconBox, { backgroundColor: (color || colors.primary) + '10' }]}>
        <Icon name={icon} size={24} color={color || colors.primary} />
      </View>
      <View style={styles.sectionText}>
        <Text style={[typography.labelMedium, { color: colors.textPrimary, fontSize: 16 }]}>{title}</Text>
        <Text style={[typography.small, { color: isMissing ? colors.error : colors.textSecondary, marginTop: 2 }]}>
          {isMissing ? 'Not added yet' : subtitle}
        </Text>
      </View>
      {isMissing ? (
        <View style={[styles.statusBadge, { backgroundColor: colors.error + '15' }]}>
          <Text style={[typography.tiny, { color: colors.error, fontWeight: 'bold' }]}>ADD</Text>
        </View>
      ) : (
        <FeatherIcon name="chevron-right" size={20} color={colors.textPlaceholder} />
      )}
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.primary} />
      
      {/* Premium Header - WorkIndia Style */}
      <View style={[styles.headerContainer, { backgroundColor: colors.primary }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.topNav}>
            <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <FeatherIcon name="arrow-left" size={24} color="#FFFFFF" />
            </Pressable>
            <Text style={[typography.h4, { color: '#FFFFFF', fontWeight: 'bold' }]}>My Profile</Text>
            <Pressable onPress={() => navigation.navigate('ProfilePersonalInfo')} style={styles.iconBtn}>
              <FeatherIcon name="edit-3" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.profileSummary}>
            <View style={styles.avatarContainer}>
              <Pressable
                onPress={() => profilePic ? setShowImageViewer(true) : setShowImagePicker(true)}
                style={[styles.avatarCircle, { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' }]}
              >
                {profilePic && !imageError ? (
                  <Image source={{ uri: profilePic }} style={styles.avatarImage} onError={() => setImageError(true)} />
                ) : (
                  <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary + '20' }]}>
                    <Text style={[typography.h3, { color: colors.primary, fontSize: 32, fontWeight: 'bold' }]}>
                      {profileInitials(displayName)}
                    </Text>
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
                style={styles.cameraIconBtn}
              >
                <FeatherIcon name="camera" size={14} color={colors.primary} />
              </Pressable>
            </View>

            <View style={styles.summaryText}>
              <View style={styles.nameVerifiedRow}>
                <Text style={[typography.h3, { color: '#FFFFFF' }]} numberOfLines={1}>{displayName}</Text>
                <Icon name="check-decagram" size={20} color="#60A5FA" style={{ marginLeft: 6 }} />
              </View>
              <Text style={[typography.body, { color: 'rgba(255,255,255,0.8)', marginTop: 2 }]} numberOfLines={1}>{displayEmail}</Text>
              <View style={styles.phoneRow}>
                <FeatherIcon name="phone" size={12} color="rgba(255,255,255,0.6)" />
                <Text style={[typography.small, { color: 'rgba(255,255,255,0.8)', marginLeft: 6 }]}>{displayPhone}</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[colors.primary]} 
            tintColor={colors.primary}
          />
        }
      >
        {/* Profile Strength Card */}
        {completion && (
          <View style={[styles.strengthCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.strengthInfo}>
              <View>
                <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Profile Completeness</Text>
                <Text style={[typography.tiny, { color: colors.textSecondary, marginTop: 2 }]}>
                  {completion.percentage === 100 ? 'Your profile is perfect!' : 'Add missing details to get more job calls'}
                </Text>
              </View>
              <Text style={[typography.h4, { color: colors.primary }]}>{completion.percentage}%</Text>
            </View>
            <View style={[styles.progressBase, { backgroundColor: colors.surfaceSecondary }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${completion.percentage}%` }]} />
            </View>
          </View>
        )}

        <View style={styles.sectionTitleRow}>
          <Text style={[typography.labelMedium, { color: colors.textSecondary, fontWeight: 'bold' }]}>PROFESSIONAL DETAILS</Text>
        </View>

        <SectionItem 
          title="Work Experience" 
          subtitle={profile?.experience?.length ? `${profile.experience.length} Experience added` : "Add your past jobs"}
          icon="briefcase-variant-outline" 
          color="#3B82F6" 
          onPress={() => navigation.navigate('ProfileExperience')} 
          isMissing={isSectionMissing('experience')} 
        />

        <SectionItem 
          title="Education" 
          subtitle={profile?.education?.length ? `${profile.education.length} Education added` : "Add your degree/college"}
          icon="school-outline" 
          color="#10B981" 
          onPress={() => navigation.navigate('ProfileEducation')} 
          isMissing={isSectionMissing('education')} 
        />

        <SectionItem 
          title="Job Preferences" 
          subtitle="Preferred roles & locations"
          icon="bullseye-arrow" 
          color="#F59E0B" 
          onPress={() => navigation.navigate('ProfileJobPreferences')} 
          isMissing={isSectionMissing('preferences')} 
        />

        <SectionItem 
          title="Resume / CV" 
          subtitle="Upload your resume to get hired fast"
          icon="file-document-outline" 
          color="#8B5CF6" 
          onPress={() => navigation.navigate('ProfileResume')} 
          isMissing={isSectionMissing('resume')} 
        />

        <View style={[styles.sectionTitleRow, { marginTop: 24 }]}>
          <Text style={[typography.labelMedium, { color: colors.textSecondary, fontWeight: 'bold' }]}>PERSONAL DETAILS</Text>
        </View>

        <SectionItem 
          title="Personal Info" 
          subtitle="Name, DOB, Gender, Language"
          icon="account-outline" 
          color="#EC4899" 
          onPress={() => navigation.navigate('ProfilePersonalInfo')} 
          isMissing={isSectionMissing('personal')} 
        />

        <SectionItem 
          title="My Documents" 
          subtitle="ID proofs & other certifications"
          icon="card-account-details-outline" 
          color="#64748B" 
          onPress={() => {}} 
          isMissing={true} 
        />

        {/* Pro Tip */}
        <View style={[styles.proTip, { backgroundColor: colors.surfaceHighlight, borderColor: colors.primary + '30' }]}>
          <Icon name="lightbulb-on-outline" size={24} color={colors.primary} />
          <View style={styles.proTipText}>
            <Text style={[typography.labelMedium, { color: colors.primary }]}>Pro Tip</Text>
            <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]}>
              Profiles with photos and resumes get 5x more attention from employers.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Image Selection Modal */}
      <Modal visible={showImagePicker} transparent animationType="slide" onRequestClose={() => setShowImagePicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowImagePicker(false)}>
          <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
            <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: 20 }]}>Profile Photo</Text>
            <View style={styles.pickerOptions}>
              <Pressable style={styles.pickerOption} onPress={() => processImage('camera')}>
                <View style={[styles.pickerIcon, { backgroundColor: colors.primary + '10' }]}>
                  <FeatherIcon name="camera" size={24} color={colors.primary} />
                </View>
                <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: 8 }]}>Camera</Text>
              </Pressable>
              <Pressable style={styles.pickerOption} onPress={() => processImage('gallery')}>
                <View style={[styles.pickerIcon, { backgroundColor: '#10B98110' }]}>
                  <FeatherIcon name="image" size={24} color="#10B981" />
                </View>
                <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: 8 }]}>Gallery</Text>
              </Pressable>
              {profilePic && (
                <Pressable style={styles.pickerOption} onPress={() => { setShowImagePicker(false); setShowDeleteConfirm(true); }}>
                  <View style={[styles.pickerIcon, { backgroundColor: colors.error + '10' }]}>
                    <FeatherIcon name="trash-2" size={24} color={colors.error} />
                  </View>
                  <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: 8 }]}>Remove</Text>
                </Pressable>
              )}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Image Viewer */}
      <Modal visible={showImageViewer} transparent animationType="fade" onRequestClose={() => setShowImageViewer(false)}>
        <View style={styles.viewerContainer}>
          <Pressable style={styles.viewerCloseBtn} onPress={() => setShowImageViewer(false)}>
            <FeatherIcon name="x" size={28} color="#FFF" />
          </Pressable>
          {profilePic && <Image source={{ uri: profilePic }} style={styles.fullImage} resizeMode="contain" />}
        </View>
      </Modal>

      <ConfirmationModal
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeletePicture}
        title="Remove Photo"
        message="Are you sure you want to remove your profile picture?"
        confirmText="Remove"
        cancelText="Cancel"
        colors={colors}
        loading={isUploading}
        type="danger"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 56,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraIconBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  summaryText: {
    marginLeft: 20,
    flex: 1,
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
  scroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
    marginTop: 16,
  },
  strengthCard: {
    padding: 16,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  strengthInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBase: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionTitleRow: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionText: {
    flex: 1,
    marginLeft: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proTip: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  proTipText: {
    flex: 1,
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  pickerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  pickerOption: {
    alignItems: 'center',
  },
  pickerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullImage: {
    width: width,
    height: width,
  },
  uploadingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default ProfileDetailsScreen;
