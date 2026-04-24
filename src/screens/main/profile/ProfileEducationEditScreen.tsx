import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchMetaQualifications } from '../../../redux/slice/metaSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
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
  const { colors } = useTheme();
  const { draft, updateDraft } = useProfileSetup();
  const dispatch = useDispatch<AppDispatch>();
  const { qualifications } = useSelector((state: RootState) => state.meta);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (qualifications.length === 0) {
      dispatch(fetchMetaQualifications());
    }
  }, [dispatch, qualifications.length]);

  const displayData = qualifications.length > 0 ? qualifications.map(q => q.name) : QUALIFICATIONS;

  const canSave = draft.qualification.trim().length > 0;

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
      title="Education"
      subtitle="Your highest qualification helps match you to the right roles.">
      
      {renderSection(
        <>
          <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Qualification</Text>
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
                  color: draft.qualification ? colors.textPrimary : colors.textPlaceholder,
                  flex: 1,
                },
              ]}>
              {draft.qualification || 'Select qualification'}
            </Text>
            <Icon name="chevron-down" size={14} color={colors.textPlaceholder} />
          </AnimatedPressable>
        </>,
        0
      )}

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
              data={displayData}
              keyExtractor={item => item}
              style={styles.list}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
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
                </Animated.View>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Animated.View entering={FadeInDown.delay(500).duration(500)}>
        <PrimaryButton title="Save" onPress={() => navigation.goBack()} disabled={!canSave} colors={colors} />
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
});

export default ProfileEducationEditScreen;
