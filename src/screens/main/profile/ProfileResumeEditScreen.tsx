import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  const { draft, updateDraft } = useProfileSetup();

  const clearFile = () => {
    updateDraft({ resumeUri: null, resumeName: null, resumeSkipped: false });
  };

  const skip = () => {
    clearFile();
    updateDraft({ resumeSkipped: true });
  };

  const canSave = draft.resumeSkipped || Boolean(draft.resumeUri);

  return (
    <ProfileEditLayout
      title="Resume"
      subtitle="Upload your CV so employers can review it when you apply.">
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
  },
});

export default ProfileResumeEditScreen;
