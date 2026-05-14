import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ActivityIndicator,
  TextInput as RNTextInput,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchMetaCategories, fetchMetaCities } from '../redux/slice/metaSlice';
import { fetchProfileCompletion } from '../redux/slice/profileSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { typography } from '../theme/typography';
// Removed unused TextInput from gesture handler

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HeaderFilterGridProps {
  visible: boolean;
  onClose: () => void;
  onFilterSelect: (filters: any) => void;
  activeFilter: string | null;
  colors: any;
  headerTranslateY?: Animated.Value | Animated.AnimatedInterpolation<string | number>;
  top?: number;
}

const CATEGORIES = [
  { id: 'jobType', label: 'Type', icon: 'bolt' },
  { id: 'Department', label: 'Department', icon: 'business' },
  { id: 'company', label: 'Companies', icon: 'building' },
  { id: 'industry', label: 'Industry', icon: 'industry' },
  { id: 'role', label: 'Role', icon: 'briefcase' },
  { id: 'freshness', label: 'Freshness', icon: 'graduation-cap' },
  { id: 'location', label: 'Location', icon: 'map-marker' },
  { id: 'salary', label: 'Salary', icon: 'money' },
  { id: 'experience', label: 'Exp', icon: 'briefcase' },
  { id: 'sortBy', label: 'Sort', icon: 'sort-amount-desc' },
];

const QUICK_FILTERS = [
  { id: 'remote', label: 'Remote', icon: 'home' },
  { id: 'immediate', label: 'Immediate Joiner', icon: 'bolt' },
  { id: 'highSalary', label: 'High Salary', icon: 'line-chart' },
  { id: 'freshers', label: 'Freshers', icon: 'graduation-cap' },
];

const OPTIONS: any = {
  jobType: ['Full-time', 'Part-time', 'Contract', 'Internship'],
  salary: ['₹3L-6L', '₹6L-10L', '₹10L-15L', '₹15L-20L', '₹20L-30L', '₹30L-40L', '₹40L+'],
  experience: ['Fresher', '1-3 Yrs', '3-5 Yrs', '5-10 Yrs'],
  location: ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Remote'],
  sortBy: ['Relevance', 'Newest First', 'Salary: High to Low', 'Salary: Low to High'],
  Department: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'],
  company: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix'],
  industry: ['IT Services', 'E-commerce', 'Fintech', 'Healthcare', 'Edtech'],
  role: ['Frontend Developer', 'Backend Developer', 'Fullstack', 'DevOps', 'Data Science'],
  freshness: ['All', 'Last 24 Hours', 'Last 3 Days', 'Last 7 Days'],
};

