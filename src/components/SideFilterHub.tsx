import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Pressable, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

interface SideFilterHubProps {
  colors: any;
  onFilterSelect: (filter: string) => void;
  activeFilter: string | null;
}

const SideFilterHub: React.FC<SideFilterHubProps> = ({ colors, onFilterSelect, activeFilter }) => {
  const [showFilterHub, setShowFilterHub] = useState(false);
  const filterPanelAnim = useRef(new Animated.Value(-80)).current;

  const toggleFilterHub = () => {
    const toValue = showFilterHub ? -80 : 0;
    Animated.spring(filterPanelAnim, {
      toValue,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
    setShowFilterHub(!showFilterHub);
  };

  const handleSelect = (filter: string) => {
    onFilterSelect(filter);
    setTimeout(() => {
      toggleFilterHub();
    }, 400);
  };

  const QUICK_FILTERS = [
    { id: 'remote', label: 'Remote', icon: 'home' },
    { id: 'full-time', label: 'Full-time', icon: 'bolt' },
    { id: 'part-time', label: 'Part-time', icon: 'clock-o' },
    { id: 'internship', label: 'Internship', icon: 'mortar-board' },
    { id: 'high-pay', label: 'High Pay', icon: 'money' },
    { id: 'freshers', label: 'Freshers', icon: 'graduation-cap' },
    { id: 'immediate', label: 'Immediate', icon: 'flash' },
    { id: 'top-mnc', label: 'Top MNC', icon: 'building' },
    { id: 'startup', label: 'Startups', icon: 'rocket' },
  ];

  return (
    <Animated.View 
      style={[
        styles.sideFilterHub, 
        { 
          backgroundColor: colors.surface + 'F2', 
          borderColor: colors.border,
          transform: [{ translateX: filterPanelAnim }] 
        }
      ]}>
      <Pressable 
        onPress={toggleFilterHub}
        style={[styles.filterHandle, { backgroundColor: colors.primary }]}>
        <Icon name={showFilterHub ? "chevron-left" : "sliders"} size={16} color="#fff" />
      </Pressable>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.filterChipList}>
        {QUICK_FILTERS.map((item) => (
          <Pressable 
            key={item.id}
            onPress={() => handleSelect(item.label)}
            style={[
              styles.quickChip, 
              { backgroundColor: activeFilter === item.label ? colors.primary : colors.surfaceHighlight }
            ]}>
            <Icon name={item.icon} size={14} color={activeFilter === item.label ? '#fff' : colors.primary} />
            <Text style={[styles.quickChipText, { color: activeFilter === item.label ? '#fff' : colors.textPrimary }]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sideFilterHub: {
    position: 'absolute',
    left: 0,
    top: '20%',
    bottom: '20%', // Make it taller to accommodate more filters
    width: 75,
    paddingVertical: spacing.md,
    borderTopRightRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    borderWidth: 1,
    borderLeftWidth: 0,
    zIndex: 1000,
    elevation: 15,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  filterHandle: {
    position: 'absolute',
    right: -36,
    top: 60, // Adjusted for taller hub
    width: 36,
    height: 44,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  filterChipList: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.lg,
  },
  quickChip: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    elevation: 3,
  },
  quickChipText: {
    fontSize: 8,
    fontWeight: '800',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default SideFilterHub;
