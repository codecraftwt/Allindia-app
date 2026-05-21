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
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolateColor,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useToast } from '../../../context/ToastContext';
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

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function formatDobDisplay(iso: string) {
  if (!iso) {
    return '';
  }
  const [y, m, d] = iso.split('-');
  const mi = parseInt(m, 10) - 1;
  return `${d} ${MONTHS[mi]} ${y}`;
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

// --- Isolated DOB Picker Modal ---
interface DobPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  initialDate: string;
  colors: any;
  years: number[];
}

const DobPickerModal: React.FC<DobPickerModalProps> = React.memo(({
  visible,
  onClose,
  onSelect,
  initialDate,
  colors,
  years,
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date().toISOString().slice(0, 10));
  const [viewMode, setViewMode] = useState<'calendar' | 'year' | 'month'>('calendar');

  React.useEffect(() => {
    if (visible) {
      setCurrentDate(initialDate || new Date().toISOString().slice(0, 10));
      setViewMode('calendar');
    }
  }, [visible, initialDate]);

  const markedDates = useMemo(() => (
    initialDate ? { [initialDate]: { selected: true, selectedColor: colors.primary } } : {}
  ), [initialDate, colors.primary]);

  const calendarTheme = useMemo(() => ({
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
    textDayFontFamily: typography.body.fontFamily,
    textMonthFontFamily: typography.sectionTitle.fontFamily,
    textDayHeaderFontFamily: typography.labelMedium.fontFamily,
  }), [colors]);

  const currentYear = currentDate.split('-')[0];
  const currentMonthIdx = parseInt(currentDate.split('-')[1]) - 1;

  return (
    <Modal 
      visible={visible} 
      animationType="fade" 
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <AnimatedPressable
          entering={SlideInDown.duration(300).easing(Easing.out(Easing.quad))}
          exiting={SlideOutDown.duration(250).easing(Easing.in(Easing.quad))}
          style={[styles.modalSheet, { backgroundColor: colors.surface }]}
          onPress={e => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>DOB</Text>
              <Pressable
                onPress={() => setViewMode(viewMode === 'month' ? 'calendar' : 'month')}
                style={[styles.yearToggle, { backgroundColor: colors.surfaceHighlight }]}
              >
                <Text style={[typography.labelMedium, { color: colors.primary }]}>
                  {MONTHS[currentMonthIdx]}
                </Text>
                <Icon name={viewMode === 'month' ? "chevron-up" : "chevron-down"} size={10} color={colors.primary} />
              </Pressable>
              <Pressable
                onPress={() => setViewMode(viewMode === 'year' ? 'calendar' : 'year')}
                style={[styles.yearToggle, { backgroundColor: colors.surfaceHighlight }]}
              >
                <Text style={[typography.labelMedium, { color: colors.primary }]}>
                  {currentYear}
                </Text>
                <Icon name={viewMode === 'year' ? "chevron-up" : "chevron-down"} size={10} color={colors.primary} />
              </Pressable>
            </View>
            <Pressable 
              onPress={() => {
                onSelect(currentDate);
                onClose();
              }} 
              hitSlop={12}
            >
              <Text style={[typography.labelMedium, { color: colors.primary }]}>Done</Text>
            </Pressable>
          </View>

          {viewMode === 'year' ? (
            <View style={{ height: 320 }}>
              <FlatList
                key="year-list"
                data={years}
                keyExtractor={item => item.toString()}
                initialScrollIndex={years.indexOf(parseInt(currentYear)) !== -1 ? years.indexOf(parseInt(currentYear)) : 0}
                getItemLayout={(data, index) => ({ length: 50, offset: 50 * index, index })}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      const parts = currentDate.split('-');
                      setCurrentDate(`${item}-${parts[1]}-${parts[2]}`);
                      setViewMode('calendar');
                    }}
                    style={[styles.yearRow, { borderBottomColor: colors.border }]}
                  >
                    <Text style={[
                      typography.body,
                      { color: currentYear === item.toString() ? colors.primary : colors.textPrimary, textAlign: 'center' }
                    ]}>
                      {item}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          ) : viewMode === 'month' ? (
            <View style={{ padding: spacing.md, height: 320 }}>
              <FlatList
                key="month-grid"
                data={MONTHS}
                numColumns={3}
                keyExtractor={item => item}
                renderItem={({ item, index }) => (
                  <Pressable
                    onPress={() => {
                      const parts = currentDate.split('-');
                      setCurrentDate(`${parts[0]}-${String(index + 1).padStart(2, '0')}-${parts[2]}`);
                      setViewMode('calendar');
                    }}
                    style={[
                      styles.monthGridItem,
                      {
                        backgroundColor: currentMonthIdx === index ? colors.surfaceHighlight : colors.surface,
                        borderColor: currentMonthIdx === index ? colors.primary : colors.border,
                      }
                    ]}
                  >
                    <Text style={[
                      typography.labelMedium,
                      { color: currentMonthIdx === index ? colors.primary : colors.textPrimary }
                    ]}>
                      {item}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          ) : (
            <Calendar
              current={currentDate}
              onMonthChange={month => setCurrentDate(month.dateString)}
              minDate="1950-01-01"
              maxDate={new Date().toISOString().slice(0, 10)}
              onDayPress={day => onSelect(day.dateString)}
              markedDates={markedDates}
              enableSwipeMonths
              hideExtraDays
              firstDay={1}
              theme={calendarTheme}
            />
          )}
        </AnimatedPressable>
      </Pressable>
    </Modal>
  );
});

// --- Isolated City Picker Modal ---
interface CityPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: string) => void;
  currentCity: string;
  colors: any;
  cities: any[];
}

