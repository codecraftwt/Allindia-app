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
import type { ProfileStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography, moderateScale } from '../../../theme/typography';
import { ProfileEditLayout } from './ProfileEditLayout';

type Props = StackScreenProps<ProfileStackParamList, 'ProfileEducation'>;

type EducationEntry = {
  id: string;
  qual: any | null;
  notes: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ProfileEducationEditScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const { qualifications } = useSelector((state: RootState) => state.meta);
  const { loading, error, data } = useSelector((state: RootState) => state.profile);

  // List of education entries
  const [entries, setEntries] = useState<EducationEntry[]>([
    { id: '1', qual: null, notes: '' },
  ]);

  // Modal state: which entry index is being edited
  const [openForIndex, setOpenForIndex] = useState<number | null>(null);
  const [selectedDegree, setSelectedDegree] = useState<string | null>(null);

  // Step 1: unique degree names (all qualifications)
  const degreeNameList: string[] = Array.from(
    new Set(
      qualifications
        .map((q: any) => q.name)
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  // Step 2: all streams for the selected degree name
  const streamList = selectedDegree
    ? qualifications.filter((q: any) => q.name === selectedDegree)
    : [];

  const closeModal = () => {
    setSelectedDegree(null);
    setOpenForIndex(null);
  };

  useEffect(() => {
    dispatch(fetchEducation());
    dispatch(fetchMetaQualifications());
  }, [dispatch]);

  // Pre-fill from backend data
  useEffect(() => {
    if (data?.education && qualifications.length > 0) {
      const edu = data.education;
      // Support both single and array (qualification_ids)
      const ids: number[] = Array.isArray(edu.qualification_ids)
        ? edu.qualification_ids
        : edu.qualification_id
        ? [typeof edu.qualification_id === 'object' ? edu.qualification_id.id : edu.qualification_id]
        : [];

      if (ids.length > 0) {
        const preloaded = ids.map((id, i) => {
          const found = qualifications.find((q: any) => q.id === id);
          return { id: String(i + 1), qual: found || null, notes: i === 0 ? (edu.education_notes || '') : '' };
        });
        setEntries(preloaded.length > 0 ? preloaded : [{ id: '1', qual: null, notes: '' }]);
      } else {
        setEntries([{ id: '1', qual: null, notes: edu.education_notes || '' }]);
      }
    }
  }, [data, qualifications]);

  const handleSave = async () => {
    try {
      const validEntries = entries.filter(e => e.qual !== null);
      await dispatch(updateEducation({
        qualification_id: validEntries[0]?.qual?.id || null,
        qualification_ids: validEntries.map(e => e.qual.id),
        education_notes: entries[0]?.notes || null,
      })).unwrap();

      showToast(t('profileEducation.educationUpdated', 'Education updated successfully!'), 'success');
      setTimeout(() => navigation.goBack(), 3000);
    } catch (err: any) {
      showToast(err?.message || t('profileEducation.failedToUpdateEducation', 'Failed to save education'), 'error');
      console.error('Failed to save education:', err);
    }
  };

  const addEntry = () => {
    setEntries(prev => [...prev, { id: Date.now().toString(), qual: null, notes: '' }]);
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const setQualForEntry = (id: string, qual: any) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, qual } : e));
  };

  const setNotesForEntry = (id: string, notes: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, notes } : e));
  };

  const canSave = entries.some(e => e.qual !== null);

  const scale = useSharedValue(1);
  const selectStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const activeEntry = openForIndex !== null ? entries[openForIndex] : null;

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
          {entries.map((entry, index) => (
            <Animated.View
              key={entry.id}
              entering={FadeInDown.delay(index * 80).duration(400).springify()}
              style={[
                styles.entryCard,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}>

              {/* Qualification label */}
              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
                {t('profileEducation.qualification', 'Qualification')}
                {entries.length > 1 ? ` ${index + 1}` : ''}
              </Text>

              {/* Qualification picker trigger */}
              <AnimatedPressable
                onPressIn={() => (scale.value = withSpring(0.97))}
                onPressOut={() => (scale.value = withSpring(1))}
                onPress={() => setOpenForIndex(index)}
                style={[
                  styles.selectField,
                  selectStyle,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}>
                <Icon name="graduation-cap" size={18} color={colors.primary} />
                <Text
                  style={[
                    typography.body,
                    { color: entry.qual ? colors.textPrimary : colors.textPlaceholder, flex: 1 },
                  ]}>
                  {entry.qual
                    ? `${entry.qual.display_label || entry.qual.name}${entry.qual.stream ? ' - ' + entry.qual.stream : ''}`
                    : t('profileEducation.selectQualification', 'Select qualification')}
                </Text>
                <Icon name="chevron-down" size={14} color={colors.textPlaceholder} />
              </AnimatedPressable>

              {/* Education Notes */}
              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.xs }]}>
                {t('profileEducation.educationNotes', 'Education Notes')}
              </Text>
              <TextInput
                multiline
                numberOfLines={4}
                value={entry.notes}
                onChangeText={(val) => setNotesForEntry(entry.id, val)}
                placeholder={t('profileEducation.notesPlaceholder', 'Describe your education background...')}
                placeholderTextColor={colors.textPlaceholder}
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
              />
            </Animated.View>
          ))}

          {/* Add another education button */}
          <Pressable
            style={[
              styles.addButton,
              { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
            ]}
            onPress={addEntry}>
            <Icon name="plus-circle" size={20} color={colors.primary} />
            <Text style={[typography.labelLarge, { color: colors.primary, marginLeft: spacing.sm }]}>
              {t('profileEducation.addEducation', 'Add another education')}
            </Text>
          </Pressable>

          {error && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {typeof error === 'string' ? error : ((error as any).message || 'An error occurred')}
            </Text>
          )}
        </>
      )}

      {/* Qualification Picker Modal — shared for all entries */}
      <Modal
        visible={openForIndex !== null}
        animationType="fade"
        transparent
        onRequestClose={closeModal}>
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <AnimatedPressable
            entering={SlideInDown.duration(300).easing(Easing.out(Easing.quad))}
            exiting={SlideOutDown.duration(250).easing(Easing.in(Easing.quad))}
            style={[styles.sheet, { backgroundColor: colors.surface }]}
            onPress={(e: any) => e.stopPropagation()}>

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              {selectedDegree ? (
                <Pressable
                  onPress={() => setSelectedDegree(null)}
                  hitSlop={12}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Icon name="arrow-left" size={16} color={colors.primary} />
                  <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
                    {selectedDegree}
                  </Text>
                </Pressable>
              ) : (
                <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
                  {t('profileEducation.qualification', 'Qualification')}
                </Text>
              )}
              <Pressable onPress={closeModal} hitSlop={12}>
                <Icon name="times" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Step 1: Unique degree names */}
            {!selectedDegree && (
              <FlatList
                data={degreeNameList}
                keyExtractor={name => name}
                style={styles.list}
                renderItem={({ item: name, index }) => (
                  <Animated.View entering={FadeInDown.delay(index * 40).duration(350)}>
                    <Pressable
                      onPress={() => setSelectedDegree(name)}
                      style={[styles.row, { backgroundColor: 'transparent' }]}>
                      <Text style={[typography.body, { color: colors.textPrimary }]}>{name}</Text>
                      <Icon name="chevron-right" size={13} color={colors.textPlaceholder} />
                    </Pressable>
                  </Animated.View>
                )}
              />
            )}

            {/* Step 2: Streams for selected degree */}
            {selectedDegree && (
              <FlatList
                data={streamList}
                keyExtractor={item => item.id.toString()}
                style={styles.list}
                renderItem={({ item, index }) => {
                  const isSelected = activeEntry?.qual?.id === item.id;
                  return (
                    <Animated.View entering={FadeInDown.delay(index * 40).duration(350)}>
                      <Pressable
                        onPress={() => {
                          if (openForIndex !== null) {
                            setQualForEntry(entries[openForIndex].id, item);
                          }
                          closeModal();
                        }}
                        style={[
                          styles.row,
                          { backgroundColor: isSelected ? colors.surfaceHighlight : 'transparent' },
                        ]}>
                        <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>
                          {item.stream || item.name}
                        </Text>
                        {isSelected && <Icon name="check" size={16} color={colors.primary} />}
                      </Pressable>
                    </Animated.View>
                  );
                }}
              />
            )}

          </AnimatedPressable>
        </Pressable>
      </Modal>

      <Animated.View entering={FadeInDown.delay(600).duration(500)}>
        <PrimaryButton
          title={loading ? t('profileEducation.saving', 'Saving...') : t('profileEducation.save', 'Save')}
          onPress={handleSave}
          disabled={!canSave || loading}
          loading={loading}
          colors={colors}
        />
      </Animated.View>
    </ProfileEditLayout>
  );
};

const styles = StyleSheet.create({
  entryCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    padding: moderateScale(14),
    marginBottom: spacing.md,
    position: 'relative',
  },
  removeBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 10,
    padding: spacing.xs,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(12),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    maxHeight: '70%',
    paddingBottom: moderateScale(24),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(14),
  },
  list: {
    maxHeight: moderateScale(380),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(16),
  },
  textArea: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    padding: moderateScale(12),
    height: moderateScale(110),
    textAlignVertical: 'top',
    fontSize: moderateScale(14),
  },
  errorText: {
    ...typography.small,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  centerLoader: {
    paddingVertical: moderateScale(40),
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(12),
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.card,
  },
});

export default ProfileEducationEditScreen;
