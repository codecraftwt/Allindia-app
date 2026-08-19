import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, Modal, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, SlideInDown, SlideOutDown, useSharedValue, useAnimatedStyle, withSpring, Easing } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchSkills, updateSkills } from '../../../redux/slice/profileSlice';
import { fetchMetaCertifications } from '../../../redux/slice/metaSlice';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { useToast } from '../../../context/ToastContext';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../../components/auth';
import type { ProfileStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { ProfileEditLayout } from './ProfileEditLayout';

type Props = StackScreenProps<ProfileStackParamList, 'ProfileSkills'>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ProfileSkillsEditScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  
  const { loading: profileLoading, data } = useSelector((state: RootState) => state.profile);
  const { certifications } = useSelector((state: RootState) => state.meta);

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const scale = useSharedValue(1);
  const selectStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    dispatch(fetchSkills());
    dispatch(fetchMetaCertifications());
  }, [dispatch]);

  useEffect(() => {
    if (data?.skills && Array.isArray(data.skills)) {
      setSkills(data.skills);
    }
  }, [data?.skills]);

  const filteredCertifications = useMemo(() => {
    if (!certifications) return [];
    return certifications.filter((cert: any) => 
      cert.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [certifications, searchQuery]);

  const handleAddSkill = (val?: string) => {
    const skillToAdd = val || skillInput.trim();
    if (skillToAdd) {
      const currentSkills = Array.isArray(skills) ? skills : [];
      if (!currentSkills.map(s => (typeof s === 'string' ? s.toLowerCase() : '')).includes(skillToAdd.toLowerCase())) {
        setSkills([...currentSkills, skillToAdd]);
      }
      setSkillInput('');
      setModalVisible(false);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const currentSkills = Array.isArray(skills) ? skills : [];
    setSkills(currentSkills.filter(s => s !== skillToRemove));
  };

  const handleSave = async () => {
    try {
      await dispatch(updateSkills({ skills })).unwrap();
      showToast(t('profileSkills.skillsUpdated', 'Skills updated successfully!'), 'success');
      setTimeout(() => {
        navigation.goBack();
      }, 3000);
    } catch (err: any) {
      showToast(err?.message || t('profileSkills.failedToUpdateSkills', 'Failed to save skills'), 'error');
    }
  };

  return (
    <ProfileEditLayout
      title={t('profileSkills.skills', 'Skills')}
      subtitle={t('profileSkills.skillsSubtitle', 'Add skills to highlight your expertise.')}
    >
      <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
        
        <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>{t('profileSkills.selectSkill', 'Select from predefined skills')}</Text>
        <AnimatedPressable
          onPressIn={() => (scale.value = withSpring(0.97))}
          onPressOut={() => (scale.value = withSpring(1))}
          onPress={() => setModalVisible(true)}
          style={[
            styles.selectField,
            selectStyle,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <FontAwesomeIcon name="search" size={18} color={colors.primary} />
          <Text
            style={[
              typography.body,
              {
                color: colors.textPlaceholder,
                flex: 1,
              },
            ]}>
            {t('profileSkills.searchSkills', 'Search skills...')}
          </Text>
          <FontAwesomeIcon name="chevron-down" size={14} color={colors.textPlaceholder} />
        </AnimatedPressable>

        <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: spacing.md }]}>{t('profileSkills.addSkill', 'Or add a custom skill')}</Text>
        <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Icon name="award" size={18} color={colors.primary} />
          <TextInput
            placeholder={t('profileSkills.skillPlaceholder', 'e.g. Project Management, React...')}
            placeholderTextColor={colors.textPlaceholder}
            value={skillInput}
            onChangeText={setSkillInput}
            onSubmitEditing={() => handleAddSkill()}
            style={[typography.body, { color: colors.textPrimary, flex: 1, paddingVertical: 12, paddingHorizontal: 12 }]}
          />
          {skillInput.trim().length > 0 && (
            <TouchableOpacity onPress={() => handleAddSkill()} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
              <Text style={[typography.labelSmall, { color: '#FFF' }]}>{t('profileSkills.add', 'Add')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.chipContainer}>
          {(Array.isArray(skills) ? skills : []).map((skill, index) => (
            <Pressable
              key={index}
              onPress={() => handleRemoveSkill(skill)}
              style={[styles.chip, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
            >
              <Text style={[typography.small, { color: colors.primary, marginRight: 6 }]}>{skill}</Text>
              <Icon name="x" size={14} color={colors.primary} />
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(600).springify()} style={{ marginTop: spacing.xl }}>
        <PrimaryButton
          title={profileLoading ? t('profileSkills.saving', 'Saving...') : t('profileSkills.save', 'Save')}
          onPress={handleSave}
          colors={colors}
          disabled={profileLoading}
        />
      </Animated.View>

      {/* Modal for selecting predefined skills */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <AnimatedPressable
            entering={SlideInDown.duration(300)}
            exiting={SlideOutDown.duration(250)}
            style={[styles.sheet, { backgroundColor: colors.surface }]}
            onPress={(e: any) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
                {t('profileSkills.selectSkill', 'Select from predefined skills')}
              </Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={12}>
                <FontAwesomeIcon name="times" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={[styles.modalSearchContainer, { backgroundColor: colors.background }]}>
              <FontAwesomeIcon name="search" size={16} color={colors.textPlaceholder} />
              <TextInput
                placeholder={t('profileSkills.searchSkills', 'Search skills...')}
                placeholderTextColor={colors.textPlaceholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[typography.body, { color: colors.textPrimary, flex: 1, marginLeft: spacing.sm, paddingVertical: 8 }]}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredCertifications}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    handleAddSkill(item.name);
                    setSearchQuery('');
                  }}>
                  <Text style={[typography.body, { color: colors.textPrimary }]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: spacing.xxl }}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={[typography.body, { color: colors.textSecondary }]}>
                    No skills found. You can add it manually.
                  </Text>
                </View>
              )}
            />
          </AnimatedPressable>
        </Pressable>
      </Modal>

    </ProfileEditLayout>
  );
};

const styles = StyleSheet.create({
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  modalItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});

export default ProfileSkillsEditScreen;
