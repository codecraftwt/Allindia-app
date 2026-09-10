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
import { typography, moderateScale } from '../../../theme/typography';
import { useNavigation, useRoute } from '@react-navigation/native';
import SkeletonPulse from '../../../components/SkeletonPulse';

import { getCategoryColor, getCategoryIcon } from '../../../utils/categoryUtils';

const JobCategoriesScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categories, loading } = useSelector((state: RootState) => state.meta);

  const [searchQuery, setSearchQuery] = useState('');

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
          <SkeletonPulse style={[styles.iconBox, { backgroundColor: colors.primary }]} />
          <View style={styles.cardContent}>
            <SkeletonPulse style={{ height: moderateScale(16), width: '60%', borderRadius: moderateScale(4), marginBottom: moderateScale(4) }} />
            <SkeletonPulse style={{ height: moderateScale(10), width: '30%', borderRadius: moderateScale(4) }} />
          </View>
          <SkeletonPulse style={styles.arrowBox} />
        </View>
      ))}
    </View>
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={handleBackPress} style={styles.backBtn}>
          <Icon name="chevron-left" size={moderateScale(18)} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.appTitle, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]}>
          Job Categories
        </Text>
        <View style={{ width: moderateScale(36) }} />
      </View>

      <View style={styles.searchWrapper}>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
          <Icon name="search" size={moderateScale(15)} color={colors.textPlaceholder} />
          <TextInput
            placeholder="Search industry or sector..."
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="times-circle" size={moderateScale(15)} color={colors.textPlaceholder} />
            </Pressable>
          )}
        </View>
      </View>

      {loading && categories.length === 0 ? (
        <CategoriesSkeleton />
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(cat) => cat.id.toString()}
          renderItem={({ item: cat }) => {
            return (
              <Pressable
                onPress={() => navigation.navigate('IndustryCategory', { categoryId: cat.id, categoryName: cat.name })}
                style={[
                  styles.listCard,
                  { backgroundColor: colors.surface, borderColor: colors.border }
                ]}>
                <View style={[styles.iconBox, { backgroundColor: colors.primary, borderRadius: moderateScale(10) }]}>
                  <Icon name={getCategoryIcon(cat.name)} size={moderateScale(18)} color="#FFFFFF" />
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
                  <Icon name="chevron-right" size={moderateScale(11)} color={colors.textPlaceholder} />
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            filteredCategories.length === 0 && !loading ? (
              <View style={styles.emptyResults}>
                <Icon name="search-minus" size={moderateScale(36)} color={colors.border} />
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
    paddingTop: spacing.xs,
    paddingBottom: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    height: moderateScale(42),
    borderRadius: moderateScale(10),
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: moderateScale(6),
    fontSize: moderateScale(13),
    paddingVertical: moderateScale(6),
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
    padding: moderateScale(12),
    paddingBottom: moderateScale(36),
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(10),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    marginBottom: moderateScale(10),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  iconBox: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: moderateScale(10),
  },
  arrowBox: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyResults: {
    alignItems: 'center',
    marginTop: moderateScale(50),
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    marginTop: moderateScale(16),
    opacity: 0.6,
    width: '100%',
  },
});

export default JobCategoriesScreen;
