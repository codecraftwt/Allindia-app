import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolateColor,
  interpolate
} from 'react-native-reanimated';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { updatePersonalProfile } from '../../../redux/slice/profileSlice';
import { fetchMetaCities } from '../../../redux/slice/metaSlice';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../../components/auth';
import type { Gender } from '../../../context/ProfileSetupContext';
import { useProfileSetup } from '../../../context/ProfileSetupContext';
import type { ProfileStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { INDIAN_CITIES } from '../../ProfileSetup/profileSetupConstants';
import { ProfileEditLayout } from './ProfileEditLayout';

type Props = StackScreenProps<ProfileStackParamList, 'ProfilePersonalInfo'>;

const GENDERS: { id: Gender; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
];

function formatDobDisplay(iso: string) {
  if (!iso) {
    return '';
  }
  const [y, m, d] = iso.split('-');
  const mi = parseInt(m, 10) - 1;
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${d} ${months[mi]} ${y}`;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GenderChip: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: any;
}> = ({ label, selected, onPress, colors }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    const bgColor = selected ? (colors?.surfaceHighlight || '#EFF6FF') : (colors?.surface || '#FFFFFF');
    const borderColor = selected ? (colors?.primary || '#2563EB') : (colors?.border || '#E5E7EB');
    const textColor = selected ? (colors?.primary || '#2563EB') : (colors?.textSecondary || '#6B7280');
    
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: withTiming(bgColor, { duration: 250 }),
      borderColor: withTiming(borderColor, { duration: 250 }),
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const textColor = selected ? (colors?.primary || '#2563EB') : (colors?.textSecondary || '#6B7280');
    return {
      color: withTiming(textColor, { duration: 250 }),
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.genderChip, animatedStyle]}
    >
      <Animated.Text style={[typography.labelMedium, textStyle]}>
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
};

const SkeletonItem: React.FC<{ width?: any; height: number; borderRadius?: number; style?: any }> = ({ width = '100%', height, borderRadius = radius.md, style }) => {
  const { colors } = useTheme();
  const shimmerValue = useSharedValue(-1);

  React.useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerValue.value, [-1, 1], [-200, 400]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View 
      style={[
        { 
          width, 
          height, 
          borderRadius, 
          backgroundColor: colors.surfaceSecondary, 
          overflow: 'hidden' 
        }, 
        style
      ]}
    >
      <Animated.View 
        style={[
          shimmerStyle, 
          { 
            width: '50%', 
            height: '100%', 
            backgroundColor: 'rgba(255,255,255,0.3)', 
            position: 'absolute' 
          }
        ]} 
      />
    </View>
  );
};

const ProfileSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.lg, paddingVertical: spacing.md }}>
      <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
        <SkeletonItem width={100} height={100} borderRadius={50} />
      </View>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={{ gap: spacing.xs }}>
          <SkeletonItem width={120} height={16} />
          <SkeletonItem height={50} borderRadius={radius.card} />
        </View>
      ))}
    </View>
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
      shadowOpacity: withTiming(focusValue.value * 0.1),
      shadowRadius: withTiming(focusValue.value * 4),
      elevation: withTiming(focusValue.value * 2),
    };
  });

  return (
    <Animated.View style={[animatedStyle, { borderRadius: radius.card, shadowColor: colors.primary }]}>
      <TextInput
        {...props}
        style={[style, { borderWidth: 0 }]} // Remove border from TextInput as Animated.View handles it
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

const ProfilePersonalInfoScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { draft, updateDraft } = useProfileSetup();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: profileData, loading: profileLoading } = useSelector((state: RootState) => state.profile);
  const { cities } = useSelector((state: RootState) => state.meta);

  // All State hooks
  const [dobOpen, setDobOpen] = useState(false);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState('');

  // All Memo hooks
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearList = [];
    for (let i = currentYear; i >= 1950; i--) {
      yearList.push(i);
    }
    return yearList;
  }, []);

  const markedDates = useMemo(
    () =>
      draft.dateOfBirth
        ? { [draft.dateOfBirth]: { selected: true, selectedColor: colors.primary } }
        : {},
    [colors.primary, draft.dateOfBirth],
  );

  const filteredCities = useMemo(() => {
    const q = cityQuery.trim().toLowerCase();
    const source = cities.length > 0 ? cities.map(c => c.city) : INDIAN_CITIES;
    if (!q) {
      return source;
    }
    return source.filter(c => c.toLowerCase().includes(q));
  }, [cityQuery, cities]);

  const calendarCurrent = useMemo(() => {
    if (draft.dateOfBirth) return draft.dateOfBirth;
    return new Date().toISOString().slice(0, 10);
  }, [draft.dateOfBirth]);

  // All Effect hooks
  React.useEffect(() => {
    if (cities.length === 0) {
      dispatch(fetchMetaCities());
    }
  }, [dispatch, cities.length]);

  React.useEffect(() => {
    if (profileData?.profile?.personal) {
      const p = profileData.profile.personal;
      const pref = profileData.profile.preferences;

      let city = pref?.current_city || '';
      let area = '';
      if (p.address && p.address.includes(',')) {
        const parts = p.address.split(',');
        city = parts[0].trim();
        area = parts.slice(1).join(',').trim();
      } else if (p.address) {
        area = p.address;
      }

      updateDraft({
        fullName: p.name || '',
        gender: (p.gender as Gender) || '',
        dateOfBirth: p.date_of_birth || '',
        city: city,
        area: area,
      });
    }
  }, [profileData, updateDraft]);

  const fullName = draft.fullName || user?.name || '';
  const email = user?.email || '';
  const phone = user?.phone || '';

  const canSave =
    draft.fullName.trim().length >= 2 &&
    draft.gender !== '' &&
    draft.dateOfBirth !== '' &&
    draft.city.trim().length > 0 &&
    draft.area.trim().length >= 2 &&
    !profileLoading;

  const handleSave = async () => {
    try {
      await dispatch(updatePersonalProfile({
        name: draft.fullName,
        phone: user?.phone || undefined,
        gender: draft.gender as string,
        date_of_birth: draft.dateOfBirth,
        address: `${draft.city}, ${draft.area}`,
      })).unwrap();
      navigation.goBack();
    } catch (error) {

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
      title="Personal info"
      subtitle="Your name, identity, and where you’re based — used across job matches.">

      {renderSection(
        <>
          <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Full name</Text>
          <AnimatedInput
            value={fullName}
            onChangeText={t => updateDraft({ fullName: t })}
            placeholder="As on your ID / resume"
            placeholderTextColor={colors.textPlaceholder}
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                backgroundColor: colors.surface,
              },
            ]}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </>,
        0
      )}

      {renderSection(
        <>
          <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>
            Email Address
          </Text>
          <TextInput
            value={email}
            editable={false}
            style={[
              styles.input,
              {
                color: colors.textSecondary,
                backgroundColor: colors.surfaceHighlight,
                borderColor: colors.border,
              },
            ]}
          />
        </>,
        1
      )}

      {renderSection(
        <>
          <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>
            Phone Number
          </Text>
          <TextInput
            value={phone}
            editable={false}
            style={[
              styles.input,
              {
                color: colors.textSecondary,
                backgroundColor: colors.surfaceHighlight,
                borderColor: colors.border,
              },
            ]}
          />
        </>,
        2
      )}

      {renderSection(
        <>
          <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>
            Gender
          </Text>
          <View style={styles.genderRow}>
            {GENDERS.map((g, idx) => {
              const selected = draft.gender === g.id;

              return (
                <GenderChip
                  key={g.id}
                  label={g.label}
                  selected={selected}
                  onPress={() => updateDraft({ gender: g.id })}
                  colors={colors}
                />
              );
            })}
          </View>
        </>,
        3
      )}

      {renderSection(
        <>
          <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>
            Date of birth
          </Text>
          <Pressable
            onPress={() => setDobOpen(true)}
            style={[
              styles.dobField,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Icon name="calendar" size={18} color={colors.primary} />
            <Text
              style={[
                typography.body,
                {
                  color: draft.dateOfBirth ? colors.textPrimary : colors.textPlaceholder,
                  flex: 1,
                },
              ]}>
              {draft.dateOfBirth ? formatDobDisplay(draft.dateOfBirth) : 'Select date of birth'}
            </Text>
            <Icon name="chevron-down" size={14} color={colors.textPlaceholder} />
          </Pressable>
        </>,
        4
      )}

      {renderSection(
        <>
          <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>
            City
          </Text>
          <Pressable
            onPress={() => {
              setCityQuery('');
              setCityOpen(true);
            }}
            style={[
              styles.selectField,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Icon name="map-marker" size={18} color={colors.primary} />
            <Text
              style={[
                typography.body,
                {
                  color: draft.city ? colors.textPrimary : colors.textPlaceholder,
                  flex: 1,
                },
              ]}>
              {draft.city || 'Search or select city'}
            </Text>
            <Icon name="chevron-down" size={14} color={colors.textPlaceholder} />
          </Pressable>
        </>,
        5
      )}

      {renderSection(
        <>
          <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>
            Area / locality
          </Text>
          <AnimatedInput
            value={draft.area}
            onChangeText={t => updateDraft({ area: t })}
            placeholder="e.g. Koramangala, Andheri West"
            placeholderTextColor={colors.textPlaceholder}
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                backgroundColor: colors.surface,
              },
            ]}
          />
        </>,
        6
      )}

      <Animated.View entering={FadeInDown.delay(900).duration(500)}>
        <PrimaryButton
          title={profileLoading ? "Saving..." : "Save"}
          onPress={handleSave}
          disabled={!canSave}
          colors={colors}
        />
      </Animated.View>

      <Modal visible={dobOpen} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setDobOpen(false)}>
          <Pressable
            style={[styles.modalSheet, { backgroundColor: colors.surface }]}
            onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Date of birth</Text>
                <Pressable
                  onPress={() => setYearPickerOpen(!yearPickerOpen)}
                  style={[styles.yearToggle, { backgroundColor: colors.surfaceHighlight }]}
                >
                  <Text style={[typography.labelMedium, { color: colors.primary }]}>
                    {draft.dateOfBirth ? draft.dateOfBirth.split('-')[0] : new Date().getFullYear()}
                  </Text>
                  <Icon name={yearPickerOpen ? "chevron-up" : "chevron-down"} size={10} color={colors.primary} />
                </Pressable>
              </View>
              <Pressable onPress={() => setDobOpen(false)} hitSlop={12}>
                <Text style={[typography.labelMedium, { color: colors.primary }]}>Done</Text>
              </Pressable>
            </View>

            {yearPickerOpen ? (
              <View style={{ height: 300 }}>
                <FlatList
                  data={years}
                  keyExtractor={item => item.toString()}
                  initialScrollIndex={years.indexOf(parseInt(draft.dateOfBirth?.split('-')[0] || new Date().getFullYear().toString()))}
                  getItemLayout={(data, index) => ({ length: 50, offset: 50 * index, index })}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        const currentDob = draft.dateOfBirth || new Date().toISOString().slice(0, 10);
                        const parts = currentDob.split('-');
                        const newDob = `${item}-${parts[1] || '01'}-${parts[2] || '01'}`;
                        updateDraft({ dateOfBirth: newDob });
                        setYearPickerOpen(false);
                      }}
                      style={[
                        styles.yearRow,
                        { borderBottomColor: colors.border }
                      ]}
                    >
                      <Text style={[
                        typography.body,
                        { color: (draft.dateOfBirth?.startsWith(item.toString())) ? colors.primary : colors.textPrimary, textAlign: 'center' }
                      ]}>
                        {item}
                      </Text>
                    </Pressable>
                  )}
                />
              </View>
            ) : (
              <Calendar
                current={calendarCurrent}
                minDate="1950-01-01"
                maxDate={new Date().toISOString().slice(0, 10)}
                onDayPress={day => {
                  updateDraft({ dateOfBirth: day.dateString });
                  setDobOpen(false);
                }}
                markedDates={markedDates}
                enableSwipeMonths
                theme={{
                  backgroundColor: colors.surface,
                  calendarBackground: colors.surface,
                  textSectionTitleColor: colors.textSecondary,
                  selectedDayBackgroundColor: colors.primary,
                  selectedDayTextColor: colors.onPrimary,
                  todayTextColor: colors.primary,
                  dayTextColor: colors.textPrimary,
                  textDisabledColor: colors.textPlaceholder,
                  monthTextColor: colors.textPrimary,
                  arrowColor: colors.primary,
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={cityOpen} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setCityOpen(false)}>
          <Pressable
            style={[styles.citySheet, { backgroundColor: colors.surface }]}
            onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Select city</Text>
              <Pressable onPress={() => setCityOpen(false)} hitSlop={12}>
                <Icon name="times" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <TextInput
              value={cityQuery}
              onChangeText={setCityQuery}
              placeholder="Type to search…"
              placeholderTextColor={colors.textPlaceholder}
              style={[
                styles.searchInput,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.surfaceHighlight,
                  borderColor: colors.border,
                },
              ]}
            />
            <FlatList
              data={filteredCities}
              keyExtractor={item => item}
              keyboardShouldPersistTaps="handled"
              style={styles.cityList}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    updateDraft({ city: item });
                    setCityOpen(false);
                  }}
                  style={[
                    styles.cityRow,
                    {
                      backgroundColor:
                        draft.city === item ? colors.surfaceHighlight : 'transparent',
                    },
                  ]}>
                  <Text style={[typography.body, { color: colors.textPrimary }]}>{item}</Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </ProfileEditLayout>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
    fontFamily: typography.body.fontFamily,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  genderChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.button,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: '28%',
    alignItems: 'center',
  },
  dobField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
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
  modalSheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: spacing.xl,
    maxHeight: '72%',
  },
  citySheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '78%',
    paddingBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchInput: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.search,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    fontFamily: typography.body.fontFamily,
  },
  cityList: {
    maxHeight: 360,
  },
  cityRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  yearToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  yearRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthGridItem: {
    flex: 1,
    margin: 4,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfilePersonalInfoScreen;
