import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { fetchMetaCategories } from '../../../redux/slice/metaSlice';
import { useTheme } from '../../../context/ThemeContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { typography } from '../../../theme/typography';
import { useNavigation } from '@react-navigation/native';

const JobCategoriesScreen: React.FC = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
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

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('software') || n.includes('it') || n.includes('tech')) return 'code';
    if (n.includes('sales') || n.includes('marketing')) return 'line-chart';
    if (n.includes('design') || n.includes('creative')) return 'paint-brush';
    if (n.includes('finance') || n.includes('account')) return 'money';
    if (n.includes('admin') || n.includes('office')) return 'building-o';
    if (n.includes('customer') || n.includes('support')) return 'headset';
    if (n.includes('health') || n.includes('medical')) return 'medkit';
    if (n.includes('education') || n.includes('teacher')) return 'graduation-cap';
    if (n.includes('hospitality')) return 'hotel';
    return 'briefcase';
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.appTitle, { color: colors.textPrimary, flex: 1, textAlign: 'center', marginRight: 44 }]}>
          Job Categories
        </Text>
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
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
            Exploring sectors...
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {filteredCategories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => navigation.navigate('IndustryCategory', { categoryId: cat.id, categoryName: cat.name })}
              style={[
                styles.listCard,
                { backgroundColor: colors.surface, borderColor: colors.border }
              ]}>
              <View style={[styles.iconBox, { backgroundColor: colors.surfaceHighlight }]}>
                <Icon name={getCategoryIcon(cat.name)} size={22} color={colors.primary} />
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
          ))}
          
          {filteredCategories.length === 0 && (
            <View style={styles.emptyResults}>
              <Icon name="search-minus" size={40} color={colors.border} />
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
                No categories matching "{searchQuery}"
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={[typography.tiny, { color: colors.textPlaceholder }]}>
              Finding more industries for you...
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xxl,
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
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    opacity: 0.6,
  },
});

export default JobCategoriesScreen;
