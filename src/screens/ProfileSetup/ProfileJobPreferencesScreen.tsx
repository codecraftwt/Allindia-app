import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../components/auth';
import { useProfileSetup } from '../../context/ProfileSetupContext';
import type { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { JOB_CATEGORIES, SALARY_OPTIONS } from './profileSetupConstants';
import { ProfileSetupLayout } from './ProfileSetupLayout';

type Props = StackScreenProps<AuthStackParamList, 'ProfileJobPreferences'>;

const ProfileJobPreferencesScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { draft, setDraft, updateDraft } = useProfileSetup();

  const toggleCategory = (id: string) => {
    setDraft(prev => ({
      ...prev,
      jobCategoryIds: prev.jobCategoryIds.includes(id)
        ? prev.jobCategoryIds.filter(x => x !== id)
        : [...prev.jobCategoryIds, id],
    }));
  };

  const canContinue = draft.jobCategoryIds.length >= 1 && draft.expectedSalary !== '';

  return (
    <ProfileSetupLayout
      step={5}
      title="Job preferences"
      subtitle="Choose categories you're open to and your expected salary band.">
      <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Job categories</Text>
      <Text style={[typography.small, { color: colors.textPlaceholder, marginTop: -spacing.xs }]}>
        Select all that apply
      </Text>
      <View style={styles.chipWrap}>
        {JOB_CATEGORIES.map(cat => {
          const selected = draft.jobCategoryIds.includes(cat.id);
          return (
            <Pressable
              key={cat.id}
              onPress={() => toggleCategory(cat.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.surfaceHighlight : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}>
              <Text
                style={[
                  typography.small,
                  {
                    color: selected ? colors.primary : colors.textSecondary,
                    fontFamily: typography.labelMedium.fontFamily,
                  },
                ]}>
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text
        style={[
          typography.labelMedium,
          { color: colors.textPrimary, marginTop: spacing.md },
        ]}>
        Expected salary
      </Text>
      <View style={styles.salaryWrap}>
        {SALARY_OPTIONS.map(opt => {
          const selected = draft.expectedSalary === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => updateDraft({ expectedSalary: opt.id })}
              style={[
                styles.salaryChip,
                {
                  backgroundColor: selected ? colors.surfaceHighlight : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}>
              <Text
                style={[
                  typography.small,
                  {
                    color: selected ? colors.primary : colors.textSecondary,
                    fontFamily: typography.labelMedium.fontFamily,
                  },
                ]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton
        title="Continue"
        onPress={() => navigation.navigate('ProfileResume')}
        disabled={!canContinue}
        colors={colors}
        iconRight={<Icon name="arrow-right" size={16} color={colors.onPrimary} />}
      />
    </ProfileSetupLayout>
  );
};

const styles = StyleSheet.create({
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.button,
    borderWidth: StyleSheet.hairlineWidth,
  },
  salaryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  salaryChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.button,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

export default ProfileJobPreferencesScreen;
