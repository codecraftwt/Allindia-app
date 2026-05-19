import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  PanResponder,
  TextInput,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchMetaCategories, fetchMetaCities } from '../redux/slice/metaSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { typography } from '../theme/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');
const DRAWER_WIDTH = 280;
const DRAWER_HEIGHT = 500;
const HANDLE_HEIGHT = 50;

interface SideFilterHubProps {
  colors: any;
  onFilterSelect: (filters: any) => void;
  activeFilter?: any;
  hiddenSections?: string[];
}

const SideFilterHub: React.FC<SideFilterHubProps> = ({ colors, onFilterSelect, hiddenSections = [] }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, cities, loading } = useSelector((state: RootState) => state.meta);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('jobType');
  const [selectedFilters, setSelectedFilters] = useState<any>({
    jobType: [],
    categories: [],
    subCategories: [],
    cities: [],
    salary: null,
    freshness: null,
    manualSalary: { min: '', max: '' },
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [browsingCategory, setBrowsingCategory] = useState<any | null>(null);

  // Drawer horizontal animation
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  // Handle vertical position animation
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT * 0.3)).current;
  const lastPanY = useRef(SCREEN_HEIGHT * 0.3);

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchMetaCategories());
    if (cities.length === 0) dispatch(fetchMetaCities());
  }, [dispatch]);

  const toggleDrawer = useCallback(() => {
    setIsOpen(prev => {
      const newState = !prev;
      const toValue = newState ? 0 : -DRAWER_WIDTH;
      Animated.spring(drawerAnim, {
        toValue,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
      return newState;
    });
  }, [drawerAnim]);

  // PanResponder for vertical dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only set responder if there is significant vertical movement
        return Math.abs(gestureState.dy) > 2;
      },
      onPanResponderMove: (_, gestureState) => {
        let nextY = lastPanY.current + gestureState.dy;
        // Keep within screen bounds, staying above the bottom tab bar (approx 120px)
        if (nextY < 10) nextY = 10;
        if (nextY > SCREEN_HEIGHT - 160) nextY = SCREEN_HEIGHT - 160;
        panY.setValue(nextY);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Tap Detection: If movement is very small, toggle the drawer
        const isTap = Math.abs(gestureState.dx) < 12 && Math.abs(gestureState.dy) < 12;

        if (isTap) {
          toggleDrawer();
        } else {
          // It was a drag, update the last position
          let finalY = lastPanY.current + gestureState.dy;
          if (finalY < 10) finalY = 10;
          if (finalY > SCREEN_HEIGHT - 160) finalY = SCREEN_HEIGHT - 160;
          lastPanY.current = finalY;
        }
      },
    })
  ).current;

  // Calculate dynamic drawer offset
  // If handle is in bottom half, shift drawer up so it doesn't go off screen
  const drawerTranslateY = panY.interpolate({
    inputRange: [0, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT],
    outputRange: [0, -DRAWER_HEIGHT * 0.5, -DRAWER_HEIGHT - 40], // Further shift UP
    extrapolate: 'clamp',
  });

  // Handle position relative to drawer
  const handleTranslateY = panY.interpolate({
    inputRange: [0, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT],
    outputRange: [20, DRAWER_HEIGHT / 2 - HANDLE_HEIGHT / 2, DRAWER_HEIGHT - HANDLE_HEIGHT + 40],
    extrapolate: 'clamp',
  });

  const ALL_SECTIONS = [
    { id: 'jobType', label: 'Type', icon: 'bolt' },
    { id: 'category', label: 'Category', icon: 'th-large' },
    { id: 'city', label: 'City', icon: 'map-marker' },
    { id: 'salary', label: 'Salary', icon: 'money' },
    { id: 'freshness', label: 'Posted In', icon: 'clock-o' },
  ];

  const SECTIONS = ALL_SECTIONS.filter(s => !hiddenSections.includes(s.id));

  // If current selected section is hidden, reset to first visible
  const effectiveSection = SECTIONS.find(s => s.id === selectedSection)
    ? selectedSection
    : (SECTIONS[0]?.id ?? 'jobType');

  const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Work from office', 'Apprenticeship', 'Freelance', 'Work from home', 'Hybrid'];
  const SALARY_OPTIONS = ['₹3L-6L', '₹6L-10L', '₹10L-20L', '₹20L+'];
  const FRESHNESS_OPTIONS = ['All', 'Last 24 Hours', 'Last 3 Days', 'Last 7 Days'];

  const handleCategoryChange = (id: string) => {
    setSelectedSection(id);
    setSearchQuery('');
    setBrowsingCategory(null);
  };

  const toggleOption = (category: string, option: any, isSelectionOnly: boolean = false) => {
    if (category === 'jobType') {
      const current = selectedFilters.jobType || [];
      const updated = current.includes(option)
        ? current.filter((i: string) => i !== option)
        : [...current, option];
      setSelectedFilters({ ...selectedFilters, jobType: updated });
    } else if (category === 'category') {
      if (browsingCategory) {
        // Subcategory selection (Multi-select)
        const current = selectedFilters.subCategories || [];
        const isSelected = current.some((c: any) => c.id === option.id);

        if (option.isAll) {
          const catCurrent = selectedFilters.categories || [];
          if (!catCurrent.some((c: any) => c.id === browsingCategory.id)) {
            setSelectedFilters({
              ...selectedFilters,
              categories: [...catCurrent, browsingCategory]
            });
          }
        } else {
          const updated = isSelected
            ? current.filter((c: any) => c.id !== option.id)
            : [...current, option];

          const catCurrent = selectedFilters.categories || [];
          const updatedCats = catCurrent.some((c: any) => c.id === browsingCategory.id)
            ? catCurrent
            : [...catCurrent, browsingCategory];

          setSelectedFilters({
            ...selectedFilters,
            categories: updatedCats,
            subCategories: updated
          });
        }
      } else {
        // Main Category selection
        const current = selectedFilters.categories || [];
        const isSelected = current.some((c: any) => c.id === option.id);

        const updated = isSelected
          ? current.filter((c: any) => c.id !== option.id)
          : [...current, option];

        if (isSelectionOnly || !option.subcategories || option.subcategories.length === 0) {
          setSelectedFilters({
            ...selectedFilters,
            categories: updated,
            subCategories: isSelected
              ? (selectedFilters.subCategories || []).filter((sc: any) => sc.parent_id !== option.id)
              : selectedFilters.subCategories
          });
        } else if (option.subcategories && option.subcategories.length > 0) {
          setBrowsingCategory(option);
        }
      }
    } else if (category === 'city') {
      const current = selectedFilters.cities || [];
      const isSelected = current.some((c: any) => c.id === option.id);
      const updated = isSelected
        ? current.filter((c: any) => c.id !== option.id)
        : [...current, option];
      setSelectedFilters({
        ...selectedFilters,
        cities: updated
      });
    } else {
      setSelectedFilters({
        ...selectedFilters,
        [category]: selectedFilters[category] === option ? null : option
      });
    }
  };

  const handleReset = () => {
    setSelectedFilters({
      jobType: [],
      categories: [],
      subCategories: [],
      cities: [],
      salary: null,
      freshness: null,
      manualSalary: { min: '', max: '' },
    });
    setBrowsingCategory(null);
    setSearchQuery('');
  };

  const handleApply = () => {
    const filters: any = {};
    if (selectedFilters.categories && selectedFilters.categories.length > 0) {
      filters.category_id = selectedFilters.categories.map((c: any) => c.id).join(',');
    }
    if (selectedFilters.subCategories && selectedFilters.subCategories.length > 0) {
      filters.subcategory_id = selectedFilters.subCategories.map((c: any) => c.id).join(',');
    }
    if (selectedFilters.cities && selectedFilters.cities.length > 0) {
      filters.city_id = selectedFilters.cities.map((c: any) => c.id).join(',');
    }
    if (selectedFilters.jobType.length > 0) {
      filters.job_type = selectedFilters.jobType.map((t: string) => t.toLowerCase().replace(/[-\s]/g, '_')).join(',');
    }
    if (selectedFilters.manualSalary.min || selectedFilters.manualSalary.max) {
      if (selectedFilters.manualSalary.min) filters.salary_min = parseInt(selectedFilters.manualSalary.min, 10);
      if (selectedFilters.manualSalary.max) filters.salary_max = parseInt(selectedFilters.manualSalary.max, 10);
    } else if (selectedFilters.salary) {
      const salary = selectedFilters.salary;
      if (salary === '₹3L-6L') {
        filters.salary_min = 300000;
        filters.salary_max = 600000;
      } else if (salary === '₹6L-10L') {
        filters.salary_min = 600000;
        filters.salary_max = 1000000;
      } else if (salary === '₹10L-20L') {
        filters.salary_min = 1000000;
        filters.salary_max = 2000000;
      } else if (salary === '₹20L+') {
        filters.salary_min = 2000000;
      }
    }
    if (selectedFilters.freshness) {
      filters.freshness = selectedFilters.freshness;
    }
    onFilterSelect(filters);
    toggleDrawer();
  };

  const getOptions = () => {
    switch (effectiveSection) {
      case 'jobType': return JOB_TYPES;
      case 'category':
        if (browsingCategory) {
          return browsingCategory.subcategories || [];
        }
        return categories;
      case 'city': return cities;
      case 'salary': return SALARY_OPTIONS;
      case 'freshness': return FRESHNESS_OPTIONS;
      default: return [];
    }
  };

  const getFilteredOptions = () => {
    const options = getOptions() || [];
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((opt: any) => {
      const label = typeof opt === 'string' ? opt : (opt.city || opt.name || opt.label || '');
      return label.toLowerCase().includes(q);
    });
  };

  return (
    <>
      {isOpen && (
        <Pressable style={styles.backdrop} onPress={toggleDrawer} />
      )}

      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            transform: [
              { translateX: drawerAnim },
              { translateY: Animated.add(panY, drawerTranslateY) },
            ],
          }
        ]}>

        {/* Draggable Toggle Button (Handle) */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.handle,
            {
              backgroundColor: colors.primary,
              transform: [{ translateY: handleTranslateY }]
            }
          ]}>
          <Icon name={isOpen ? "chevron-left" : "sliders"} size={18} color="#fff" />
        </Animated.View>

        <View style={styles.content}>
          <View style={[styles.sidebar, { backgroundColor: colors.surfaceHighlight }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {SECTIONS.map(sec => (
                <Pressable
                  key={sec.id}
                  onPress={() => handleCategoryChange(sec.id)}
                  style={[
                    styles.sideItem,
                    effectiveSection === sec.id && { backgroundColor: colors.surface }
                  ]}>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Icon
                      name={sec.icon}
                      size={16}
                      color={effectiveSection === sec.id ? colors.primary : colors.textPlaceholder}
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={[
                      styles.sideText,
                      { color: effectiveSection === sec.id ? colors.textPrimary : colors.textSecondary },
                      effectiveSection === sec.id && { fontWeight: '700' }
                    ]}>
                      {sec.label}
                    </Text>
                    {((sec.id === 'jobType' && selectedFilters.jobType?.length > 0) ||
                      (sec.id === 'category' && selectedFilters.categories?.length > 0) ||
                      (sec.id === 'city' && selectedFilters.cities?.length > 0) ||
                      (sec.id !== 'jobType' && sec.id !== 'category' && sec.id !== 'city' && selectedFilters[sec.id])) && (
                        <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                      )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.optionsArea}>
            {effectiveSection === 'category' && browsingCategory ? (
              <View style={[styles.browsingHeader, { backgroundColor: colors.surfaceHighlight, borderBottomColor: colors.border }]}>
                <Pressable onPress={() => setBrowsingCategory(null)} style={styles.browsingBackBtn}>
                  <Icon name="arrow-left" size={14} color={colors.primary} />
                </Pressable>
                <Text style={[styles.browsingTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {browsingCategory.name}
                </Text>
                <View style={{ width: 36 }} />
              </View>
            ) : (effectiveSection === 'category' || effectiveSection === 'city') ? (
              <View style={[styles.searchBox, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                <Icon name="search" size={12} color={colors.textPlaceholder} />
                <TextInput
                  style={[styles.searchInput, { color: colors.textPrimary }]}
                  placeholder={`Search ${effectiveSection}...`}
                  placeholderTextColor={colors.textPlaceholder}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                />
              </View>
            ) : (
              <Text style={[styles.sectionTitle, { color: colors.textPlaceholder }]}>
                Select {SECTIONS.find(s => s.id === effectiveSection)?.label}
              </Text>
            )}

            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsScroll}>
                {effectiveSection === 'salary' && (
                  <View style={styles.manualSalaryRow}>
                    <View style={styles.manualInputBox}>
                      <Text style={styles.manualLabel}>Min</Text>
                      <TextInput
                        style={[styles.manualInput, { color: colors.textPrimary, borderColor: colors.border }]}
                        placeholder="Min"
                        placeholderTextColor={colors.textPlaceholder}
                        keyboardType="numeric"
                        value={selectedFilters.manualSalary.min}
                        onChangeText={(val) => setSelectedFilters({
                          ...selectedFilters,
                          salary: null,
                          manualSalary: { ...selectedFilters.manualSalary, min: val }
                        })}
                      />
                    </View>
                    <View style={styles.manualInputBox}>
                      <Text style={styles.manualLabel}>Max</Text>
                      <TextInput
                        style={[styles.manualInput, { color: colors.textPrimary, borderColor: colors.border }]}
                        placeholder="Max"
                        placeholderTextColor={colors.textPlaceholder}
                        keyboardType="numeric"
                        value={selectedFilters.manualSalary.max}
                        onChangeText={(val) => setSelectedFilters({
                          ...selectedFilters,
                          salary: null,
                          manualSalary: { ...selectedFilters.manualSalary, max: val }
                        })}
                      />
                    </View>
                  </View>
                )}
                {getFilteredOptions().map((opt: any) => {
                  const isSelected = effectiveSection === 'jobType'
                    ? selectedFilters.jobType.includes(opt)
                    : (effectiveSection === 'category'
                      ? (browsingCategory
                        ? (opt.isAll
                          ? ((selectedFilters.categories || []).some((c: any) => c.id == browsingCategory.id) &&
                            !(selectedFilters.subCategories || []).some((sc: any) => sc.parent_id == browsingCategory.id))
                          : (selectedFilters.subCategories || []).some((c: any) => c.id == opt.id))
                        : (selectedFilters.categories || []).some((c: any) => c.id == opt.id))
                      : effectiveSection === 'city'
                        ? (selectedFilters.cities || []).some((c: any) => c.id == opt.id)
                        : ((effectiveSection === 'salary' || effectiveSection === 'freshness')
                          ? selectedFilters[effectiveSection] === opt
                          : selectedFilters[effectiveSection]?.id == opt.id));
                  const label = typeof opt === 'string' ? opt : (opt.name || opt.city || opt.label || 'Unknown');

                  return (
                    <View key={typeof opt === 'string' ? opt : (opt.id || label)} style={styles.optionItem}>
                      <Pressable
                        onPress={() => toggleOption(effectiveSection, opt, true)}
                        style={styles.checkboxTouch}
                      >
                        <View style={[
                          (effectiveSection === 'jobType' || effectiveSection === 'category' || effectiveSection === 'city') ? styles.checkbox : styles.radio,
                          { borderColor: isSelected ? colors.primary : colors.border }
                        ]}>
                          {isSelected && (
                            <View style={[
                              (effectiveSection === 'jobType' || effectiveSection === 'category' || effectiveSection === 'city') ? styles.checkboxInner : styles.radioInner,
                              { backgroundColor: colors.primary }
                            ]} />
                          )}
                        </View>
                      </Pressable>

                      <Pressable
                        onPress={() => toggleOption(effectiveSection, opt, false)}
                        style={styles.textTouch}
                      >
                        <Text style={[styles.optionText, { color: colors.textPrimary, flex: 1 }]}>{label}</Text>
                        {effectiveSection === 'category' && !browsingCategory && opt.subcategories?.length > 0 && (
                          <Icon name="chevron-right" size={12} color={colors.textPlaceholder} />
                        )}
                      </Pressable>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Pressable
            style={[styles.resetBtn, { borderColor: colors.border }]}
            onPress={handleReset}>
            <Text style={[styles.resetText, { color: colors.textSecondary }]}>Reset All</Text>
          </Pressable>
          <Pressable
            style={[styles.applyBtn, { backgroundColor: colors.primary }]}
            onPress={handleApply}>
            <Text style={styles.applyText}>Apply</Text>
          </Pressable>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 999,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: DRAWER_HEIGHT,
    width: DRAWER_WIDTH,
    borderTopRightRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    borderWidth: 1,
    borderLeftWidth: 0,
    zIndex: 1000,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  handle: {
    position: 'absolute',
    right: -44,
    top: 0,
    width: 44,
    height: 50,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 95,
    paddingTop: spacing.lg,
  },
  sideItem: {
    alignItems: 'center',
    paddingVertical: 14,
    gap: 4,
  },
  sideText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  optionsArea: {
    flex: 1,
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
    height: '100%',
  },
  optionsScroll: {
    paddingBottom: 40,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 15,
    right: 8,
  },
  browsingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  browsingBackBtn: {
    width: 32,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browsingTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkboxTouch: {
    paddingRight: 10,
    paddingVertical: 4,
  },
  textTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 10,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    fontWeight: '700',
    fontSize: 14,
  },
  applyBtn: {
    flex: 2,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  manualSalaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  manualInputBox: {
    flex: 1,
  },
  manualLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  manualInput: {
    height: 36,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 12,
  },
});

export default SideFilterHub;
