import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../components/auth';
import { useProfileSetup } from '../../context/ProfileSetupContext';
import type { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { QUALIFICATIONS } from './profileSetupConstants';
import { ProfileSetupLayout } from './ProfileSetupLayout';

type Props = StackScreenProps<AuthStackParamList, 'ProfileEducation'>;

const ProfileEducationScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { draft, updateDraft } = useProfileSetup();
  const [open, setOpen] = useState(false);

  const canContinue = draft.qualification.trim().length > 0;

  return (
    <ProfileSetupLayout
      step={3}
      title="Education"
      subtitle="Pick your highest completed qualification. You can add certificates later in your profile.">
      <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Qualification</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.selectField,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}>
        <Icon name="graduation-cap" size={18} color={colors.primary} />
        <Text
          style={[
            typography.body,
            {
              color: draft.qualification ? colors.textPrimary : colors.textPlaceholder,
              flex: 1,
            },
          ]}>
          {draft.qualification || 'Select qualification'}
        </Text>
        <Icon name="chevron-down" size={14} color={colors.textPlaceholder} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.surface }]}
            onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
                Qualification
              </Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Icon name="times" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <FlatList
              data={QUALIFICATIONS}
              keyExtractor={item => item}
              style={styles.list}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    updateDraft({ qualification: item });
                    setOpen(false);
                  }}
                  style={[
                    styles.row,
                    {
                      backgroundColor:
                        draft.qualification === item ? colors.surfaceHighlight : 'transparent',
                    },
                  ]}>
                  <Text style={[typography.body, { color: colors.textPrimary }]}>{item}</Text>
                  {draft.qualification === item ? (
                    <Icon name="check" size={16} color={colors.primary} />
                  ) : null}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <PrimaryButton
        title="Continue"
        onPress={() => navigation.navigate('ProfileExperience')}
        disabled={!canContinue}
        colors={colors}
        iconRight={<Icon name="arrow-right" size={16} color={colors.onPrimary} />}
      />
    </ProfileSetupLayout>
  );
};

const styles = StyleSheet.create({
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '70%',
    paddingBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  list: {
    maxHeight: 400,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});

export default ProfileEducationScreen;
