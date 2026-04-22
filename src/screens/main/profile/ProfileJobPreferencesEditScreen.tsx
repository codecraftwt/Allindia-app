import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { updatePreferencesProfile } from '../../../redux/slice/profileSlice';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../../components/auth';
import { useProfileSetup } from '../../../context/ProfileSetupContext';
import type { ProfileStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { SALARY_OPTIONS } from '../../ProfileSetup/profileSetupConstants';
import { fetchMetaCategories } from '../../../redux/slice/metaSlice';
import { ProfileEditLayout } from './ProfileEditLayout';


type Props = StackScreenProps<ProfileStackParamList, 'ProfileJobPreferences'>;

const ProfileJobPreferencesEditScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { draft, setDraft, updateDraft } = useProfileSetup();
  const { data: profileData, loading: profileLoading } = useSelector((state: RootState) => state.profile);
  const { categories, loading: metaLoading } = useSelector((state: RootState) => state.meta);
  const isInitialized = React.useRef(false);

  React.useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchMetaCategories());
    }
  }, [categories.length, dispatch]);

  React.useEffect(() => {
    if (profileData?.profile?.preferences && !isInitialized.current) {
      const p = profileData.profile.preferences;
      updateDraft({
        expectedSalary: p.expected_salary_min ? 'custom' : draft.expectedSalary,
        jobCategoryIds: p.job_category_id ? [p.job_category_id.toString()] : draft.jobCategoryIds,
      });
      isInitialized.current = true;
    }
  }, [profileData, updateDraft]);

  const toggleCategory = (id: string) => {
    setDraft(prev => ({
      ...prev,
      jobCategoryIds: [id], // Single selection to ensure it updates correctly
    }));
  };

  const canSave = draft.jobCategoryIds.length >= 1 && draft.expectedSalary !== '' && !profileLoading;

  const handleSave = async () => {
    try {
      // Mapping logic for Salary (simplified for demo)
      let minSalary = 0;
      let maxSalary = 0;
      
      switch(draft.expectedSalary) {
        case 'below2': minSalary = 0; maxSalary = 16000; break;
        case '2to4': minSalary = 16000; maxSalary = 33000; break;
        case '4to6': minSalary = 33000; maxSalary = 50000; break;
        case '6to10': minSalary = 50000; maxSalary = 83000; break;
        default: minSalary = 0; maxSalary = 0;
      }

      await dispatch(updatePreferencesProfile({
        job_category_id: parseInt(draft.jobCategoryIds[0]) || 1, 
        expected_salary_min: minSalary,
        expected_salary_max: maxSalary,
        work_from_home: false,
      })).unwrap();
      navigation.goBack();
    } catch (error) {
     
    }
  };

  return (
    <ProfileEditLayout
      title="Job preferences"
      subtitle="Categories you’re open to and your expected salary range.">
      <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Job categories</Text>
      <Text style={[typography.small, { color: colors.textPlaceholder, marginTop: -spacing.xs }]}>
        Select all that apply
      </Text>
      <View style={styles.chipWrap}>
        {metaLoading && categories.length === 0 ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
        ) : (
          categories.map((cat: any) => {
            const isCategorySelected = draft.jobCategoryIds.includes(cat.id.toString());
            
            return (
              <React.Fragment key={cat.id}>
                <Pressable
                  onPress={() => toggleCategory(cat.id.toString())}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isCategorySelected ? colors.surfaceHighlight : colors.surface,
                      borderColor: isCategorySelected ? colors.primary : colors.border,
                    },
                  ]}>
                  <Text
                    style={[
                      typography.small,
                      {
                        color: isCategorySelected ? colors.primary : colors.textSecondary,
                        fontFamily: typography.labelMedium.fontFamily,
                      },
                    ]}>
                    {cat.name}
                  </Text>
                </Pressable>
                
                {/* Show subcategories if parent category is selected */}
                {isCategorySelected && cat.subcategories && cat.subcategories.length > 0 && (
                  <View style={styles.subCategoryWrap}>
                    {cat.subcategories.map((sub: any) => {
                      const isSubSelected = draft.jobCategoryIds.includes(sub.id.toString());
                      return (
                        <Pressable
                          key={sub.id}
                          onPress={() => toggleCategory(sub.id.toString())}
                          style={[
                            styles.subChip,
                            {
                              backgroundColor: isSubSelected ? colors.primary + '10' : colors.surface,
                              borderColor: isSubSelected ? colors.primary : colors.border,
                            },
                          ]}>
                          <Text
                            style={[
                              typography.small,
                              {
                                color: isSubSelected ? colors.primary : colors.textSecondary,
                                fontSize: 12,
                              },
                            ]}>
                            {sub.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </React.Fragment>
            );
          })
        )}
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
        title={profileLoading ? "Saving..." : "Save"} 
        onPress={handleSave} 
        disabled={!canSave} 
        colors={colors} 
      />
    </ProfileEditLayout>
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
  subCategoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    width: '100%',
    paddingLeft: spacing.md,
    marginVertical: spacing.xs,
  },
  subChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

export default ProfileJobPreferencesEditScreen;
