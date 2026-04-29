import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchMetaCategories, fetchMetaCities } from '../redux/slice/metaSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { typography } from '../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = 280;

interface SideFilterHubProps {
  colors: any;
  onFilterSelect: (filters: any) => void;
  activeFilter?: any;
}

const SideFilterHub: React.FC<SideFilterHubProps> = ({ colors, onFilterSelect }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, cities, loading } = useSelector((state: RootState) => state.meta);
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('jobType');
  const [selectedFilters, setSelectedFilters] = useState<any>({
    jobType: [],
    category: null,
    city: null,
  });

  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchMetaCategories());
    if (cities.length === 0) dispatch(fetchMetaCities());
  }, [dispatch]);

  const toggleDrawer = () => {
    const toValue = isOpen ? -DRAWER_WIDTH : 0;
    Animated.spring(drawerAnim, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
    setIsOpen(!isOpen);
  };

  const SECTIONS = [
    { id: 'jobType', label: 'Type', icon: 'bolt' },
    { id: 'category', label: 'Category', icon: 'th-large' },
    { id: 'city', label: 'City', icon: 'map-marker' },
  ];

  const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

  const toggleOption = (id: string, option: any) => {
    if (id === 'jobType') {
      const current = selectedFilters.jobType;
      const updated = current.includes(option)
        ? current.filter((i: string) => i !== option)
        : [...current, option];
      setSelectedFilters({ ...selectedFilters, jobType: updated });
    } else {
      setSelectedFilters({
        ...selectedFilters,
        [id]: selectedFilters[id]?.id === option.id ? null : option
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
    toggleDrawer();
  };

  const getOptions = () => {
    switch (selectedSection) {
      case 'jobType': return JOB_TYPES;
      case 'category': return categories;
      case 'city': return cities;
      default: return [];
    }
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
            transform: [{ translateX: drawerAnim }] 
          }
        ]}>
        
        {/* Toggle Button */}
        <Pressable 
          onPress={toggleDrawer}
          style={[styles.handle, { backgroundColor: colors.primary }]}>
          <Icon name={isOpen ? "chevron-left" : "sliders"} size={18} color="#fff" />
        </Pressable>

        <View style={styles.content}>
          <View style={[styles.sidebar, { backgroundColor: colors.surfaceHighlight }]}>
            {SECTIONS.map(sec => (
              <Pressable
                key={sec.id}
                onPress={() => setSelectedSection(sec.id)}
                style={[
                  styles.sideItem,
                  selectedSection === sec.id && { backgroundColor: colors.surface }
                ]}>
                <Icon 
                  name={sec.icon} 
                  size={18} 
                  color={selectedSection === sec.id ? colors.primary : colors.textPlaceholder} 
                />
                <Text style={[
                  styles.sideText, 
                  { color: selectedSection === sec.id ? colors.textPrimary : colors.textSecondary }
                ]}>
                  {sec.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.optionsArea}>
            <Text style={[styles.sectionTitle, { color: colors.textPlaceholder }]}>
              Select {SECTIONS.find(s => s.id === selectedSection)?.label}
            </Text>
            
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsScroll}>
                {getOptions().map((opt: any) => {
                  const isSelected = selectedSection === 'jobType'
                    ? selectedFilters.jobType.includes(opt)
                    : selectedFilters[selectedSection]?.id === opt.id;
                  
                  // Extract label more reliably
                  const label = typeof opt === 'string' 
                    ? opt 
                    : (opt.city || opt.name || opt.label || 'Unknown');

                  return (
                    <Pressable
                      key={typeof opt === 'string' ? opt : (opt.id || label)}
                      onPress={() => toggleOption(selectedSection, opt)}
                      style={styles.optionItem}>
                      <View style={[
                        selectedSection === 'jobType' ? styles.checkbox : styles.radio,
                        { borderColor: isSelected ? colors.primary : colors.border }
                      ]}>
                        {isSelected && (
                          <View style={[
                            selectedSection === 'jobType' ? styles.checkboxInner : styles.radioInner,
                            { backgroundColor: colors.primary }
                          ]} />
                        )}
                      </View>
                      <Text style={[styles.optionText, { color: colors.textPrimary }]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Pressable 
            style={[styles.applyBtn, { backgroundColor: colors.primary }]}
            onPress={handleApply}>
            <Text style={styles.applyText}>Apply Filters</Text>
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
    top: '20%',
    bottom: '8%',
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
    top: '50%',
    marginTop: -25, // Center the 50px high handle
    width: 44,
    height: 50,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 80,
    paddingTop: spacing.xxl,
  },
  sideItem: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  sideText: {
    fontSize: 10,
    fontWeight: '700',
  },
  optionsArea: {
    flex: 1,
    padding: spacing.md,
    paddingTop: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  optionsScroll: {
    paddingBottom: 40,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
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
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
  applyBtn: {
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
});

export default SideFilterHub;
