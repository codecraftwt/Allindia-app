import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../context/ThemeContext';
import type { SearchStackParamList } from '../../navigation/types';
import type { ThemeColors } from '../../theme/colors';
import { components } from '../../theme/components';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { HomeJob } from './homeMockData';
import { ALL_LISTED_JOBS } from './homeMockData';

type JobListingNav = StackNavigationProp<SearchStackParamList, 'JobListing'>;
type JobListingRoute = RouteProp<SearchStackParamList, 'JobListing'>;

function JobListCard({
  job,
  colors,
  onPress,
}: {
  job: HomeJob;
  colors: ThemeColors;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.listCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}>
      <View style={styles.listCardTop}>
        <View style={[styles.listIconWrap, { backgroundColor: colors.surfaceHighlight }]}>
          <Icon name="briefcase" size={18} color={colors.primary} />
        </View>
        <View style={styles.listCardText}>
          <Text style={[typography.jobTitle, { color: colors.textPrimary }]} numberOfLines={2}>
            {job.title}
          </Text>
          <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
            {job.company}
          </Text>
        </View>
      </View>
      <View style={styles.listMeta}>
        <View style={styles.metaItem}>
          <Icon name="map-marker" size={13} color={colors.textPlaceholder} />
          <Text style={[typography.small, { color: colors.textSecondary }]} numberOfLines={1}>
            {job.location}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="clock-o" size={13} color={colors.textPlaceholder} />
          <Text style={[typography.small, { color: colors.textPlaceholder }]} numberOfLines={1}>
            {job.postedLabel}
          </Text>
        </View>
      </View>
      <View style={styles.listFooter}>
        <Text style={[typography.labelMedium, { color: colors.success }]}>{job.salary}</Text>
        <View style={[styles.typePillSm, { backgroundColor: colors.badgeBackground }]}>
          <Text style={[typography.small, { color: colors.badgeText, fontFamily: typography.labelMedium.fontFamily }]}>
            {job.employmentType}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function FilterSelectRow({
  label,
  value,
  colors,
  onPress,
}: {
  label: string;
  value: string;
  colors: ThemeColors;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterRow, { borderBottomColor: colors.border }]}
      disabled={!onPress}>
      <Text style={[typography.body, { color: colors.textPrimary }]}>{label}</Text>
      <View style={styles.filterRowRight}>
        <Text style={[typography.small, { color: colors.textSecondary }]} numberOfLines={1}>
          {value}
        </Text>
        <Icon name="chevron-right" size={12} color={colors.textPlaceholder} />
      </View>
    </Pressable>
  );
}

const JobListingScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<JobListingNav>();
  const route = useRoute<JobListingRoute>();
  const query = route.params?.query;

  const openJob = (jobId: string) => {
    navigation.navigate('JobDetail', { jobId });
  };

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [workFromHome, setWorkFromHome] = useState(false);
  const [city, setCity] = useState('Any city');
  const [category, setCategory] = useState('Any category');
  const [salary, setSalary] = useState('Any salary');
  const [experience, setExperience] = useState('Any experience');
  const [qualification, setQualification] = useState('Any qualification');

  const headerTitle = query ? `"${query}"` : 'All jobs';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn} accessibilityLabel="Go back">
          <Icon name="chevron-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.topTitleWrap}>
          <Text style={[typography.small, { color: colors.textPlaceholder }]}>Results</Text>
          <Text style={[typography.labelMedium, { color: colors.textPrimary }]} numberOfLines={1}>
            {headerTitle}
          </Text>
        </View>
        <Pressable
          onPress={() => setFiltersOpen(true)}
          hitSlop={8}
          style={[styles.filterBtn, { backgroundColor: colors.surfaceHighlight }]}
          accessibilityLabel="Open filters">
          <Icon name="sliders" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <FlatList
        data={ALL_LISTED_JOBS}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: spacing.xxl + Math.max(insets.bottom, spacing.md) },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }) => (
          <JobListCard job={item} colors={colors} onPress={() => openJob(item.id)} />
        )}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={filtersOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFiltersOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setFiltersOpen(false)} accessibilityLabel="Close filters" />
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                paddingBottom: Math.max(insets.bottom, spacing.md),
                borderTopColor: colors.border,
              },
            ]}>
            <View style={[styles.sheetHandleZone, { borderBottomColor: colors.border }]}>
              <View style={[styles.sheetGrab, { backgroundColor: colors.muted }]} />
              <View style={styles.sheetTitleRow}>
                <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Filters</Text>
                <Pressable onPress={() => setFiltersOpen(false)} hitSlop={10}>
                  <Icon name="times" size={20} color={colors.textPlaceholder} />
                </Pressable>
              </View>
            </View>
            <ScrollView
              style={styles.sheetScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <FilterSelectRow
                label="City"
                value={city}
                colors={colors}
                onPress={() => setCity(c => (c === 'Any city' ? 'Bengaluru' : 'Any city'))}
              />
              <FilterSelectRow
                label="Category"
                value={category}
                colors={colors}
                onPress={() => setCategory(c => (c === 'Any category' ? 'IT & Software' : 'Any category'))}
              />
              <FilterSelectRow
                label="Salary"
                value={salary}
                colors={colors}
                onPress={() => setSalary(s => (s === 'Any salary' ? '₹5 – 10 LPA' : 'Any salary'))}
              />
              <FilterSelectRow
                label="Experience"
                value={experience}
                colors={colors}
                onPress={() => setExperience(e => (e === 'Any experience' ? '1–3 years' : 'Any experience'))}
              />
              <FilterSelectRow
                label="Qualification"
                value={qualification}
                colors={colors}
                onPress={() => setQualification(q => (q === 'Any qualification' ? 'Graduate' : 'Any qualification'))}
              />
              <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
                <Text style={[typography.body, { color: colors.textPrimary }]}>Work from home</Text>
                <Switch
                  value={workFromHome}
                  onValueChange={setWorkFromHome}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={workFromHome ? colors.onPrimary : colors.surfaceSecondary}
                />
              </View>
            </ScrollView>
            <View style={[styles.sheetActions, { borderTopColor: colors.border }]}>
              <Pressable
                style={[styles.secondaryBtn, { borderColor: colors.border }]}
                onPress={() => {
                  setCity('Any city');
                  setCategory('Any category');
                  setSalary('Any salary');
                  setExperience('Any experience');
                  setQualification('Any qualification');
                  setWorkFromHome(false);
                }}>
                <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>Reset</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                onPress={() => setFiltersOpen(false)}>
                <Text style={[typography.labelMedium, { color: colors.onPrimary }]}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitleWrap: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: spacing.sm,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  listCard: {
    ...components.jobCard,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  listCardTop: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  listIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCardText: {
    flex: 1,
    minWidth: 0,
  },
  listMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  typePillSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    maxHeight: '88%',
  },
  sheetHandleZone: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  sheetGrab: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  sheetScroll: {
    maxHeight: 360,
    paddingHorizontal: spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  filterRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: '55%',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: radius.button,
    borderWidth: 1,
  },
  primaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: radius.button,
  },
});

export default JobListingScreen;
