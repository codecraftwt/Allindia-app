import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Animated as RNAnimated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  runOnJS,
  useDerivedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { updatePreferencesProfile, fetchProfile } from '../../../redux/slice/profileSlice';
import {
  fetchMetaCategories,
  fetchMetaCities,
  fetchMetaQualifications,
} from '../../../redux/slice/metaSlice';
import type { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from '../../../context/ToastContext';
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
  { id: 'experienced', label: 'Experienced' },
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
    category.subcategories.some((sub: any) => selectedIds.map(Number).includes(Number(sub.id))),
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
            const active = selectedIds.map(Number).includes(Number(sub.id));
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

const SalarySelectionField = ({ label, value, onChange, colors }: any) => (
  <View
    style={[
      styles.dropdownTrigger,
      {
        flex: 1,
        backgroundColor: colors.surface,
        borderColor: colors.border,
      },
    ]}>
    <Text style={{ fontSize: 18, color: colors.primary, fontWeight: 'bold', width: 20, textAlign: 'center' }}>₹</Text>
    <View style={{ flex: 1 }}>
      <Text style={[typography.tiny, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        keyboardType="number-pad"
        value={value.toString()}
        onChangeText={(text) => {
          const val = parseInt(text.replace(/\D/g, ''), 10) || 0;
          onChange(Math.min(val, MAX_SALARY_LIMIT));
        }}
        placeholder="0"
        placeholderTextColor={colors.textPlaceholder}
        style={[typography.body, { color: colors.textPrimary, padding: 0, height: 24 }]}
      />
    </View>
    <Text style={[typography.tiny, { color: colors.textPlaceholder }]}>LPA</Text>
  </View>
);

const InteractiveRangeSlider = ({ min, max, colors, onChange }: any) => {
  const [layoutWidth, setLayoutWidth] = useState(0);
  const minX = useSharedValue(0);
  const maxX = useSharedValue(0);
  const startMinX = useSharedValue(0);
  const startMaxX = useSharedValue(0);

  // Sync with props only when layout or props change
  useEffect(() => {
    if (layoutWidth > 0) {
      minX.value = (min / MAX_SALARY_LIMIT) * layoutWidth;
      maxX.value = (max / MAX_SALARY_LIMIT) * layoutWidth;
    }
  }, [min, max, layoutWidth]);

  const updateParent = (isMin: boolean) => {
    const finalMin = Math.round((minX.value / layoutWidth) * MAX_SALARY_LIMIT);
    const finalMax = Math.round((maxX.value / layoutWidth) * MAX_SALARY_LIMIT);
    onChange(finalMin, finalMax);
  };

  const minGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startMinX.value = minX.value;
    })
    .onUpdate((e) => {
      'worklet';
      minX.value = Math.max(0, Math.min(maxX.value - 20, startMinX.value + e.translationX));
    })
    .onEnd(() => {
      'worklet';
      runOnJS(updateParent)(true);
    });

  const maxGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startMaxX.value = maxX.value;
    })
    .onUpdate((e) => {
      'worklet';
      maxX.value = Math.max(minX.value + 20, Math.min(layoutWidth, startMaxX.value + e.translationX));
    })
    .onEnd(() => {
      'worklet';
      runOnJS(updateParent)(false);
    });

  const minThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: minX.value - 12 }],
  }));

  const maxThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: maxX.value - 12 }],
  }));

  const trackStyle = useAnimatedStyle(() => ({
    left: minX.value,
    width: maxX.value - minX.value,
  }));

  // Create Animated Labels


  return (
    <View 
      style={styles.rangeIndicatorContainer}
      onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
    >
      <View style={[styles.rangeTrack, { backgroundColor: colors.surfaceHighlight }]}>
        <Animated.View style={[styles.rangeFill, { backgroundColor: colors.primary }, trackStyle]} />
      </View>
      
      {layoutWidth > 0 && (
        <>
          <GestureDetector gesture={minGesture}>
            <Animated.View style={[styles.sliderThumb, minThumbStyle, { backgroundColor: '#fff', borderColor: colors.primary }]} />
          </GestureDetector>
          
          <GestureDetector gesture={maxGesture}>
            <Animated.View style={[styles.sliderThumb, maxThumbStyle, { backgroundColor: '#fff', borderColor: colors.primary }]} />
          </GestureDetector>
        </>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
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

// ─── Skeleton Components ───────────────────────────────────────────────────

const SkeletonPulse: React.FC<{ style: any }> = ({ style }) => {
  const opacity = useMemo(() => new RNAnimated.Value(0.3), []);
  const { colors } = useTheme();

  useEffect(() => {
    const loop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        RNAnimated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <RNAnimated.View style={[style, { backgroundColor: colors.border, opacity }]} />;
};

// ─── Custom Animated Sheet Wrapper ───────────────────────────────────────
const BottomSheetContent = ({ children, visible, colors }: any) => {
  const translateY = useSharedValue(500); // Start off-screen

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 250 });
    } else {
      translateY.value = 500;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.citySheet,
        { backgroundColor: colors.surface },
        animatedStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const PreferencesSkeleton = ({ colors }: any) => (
  <View style={{ gap: spacing.lg, paddingHorizontal: 4 }}>
    {/* Current City Skeleton */}
    <View style={{ gap: spacing.xs }}>
      <SkeletonPulse style={{ width: 100, height: 16, borderRadius: 4, marginBottom: 4 }} />
      <SkeletonPulse style={{ width: '100%', height: 52, borderRadius: radius.md }} />
    </View>

    {/* Preferred Locations Skeleton */}
    <View style={{ gap: spacing.xs }}>
      <SkeletonPulse style={{ width: 120, height: 16, borderRadius: 4, marginBottom: 4 }} />
      <SkeletonPulse style={{ width: '100%', height: 52, borderRadius: radius.md }} />
    </View>

    {/* Job Category Search Skeleton */}
    <View style={{ gap: spacing.xs }}>
      <SkeletonPulse style={{ width: 90, height: 16, borderRadius: 4, marginBottom: 4 }} />
      <SkeletonPulse style={{ width: '100%', height: 44, borderRadius: radius.md }} />
    </View>

    {/* Categories Skeleton List */}
    <View style={{ gap: spacing.sm }}>
      {[1, 2, 3, 4, 5].map(i => (
        <SkeletonPulse key={i} style={{ width: '100%', height: 48, borderRadius: radius.md }} />
      ))}
    </View>

    {/* Salary Skeleton */}
    <View style={{ gap: spacing.xs }}>
      <SkeletonPulse style={{ width: 110, height: 16, borderRadius: 4, marginBottom: 4 }} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <SkeletonPulse style={{ flex: 1, height: 52, borderRadius: radius.md }} />
        <SkeletonPulse style={{ flex: 1, height: 52, borderRadius: radius.md }} />
      </View>
      <SkeletonPulse style={{ width: '100%', height: 6, borderRadius: 3, marginTop: 8 }} />
    </View>

    {/* WFH Skeleton */}
    <View style={{ gap: spacing.xs }}>
      <SkeletonPulse style={{ width: 100, height: 16, borderRadius: 4, marginBottom: 4 }} />
      <SkeletonPulse style={{ width: '100%', height: 76, borderRadius: radius.lg }} />
    </View>

    {/* Button Skeleton */}
    <SkeletonPulse style={{ width: '100%', height: 52, borderRadius: radius.md, marginTop: spacing.md }} />
  </View>
);

// ── Category Search Component (Stable) ──────────────────────────────────────
const CategorySearchField = React.memo(({ value, onChange, colors }: any) => (
  <View style={{ paddingHorizontal: 14, marginTop: spacing.md, marginBottom: spacing.sm }}>
    <Text style={[typography.labelMedium, { color: colors.textPrimary, marginBottom: spacing.xs }]}>Job category</Text>
    <View style={[styles.miniSearch, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Icon name="search" size={14} color={colors.textPlaceholder} />
      <TextInput
        placeholder="Search categories..."
        placeholderTextColor={colors.textPlaceholder}
        value={value}
        onChangeText={onChange}
        style={[typography.small, { color: colors.textPrimary, flex: 1, paddingVertical: 8 }]}
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange('')}>
          <Icon name="x-circle" size={14} color={colors.textPlaceholder} />
        </TouchableOpacity>
      )}
    </View>
  </View>
));

// ─── Main Screen ─────────────────────────────────────────────────────────────

type Props = StackScreenProps<ProfileStackParamList, 'ProfileJobPreferencesEdit'>;

export const ProfileJobPreferencesEditScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  // Redux Data
  const { data: profile, loading: profileLoading } = useSelector((state: RootState) => state.profile);
  const { categories, cities, qualifications, loading: metaLoading } = useSelector((state: RootState) => state.meta);

  // Local States
  const [currentCityId, setCurrentCityId] = useState<number | null>(null);
  const [preferredCityIds, setPreferredCityIds] = useState<number[]>([]);
  const [jobCategoryIds, setJobCategoryIds] = useState<number[]>([]);
  const [minSalary, setMinSalary] = useState<number>(2);
  const [maxSalary, setMaxSalary] = useState<number>(5);
  const [workFromHome, setWorkFromHome] = useState(false);
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);
  const [catSearch, setCatSearch] = useState('');
  const [langInput, setLangInput] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<string | null>(null);
  const [showAllCats, setShowAllCats] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modals
  const [showCityModal, setShowCityModal] = useState(false);
  const [showPrefCityModal, setShowPrefCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [prefCitySearch, setPrefCitySearch] = useState('');

  const isInitialized = useRef(false);

  // Fetch meta data whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMetaCategories());
      dispatch(fetchMetaCities());
      dispatch(fetchMetaQualifications());
      dispatch(fetchProfile());
    }, [dispatch])
  );

  // Initial Sync from Profile — wait for BOTH profile AND meta to be ready
  useEffect(() => {
    const metaReady = cities.length > 0 && categories.length > 0;
    if (profile?.preferences && metaReady && !isInitialized.current) {
      const pref = profile.preferences;
      setCurrentCityId(pref.current_city_id ? Number(pref.current_city_id) : null);
      setPreferredCityIds((pref.preferred_city_ids || []).map(Number));
      const catIds = (pref.job_category_ids && pref.job_category_ids.length > 0)
        ? pref.job_category_ids.map(Number)
        : (pref.job_category_id ? [Number(pref.job_category_id)] : []);
      setJobCategoryIds(catIds);
      setMinSalary(Math.round((pref.expected_salary_min || 200000) / 100000));
      setMaxSalary(Math.round((pref.expected_salary_max || 500000) / 100000));
      setWorkFromHome(!!pref.work_from_home);
      setPreferredLanguage(pref.preferred_language || null);

      isInitialized.current = true;
    } else if (!profile && !profileLoading) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profile, profileLoading, cities, categories]);

  // Filter Categories
  // Filter and Sort Categories (selected first)
  const filteredCategories = useMemo(() => {
    const filtered = categories.filter((cat: any) =>
      cat.name.toLowerCase().includes(catSearch.toLowerCase()) ||
      cat.subcategories.some((sub: any) => sub.name.toLowerCase().includes(catSearch.toLowerCase()))
    );

    // Sort so categories with selected subcategories come first
    return [...filtered].sort((a, b) => {
      const aHas = a.subcategories.some((sub: any) => jobCategoryIds.map(Number).includes(Number(sub.id)));
      const bHas = b.subcategories.some((sub: any) => jobCategoryIds.map(Number).includes(Number(sub.id)));
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      return 0;
    });
  }, [categories, catSearch, jobCategoryIds]);

  // Selected subcategories list
  const selectedSubcategories = useMemo(() => {
    const list: { id: number; name: string }[] = [];
    categories.forEach((cat: any) => {
      cat.subcategories.forEach((sub: any) => {
        if (jobCategoryIds.map(Number).includes(Number(sub.id))) {
          list.push({ id: Number(sub.id), name: sub.name });
        }
      });
    });
    return list;
  }, [categories, jobCategoryIds]);

  const currentCityLabel = cities.find((c: any) => Number(c.id) === Number(currentCityId))?.label;

  const handleSave = async () => {
    setSaving(true);
    let finalLanguage = preferredLanguage;
    const val = langInput.trim();
    if (val) {
      let current = preferredLanguage ? preferredLanguage.split(',').map(s => s.trim()) : [];
      if (!current.map(s => s.toLowerCase()).includes(val.toLowerCase())) {
        current.push(val);
        finalLanguage = current.join(', ');
      }
    }

    const validCityIds = cities.map(c => Number(c.id));
    const payload = {
      current_city_id: currentCityId ? Number(currentCityId) : null,
      preferred_city_ids: preferredCityIds
        .map(id => Number(id))
        .filter(id => validCityIds.includes(id)),
      job_category_id: jobCategoryIds[0] ? Number(jobCategoryIds[0]) : null,
      job_category_ids: jobCategoryIds.map(Number),
      expected_salary_min: Number(minSalary) * 100000,
      expected_salary_max: Number(maxSalary) * 100000,
      work_from_home: workFromHome,
      preferred_language: finalLanguage ? finalLanguage.trim() : null,
    };
    console.log('Saving Job Preferences Payload:', JSON.stringify(payload, null, 2));
    try {
      await dispatch(updatePreferencesProfile(payload)).unwrap();
      showToast('Job preferences saved!', 'success');
      setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          // Fallback if no history (e.g. initial profile setup)
          navigation.navigate('ProfileOverview' as any);
        }
      }, 3000);
    } catch (err: any) {
      showToast(err?.message || 'Save failed', 'error');
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  const isInitialLoading = (profileLoading || metaLoading) && categories.length === 0;

  // ── Section Data for FlatList ──────────────────────────────────────────────
  const sections = useMemo(() => {
    if (isInitialLoading) {
      return [{ id: 'skeleton', type: 'skeleton' }];
    }

    const list: any[] = [];
    list.push(
      { id: 'current_city', type: 'city_selection' },
      { id: 'preferred_locations', type: 'pref_locations' },
      { id: 'search_bar', type: 'search_bar' }
    );


    const limit = 6;
    const shouldTruncate = !showAllCats && catSearch.length === 0 && filteredCategories.length > limit;
    const displayCats = shouldTruncate ? filteredCategories.slice(0, limit) : filteredCategories;

    displayCats.forEach((cat: any) => {
      list.push({ id: `cat_${cat.id}`, type: 'category', data: cat });
    });

    if (shouldTruncate) {
      list.push({ id: 'view_more_less', type: 'view_more_less', action: 'more' });
    } else if (showAllCats && catSearch.length === 0 && filteredCategories.length > limit) {
      list.push({ id: 'view_more_less', type: 'view_more_less', action: 'less' });
    }

    list.push(
      { id: 'salary', type: 'section', title: 'Expected salary' },
      { id: 'language', type: 'section', title: 'Preferred language' },
      { id: 'wfh', type: 'section', title: 'Work from home' }
    );

    if (!profileLoading && !metaLoading) {
      list.push({ id: 'button', type: 'button' });
    }
    return list;
  }, [filteredCategories, metaLoading, profileLoading, showAllCats, catSearch, isInitialLoading, currentCityId, preferredCityIds, selectedSubcategories]);

  const renderFlatItem = useCallback(({ item }: { item: any }) => {
    switch (item.type) {
      case 'city_selection':
        return (
          <Section title="Current city" colors={colors}>
            <Pressable
              onPress={() => {
                setCitySearch('');
                setShowCityModal(true);
              }}
              style={[
                styles.dropdownTrigger,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Icon name="map-pin" size={18} color={colors.primary} />
              <Text style={[typography.body, { color: currentCityId ? colors.textPrimary : colors.textPlaceholder, flex: 1 }]}>
                {currentCityLabel || 'Select city'}
              </Text>
              <Icon name="chevron-down" size={14} color={colors.textPlaceholder} />
            </Pressable>
          </Section>
        );
      case 'pref_locations':
        return (
          <Section title="Preferred job locations" colors={colors}>
            <Pressable
              onPress={() => {
                setPrefCitySearch('');
                setShowPrefCityModal(true);
              }}
              style={[
                styles.dropdownTrigger,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Icon name="navigation" size={18} color={colors.primary} />
              <Text style={[typography.body, { color: preferredCityIds.length ? colors.textPrimary : colors.textPlaceholder, flex: 1 }]}>
                {preferredCityIds.length ? `${preferredCityIds.length} cities selected` : 'Select cities'}
              </Text>
              <Icon name="chevron-down" size={14} color={colors.textPlaceholder} />
            </Pressable>
          </Section>
        );
      case 'search_bar':
        return <CategorySearchField value={catSearch} onChange={setCatSearch} colors={colors} />;

      case 'section':
        let content = null;
        if (item.id === 'salary') content = (
          <View style={{ gap: spacing.sm, marginTop: -4 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SalarySelectionField 
                label="Min Salary" 
                value={minSalary} 
                onChange={(val: number) => setMinSalary(Math.min(val, maxSalary))} 
                colors={colors} 
              />
              <SalarySelectionField 
                label="Max Salary" 
                value={maxSalary} 
                onChange={(val: number) => setMaxSalary(Math.max(val, minSalary))} 
                colors={colors} 
              />
            </View>
            <InteractiveRangeSlider 
              min={minSalary} 
              max={maxSalary} 
              colors={colors} 
              onChange={(newMin: number, newMax: number) => {
                setMinSalary(newMin);
                setMaxSalary(newMax);
              }}
            />
          </View>
        );
        if (item.id === 'language') content = (
          <View style={{ gap: spacing.sm }}>
            <View style={[styles.miniSearch, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingRight: 8 }]}>
              <Icon name="type" size={16} color={colors.primary} style={{ marginLeft: 8 }} />
              <TextInput
                placeholder="Type your language..."
                placeholderTextColor={colors.textPlaceholder}
                value={langInput}
                onChangeText={setLangInput}
                onSubmitEditing={() => {
                  const val = langInput.trim();
                  if (val) {
                    let current = preferredLanguage ? preferredLanguage.split(',').map(s => s.trim()) : [];
                    if (!current.map(s => s.toLowerCase()).includes(val.toLowerCase())) {
                      current.push(val);
                      setPreferredLanguage(current.join(', '));
                    }
                    setLangInput('');
                  }
                }}
                style={[typography.body, { color: colors.textPrimary, flex: 1, paddingVertical: 8, marginLeft: 8 }]}
              />
              {langInput.trim().length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    const val = langInput.trim();
                    if (val) {
                      let current = preferredLanguage ? preferredLanguage.split(',').map(s => s.trim()) : [];
                      if (!current.map(s => s.toLowerCase()).includes(val.toLowerCase())) {
                        current.push(val);
                        setPreferredLanguage(current.join(', '));
                      }
                      setLangInput('');
                    }
                  }}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.primary, borderRadius: radius.sm }}
                >
                  <Text style={[typography.small, { color: '#FFF', fontWeight: 'bold' }]}>Add</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Selected Languages as Removable Chips */}
            <View style={[styles.chipWrap, { marginBottom: 4 }]}>
              {preferredLanguage ? preferredLanguage.split(',').map(s => s.trim()).filter(Boolean).map((lang, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    const filtered = preferredLanguage.split(',').map(s => s.trim()).filter(s => s !== lang);
                    setPreferredLanguage(filtered.join(', '));
                  }}
                  style={[styles.selectedLangChip, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                  <Text style={[typography.small, { color: colors.primary }]}>{lang}</Text>
                  <Icon name="x" size={12} color={colors.primary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              )) : null}
            </View>

            <View style={styles.chipWrap}>
              {LANGUAGES.filter(l => l.id !== 'other').map((l) => {
                const languagesArray = preferredLanguage ? preferredLanguage.split(',').map(s => s.trim().toLowerCase()) : [];
                const isSelected = languagesArray.includes(l.id);

                return (
                  <Chip
                    key={l.id}
                    label={l.label}
                    selected={isSelected}
                    onPress={() => {
                      let current = preferredLanguage ? preferredLanguage.split(',').map(s => s.trim()) : [];
                      if (isSelected) {
                        current = current.filter(s => s.toLowerCase() !== l.id);
                      } else {
                        current.push(l.label);
                      }
                      setPreferredLanguage(current.join(', '));
                    }}
                    colors={colors}
                  />
                );
              })}
            </View>
          </View>
        );
        if (item.id === 'wfh') content = <WFHCard active={workFromHome} onToggle={setWorkFromHome} colors={colors} />;
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
                  prev.map(Number).includes(Number(subId))
                    ? prev.map(Number).filter(id => id !== Number(subId))
                    : [...prev.map(Number), Number(subId)]
                );
              }}
              colors={colors}
            />
          </View>
        );
      case 'view_more_less':
        const isLess = item.action === 'less';
        return (
          <TouchableOpacity onPress={() => setShowAllCats(!isLess)} style={styles.viewMoreBtn}>
            <Text style={[typography.labelMedium, { color: colors.primary }]}>
              {isLess ? 'View Less Categories' : 'View More Categories'}
            </Text>
            <Icon name={isLess ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
          </TouchableOpacity>
        );
      case 'skeleton':
        return <PreferencesSkeleton colors={colors} />;
      case 'button':
        return <View style={{ padding: 14 }}><PrimaryButton title={saving ? 'Saving...' : 'Save Preferences'} onPress={handleSave} colors={colors} /></View>;
      default:
        return null;
    }
  }, [colors, jobCategoryIds, expandedCatId, minSalary, maxSalary, workFromHome, saving, handleSave, showAllCats, currentCityId, currentCityLabel, preferredCityIds, catSearch]);

  return (
    <ProfileEditLayout
      title="Job Preferences"
      subtitle="Set your location and field"
      useFlatList={true}
      flatListData={sections}
      renderFlatItem={renderFlatItem}
      flatListExtraData={[jobCategoryIds, expandedCatId, currentCityId, preferredCityIds, minSalary, maxSalary, workFromHome, saving, showAllCats]}
    >
      {/* City Modals */}
      <Modal
        visible={showCityModal}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => setShowCityModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCityModal(false)}>
          <BottomSheetContent visible={showCityModal} colors={colors}>
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
                    setCurrentCityId(Number(item.id));
                    setShowCityModal(false);
                  }}
                  style={[
                    styles.cityRow,
                    {
                      backgroundColor:
                        Number(currentCityId) === Number(item.id) ? colors.surfaceHighlight : 'transparent',
                    },
                  ]}>
                  <Text style={[typography.body, { color: colors.textPrimary }]}>{item.label}</Text>
                </Pressable>
              )}
            />
          </BottomSheetContent>
        </Pressable>
      </Modal>

      <Modal
        visible={showPrefCityModal}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => setShowPrefCityModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowPrefCityModal(false)}>
          <BottomSheetContent visible={showPrefCityModal} colors={colors}>
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
                const selected = preferredCityIds.map(Number).includes(Number(item.id));
                return (
                  <Pressable
                    onPress={() => {
                      setPreferredCityIds(prev =>
                        selected
                          ? prev.map(Number).filter(id => id !== Number(item.id))
                          : [...prev.map(Number), Number(item.id)]
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
          </BottomSheetContent>
        </Pressable>
      </Modal>
    </ProfileEditLayout>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
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
  sliderThumb: {
    position: 'absolute',
    top: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 10,
  },

  rangeIndicatorContainer: {
    marginTop: spacing.md,
    paddingHorizontal: 12,
    height: 40,
  },
  rangeTrack: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
  rangeFill: {
    height: '100%',
    borderRadius: 2,
    position: 'absolute',
  },
  miniSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 4,
    height: 50,
  },
  selectedLangChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginRight: 4,
    marginBottom: 4,
  },
  wfhCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  wfhIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: radius.md, borderWidth: 1, marginTop: 4 },
  segmentRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
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
    height: '70%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  cityList: { flex: 1 },
  cityRow: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
  miniSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 8,
    height: 50,
  },
  viewMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
});

export default ProfileJobPreferencesEditScreen;
