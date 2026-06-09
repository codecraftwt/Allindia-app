import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  StatusBar,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { fetchMetaCategories } from '../../../redux/slice/metaSlice';
import { useTheme } from '../../../context/ThemeContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { typography } from '../../../theme/typography';
import { useNavigation } from '@react-navigation/native';
import SkeletonPulse from '../../../components/SkeletonPulse';

import { getCategoryColor, getCategoryIcon } from '../../../utils/categoryUtils';

const JobCategoriesScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { categories, loading } = useSelector((state: RootState) => state.meta);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchMetaCategories());
    }
  }, [dispatch, categories.length]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);
  const CategoriesSkeleton = () => (
    <View style={styles.scrollContent}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <View key={i} style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SkeletonPulse style={styles.iconBox} />
          <View style={styles.cardContent}>
            <SkeletonPulse style={{ height: 18, width: '60%', borderRadius: 4, marginBottom: 6 }} />
            <SkeletonPulse style={{ height: 12, width: '30%', borderRadius: 4 }} />
          </View>
          <SkeletonPulse style={styles.arrowBox} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.appTitle, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]}>
          Job Categories
        </Text>
        <Pressable
          onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          style={styles.backBtn}
        >
          <Icon name={viewMode === 'list' ? 'th-large' : 'list'} size={18} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.searchWrapper}>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
          <Icon name="search" size={16} color={colors.textPlaceholder} />
          <TextInput
            placeholder="Search industry or sector..."
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="times-circle" size={16} color={colors.textPlaceholder} />
            </Pressable>
          )}
        </View>
      </View>

      {loading && categories.length === 0 ? (
        <CategoriesSkeleton />
      ) : (
        <FlatList
          data={filteredCategories}
          key={viewMode}
          numColumns={viewMode === 'grid' ? 2 : 1}
          keyExtractor={(cat) => cat.id.toString()}
          renderItem={({ item: cat }) => {
            const cardBg = getCategoryColor(cat.name, isDark);

            if (viewMode === 'grid') {
              return (
                <Pressable
                  onPress={() => navigation.navigate('IndustryCategory', { categoryId: cat.id, categoryName: cat.name })}
                  style={[
                    styles.gridCard,
                    {
                      backgroundColor: cardBg,
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    }
                  ]}>
                  <View style={[styles.gridIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)' }]}>
                    <Icon name={getCategoryIcon(cat.name)} size={24} color="#000000" />
                  </View>
                  <Text style={[typography.labelMedium, { color: '#000000', fontWeight: '700', textAlign: 'center', marginTop: 10 }]} numberOfLines={2}>
                    {cat.name}
                  </Text>
                  <Text style={[typography.tiny, { color: 'rgba(0,0,0,0.6)', marginTop: 4 }]}>
                    {cat.jobs_count || 0} Jobs
                  </Text>
                </Pressable>
              );
            }

            return (
              <Pressable
                onPress={() => navigation.navigate('IndustryCategory', { categoryId: cat.id, categoryName: cat.name })}
                style={[
                  styles.listCard,
                  { backgroundColor: colors.surface, borderColor: colors.border }
                ]}>
                <View style={[styles.iconBox, { backgroundColor: cardBg, borderRadius: 12 }]}>
                  <Icon name={getCategoryIcon(cat.name)} size={22} color="#000000" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {cat.name}
                  </Text>
                  <Text style={[typography.small, { color: colors.textSecondary }]}>
                    {cat.jobs_count || 0} active jobs
                  </Text>
                </View>
                <View style={[styles.arrowBox, { backgroundColor: colors.surfaceHighlight }]}>
                  <Icon name="chevron-right" size={12} color={colors.textPlaceholder} />
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            filteredCategories.length === 0 && !loading ? (
              <View style={styles.emptyResults}>
                <Icon name="search-minus" size={40} color={colors.border} />
                <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
                  No categories matching "{searchQuery}"
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            filteredCategories.length > 0 ? (
              <View style={styles.footer}>
                <Text style={[typography.tiny, { color: colors.textPlaceholder }]}>
                  Finding more industries for you...
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 15,
    paddingVertical: 8,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyResults: {
    alignItems: 'center',
    marginTop: 60,
    width: '100%',
  },
  gridCard: {
    flex: 1,
    margin: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  gridIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    opacity: 0.6,
    width: '100%',
  },
});

export default JobCategoriesScreen;
