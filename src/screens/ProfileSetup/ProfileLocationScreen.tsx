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
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchMetaCities } from '../../redux/slice/metaSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../components/auth';
import { useProfileSetup } from '../../context/ProfileSetupContext';
import type { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { INDIAN_CITIES } from './profileSetupConstants';
import { ProfileSetupLayout } from './ProfileSetupLayout';

type Props = StackScreenProps<AuthStackParamList, 'ProfileLocation'>;

const ProfileLocationScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { draft, updateDraft } = useProfileSetup();
  const dispatch = useDispatch<AppDispatch>();
  const { cities } = useSelector((state: RootState) => state.meta);
  const [cityOpen, setCityOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState('');

  React.useEffect(() => {
    if (cities.length === 0) {
      dispatch(fetchMetaCities());
    }
  }, [dispatch, cities.length]);

  const filteredCities = useMemo(() => {
    const q = cityQuery.trim().toLowerCase();
    const source = cities.length > 0 ? cities.map(c => c.city) : INDIAN_CITIES;
    if (!q) {
      return source;
    }
    return source.filter(c => c.toLowerCase().includes(q));
  }, [cityQuery, cities]);

  const canContinue = draft.city.trim().length > 0 && draft.area.trim().length >= 2;

  return (
    <ProfileSetupLayout
      step={2}
      title="Location"
      subtitle="We use this to show jobs near you. You can change it anytime later.">
      <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>City</Text>
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
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
                Select city
              </Text>
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
        title="Continue"
        onPress={() => navigation.navigate('ProfileEducation')}
        disabled={!canContinue}
        colors={colors}
        iconRight={<Icon name="arrow-right" size={16} color={colors.onPrimary} />}
      />
    </ProfileSetupLayout>
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
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
    fontFamily: typography.body.fontFamily,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
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

export default ProfileLocationScreen;
