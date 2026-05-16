import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { StackScreenProps } from '@react-navigation/stack';
import { useToast } from '../../../context/ToastContext';
import { PrimaryButton } from '../../../components/auth';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchExperience, updateExperience } from '../../../redux/slice/profileSlice';
import { useProfileSetup } from '../../../context/ProfileSetupContext';
import type { ProfileStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { ProfileEditLayout } from './ProfileEditLayout';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ExperienceCard: React.FC<{
  label: string;
  icon: string;
  selected: boolean;
  onPress: () => void;
  colors: any;
}> = ({ label, icon, selected, onPress, colors }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    const bgColor = selected ? (colors?.surfaceHighlight || '#EFF6FF') : (colors?.surface || '#FFFFFF');
    const borderColor = selected ? (colors?.primary || '#2563EB') : (colors?.border || '#E5E7EB');

    return {
      transform: [{ scale: withSpring(selected ? 1.05 : 1) }],
      backgroundColor: withTiming(bgColor, { duration: 250 }),
      borderColor: withTiming(borderColor, { duration: 250 }),
      elevation: withTiming(selected ? 4 : 0),
      shadowOpacity: withTiming(selected ? 0.1 : 0),
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    const textColor = selected ? (colors?.primary || '#2563EB') : (colors?.textSecondary || '#6B7280');
    return {
      color: withTiming(textColor, { duration: 250 }),
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withSpring(0.95))}
      onPressOut={() => (scale.value = withSpring(1))}
      style={[styles.toggle, animatedStyle]}
    >
      <Animated.View style={{ alignItems: 'center', gap: spacing.xs }}>
        <Icon
          name={icon}
          size={24}
          color={selected ? colors.primary : colors.textSecondary}
        />
        <Animated.Text style={[typography.labelMedium, contentStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </AnimatedPressable>
  );
};

const AnimatedInput: React.FC<any> = ({ style, onFocus, onBlur, ...props }) => {
  const focusValue = useSharedValue(0);
  const { colors } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const bColor = colors?.border || '#E5E7EB';
    const pColor = colors?.primary || '#2563EB';

    return {
      borderColor: interpolateColor(
        focusValue.value,
        [0, 1],
        [bColor, pColor]
      ),
      borderWidth: withTiming(focusValue.value ? 1.5 : StyleSheet.hairlineWidth),
      elevation: withTiming(focusValue.value * 2),
    };
  });

  return (
    <Animated.View style={[animatedStyle, { borderRadius: radius.card, backgroundColor: colors.surface, overflow: 'hidden' }]}>
      <TextInput
        {...props}
        style={[style, { borderWidth: 0, textAlignVertical: 'center' }]}
        cursorColor={colors.primary}
        selectionColor={`${colors.primary}33`}
        onFocus={(e) => {
          focusValue.value = withTiming(1);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          focusValue.value = withTiming(0);
          onBlur?.(e);
        }}
      />
    </Animated.View>
  );
};

type Props = StackScreenProps<ProfileStackParamList, 'ProfileExperience'>;

const ProfileExperienceEditScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, data } = useSelector((state: RootState) => state.profile);

  const [isFresher, setIsFresher] = useState(true);
  const [years, setYears] = useState('');

  React.useEffect(() => {
    dispatch(fetchExperience());
  }, [dispatch]);

  React.useEffect(() => {
    if (data?.experience) {
      setIsFresher(data.experience.experience_type === 'fresher');
      setYears(data.experience.total_experience_years?.toString() || '');
    }
  }, [data]);

  const yearsNum = parseInt(years.replace(/\D/g, ''), 10);
  const canSave = isFresher || (!Number.isNaN(yearsNum) && yearsNum >= 1 && yearsNum <= 50);

  const handleSave = async () => {
    try {
      await dispatch(updateExperience({
        experience_type: isFresher ? 'fresher' : 'experienced',
        total_experience_years: isFresher ? null : yearsNum,
      })).unwrap();
      showToast('Experience updated successfully!', 'success');
      setTimeout(() => navigation.goBack(), 3000);
    } catch (err: any) {
      showToast(err?.message || 'Failed to update experience', 'error');
      console.error('Failed to update experience:', err);
    }
  };

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
      title="Experience"
      subtitle="Tell us if you’re starting out or already have work history.">

      {renderSection(
        <>
          <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Work experience</Text>
          <View style={styles.toggleRow}>
            <ExperienceCard
              label="Fresher"
              icon="leaf"
              selected={isFresher}
              onPress={() => {
                setIsFresher(true);
                setYears('');
              }}
              colors={colors}
            />
            <ExperienceCard
              label="Experienced"
              icon="briefcase"
              selected={!isFresher}
              onPress={() => setIsFresher(false)}
              colors={colors}
            />
          </View>
        </>,
        0
      )}

      {!isFresher ? (
        <Animated.View entering={FadeIn.duration(400)}>
          {renderSection(
            <>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: spacing.sm }]}>
                Total years of experience
              </Text>

              <View style={styles.chipGrid}>
                {[
                  { label: '0 to 1 Year', value: '1' },
                  { label: '1 to 2 Years', value: '2' },
                  { label: '2 to 3 Years', value: '3' },
                  { label: '3 to 5 Years', value: '5' },
                  { label: '5 to 7 Years', value: '7' },
                  { label: '7 to 10 Years', value: '10' },
                  { label: '10+ Years', value: '15' },
                ].map((range) => (
                  <Pressable
                    key={range.label}
                    onPress={() => setYears(range.value)}
                    style={[
                      styles.yearChip,
                      {
                        backgroundColor: years === range.value ? colors.primary : colors.surfaceHighlight,
                        borderColor: years === range.value ? colors.primary : colors.border,
                      }
                    ]}
                  >
                    <Text
                      style={[
                        typography.labelMedium,
                        { color: years === range.value ? colors.onPrimary : colors.textPrimary }
                      ]}
                    >
                      {range.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[typography.small, { color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xs }]}>
                Or enter manually:
              </Text>

              <AnimatedInput
                value={years}
                onChangeText={(t: string) => setYears(t.replace(/\D/g, '').slice(0, 2))}
                placeholder="e.g. 12"
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="number-pad"
                style={[
                  styles.input,
                  { color: colors.textPrimary },
                ]}
              />
              <Text style={[typography.small, { color: colors.textPlaceholder }]}>
                Whole years only (1–50).
              </Text>
            </>,
            1
          )}
        </Animated.View>
      ) : null}

      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {typeof error === 'string' ? error : (error.message || 'An error occurred')}
        </Text>
      )}

      <Animated.View entering={FadeInDown.delay(500).duration(500)}>
        <PrimaryButton
          title={loading ? "Saving..." : "Save"}
          onPress={handleSave}
          disabled={!canSave || loading}
          colors={colors}
        />
      </Animated.View>
    </ProfileEditLayout>
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
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  yearChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  input: {
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 52,
    fontSize: 16,
    fontFamily: typography.body.fontFamily,
  },
  errorText: {
    ...typography.small,
    marginTop: spacing.md,
    textAlign: 'center',
  }
});

export default ProfileExperienceEditScreen;
