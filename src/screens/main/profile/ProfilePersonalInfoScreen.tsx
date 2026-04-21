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
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
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

const ProfilePersonalInfoScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { draft, updateDraft } = useProfileSetup();
  const { user } = useSelector((state: RootState) => state.auth);
  const [dobOpen, setDobOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState('');

  // Use user name if draft is empty
  const fullName = draft.fullName || user?.name || '';
  const email = user?.email || '';
  const phone = user?.phone || '';

  const markedDates = useMemo(
    () =>
      draft.dateOfBirth
        ? { [draft.dateOfBirth]: { selected: true, selectedColor: colors.primary } }
        : {},
    [colors.primary, draft.dateOfBirth],
  );

  const filteredCities = useMemo(() => {
    const q = cityQuery.trim().toLowerCase();
    if (!q) {
      return INDIAN_CITIES;
    }
    return INDIAN_CITIES.filter(c => c.toLowerCase().includes(q));
  }, [cityQuery]);

  const canSave =
    draft.fullName.trim().length >= 2 &&
    draft.gender !== '' &&
    draft.dateOfBirth !== '' &&
    draft.city.trim().length > 0 &&
    draft.area.trim().length >= 2;

  return (
    <ProfileEditLayout
      title="Personal info"
      subtitle="Your name, identity, and where you’re based — used across job matches.">
      <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Full name</Text>
      <TextInput
        value={fullName}
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

      <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: spacing.sm }]}>
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

      <Modal visible={dobOpen} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setDobOpen(false)}>
          <Pressable
            style={[styles.modalSheet, { backgroundColor: colors.surface }]}
            onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Date of birth</Text>
              <Pressable onPress={() => setDobOpen(false)} hitSlop={12}>
                <Text style={[typography.labelMedium, { color: colors.primary }]}>Done</Text>
              </Pressable>
            </View>
            <Calendar
              current={draft.dateOfBirth || undefined}
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
          </Pressable>
        </Pressable>
      </Modal>

      <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: spacing.md }]}>
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

      <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: spacing.sm }]}>
        Area / locality
      </Text>
      <TextInput
        value={draft.area}
        onChangeText={t => updateDraft({ area: t })}
        placeholder="e.g. Koramangala, Andheri West"
        placeholderTextColor={colors.textPlaceholder}
        style={[
          styles.input,
          {
            color: colors.textPrimary,
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      />

      <PrimaryButton
        title="Save"
        onPress={() => navigation.goBack()}
        disabled={!canSave}
        colors={colors}
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
});

export default ProfilePersonalInfoScreen;
