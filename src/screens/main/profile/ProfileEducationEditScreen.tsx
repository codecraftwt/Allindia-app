import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View, TextInput, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeInDown,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchMetaQualifications } from '../../../redux/slice/metaSlice';
import { fetchEducation, updateEducation } from '../../../redux/slice/profileSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useToast } from '../../../context/ToastContext';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../../components/auth';
import { useProfileSetup } from '../../../context/ProfileSetupContext';
import type { ProfileStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { QUALIFICATIONS } from '../../ProfileSetup/profileSetupConstants';
import { ProfileEditLayout } from './ProfileEditLayout';

type Props = StackScreenProps<ProfileStackParamList, 'ProfileEducation'>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ProfileEducationEditScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const { qualifications } = useSelector((state: RootState) => state.meta);
  const { loading, error, data } = useSelector((state: RootState) => state.profile);

  const [open, setOpen] = useState(false);
  const [selectedQual, setSelectedQual] = useState<any>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    dispatch(fetchEducation());
    if (qualifications.length === 0) {
      dispatch(fetchMetaQualifications());
    }
  }, [dispatch, qualifications.length]);

  useEffect(() => {
    if (data?.education) {
      const edu = data.education;
      // Handle both numeric ID and nested object cases
      const qualId = typeof edu.qualification_id === 'object' ? edu.qualification_id?.id : edu.qualification_id;

      if (qualId && qualifications.length > 0) {
        const currentQual = qualifications.find(q => q.id === qualId);
        setSelectedQual(currentQual || null);
      }
      setNotes(edu.education_notes || '');
    }
  }, [data, qualifications]);

  const handleSave = async () => {
    try {
      await dispatch(updateEducation({
        qualification_id: selectedQual?.id || null,
        education_notes: notes,
      })).unwrap();

      showToast(t('profileEducation.educationUpdated', 'Education updated successfully!'), 'success');

      // Delay navigation to let the user see the success message and progress bar
      setTimeout(() => {
        navigation.goBack();
      }, 3000); // 2.5s progress + 0.5s fade out
    } catch (err: any) {
      showToast(err?.message || t('profileEducation.failedToUpdateEducation', 'Failed to save education'), 'error');
      console.error('Failed to save education:', err);
    }
  };

  const canSave = selectedQual !== null;

  const scale = useSharedValue(1);
  const selectStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const renderSection = (children: React.ReactNode, index: number) => (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 100).duration(600).springify()}
      style={{ gap: spacing.xs }}
    >
      {children}
    </Animated.View>
  );

  return (
    <ProfileEditLayout
      title={t('profileEducation.education', 'Education')}
      subtitle={t('profileEducation.educationSubtitle', 'Your highest qualification helps match you to the right roles.')}>

      {loading && !data ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {renderSection(
            <>
              <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>{t('profileEducation.qualification', 'Qualification')}</Text>
              <AnimatedPressable
                onPressIn={() => (scale.value = withSpring(0.97))}
                onPressOut={() => (scale.value = withSpring(1))}
                onPress={() => setOpen(true)}
                style={[
                  styles.selectField,
                  selectStyle,
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
                      color: selectedQual ? colors.textPrimary : colors.textPlaceholder,
                      flex: 1,
                    },
                  ]}>
                  {selectedQual ? selectedQual.name : t('profileEducation.selectQualification', 'Select qualification')}
                </Text>
                <Icon name="chevron-down" size={14} color={colors.textPlaceholder} />
              </AnimatedPressable>
            </>,
            0
          )}

          {renderSection(
            <>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: spacing.md }]}>
                {t('profileEducation.educationNotes', 'Education Notes')}
              </Text>
              <TextInput
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                placeholder={t('profileEducation.notesPlaceholder', 'Describe your education background...')}
                placeholderTextColor={colors.textPlaceholder}
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }
                ]}
              />
            </>,
            1
          )}

          {error && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {typeof error === 'string' ? error : (error.message || 'An error occurred')}
            </Text>
          )}
        </>
      )}

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <AnimatedPressable
            entering={SlideInDown.duration(300).easing(Easing.out(Easing.quad))}
            exiting={SlideOutDown.duration(250).easing(Easing.in(Easing.quad))}
            style={[styles.sheet, { backgroundColor: colors.surface }]}
            onPress={(e: any) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
                {t('profileEducation.qualification', 'Qualification')}
              </Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Icon name="times" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <FlatList
              data={qualifications}
              keyExtractor={item => item.id.toString()}
              style={styles.list}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
                  <Pressable
                    onPress={() => {
                      setSelectedQual(item);
                      setOpen(false);
                    }}
                    style={[
                      styles.row,
                      {
                        backgroundColor:
                          selectedQual?.id === item.id ? colors.surfaceHighlight : 'transparent',
                      },
                    ]}>
                    <Text style={[typography.body, { color: colors.textPrimary }]}>{item.name}</Text>
                    {selectedQual?.id === item.id ? (
                      <Icon name="check" size={16} color={colors.primary} />
                    ) : null}
                  </Pressable>
                </Animated.View>
              )}
            />
          </AnimatedPressable>
        </Pressable>
      </Modal>

      <Animated.View entering={FadeInDown.delay(600).duration(500)}>
        <PrimaryButton
          title={loading ? t('profileEducation.saving', 'Saving...') : t('profileEducation.save', 'Save')}
          onPress={handleSave}
          disabled={!canSave || loading}
          colors={colors}
        />
      </Animated.View>
    </ProfileEditLayout>
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
  textArea: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    padding: spacing.md,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.small,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  centerLoader: {
    paddingVertical: 50,
    alignItems: 'center',
  },
});

export default ProfileEducationEditScreen;
