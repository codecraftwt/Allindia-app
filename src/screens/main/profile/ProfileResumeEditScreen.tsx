import React from 'react';
import { Pressable, StyleSheet, Text, View, Alert, ToastAndroid, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { uploadResume, deleteResume } from '../../../redux/slice/profileSlice';
import { pick, isCancel, types } from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../../components/auth';
import { useProfileSetup } from '../../../context/ProfileSetupContext';
import type { ProfileStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { ProfileEditLayout } from './ProfileEditLayout';

type Props = StackScreenProps<ProfileStackParamList, 'ProfileResume'>;

const ProfileResumeEditScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { draft, updateDraft } = useProfileSetup();
  const { data: profileData, loading: profileLoading } = useSelector((state: RootState) => state.profile);

  const resume = profileData?.profile?.resume;

  React.useEffect(() => {
    if (resume?.has_resume) {
      updateDraft({
        resumeName: resume.resume_original_name,
        resumeUri: resume.resume_url, // This might not be a local URI but we use it as a flag
      });
    }
  }, [resume, updateDraft]);

  const handlePickFile = async () => {
    try {
      const res = await pick({
        type: [types.pdf, types.doc, types.docx],
      });
      
      const file = res[0];
      
      // Auto-upload when file is picked
      const resultAction = await dispatch(uploadResume({
        uri: file.uri,
        name: file.name || 'resume.pdf',
        type: file.type || 'application/pdf',
      }));

      if (uploadResume.fulfilled.match(resultAction)) {
        updateDraft({ 
          resumeUri: file.uri, 
          resumeName: file.name || 'resume.pdf' 
        });
        if (Platform.OS === 'android') {
          ToastAndroid.show('Resume uploaded successfully ✅', ToastAndroid.SHORT);
        } else {
          Alert.alert('Success', 'Resume uploaded successfully ✅');
        }
      } else {
        // Show specific error from backend (like file size limit)
        let errorMsg = resultAction.payload as string;
        
        // Convert technical "5120 kilobytes" to "5 MB" for better UX
        if (errorMsg?.includes('5120 kilobytes')) {
          errorMsg = 'File size is too large. Please upload a resume smaller than 5 MB.';
        }

        Alert.alert('Upload Failed ❌', errorMsg || 'Something went wrong while uploading.');
      }
      
    } catch (err) {
      if (!isCancel(err)) {
    
        Alert.alert('Error', 'Failed to pick file.');
      }
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Resume',
      'Are you sure you want to remove your resume?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const resultAction = await dispatch(deleteResume());
              if (deleteResume.fulfilled.match(resultAction)) {
                updateDraft({ resumeUri: null, resumeName: null, resumeSkipped: false });
                if (Platform.OS === 'android') {
                  ToastAndroid.show('Resume removed successfully 🗑️', ToastAndroid.SHORT);
                } else {
                  Alert.alert('Deleted', 'Resume removed successfully 🗑️');
                }
              } else {
                Alert.alert('Error', resultAction.payload as string || 'Failed to delete resume.');
              }
            } catch (err) {
            
            }
          }
        },
      ]
    );
  };

  const skip = () => {
    updateDraft({ resumeUri: null, resumeName: null, resumeSkipped: true });
  };

  const canSave = draft.resumeSkipped || Boolean(draft.resumeUri);

  return (
    <ProfileEditLayout
      title="Resume"
      subtitle="Upload your CV so employers can review it when you apply.">
      {draft.resumeName ? (
        <View
          style={[
            styles.preview,
            {
              backgroundColor: colors.surfaceHighlight,
              borderColor: colors.border,
            },
          ]}>
          <Icon name="file-text-o" size={22} color={colors.primary} />
          <View style={styles.previewText}>
            <Text
              style={[typography.labelMedium, { color: colors.textPrimary }]}
              numberOfLines={1}>
              {draft.resumeName}
            </Text>
            <Text style={[typography.small, { color: colors.textSecondary }]}>
              {resume?.has_resume ? 'Uploaded' : 'Ready to upload'}
            </Text>
          </View>
          <Pressable onPress={handleDelete} hitSlop={10} disabled={profileLoading}>
            <Icon name="trash-o" size={22} color={colors.error} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={handlePickFile}
          disabled={profileLoading}
          style={[
            styles.uploadBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderStyle: 'dashed',
            },
          ]}>
          <Icon name="cloud-upload" size={32} color={colors.primary} />
          <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: spacing.sm }]}>
            {profileLoading ? 'Uploading...' : 'Tap to upload resume'}
          </Text>
          <Text style={[typography.small, { color: colors.textSecondary }]}>
            PDF, DOC, DOCX up to 5MB
          </Text>
        </Pressable>
      )}

      {draft.resumeSkipped && !draft.resumeUri ? (
        <View
          style={[
            styles.skipBanner,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
          ]}>
          <Icon name="info-circle" size={18} color={colors.textSecondary} />
          <Text style={[typography.small, { color: colors.textSecondary, flex: 1 }]}>
            You haven’t attached a file yet. You can skip and add one later.
          </Text>
        </View>
      ) : null}

      <Pressable onPress={skip} style={styles.skipBtn}>
        <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>
          Skip for now
        </Text>
      </Pressable>

      <PrimaryButton
        title="Save"
        onPress={() => navigation.goBack()}
        disabled={!canSave}
        colors={colors}
        iconRight={<Icon name="check" size={16} color={colors.onPrimary} />}
      />
    </ProfileEditLayout>
  );
};

const styles = StyleSheet.create({
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  previewText: {
    flex: 1,
    minWidth: 0,
  },
  skipBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  skipBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  uploadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    borderRadius: radius.card,
    borderWidth: 2,
    marginBottom: spacing.md,
  },
});

export default ProfileResumeEditScreen;
