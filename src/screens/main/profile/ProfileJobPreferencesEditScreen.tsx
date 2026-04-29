import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Pressable,
  ActivityIndicator,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { updatePreferencesProfile, fetchProfile } from '../../../redux/slice/profileSlice';
import {
  fetchMetaCategories,
  fetchMetaCities,
  fetchMetaQualifications,
} from '../../../redux/slice/metaSlice';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '../../../components/auth';
import type { ProfileStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { ProfileEditLayout } from './ProfileEditLayout';

// ─── Constants ──────────────────────────────────────────────────────────────
const MAX_SALARY_LIMIT = 40;
const SALARY_OPTIONS = Array.from({ length: MAX_SALARY_LIMIT + 1 }, (_, i) => i);

const EXP_TYPES = [
  { id: 'fresher', label: 'Fresher' },
  { id: 'experienced', label: 'Experienced' },
];

// ─── Components ─────────────────────────────────────────────────────────────

const Section = React.memo(({ title, subtitle, children, colors }: any) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionDot, { backgroundColor: colors.primary }]} />
      <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>{title}</Text>
    </View>
    {subtitle && <Text style={[typography.small, { color: colors.textPlaceholder, marginLeft: 22, marginBottom: spacing.xs }]}>{subtitle}</Text>}
    <View style={styles.sectionBody}>{children}</View>
  </View>
));