const HeaderFilterGrid: React.FC<HeaderFilterGridProps> = ({
  visible,
  onClose,
  onFilterSelect,
  activeFilter,
  colors,
  headerTranslateY,
  top = 210
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, cities, loading: metaLoading } = useSelector((state: RootState) => state.meta);
  const { completion } = useSelector((state: RootState) => state.profile);

  const [selectedCategory, setSelectedCategory] = useState('jobType');
  const [searchQuery, setSearchQuery] = useState('');
  const [browsingCategory, setBrowsingCategory] = useState<any | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<any>({
    jobType: [],
    categories: [],
    subCategories: [],
    cities: [],
    salary: null,
    freshness: null,
    manualSalary: { min: '', max: '' },
  });
  const [isMounted, setIsMounted] = useState(false);

  // Mount/unmount control — keep rendered during close animation
  useEffect(() => {
    if (visible) {
      setIsMounted(true);
    } else {
      const t = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      if (categories.length === 0) dispatch(fetchMetaCategories());
      if (cities.length === 0) dispatch(fetchMetaCities());
      dispatch(fetchProfileCompletion());
    }
  }, [visible, dispatch, categories.length, cities.length]);

  const CATEGORIES_LIST = [
    { id: 'jobType', label: 'Job Type', icon: 'bolt' },
    { id: 'category', label: 'Category', icon: 'th-large' },
    { id: 'city', label: 'City', icon: 'map-marker' },
    { id: 'salary', label: 'Salary', icon: 'money' },
    { id: 'freshness', label: 'Posted In', icon: 'clock-o' },
  ];

  const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Work from office', 'Apprenticeship', 'Freelance', 'Work from home', 'Hybrid'];

  const slideAnim = useRef(new Animated.Value(-300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const toggleQuickFilter = (id: string) => {
    setQuickFilters(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const clearCategory = (catId: string) => {
    setSelectedFilters({ ...selectedFilters, [catId]: [] });
  };

  const handleCategoryChange = (id: string) => {
    setIsSwitching(true);
    setSelectedCategory(id);
    setSearchQuery('');
    setBrowsingCategory(null);
    setTimeout(() => setIsSwitching(false), 400); // Simulate processing/loading
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
          // If "All" is selected, we could clear specific subcategories for this parent
          // but for now let's just make sure the parent is in the categories array
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
            
          // Ensure parent category is also selected if a subcategory is picked
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
      // Single select for salary, freshness
      setSelectedFilters({
        ...selectedFilters,
        [category]: selectedFilters[category] === option ? null : option
      });
    }
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
      } else if (salary === '₹10L-15L') {
        filters.salary_min = 1000000;
        filters.salary_max = 1500000;
      } else if (salary === '₹15L-20L') {
        filters.salary_min = 1500000;
        filters.salary_max = 2000000;
      } else if (salary === '₹20L-30L') {
        filters.salary_min = 2000000;
        filters.salary_max = 3000000;
      } else if (salary === '₹30L-40L') {
        filters.salary_min = 3000000;
        filters.salary_max = 4000000;
      } else if (salary === '₹40L+') {
        filters.salary_min = 4000000;
      }
    }
    if (selectedFilters.freshness) {
      filters.freshness = selectedFilters.freshness;
    }
    onFilterSelect(filters);
  };

  const getOptions = () => {
    switch (selectedCategory) {
      case 'jobType': return JOB_TYPES;
      case 'category':
        if (browsingCategory) {
          return [
            { id: `all-${browsingCategory.id}`, name: `All ${browsingCategory.name}`, isAll: true },
            ...(browsingCategory.subcategories || [])
          ];
        }
        return categories;
      case 'city': return cities;
      case 'salary': return OPTIONS.salary;
      case 'freshness': return OPTIONS.freshness;
      default: return [];
    }
  };

  const options = getOptions() || [];
  const filteredOptions = options.filter((opt: any) => {
    const labelText = typeof opt === 'string' ? opt : (opt?.name || opt?.city || opt?.label || '');
    return labelText.toLowerCase().includes((searchQuery || '').toLowerCase());
  });

  const SkeletonItem = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map(i => (
        <Animated.View
          key={i}
          style={[styles.skeletonChip, { backgroundColor: colors.surfaceSecondary }]}
        />
      ))}
    </View>
  );

  if (!visible && !isMounted) return null;

  return (
    <Animated.View
      style={[styles.container, { opacity: opacityAnim, top }]}
      pointerEvents={visible ? 'auto' : 'none'}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.dropdownCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            transform: [
              { translateY: slideAnim },
            ]
          }
        ]}>

        {/* Top Quick Filters */}
        <View style={[styles.quickBar, { borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickBarContent}>
            {QUICK_FILTERS.map((qf) => {
              const isSelected = quickFilters.includes(qf.id);
              return (
                <TouchableOpacity
                  key={qf.id}
                  onPress={() => toggleQuickFilter(qf.id)}
                  style={[
                    styles.quickChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                      borderColor: isSelected ? colors.primary : colors.border
                    }
                  ]}>
                  <Icon name={qf.icon} size={10} color={isSelected ? colors.onPrimary : colors.textSecondary} />
                  <Text style={[styles.quickText, { color: isSelected ? colors.onPrimary : colors.textPrimary }]}>
                    {qf.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>


        <View style={styles.contentRow}>
          {/* Sidebar (Left) */}
          <View style={[styles.sidebar, { borderRightColor: colors.border, backgroundColor: colors.surfaceHighlight }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {CATEGORIES_LIST.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => handleCategoryChange(cat.id)}
                  style={[
                    styles.sideItem,
                    selectedCategory === cat.id && { backgroundColor: colors.surface }
                  ]}>
                  <Icon
                    name={cat.icon}
                    size={14}
                    color={selectedCategory === cat.id ? colors.primary : colors.textPlaceholder}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.sideText,
                        { color: selectedCategory === cat.id ? colors.textPrimary : colors.textSecondary },
                        selectedCategory === cat.id && { fontWeight: '700' }
                      ]}>
                      {cat.label}
                    </Text>
                    {cat.id === 'jobType' && selectedFilters.jobType?.length > 0 && (
                      <Text style={[styles.selectedSubtext, { color: colors.primary }]} numberOfLines={1}>
                        {selectedFilters.jobType.length} selected
                      </Text>
                    )}
                    {cat.id === 'category' && selectedFilters.categories?.length > 0 && (
                      <Text style={[styles.selectedSubtext, { color: colors.primary }]} numberOfLines={1}>
                        {selectedFilters.categories.length} selected
                      </Text>
                    )}
                    {cat.id === 'city' && selectedFilters.cities && selectedFilters.cities.length > 0 && (
                      <Text style={[styles.selectedSubtext, { color: colors.primary }]} numberOfLines={1}>
                        {selectedFilters.cities.length} selected
                      </Text>
                    )}
                    {cat.id === 'salary' && selectedFilters.salary && (
                      <Text style={[styles.selectedSubtext, { color: colors.primary }]} numberOfLines={1}>
                        {selectedFilters.salary}
                      </Text>
                    )}
                    {cat.id === 'freshness' && selectedFilters.freshness && (
                      <Text style={[styles.selectedSubtext, { color: colors.primary }]} numberOfLines={1}>
                        {selectedFilters.freshness}
                      </Text>
                    )}
                  </View>
                  {((cat.id === 'jobType' && selectedFilters.jobType?.length > 0) ||
                    (cat.id === 'category' && selectedFilters.categories?.length > 0) ||
                    (cat.id === 'city' && selectedFilters.cities?.length > 0) ||
                    (cat.id !== 'jobType' && cat.id !== 'category' && cat.id !== 'city' && selectedFilters[cat.id])) && (
                      <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                    )}
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Options (Right) */}
          <View style={[styles.optionsArea, (selectedCategory === 'category' && browsingCategory) ? { padding: 0 } : null]}>
            {selectedCategory === 'category' && browsingCategory ? (
              <View style={[styles.browsingHeader, { backgroundColor: colors.surfaceHighlight, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => setBrowsingCategory(null)}
                  style={styles.browsingBackBtn}
                >
                  <Icon name="arrow-left" size={14} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.browsingTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {browsingCategory.name}
                </Text>
                <View style={{ width: 36 }} />
              </View>
            ) : (
              <View style={[styles.titleRow, (selectedCategory === 'category' || selectedCategory === 'city') && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingBottom: 8, paddingTop: 4 }]}>
                {(selectedCategory === 'category' || selectedCategory === 'city') ? (
                  <View style={[styles.headerSearchBox, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, flex: 1, height: 34 }]}>
                    <Icon name="search" size={12} color={colors.textPlaceholder} />
                    <RNTextInput
                      style={[styles.searchInput, { color: colors.textPrimary, fontSize: 13 }]}
                      placeholder={`Search ${selectedCategory === 'category' ? 'categories' : 'cities'}...`}
                      placeholderTextColor={colors.textPlaceholder}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCorrect={false}
                      clearButtonMode="while-editing"
                    />
                  </View>
                ) : selectedCategory === 'salary' ? (
                  null // Remove Salary text as requested
                ) : (
                  <Text style={[styles.sectionTitle, { color: colors.textPlaceholder, flex: 1 }]}>
                    {CATEGORIES_LIST.find(c => c.id === selectedCategory)?.label}
                  </Text>
                )}
              </View>
            )}

            {/* Manual Salary Inputs at the Top */}
            {selectedCategory === 'salary' && (
              <View style={[styles.manualSalaryRow, { marginTop: 4, marginBottom: 12 }]}>
                <View style={styles.manualInputBox}>
                  <Text style={styles.manualLabel}>Min Salary</Text>
                  <RNTextInput
                    style={[styles.manualInput, { color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="e.g. 15000"
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
                  <Text style={styles.manualLabel}>Max Salary</Text>
                  <RNTextInput
                    style={[styles.manualInput, { color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="e.g. 25000"
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

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.sm, paddingBottom: 40, paddingTop: selectedCategory === 'salary' ? 0 : 6 }}
            >
              {isSwitching || metaLoading ? <SkeletonItem /> : (
                filteredOptions.map((option: any) => {
                  const isSelected = selectedCategory === 'jobType'
                    ? selectedFilters.jobType.includes(option)
                    : (selectedCategory === 'category'
                      ? (browsingCategory
                        ? (option.isAll 
                           ? (selectedFilters.categories || []).some((c: any) => c.id === browsingCategory.id)
                           : (selectedFilters.subCategories || []).some((c: any) => c.id === option.id))
                        : (selectedFilters.categories || []).some((c: any) => c.id === option.id))
                      : selectedCategory === 'city'
                        ? (selectedFilters.cities || []).some((c: any) => c.id === option.id)
                        : ((selectedCategory === 'salary' || selectedCategory === 'freshness')
                          ? selectedFilters[selectedCategory] === option
                          : selectedFilters[selectedCategory]?.id === option.id));
                  const labelText = typeof option === 'string' ? option : (option.name || option.city || option.label || '');

                  return (
                    <View
                      key={typeof option === 'string' ? option : option.id}
                      style={styles.optionItem}>
                      
                      <TouchableOpacity 
                        onPress={() => toggleOption(selectedCategory, option, true)}
                        style={styles.checkboxTouch}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 4 }}
                      >
                        <View style={[
                          (selectedCategory === 'jobType' || selectedCategory === 'category' || selectedCategory === 'city') ? styles.checkbox : styles.radio,
                          { borderColor: isSelected ? colors.primary : colors.border }
                        ]}>
                          {isSelected && (
                            <View style={[
                              (selectedCategory === 'jobType' || selectedCategory === 'category' || selectedCategory === 'city') ? styles.checkboxInner : styles.radioInner,
                              { backgroundColor: colors.primary }
                            ]} />
                          )}
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        onPress={() => toggleOption(selectedCategory, option, false)}
                        style={styles.textTouch}
                        hitSlop={{ top: 10, bottom: 10, left: 0, right: 10 }}
                      >
                        <Text style={[styles.optionText, { color: colors.textPrimary, flex: 1 }]}>{labelText}</Text>
                        {selectedCategory === 'category' && !browsingCategory && option.subcategories?.length > 0 && (
                          <View style={styles.arrowTouch}>
                            <Icon name="chevron-right" size={12} color={colors.textPlaceholder} />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
              {!(isSwitching || metaLoading) && filteredOptions.length === 0 && (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No options available</Text>
              )}
            </ScrollView>
          </View>
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => setSelectedFilters({ jobType: [], categories: [], subCategories: [], cities: [], salary: null, freshness: null, manualSalary: { min: '', max: '' } })}
            style={[styles.resetBtn, { borderColor: colors.primary }]}
          >
            <Text style={[styles.resetText, { color: colors.primary }]}>RESET</Text>
          </TouchableOpacity>
          <View style={styles.footerRight}>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              onPress={handleApply}>
              <Text style={styles.applyText}>APPLY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 90,
  },
  backdrop: {
    position: 'absolute',
    top: -500,
    left: -100,
    right: -100,
    bottom: -SCREEN_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dropdownCard: {
    height: 520,
    borderRadius: radius.xxl,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '30%',
    borderRightWidth: 1,
  },
  sideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    gap: 8,
  },
  sideText: {
    fontSize: 12,
  },
  optionsArea: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: 0,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  arrowTouch: {
    padding: 6,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
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
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
    marginTop: 20,
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skeletonChip: {
    width: 80,
    height: 32,
    borderRadius: radius.pill,
    opacity: 0.6,
  },
  quickBar: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  quickBarContent: {
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    gap: 6,
  },
  quickText: {
    fontSize: 11,
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 0,
  },
  browsingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingRight: 12,
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
  headerSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 0,
    height: '100%',
  },
  clearLink: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  resetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  footerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  applyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  applyText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    right: 8,
    top: 22,
  },
  selectedSubtext: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  profileBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profileBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  profileBarText: {
    fontSize: 11,
    fontWeight: '700',
  },
  profileBarPercent: {
    fontSize: 11,
    fontWeight: '800',
  },
  profileProgressBase: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  profileProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  manualSalaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  manualInputBox: {
    flex: 1,
  },
  manualLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  manualInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
});

export default HeaderFilterGrid;
