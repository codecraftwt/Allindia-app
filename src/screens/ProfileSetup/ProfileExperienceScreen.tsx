import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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

type Props = StackScreenProps<AuthStackParamList, 'ProfileExperience'>;

const ProfileExperienceScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { draft, updateDraft } = useProfileSetup();

  const yearsNum = parseInt(draft.experienceYears.replace(/\D/g, ''), 10);
  const canContinue =
    draft.isFresher || (!Number.isNaN(yearsNum) && yearsNum >= 1 && yearsNum <= 50);

  return (
    <ProfileSetupLayout
      step={4}
      title="Experience"
      subtitle="Fresher or experienced — we'll match jobs that fit your level.">
      <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Work experience</Text>
      <View style={styles.toggleRow}>
        <Pressable
          onPress={() => updateDraft({ isFresher: true, experienceYears: '' })}
          style={[
            styles.toggle,
            {
              backgroundColor: draft.isFresher ? colors.surfaceHighlight : colors.surface,
              borderColor: draft.isFresher ? colors.primary : colors.border,
            },
          ]}>
          <Icon name="leaf" size={18} color={draft.isFresher ? colors.primary : colors.textSecondary} />
          <Text
            style={[
              typography.labelMedium,
              { color: draft.isFresher ? colors.primary : colors.textSecondary },
            ]}>
            Fresher
          </Text>
        </Pressable>
        <Pressable
          onPress={() => updateDraft({ isFresher: false })}
          style={[
            styles.toggle,
            {
              backgroundColor: !draft.isFresher ? colors.surfaceHighlight : colors.surface,
              borderColor: !draft.isFresher ? colors.primary : colors.border,
            },
          ]}>
          <Icon
            name="briefcase"
            size={18}
            color={!draft.isFresher ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              typography.labelMedium,
              { color: !draft.isFresher ? colors.primary : colors.textSecondary },
            ]}>
            Experienced
          </Text>
        </Pressable>
      </View>

      {!draft.isFresher ? (
        <>
          <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: spacing.sm }]}>
            Total years of experience
          </Text>
          <TextInput
            value={draft.experienceYears}
            onChangeText={t => updateDraft({ experienceYears: t.replace(/\D/g, '').slice(0, 2) })}
            placeholder="e.g. 3"
            placeholderTextColor={colors.textPlaceholder}
            keyboardType="number-pad"
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          />
          <Text style={[typography.small, { color: colors.textPlaceholder }]}>
            Whole years only (1–50).
          </Text>
        </>
      ) : null}

      <PrimaryButton
        title="Continue"
        onPress={() => navigation.navigate('ProfileJobPreferences')}
        disabled={!canContinue}
        colors={colors}
        iconRight={<Icon name="arrow-right" size={16} color={colors.onPrimary} />}
      />
    </ProfileSetupLayout>
  );
};

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
    fontFamily: typography.body.fontFamily,
  },
});

export default ProfileExperienceScreen;
