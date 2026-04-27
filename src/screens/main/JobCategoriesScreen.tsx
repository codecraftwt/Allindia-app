import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchMetaCategories } from '../../redux/slice/metaSlice';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';
import { useNavigation } from '@react-navigation/native';

const JobCategoriesScreen: React.FC = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { categories, loading } = useSelector((state: RootState) => state.meta);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchMetaCategories());
    }
  }, [dispatch, categories.length]);

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
    return 'briefcase';
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.labelMedium, { color: colors.textPrimary, flex: 1, textAlign: 'center', marginRight: 40 }]}>
          All Categories
        </Text>
      </View>

      {loading && categories.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => navigation.navigate('JobListing', { filters: { category_id: cat.id } })}
                style={[
                  styles.card,
                  { backgroundColor: colors.surface, borderColor: colors.border }
                ]}>
                <View style={[styles.iconBox, { backgroundColor: colors.surfaceHighlight }]}>
                  <Icon name={getCategoryIcon(cat.name)} size={24} color={colors.primary} />
                </View>
                <Text style={[typography.labelMedium, { color: colors.textPrimary, textAlign: 'center' }]} numberOfLines={2}>
                  {cat.name}
                </Text>
                <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4 }]}>
                  {cat.jobs_count || 0} Jobs
                </Text>
              </Pressable>
            ))}
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: spacing.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
});

export default JobCategoriesScreen;