const CityPickerModal: React.FC<CityPickerModalProps> = React.memo(({
  visible,
  onClose,
  onSelect,
  currentCity,
  colors,
  cities,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = cities.length > 0 ? cities.map(c => c.city) : INDIAN_CITIES;
    if (!q) return source;
    return source.filter(c => c.toLowerCase().includes(q));
  }, [query, cities]);

  React.useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);

  return (
    <Modal 
      visible={visible} 
      animationType="fade" 
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <AnimatedPressable
          entering={SlideInDown.duration(300).easing(Easing.out(Easing.quad))}
          exiting={SlideOutDown.duration(250).easing(Easing.in(Easing.quad))}
          style={[styles.citySheet, { backgroundColor: colors.surface }]}
          onPress={e => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Select city</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Icon name="times" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
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
            data={filtered}
            keyExtractor={item => item}
            keyboardShouldPersistTaps="handled"
            style={styles.cityList}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item)}
                style={[
                  styles.cityRow,
                  { backgroundColor: currentCity === item ? colors.surfaceHighlight : 'transparent' },
                ]}>
                <Text style={[typography.body, { color: colors.textPrimary }]}>{item}</Text>
              </Pressable>
            )}
          />
        </AnimatedPressable>
      </Pressable>
    </Modal>
  );
});

const ProfilePersonalInfoScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const { draft, updateDraft } = useProfileSetup();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: profileData, loading: profileLoading } = useSelector((state: RootState) => state.profile);
  const { cities } = useSelector((state: RootState) => state.meta);
  const [dobOpen, setDobOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearList = [];
    for (let i = currentYear; i >= 1950; i--) {
      yearList.push(i);
    }
    return yearList;
  }, []);

  const handleDaySelect = React.useCallback((date: string) => {
    updateDraft({ dateOfBirth: date });
    setDobOpen(false);
  }, [updateDraft]);

  const handleCitySelect = React.useCallback((city: string) => {
    updateDraft({ city });
    setCityOpen(false);
  }, [updateDraft]);

  const markedDates = useMemo(
    () =>
      draft.dateOfBirth
        ? { [draft.dateOfBirth]: { selected: true, selectedColor: colors.primary } }
        : {},
    [colors.primary, draft.dateOfBirth],
  );

  React.useEffect(() => {
    if (cities.length === 0) {
      dispatch(fetchMetaCities());
    }
  }, [dispatch, cities.length]);




  React.useEffect(() => {
    if (profileData?.personal) {
      const p = profileData.personal;
      const pref = profileData.preferences;

      let city = '';
      if (typeof pref?.current_city === 'object' && pref.current_city !== null) {
        city = pref.current_city.city || '';
      } else {
        city = pref?.current_city || '';
      }
      let area = '';
      if (p.address && p.address.includes(',')) {
        const parts = p.address.split(',');
        city = parts[0].trim();
        area = parts.slice(1).join(',').trim();
      } else if (p.address) {
        if (!city) {
          city = p.address.trim();
        } else {
          area = p.address.trim();
        }
      }

      updateDraft({
        fullName: p.name || '',
        gender: (p.gender as Gender) || '',
        dateOfBirth: p.date_of_birth || '',
        city: city,
        area: area,
        boundary: '',
        bio: p.bio || '',
      });

      setPhoneNumber(p.phone || user?.phone || '');
    }
  }, [profileData, updateDraft]);

  const fullName = draft.fullName || user?.name || '';
  const email = user?.email || '';

  const canSave = !profileLoading;

  const handleSave = async () => {
    const nameToSave = draft.fullName.trim() || user?.name || '';
    if (nameToSave.length < 2) {
      showToast('Please enter a valid full name', 'error');
      return;
    }
    if (phoneNumber && phoneNumber.trim().length !== 10) {
      showToast('Phone number must be exactly 10 digits', 'error');
      return;
    }

    const address = draft.city 
      ? (draft.area ? `${draft.city}, ${draft.area}` : draft.city)
      : (draft.area || undefined);

    try {
      await dispatch(updatePersonalProfile({
        name: nameToSave,
        phone: phoneNumber || undefined,
        gender: draft.gender as string,
        date_of_birth: draft.dateOfBirth,
        address: address,
        bio: draft.bio,
      })).unwrap();
      
      showToast('Profile updated successfully!', 'success');
      
      setTimeout(() => {
        navigation.goBack();
      }, 3000);
    } catch (error: any) {
       showToast(error || 'Failed to save profile', 'error');
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
      title="Personal info">
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
          <AnimatedInput
            value={phoneNumber}
            onChangeText={(text: string) => {
              const clean = text.replace(/[^0-9]/g, '');
              setPhoneNumber(clean);
            }}
            placeholder="Enter phone number"
            placeholderTextColor={colors.textPlaceholder}
            keyboardType="phone-pad"
            maxLength={10}
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                backgroundColor: colors.surface,
              },
            ]}
          />
          {phoneNumber.length > 0 && phoneNumber.length < 10 && (
            <Text style={[typography.small, { color: colors.error, marginTop: 4, fontWeight: '500' }]}>
              Phone number must be exactly 10 digits
            </Text>
          )}
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
            onPress={() => setCityOpen(true)}
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
            Bio
          </Text>
          <AnimatedInput
            multiline
            numberOfLines={4}
            value={draft.bio}
            onChangeText={t => updateDraft({ bio: t })}
            placeholder="A short introduction about yourself..."
            placeholderTextColor={colors.textPlaceholder}
            style={[
              styles.textArea,
              {
                color: colors.textPrimary,
                backgroundColor: colors.surface,
              },
            ]}
          />
        </>,
        7
      )}

      <Animated.View entering={FadeInDown.delay(900).duration(500)}>
        <PrimaryButton
          title={profileLoading ? "Saving..." : "Save"}
          onPress={handleSave}
          disabled={!canSave}
          colors={colors}
        />
      </Animated.View>

      <DobPickerModal
        visible={dobOpen}
        onClose={() => setDobOpen(false)}
        onSelect={handleDaySelect}
        initialDate={draft.dateOfBirth}
        colors={colors}
        years={years}
      />

      <CityPickerModal
        visible={cityOpen}
        onClose={() => setCityOpen(false)}
        onSelect={handleCitySelect}
        currentCity={draft.city}
        colors={colors}
        cities={cities}
      />
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
  textArea: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default ProfilePersonalInfoScreen;
