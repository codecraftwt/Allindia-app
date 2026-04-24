import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
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
}

const CATEGORIES = [
  { id: 'jobType', label: 'Type', icon: 'bolt' },
  { id: 'salary', label: 'Salary', icon: 'money' },
  { id: 'experience', label: 'Exp', icon: 'briefcase' },
  { id: 'location', label: 'City', icon: 'map-marker' },
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
};

const HeaderFilterGrid: React.FC<HeaderFilterGridProps> = ({ 
  visible, 
  onClose, 
  onFilterSelect, 
  activeFilter, 
  colors,
  headerTranslateY
}) => {
  const [selectedCategory, setSelectedCategory] = useState('jobType');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<any>({
    jobType: ['Full-time'],
    salary: [],
    experience: [],
    location: [],
    sortBy: ['Relevance'],
  });

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

  const toggleOption = (category: string, option: string) => {
    const current = selectedFilters[category] || [];
    const updated = current.includes(option) 
      ? current.filter((i: string) => i !== option)
      : [...current, option];
    setSelectedFilters({ ...selectedFilters, [category]: updated });
  };

  const getSelectionCount = (catId: string) => {
    return selectedFilters[catId]?.length || 0;
  };

  const filteredOptions = OPTIONS[selectedCategory]?.filter((opt: string) => 
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
      style={[styles.container, { opacity: opacityAnim }]} 
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
            {CATEGORIES.map((cat) => (
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
                <Text 
                  style={[
                    styles.sideText, 
                    { color: selectedCategory === cat.id ? colors.textPrimary : colors.textSecondary },
                    selectedCategory === cat.id && { fontWeight: '700' }
                  ]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Options (Right) */}
          <View style={styles.optionsArea}>
            <View style={styles.titleRow}>
                <Text style={[styles.sectionTitle, { color: colors.textPlaceholder }]}>{selectedCategory}</Text>
                {getSelectionCount(selectedCategory) > 0 && (
                  <TouchableOpacity onPress={() => clearCategory(selectedCategory)}>
                    <Text style={[styles.clearLink, { color: colors.primary }]}>Clear</Text>
                  </TouchableOpacity>
                )}
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {isSwitching ? <SkeletonItem /> : (
                OPTIONS[selectedCategory].map((option: string) => (
                  <Pressable
                    key={option}
                    onPress={() => toggleOption(selectedCategory, option)}
                    style={styles.optionItem}>
                    <View style={[
                      styles.radio, 
                      { borderColor: selectedFilters[selectedCategory]?.includes(option) ? colors.primary : colors.border }
                    ]}>
                      {selectedFilters[selectedCategory]?.includes(option) && (
                        <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                      )}
                    </View>
                    <Text style={[styles.optionText, { color: colors.textPrimary }]}>{option}</Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>

        {/* Action Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => setSelectedFilters({})}>
            <Text style={[styles.resetText, { color: colors.primary }]}>RESET</Text>
          </TouchableOpacity>
          <View style={styles.footerRight}>
            <TouchableOpacity 
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              onPress={() => onFilterSelect(selectedFilters)}>
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
    top: 120,
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
    height: 320,
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
});

export default HeaderFilterGrid;