const CategoryAccordion = React.memo(({ category, selectedIds, isExpanded, onToggle, onSelectSub, colors }: any) => {
  const rotation = useSharedValue(0);
  
  const hasSelection = useMemo(() => 
    category.subcategories.some((sub: any) => selectedIds.includes(sub.id)),
    [category.subcategories, selectedIds]
  );

  useEffect(() => {
    rotation.value = withTiming(isExpanded ? 180 : 0);
  }, [isExpanded]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[
      styles.accordion, 
      { 
        backgroundColor: colors.surface, 
        borderColor: hasSelection ? colors.primary : colors.border,
        borderWidth: hasSelection ? 1.5 : 1
      }
    ]}>
      <Pressable 
        onPress={() => onToggle(category.id.toString())} 
        style={[
          styles.accordionHeader,
          hasSelection && { backgroundColor: colors.primary + '08' }
        ]}
      >
        <Text style={[
          typography.body, 
          { 
            color: hasSelection ? colors.primary : colors.textPrimary, 
            flex: 1,
            fontWeight: hasSelection ? '700' : '400'
          }
        ]}>
          {category.name}
          {hasSelection && (
            <Text style={[typography.small, { color: colors.primary }]}> (Selected)</Text>
          )}
        </Text>
        <Animated.View style={arrowStyle}>
          <Icon name="chevron-down" size={18} color={hasSelection ? colors.primary : colors.textPlaceholder} />
        </Animated.View>
      </Pressable>
      {isExpanded && (
        <View style={styles.subCatGrid}>
          {category.subcategories.map((sub: any) => {
            const active = selectedIds.includes(sub.id);
            return (
              <TouchableOpacity
                key={sub.id}
                onPress={() => onSelectSub(sub.id)}
                style={[styles.subCatItem, { backgroundColor: active ? colors.primary + '15' : colors.background, borderColor: active ? colors.primary : colors.border }]}
              >
                <Text style={[typography.small, { color: active ? colors.primary : colors.textSecondary }]}>{sub.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
});

const Chip = React.memo(({ label, selected, onPress, colors }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border }]}
  >
    <Text style={[typography.small, { color: selected ? '#fff' : colors.textSecondary }]}>{label}</Text>
  </TouchableOpacity>
));

const SalarySelectionField = ({ label, value, onPress, colors }: any) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.dropdownTrigger,
      {
        flex: 1,
        backgroundColor: colors.surface,
        borderColor: colors.border,
      },
    ]}>
    <Icon name="dollar-sign" size={18} color={colors.primary} />
    <View style={{ flex: 1 }}>
      <Text style={[typography.tiny, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[typography.body, { color: colors.textPrimary }]}>{value} Lakhs</Text>
    </View>
    <Icon name="chevron-down" size={14} color={colors.textPlaceholder} />
  </Pressable>
);

const SalaryRangeIndicator = ({ min, max, colors }: any) => {
  const minPos = (min / MAX_SALARY_LIMIT) * 100;
  const maxPos = (max / MAX_SALARY_LIMIT) * 100;
  
  return (
    <View style={styles.rangeIndicatorContainer}>
      <View style={[styles.rangeTrack, { backgroundColor: colors.surfaceHighlight }]}>
        <View style={[styles.rangeFill, { backgroundColor: colors.primary, left: `${minPos}%`, width: `${maxPos - minPos}%` }]} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={[typography.small, { color: colors.textPlaceholder }]}>₹0</Text>
        <Text style={[typography.small, { color: colors.textPlaceholder }]}>₹40L+</Text>
      </View>
    </View>
  );
};

const WFHCard = ({ active, onToggle, colors }: any) => (
  <Pressable 
    onPress={() => onToggle(!active)}
    style={[
      styles.wfhCard, 
      { 
        backgroundColor: active ? colors.primary : colors.surface, 
        borderColor: active ? colors.primary : colors.border 
      }
    ]}>
    <View style={[styles.wfhIconCircle, { backgroundColor: active ? 'rgba(255,255,255,0.2)' : colors.surfaceHighlight }]}>
      <Icon name="home" size={20} color={active ? '#fff' : colors.primary} />
    </View>
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={[typography.labelMedium, { color: active ? '#fff' : colors.textPrimary }]}>Remote / Work From Home</Text>
      <Text style={[typography.small, { color: active ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>Show jobs that don't require office visit</Text>
    </View>
    <Switch 
      value={active} 
      onValueChange={onToggle}
      trackColor={{ false: 'transparent', true: 'rgba(255,255,255,0.3)' }}
      thumbColor={active ? '#fff' : colors.textPlaceholder}
    />
  </Pressable>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

type Props = StackScreenProps<ProfileStackParamList, 'ProfileJobPreferencesEdit'>;

export const ProfileJobPreferencesEditScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  // Redux Data
  const { data: profile, loading: profileLoading } = useSelector((state: RootState) => state.profile);
  const { categories, cities, qualifications, loading: metaLoading } = useSelector((state: RootState) => state.meta);

  // Local States
  const [currentCityId, setCurrentCityId] = useState<number | null>(null);
  const [preferredCityIds, setPreferredCityIds] = useState<number[]>([]);
  const [jobCategoryIds, setJobCategoryIds] = useState<number[]>([]);
  const [minSalary, setMinSalary] = useState(2);
  const [maxSalary, setMaxSalary] = useState(5);
  const [workFromHome, setWorkFromHome] = useState(false);
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);
  const [catSearch, setCatSearch] = useState('');
  const [showAllCats, setShowAllCats] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modals
  const [showCityModal, setShowCityModal] = useState(false);
  const [showPrefCityModal, setShowPrefCityModal] = useState(false);
  const [showMinSalaryModal, setShowMinSalaryModal] = useState(false);
  const [showMaxSalaryModal, setShowMaxSalaryModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [prefCitySearch, setPrefCitySearch] = useState('');

  // Initial Sync
  useEffect(() => {
    if (!profile && !profileLoading) {
      dispatch(fetchProfile());
    }
    dispatch(fetchMetaCategories());
    dispatch(fetchMetaCities());
    dispatch(fetchMetaQualifications());

    const pref = profile?.preferences;
    if (pref) {
      setCurrentCityId(pref.current_city_id || null);
      setPreferredCityIds(pref.preferred_city_ids || []);
      const catIds = pref.job_category_id ? [pref.job_category_id] : (pref.job_category_ids || []);
      setJobCategoryIds(catIds);
      setMinSalary(Math.round((pref.expected_salary_min || 200000) / 100000));
      setMaxSalary(Math.round((pref.expected_salary_max || 500000) / 100000));
      setWorkFromHome(!!pref.work_from_home);
    }
  }, [dispatch, profile, profileLoading]);

  // Filter Categories
  const filteredCategories = useMemo(() =>
    categories.filter((cat: any) =>
      cat.name.toLowerCase().includes(catSearch.toLowerCase()) ||
      cat.subcategories.some((sub: any) => sub.name.toLowerCase().includes(catSearch.toLowerCase()))
    ),
    [categories, catSearch]
  );

  const currentCityLabel = cities.find((c: any) => c.id === currentCityId)?.label;

  const handleSave = async () => {
    setSaving(true);

    try {
      await dispatch(updatePreferencesProfile({
        current_city_id: currentCityId,
        preferred_city_ids: preferredCityIds,
        job_category_id: jobCategoryIds[0] || null,
        expected_salary_min: minSalary * 100000,
        expected_salary_max: maxSalary * 100000,
        work_from_home: workFromHome,
      })).unwrap();
      navigation.goBack();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  // ── Section Data for FlatList ──────────────────────────────────────────────
  const sections = useMemo(() => {
    const list: any[] = [];
    if (metaLoading && categories.length === 0) {
      list.push({ id: 'cat_loading', type: 'loading' });
    } else {
      // Logic for View More
      const limit = 6;
      const shouldTruncate = !showAllCats && catSearch.length === 0 && filteredCategories.length > limit;
      const displayCats = shouldTruncate ? filteredCategories.slice(0, limit) : filteredCategories;

      displayCats.forEach((cat: any) => {
        list.push({ id: `cat_${cat.id}`, type: 'category', data: cat });
      });

      if (shouldTruncate) {
        list.push({ id: 'view_more', type: 'view_more' });
      }
    }
    list.push(
      { id: 'salary', type: 'section', title: 'Expected salary' },
      { id: 'wfh', type: 'section', title: 'Work from home' }
    );
    list.push({ id: 'save', type: 'button' });
    return list;
  }, [filteredCategories, metaLoading, showAllCats, catSearch]);

  // ── Stable Header ─────────────────────────────────────────────────────────
  const ListHeader = useMemo(() => (
    <View style={{ paddingBottom: spacing.sm }}>
      <Section title="Current city" colors={colors}>
        <Pressable
          onPress={() => {
            setCitySearch('');
            setShowCityModal(true);
          }}
          style={[
            styles.dropdownTrigger,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Icon name="map-pin" size={18} color={colors.primary} />
          <Text
            style={[
              typography.body,
              {
                color: currentCityId ? colors.textPrimary : colors.textPlaceholder,
                flex: 1,
              },
            ]}>
            {currentCityLabel || 'Select city'}
          </Text>
          <Icon name="chevron-down" size={14} color={colors.textPlaceholder} />
        </Pressable>
      </Section>

      <Section title="Preferred job locations" colors={colors}>
        <Pressable
          onPress={() => {
            setPrefCitySearch('');
            setShowPrefCityModal(true);
          }}
          style={[
            styles.dropdownTrigger,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Icon name="navigation" size={18} color={colors.primary} />
          <Text
            style={[
              typography.body,
              {
                color: preferredCityIds.length ? colors.textPrimary : colors.textPlaceholder,
                flex: 1,
              },
            ]}>
            {preferredCityIds.length ? `${preferredCityIds.length} cities selected` : 'Select cities'}
          </Text>
          <Icon name="chevron-down" size={14} color={colors.textPlaceholder} />
        </Pressable>
      </Section>

      <View style={{ paddingHorizontal: 14, marginTop: spacing.md, marginBottom: spacing.sm }}>
        <Text style={[typography.labelMedium, { color: colors.textPrimary, marginBottom: spacing.xs }]}>Job category</Text>
        <View style={[styles.miniSearch, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Icon name="search" size={14} color={colors.textPlaceholder} />
          <TextInput
            placeholder="Search categories..."
            placeholderTextColor={colors.textPlaceholder}
            value={catSearch}
            onChangeText={setCatSearch}
            style={[typography.small, { color: colors.textPrimary, flex: 1, paddingVertical: 8 }]}
            autoCorrect={false}
          />
          {catSearch.length > 0 && (
            <TouchableOpacity onPress={() => setCatSearch('')}>
              <Icon name="x-circle" size={14} color={colors.textPlaceholder} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  ), [colors, currentCityId, currentCityLabel, preferredCityIds, catSearch]);

  const renderFlatItem = useCallback(({ item }: { item: any }) => {
    switch (item.type) {
      case 'section':
        let content = null;
        if (item.id === 'salary') content = (
          <View style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SalarySelectionField
                label="Min Salary"
                value={minSalary}
                onPress={() => setShowMinSalaryModal(true)}
                colors={colors}
              />
              <SalarySelectionField
                label="Max Salary"
                value={maxSalary}
                onPress={() => setShowMaxSalaryModal(true)}
                colors={colors}
              />
            </View>
            <SalaryRangeIndicator min={minSalary} max={maxSalary} colors={colors} />
          </View>
        );
        if (item.id === 'wfh') content = (
          <WFHCard active={workFromHome} onToggle={setWorkFromHome} colors={colors} />
        );
        return <Section title={item.title} colors={colors}>{content}</Section>;

      case 'category':
        return (
          <View style={{ marginBottom: spacing.xs, paddingHorizontal: 14 }}>
            <CategoryAccordion
              category={item.data}
              selectedIds={jobCategoryIds}
              isExpanded={expandedCatId === item.data.id.toString()}
              onToggle={(id: string) => setExpandedCatId(prev => (prev === id ? null : id))}
              onSelectSub={(subId: number) => {
                setJobCategoryIds(prev =>
                  prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
                );
              }}
              colors={colors}
            />
          </View>
        );
      case 'view_more':
        return (
          <TouchableOpacity
            onPress={() => setShowAllCats(true)}
            style={styles.viewMoreBtn}
          >
            <Text style={[typography.labelMedium, { color: colors.primary }]}>View More Categories</Text>
            <Icon name="chevron-down" size={16} color={colors.primary} />
          </TouchableOpacity>
        );
      case 'loading':
        return <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />;
      case 'button':
        return <View style={{ padding: 14 }}><PrimaryButton title={saving ? 'Saving...' : 'Save Preferences'} onPress={handleSave} colors={colors} /></View>;
      default:
        return null;
    }
  }, [colors, jobCategoryIds, expandedCatId, minSalary, maxSalary, workFromHome, saving, handleSave, showAllCats]);

  return (
    <ProfileEditLayout
      title="Job Preferences"
      subtitle="Set your location and field"
      useFlatList={true}
      flatListData={sections}
      renderFlatItem={renderFlatItem}
      scrollProps={{
        ListHeaderComponent: ListHeader
      }}
    >
      {/* City Modals */}
      <Modal visible={showCityModal} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCityModal(false)}>
          <Pressable
            style={[styles.citySheet, { backgroundColor: colors.surface }]}
            onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Select Current City</Text>
              <Pressable onPress={() => setShowCityModal(false)} hitSlop={12}>
                <Icon name="x" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <TextInput
              value={citySearch}
              onChangeText={setCitySearch}
              placeholder="Search city…"
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
              data={cities.filter((c: any) => c.label.toLowerCase().includes(citySearch.toLowerCase()))}
              keyExtractor={item => item.id.toString()}
              keyboardShouldPersistTaps="handled"
              style={styles.cityList}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setCurrentCityId(item.id);
                    setShowCityModal(false);
                  }}
                  style={[
                    styles.cityRow,
                    {
                      backgroundColor:
                        currentCityId === item.id ? colors.surfaceHighlight : 'transparent',
                    },
                  ]}>
                  <Text style={[typography.body, { color: colors.textPrimary }]}>{item.label}</Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={showMinSalaryModal} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowMinSalaryModal(false)}>
          <Pressable
            style={[styles.citySheet, { backgroundColor: colors.surface }]}
            onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Select Min Salary (LPA)</Text>
              <Pressable onPress={() => setShowMinSalaryModal(false)} hitSlop={12}>
                <Icon name="x" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <FlatList
              data={SALARY_OPTIONS}
              keyExtractor={item => item.toString()}
              keyboardShouldPersistTaps="handled"
              style={styles.cityList}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setMinSalary(Math.min(item, maxSalary));
                    setShowMinSalaryModal(false);
                  }}
                  style={[
                    styles.cityRow,
                    {
                      backgroundColor:
                        minSalary === item ? colors.surfaceHighlight : 'transparent',
                    },
                  ]}>
                  <Text style={[typography.body, { color: colors.textPrimary }]}>{item} Lakhs</Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showMaxSalaryModal} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowMaxSalaryModal(false)}>
          <Pressable
            style={[styles.citySheet, { backgroundColor: colors.surface }]}
            onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Select Max Salary (LPA)</Text>
              <Pressable onPress={() => setShowMaxSalaryModal(false)} hitSlop={12}>
                <Icon name="x" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <FlatList
              data={SALARY_OPTIONS}
              keyExtractor={item => item.toString()}
              keyboardShouldPersistTaps="handled"
              style={styles.cityList}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setMaxSalary(Math.max(item, minSalary));
                    setShowMaxSalaryModal(false);
                  }}
                  style={[
                    styles.cityRow,
                    {
                      backgroundColor:
                        maxSalary === item ? colors.surfaceHighlight : 'transparent',
                    },
                  ]}>
                  <Text style={[typography.body, { color: colors.textPrimary }]}>{item} Lakhs</Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={showPrefCityModal} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowPrefCityModal(false)}>
          <Pressable
            style={[styles.citySheet, { backgroundColor: colors.surface }]}
            onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Preferred Locations</Text>
              <Pressable onPress={() => setShowPrefCityModal(false)} hitSlop={12}>
                <Icon name="check" size={20} color={colors.primary} />
              </Pressable>
            </View>
            <TextInput
              value={prefCitySearch}
              onChangeText={setPrefCitySearch}
              placeholder="Search city…"
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
              data={cities.filter((c: any) => c.label.toLowerCase().includes(prefCitySearch.toLowerCase()))}
              keyExtractor={item => item.id.toString()}
              keyboardShouldPersistTaps="handled"
              style={styles.cityList}
              renderItem={({ item }) => {
                const selected = preferredCityIds.includes(item.id);
                return (
                  <Pressable
                    onPress={() => {
                      setPreferredCityIds(prev =>
                        selected ? prev.filter(id => id !== item.id) : [...prev, item.id]
                      );
                    }}
                    style={[
                      styles.cityRow,
                      {
                        backgroundColor: selected ? colors.surfaceHighlight : 'transparent',
                      },
                    ]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[typography.body, { color: selected ? colors.primary : colors.textPrimary }]}>
                        {item.label}
                      </Text>
                      {selected && <Icon name="check" size={16} color={colors.primary} />}
                    </View>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </ProfileEditLayout>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.xs },
  sectionDot: { width: 6, height: 6, borderRadius: 3 },
  sectionBody: { marginLeft: 0 },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  accordion: { borderRadius: radius.md, borderWidth: 1, padding: 12, overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', alignItems: 'center' },
  subCatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm },
  subCatItem: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, borderWidth: 1 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1 },
  rangeIndicatorContainer: {
    marginTop: 4,
    width: '100%',
    paddingHorizontal: 4,
  },
  rangeTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  rangeFill: {
    height: '100%',
    position: 'absolute',
    borderRadius: 3,
  },
  wfhCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  wfhIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: radius.md, borderWidth: 1 },
  segmentRow: { flexDirection: 'row', gap: 12 },
  segment: { flex: 1, padding: 14, borderRadius: radius.md, borderWidth: 1, alignItems: 'center' },
  yearsRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepper: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  yearsInput: { width: 60, height: 44, borderRadius: radius.sm, borderWidth: 1, fontSize: 18, fontWeight: 'bold' },
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
  miniSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 8,
  },
  viewMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
});

export default ProfileJobPreferencesEditScreen;
