import React from 'react';
import { Pressable, TouchableOpacity, StyleSheet, Text, View, Alert, Linking, Platform, Modal, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { uploadResume, deleteResume } from '../../../redux/slice/profileSlice';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../../components/auth';
import { useProfileSetup } from '../../../context/ProfileSetupContext';
import { useToast } from '../../../context/ToastContext';
import type { ProfileStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { ProfileEditLayout } from './ProfileEditLayout';

type Props = StackScreenProps<ProfileStackParamList, 'ProfileResume'>;

const ProfileResumeEditScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const { draft, updateDraft } = useProfileSetup();
  const { data: profileData, loading: profileLoading } = useSelector((state: RootState) => state.profile);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  // Correctly access resume from profile data
  const resume = profileData?.profile?.resume || (profileData as any)?.resume;

  React.useEffect(() => {
    if (resume?.has_resume) {
      updateDraft({
        resumeName: resume.resume_original_name,
        resumeUri: resume.resume_url,
      });
    }
  }, [resume, updateDraft]);

  const handlePickFile = async () => {
    try {
      const res = await pick({
        type: [types.pdf, types.doc, types.docx],
      });
      const file = res[0];
      const resultAction = await dispatch(uploadResume({
        uri: file.uri,
        name: file.name || 'resume.pdf',
        type: file.type || 'application/pdf',
      }));

      if (uploadResume.fulfilled.match(resultAction)) {
        updateDraft({ resumeUri: file.uri, resumeName: file.name || 'resume.pdf' });
        showToast('Resume uploaded successfully \u2705', 'success');
      } else {
        let errorMsg = resultAction.payload as string;
        if (errorMsg?.includes('5120 kilobytes')) {
          errorMsg = 'File size is too large. Please upload a resume smaller than 5 MB.';
        }
        showToast(errorMsg || 'Something went wrong while uploading.', 'error');
      }
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return;
      showToast('Could not pick file. Please try again.', 'error');
    }
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      const resultAction = await dispatch(deleteResume());
      if (deleteResume.fulfilled.match(resultAction)) {
        updateDraft({ resumeUri: null, resumeName: null, resumeSkipped: false });
        showToast('Resume removed successfully 🗑️', 'success');
      } else {
        showToast(resultAction.payload as string || 'Failed to delete resume.', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleViewResume = () => {
    const url = resume?.resume_url || draft.resumeUri;
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open resume link');
      });
    }
  };

  const decodeFileName = (name: string) => {
    try {
      return decodeURIComponent(name).replace(/\+/g, ' ');
    } catch {
      return name;
    }
  };

  const canSave = draft.resumeSkipped || Boolean(draft.resumeUri);

  return (
    <ProfileEditLayout
      title="Resume"
      subtitle="Upload your CV so employers can review it when you apply.">
      
      {draft.resumeName ? (
        <View style={styles.cardContainer}>
          <View style={[styles.preview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.docIcon, { backgroundColor: colors.primary + '15' }]}>
              <Icon name="file-pdf-o" size={24} color={colors.primary} />
            </View>
            <View style={styles.previewText}>
              <Text style={[typography.labelMedium, { color: colors.textPrimary }]} numberOfLines={1}>
                {decodeFileName(draft.resumeName)}
              </Text>
              <Text style={[typography.small, { color: colors.success, fontWeight: '600' }]}>
                {resume?.has_resume ? '✓ Professionally Uploaded' : 'Ready to save'}
              </Text>
            </View>
            <View style={styles.actionRow}>
              <Pressable onPress={handleViewResume} style={styles.actionBtn} hitSlop={10}>
                <Icon name="eye" size={20} color={colors.primary} />
              </Pressable>
              <Pressable onPress={() => setShowDeleteModal(true)} style={styles.actionBtn} hitSlop={10}>
                <Icon name="trash-o" size={20} color={colors.error} />
              </Pressable>
            </View>
          </View>
          
          <Pressable onPress={handlePickFile} style={styles.reUploadBtn}>
            <Text style={[typography.small, { color: colors.primary, fontWeight: 'bold' }]}>Replace with new file</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={handlePickFile}
          disabled={profileLoading}
          style={[styles.uploadBox, { backgroundColor: colors.surfaceHighlight, borderColor: colors.primary + '30', borderStyle: 'dashed' }]}>
          <View style={[styles.uploadCircle, { backgroundColor: colors.primary + '10' }]}>
            <Icon name="cloud-upload" size={32} color={colors.primary} />
          </View>
          <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: spacing.md }]}>
            {profileLoading ? 'Uploading...' : 'Tap to upload resume'}
          </Text>
          <Text style={[typography.small, { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
            PDF, DOC, DOCX up to 5MB
          </Text>
        </Pressable>
      )}

      {draft.resumeSkipped && !draft.resumeUri && (
        <View style={[styles.skipBanner, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Icon name="info-circle" size={18} color={colors.textSecondary} />
          <Text style={[typography.small, { color: colors.textSecondary, flex: 1 }]}>
            You haven’t attached a file yet. You can skip and add one later.
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <PrimaryButton
          title="Save & Continue"
          onPress={() => navigation.goBack()}
          disabled={!canSave}
          colors={colors}
          iconRight={<Icon name="arrow-right" size={16} color="#FFF" />}
        />
        {!(draft.resumeUri || resume?.has_resume) && (
          <TouchableOpacity
            onPress={() => {
              updateDraft({ resumeUri: null, resumeName: null, resumeSkipped: true });
              navigation.goBack();
            }}
            style={styles.skipBtn}
            hitSlop={{ top: 12, bottom: 12, left: 24, right: 24 }}
          >
            <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowDeleteModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.deleteIconWrap, { backgroundColor: colors.error + '15' }]}><Icon name="trash" size={28} color={colors.error} /></View>
            <Text style={[typography.appTitle, { color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs }]}>Delete Resume?</Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg }]}>Are you sure you want to remove your resume?</Text>
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, { backgroundColor: colors.surfaceSecondary }]} onPress={() => setShowDeleteModal(false)}><Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Cancel</Text></Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: colors.error }]} onPress={confirmDelete}><Text style={[typography.labelMedium, { color: '#FFF' }]}>Delete</Text></Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </ProfileEditLayout>
  );
};

const styles = StyleSheet.create({
  cardContainer: { marginBottom: spacing.lg },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  docIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  previewText: { flex: 1, marginLeft: 12 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.02)' },
  reUploadBtn: { alignSelf: 'center', marginTop: 12, paddingVertical: 8, paddingHorizontal: 16 },
  uploadBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20, borderRadius: 24, borderWidth: 2, marginBottom: spacing.md },
  uploadCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  skipBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.lg },
  footer: { marginTop: spacing.md },
  skipBtn: { alignSelf: 'center', paddingVertical: 16, width: '100%', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalContent: { width: '100%', maxWidth: 320, borderRadius: 24, padding: spacing.xl, alignItems: 'center' },
  deleteIconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  modalActions: { flexDirection: 'row', gap: spacing.md, width: '100%' },
  modalBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});

export default ProfileResumeEditScreen;
