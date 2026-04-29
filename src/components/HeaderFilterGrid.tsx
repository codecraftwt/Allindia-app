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
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchMetaCategories, fetchMetaCities } from '../redux/slice/metaSlice';
import { fetchProfileCompletion } from '../redux/slice/profileSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { typography } from '../theme/typography';

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
  salary: ['₹3L-6L', '₹6L-10L', '₹10L-20L', '₹20L+'],
  experience: ['Fresher', '1-3 Yrs', '3-5 Yrs', '5-10 Yrs'],
  location: ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Remote'],
  sortBy: ['Relevance', 'Newest First', 'Salary: High to Low', 'Salary: Low to High'],
  Department: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'],
  company: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix'],
  industry: ['IT Services', 'E-commerce', 'Fintech', 'Healthcare', 'Edtech'],
  role: ['Frontend Developer', 'Backend Developer', 'Fullstack', 'DevOps', 'Data Science'],
  freshness: ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'All Time'],
};

const HeaderFilterGrid: React.FC<HeaderFilterGridProps> = ({
  visible,
  onClose,
  onFilterSelect,
  activeFilter,
  colors,
  headerTranslateY,
  top = 130
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, cities, loading: metaLoading } = useSelector((state: RootState) => state.meta);
  const { completion } = useSelector((state: RootState) => state.profile);

  const [selectedCategory, setSelectedCategory] = useState('jobType');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<any>({
    jobType: [],
    category: null,
    city: null,
  });

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
  ];

  const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

  const slideAnim = useRef(new Animated.Value(-300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 50,
          tension: 60,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -400,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
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
    setTimeout(() => setIsSwitching(false), 400); // Simulate processing/loading
  };

  const toggleOption = (category: string, option: any) => {
    if (category === 'jobType') {
      const current = selectedFilters.jobType || [];
      const updated = current.includes(option)
        ? current.filter((i: string) => i !== option)
        : [...current, option];
      setSelectedFilters({ ...selectedFilters, jobType: updated });
    } else {
      // Single select for category and city to match API params category_id and city_id
      setSelectedFilters({
        ...selectedFilters,
        [category]: selectedFilters[category]?.id === option.id ? null : option
      });
    }
  };

  const handleApply = () => {
    const filters: any = {};
    if (selectedFilters.category) filters.category_id = selectedFilters.category.id;
    if (selectedFilters.city) filters.city_id = selectedFilters.city.id;
    if (selectedFilters.jobType.length > 0) {
      filters.job_type = selectedFilters.jobType.map((t: string) => t.toLowerCase().replace('-', '_')).join(',');
    }
    onFilterSelect(filters);
  };

  const getOptions = () => {
    switch (selectedCategory) {
      case 'jobType': return JOB_TYPES;
      case 'category': return categories;
      case 'city': return cities;
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

  if (!visible && opacityAnim._value === 0) return null;

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
              { translateY: Animated.add(slideAnim, headerTranslateY || 0) }
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
                    {cat.id === 'category' && selectedFilters.category && (
                      <Text style={[styles.selectedSubtext, { color: colors.primary }]} numberOfLines={1}>
                        {selectedFilters.category.name}
                      </Text>
                    )}
                    {cat.id === 'city' && selectedFilters.city && (
                      <Text style={[styles.selectedSubtext, { color: colors.primary }]} numberOfLines={1}>
                        {selectedFilters.city.city || selectedFilters.city.name || selectedFilters.city.label}
                      </Text>
                    )}
                    {cat.id === 'jobType' && selectedFilters.jobType.length > 0 && (
                      <Text style={[styles.selectedSubtext, { color: colors.primary }]} numberOfLines={1}>
                        {selectedFilters.jobType[0]}
                      </Text>
                    )}
                  </View>
                  {((cat.id === 'jobType' && selectedFilters.jobType.length > 0) ||
                    (cat.id !== 'jobType' && selectedFilters[cat.id])) && (
                      <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                    )}
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Options (Right) */}
          <View style={styles.optionsArea}>
            <View style={styles.titleRow}>
              <Text style={[styles.sectionTitle, { color: colors.textPlaceholder }]}>
                {CATEGORIES_LIST.find(c => c.id === selectedCategory)?.label}
              </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {isSwitching || metaLoading ? <SkeletonItem /> : (
                filteredOptions.map((option: any) => {
                  const isSelected = selectedCategory === 'jobType'
                    ? selectedFilters.jobType.includes(option)
                    : selectedFilters[selectedCategory]?.id === option.id;
                  const labelText = typeof option === 'string' ? option : (option.name || option.city || option.label || '');

                  return (
                    <Pressable
                      key={typeof option === 'string' ? option : option.id}
                      onPress={() => toggleOption(selectedCategory, option)}
                      style={styles.optionItem}>
                      <View style={[
                        selectedCategory === 'jobType' ? styles.checkbox : styles.radio,
                        { borderColor: isSelected ? colors.primary : colors.border }
                      ]}>
                        {isSelected && (
                          <View style={[
                            selectedCategory === 'jobType' ? styles.checkboxInner : styles.radioInner,
                            { backgroundColor: colors.primary }
                          ]} />
                        )}
                      </View>
                      <Text style={[styles.optionText, { color: colors.textPrimary }]}>{labelText}</Text>
                    </Pressable>
                  );
                })
              )}
              {!(isSwitching || metaLoading) && filteredOptions.length === 0 && (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No options available</Text>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Action Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => setSelectedFilters({ jobType: [], category: null, city: null })}>
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
    left: spacing.lg,
    right: spacing.lg,
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
    height: 420,
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
    padding: spacing.md,
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
    marginBottom: 16,
    gap: 10,
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
    marginBottom: 8,
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
  resetText: {
    fontSize: 12,
    fontWeight: '800',
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
});

export default HeaderFilterGrid;
