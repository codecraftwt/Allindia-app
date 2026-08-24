import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { StackScreenProps } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { updatePersonalProfile, updatePreferencesProfile } from '../../redux/slice/profileSlice';
import { fetchMetaCities } from '../../redux/slice/metaSlice';
import type { AppDispatch, RootState } from '../../redux/store';
import { PrimaryButton } from '../../components/auth';
import type { Gender } from '../../context/ProfileSetupContext';
import { useProfileSetup } from '../../context/ProfileSetupContext';
import type { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ProfileSetupLayout } from './ProfileSetupLayout';

type Props = StackScreenProps<AuthStackParamList, 'ProfileBasicInfo'>;

const GENDERS: { id: Gender; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
];

const LANGUAGES = [
  { id: 'english', label: 'English' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'marathi', label: 'Marathi' },
  { id: 'gujarati', label: 'Gujarati' },
  { id: 'tamil', label: 'Tamil' },
  { id: 'telugu', label: 'Telugu' },
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

const ProfileBasicInfoScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { draft, updateDraft } = useProfileSetup();
  const dispatch = useDispatch<AppDispatch>();
  const [dobOpen, setDobOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickerMode, setPickerMode] = useState<'calendar' | 'year' | 'month'>('calendar');
  const [currentDateStr, setCurrentDateStr] = useState(draft.dateOfBirth || new Date().toISOString().slice(0, 10));

  const cities = useSelector((state: RootState) => state.meta.cities);
  const [currentCityModalOpen, setCurrentCityModalOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  React.useEffect(() => {
    dispatch(fetchMetaCities());
  }, [dispatch]);

  const uniqueCurrentCities = useMemo(() => {
    const seen = new Set<string>();
    return (cities || []).filter((c: any) => {
      const label = c.area || c.city || c.label || '';
      if (!label) return false;
      const lower = label.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  }, [cities]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const markedDates = useMemo(
    () =>
      draft.dateOfBirth
        ? { [draft.dateOfBirth]: { selected: true, selectedColor: colors.primary } }
        : {},
    [colors.primary, draft.dateOfBirth],
  );

  const canContinue =
    draft.fullName.trim().length >= 2 && 
    draft.gender !== '' && 
    draft.dateOfBirth !== '' &&
    draft.preferredLanguage !== '' &&
    draft.currentCity.trim() !== '';

  const handleContinue = async () => {
    setSaving(true);
    try {
      await dispatch(updatePersonalProfile({
        name: draft.fullName,
        gender: draft.gender,
        date_of_birth: draft.dateOfBirth,
        current_city: draft.currentCity,
        city: draft.currentCity,
        address: draft.currentCity,
      })).unwrap();

      if (draft.preferredLanguage || draft.currentCity) {
        await dispatch(updatePreferencesProfile({
          preferred_language: draft.preferredLanguage || undefined,
          current_city: draft.currentCity || undefined,
        })).unwrap();
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as any }],
      });
    } catch (e) {
      console.error('Save failed', e);
      setSaving(false);
    }
  };

  return (
    <ProfileSetupLayout
      step={1}
      title="Basic info"
      subtitle="Tell us a bit about you. This helps employers recognise your profile.">
      <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Full name</Text>
      <TextInput
        value={draft.fullName}
        onChangeText={t => updateDraft({ fullName: t })}
        placeholder="As on your ID / resume"
        placeholderTextColor={colors.textPlaceholder}
        style={[
          styles.input,
          {
            color: colors.textPrimary,
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        autoCapitalize="words"
        autoCorrect={false}
      />

      <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: spacing.sm }]}>
        Gender
      </Text>
      <View style={styles.genderRow}>
        {GENDERS.map(g => {
          const selected = draft.gender === g.id;
          return (
            <Pressable
              key={g.id}
              onPress={() => updateDraft({ gender: g.id })}
              style={[
                styles.genderChip,
                {
                  backgroundColor: selected ? colors.surfaceHighlight : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}>
              <Text
                style={[
                  typography.labelMedium,
                  { color: selected ? colors.primary : colors.textSecondary },
                ]}>
                {g.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: spacing.sm }]}>
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

      <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: spacing.sm }]}>
        Preferred language
      </Text>
      <View style={[styles.miniSearch, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: spacing.sm }]}>
        <Icon name="language" size={16} color={colors.primary} />
        <TextInput
          placeholder="Type your language..."
          placeholderTextColor={colors.textPlaceholder}
          value={draft.preferredLanguage || ''}
          onChangeText={(t) => updateDraft({ preferredLanguage: t })}
          style={[typography.body, { color: colors.textPrimary, flex: 1, paddingVertical: 8, marginLeft: 8 }]}
        />
        {draft.preferredLanguage ? (
          <TouchableOpacity onPress={() => updateDraft({ preferredLanguage: '' })}>
            <Icon name="times-circle" size={16} color={colors.textPlaceholder} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.genderRow}>
        {LANGUAGES.map(l => {
          const selected = draft.preferredLanguage?.toLowerCase() === l.id;
          return (
            <Pressable
              key={l.id}
              onPress={() => updateDraft({ preferredLanguage: l.label })}
              style={[
                styles.genderChip,
                {
                  backgroundColor: selected ? colors.surfaceHighlight : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}>
              <Text
                style={[
                  typography.labelMedium,
                  { color: selected ? colors.primary : colors.textSecondary },
                ]}>
                {l.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: spacing.sm }]}>
        Current city
      </Text>
      <Pressable
        onPress={() => {
          setCitySearch(draft.currentCity);
          setCurrentCityModalOpen(true);
        }}
        style={[
          styles.dobField,
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
              color: draft.currentCity ? colors.textPrimary : colors.textPlaceholder,
              flex: 1,
              marginLeft: 8,
            },
          ]}>
          {draft.currentCity || 'Select or type current city'}
        </Text>
        <Icon name="chevron-down" size={14} color={colors.textPlaceholder} />
      </Pressable>

      <Modal visible={dobOpen} animationType="slide" transparent onRequestClose={() => setDobOpen(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setDobOpen(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
                {pickerMode === 'calendar' ? 'Date of birth' : pickerMode === 'year' ? 'Select Year' : 'Select Month'}
              </Text>
              <Pressable onPress={() => { setDobOpen(false); setPickerMode('calendar'); }} hitSlop={12}>
                <Text style={[typography.labelMedium, { color: colors.primary }]}>Done</Text>
              </Pressable>
            </View>

            {pickerMode === 'calendar' && (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.sm }}>
                  <TouchableOpacity onPress={() => setPickerMode('month')} style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: colors.surfaceHighlight, borderRadius: 8 }}>
                     <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{months[parseInt(currentDateStr.split('-')[1], 10) - 1]}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setPickerMode('year')} style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: colors.surfaceHighlight, borderRadius: 8 }}>
                     <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{currentDateStr.split('-')[0]}</Text>
                  </TouchableOpacity>
                </View>
                <Calendar
                  key={currentDateStr.slice(0, 7)}
                  current={currentDateStr}
                  minDate="1950-01-01"
                  maxDate={new Date().toISOString().slice(0, 10)}
                  onDayPress={day => {
                    updateDraft({ dateOfBirth: day.dateString });
                    setCurrentDateStr(day.dateString);
                    setDobOpen(false);
                  }}
                  onMonthChange={month => setCurrentDateStr(month.dateString)}
                  markedDates={markedDates}
                  enableSwipeMonths
                  hideExtraDays={true}
                  renderHeader={() => null}
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
              </>
            )}

            {pickerMode === 'year' && (
              <ScrollView style={{ maxHeight: 300 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, justifyContent: 'center', gap: 10 }}>
                  {years.map(y => (
                    <TouchableOpacity key={y} onPress={() => {
                        const [, m, d] = currentDateStr.split('-');
                        setCurrentDateStr(`${y}-${m}-${d}`);
                        setPickerMode('calendar');
                      }}
                      style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: colors.surfaceHighlight, borderRadius: 8 }}>
                      <Text style={{ color: colors.textPrimary }}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}

            {pickerMode === 'month' && (
              <ScrollView style={{ maxHeight: 300 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, justifyContent: 'center', gap: 10 }}>
                  {months.map((m, i) => (
                    <TouchableOpacity key={m} onPress={() => {
                        const [y, , d] = currentDateStr.split('-');
                        setCurrentDateStr(`${y}-${String(i + 1).padStart(2, '0')}-${d}`);
                        setPickerMode('calendar');
                      }}
                      style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: colors.surfaceHighlight, borderRadius: 8 }}>
                      <Text style={{ color: colors.textPrimary }}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* City Modal */}
      <Modal
        visible={currentCityModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setCurrentCityModalOpen(false);
        }}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              setCurrentCityModalOpen(false);
            }}
          />
          <View style={[styles.modalSheet, { backgroundColor: colors.surface, flex: 1, marginTop: 'auto', maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
                Select Current City
              </Text>
              <Pressable onPress={() => {
                setCurrentCityModalOpen(false);
              }} hitSlop={12}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <TextInput
              value={citySearch}
              onChangeText={setCitySearch}
              placeholder="Search or type city manually..."
              placeholderTextColor={colors.textPlaceholder}
              style={[
                styles.input,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.surfaceHighlight,
                  borderColor: colors.border,
                  marginBottom: 16,
                  marginHorizontal: spacing.lg,
                },
              ]}
            />
            {citySearch.trim().length > 0 && !uniqueCurrentCities.some((c: any) => (c.area || c.city || c.label || '').toLowerCase() === citySearch.trim().toLowerCase()) && (
              <TouchableOpacity
                style={{ paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingHorizontal: spacing.lg }}
                onPress={() => {
                  updateDraft({ currentCity: citySearch.trim() });
                  setCurrentCityModalOpen(false);
                }}
              >
                <Text style={[typography.body, { color: colors.primary }]}>Use "{citySearch}"</Text>
              </TouchableOpacity>
            )}
            <FlatList
              data={uniqueCurrentCities.filter((c: any) => (c.area || c.city || c.label || '').toLowerCase().includes(citySearch.toLowerCase()))}
              keyExtractor={(item) => item.id.toString()}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const displayLabel = item.area || item.city || item.label;
                return (
                  <TouchableOpacity
                    style={{ paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingHorizontal: spacing.lg }}
                    onPress={() => {
                      updateDraft({ currentCity: displayLabel });
                      setCurrentCityModalOpen(false);
                    }}
                  >
                    <Text style={[typography.body, { color: colors.textPrimary }]}>{displayLabel}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      <PrimaryButton
        title="Continue"
        onPress={handleContinue}
        disabled={!canContinue || saving}
        loading={saving}
        colors={colors}
        iconRight={<Icon name="arrow-right" size={16} color={colors.onPrimary} />}
      />
    </ProfileSetupLayout>
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
  miniSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 8,
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});

export default ProfileBasicInfoScreen;
