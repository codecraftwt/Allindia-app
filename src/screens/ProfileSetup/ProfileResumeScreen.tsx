import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
// import DocumentPicker, { isCancel, types } from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../components/auth';
import { useProfileSetup } from '../../context/ProfileSetupContext';
import type { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ProfileSetupLayout } from './ProfileSetupLayout';

type Props = StackScreenProps<AuthStackParamList, 'ProfileResume'>;

const ProfileResumeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { draft, updateDraft } = useProfileSetup();

  // const [picking, setPicking] = useState(false);
  // const pickFile = useCallback(async () => {
  //   setPicking(true);
  //   try {
  //     const res = await DocumentPicker.pickSingle({
  //       type: [types.pdf, types.images],
  //       copyTo: 'cachesDirectory',
  //     });
  //     const uri = res.fileCopyUri ?? res.uri;
  //     updateDraft({
  //       resumeUri: uri,
  //       resumeName: res.name ?? 'Resume',
  //       resumeSkipped: false,
  //     });
  //   } catch (e) {
  //     if (isCancel(e)) {
  //       return;
  //     }
  //     Alert.alert('Upload failed', 'Could not read the file. Try another file.');
  //   } finally {
  //     setPicking(false);
  //   }
  // }, [updateDraft]);

  const clearFile = () => {
    updateDraft({ resumeUri: null, resumeName: null, resumeSkipped: false });
  };

  const skip = () => {
    clearFile();
    updateDraft({ resumeSkipped: true });
  };

  const finish = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const canContinue = draft.resumeSkipped || Boolean(draft.resumeUri);

  return (
    <ProfileSetupLayout
      step={6}
      title="Resume"
      subtitle="Upload a PDF or image of your CV. Employers see this when you apply — or skip and add it later.">
      {/* <Pressable
        onPress={pickFile}
        disabled={picking}
        style={[
          styles.uploadZone,
          {
            backgroundColor: colors.surface,
            borderColor: colors.primary,
            opacity: picking ? 0.7 : 1,
          },
        ]}>
        <View style={[styles.uploadIcon, { backgroundColor: colors.surfaceHighlight }]}>
          <Icon name="cloud-upload" size={28} color={colors.primary} />
        </View>
        <Text style={[typography.jobTitle, { color: colors.textPrimary, textAlign: 'center' }]}>
          {picking ? 'Opening files…' : 'Tap to upload resume'}
        </Text>
        <Text style={[typography.small, { color: colors.textSecondary, textAlign: 'center' }]}>
          PDF, JPG, or PNG · max size depends on your device
        </Text>
      </Pressable> */}

      {draft.resumeUri && draft.resumeName ? (
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
            <Text style={[typography.small, { color: colors.textSecondary }]}>Ready to send</Text>
          </View>
          <Pressable onPress={clearFile} hitSlop={10}>
            <Icon name="times-circle" size={22} color={colors.textPlaceholder} />
          </Pressable>
        </View>
      ) : null}

      {draft.resumeSkipped && !draft.resumeUri ? (
        <View
          style={[
            styles.skipBanner,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
          ]}>
          <Icon name="info-circle" size={18} color={colors.textSecondary} />
          <Text style={[typography.small, { color: colors.textSecondary, flex: 1 }]}>
            You skipped upload. You can add a resume from your profile anytime.
          </Text>
        </View>
      ) : null}

      <Pressable onPress={skip} style={styles.skipBtn}>
        <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>
          Skip for now
        </Text>
      </Pressable>

      <PrimaryButton
        title="Finish"
        onPress={finish}
        disabled={!canContinue}
        colors={colors}
        iconRight={<Icon name="check" size={16} color={colors.onPrimary} />}
      />
    </ProfileSetupLayout>
  );
};

const styles = StyleSheet.create({
  uploadZone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radius.card,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
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
  },
});

export default ProfileResumeScreen;
