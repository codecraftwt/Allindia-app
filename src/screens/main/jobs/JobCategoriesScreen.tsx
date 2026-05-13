import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  
  FlatList,
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
import SkeletonPulse from '../../../components/SkeletonPulse';

const getCategoryColor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('beauty')) return { bg: '#FFF0F3', icon: '#FF85A1', text: '#C9184A' };
  if (n.includes('construction')) return { bg: '#F8F9FA', icon: '#ADB5BD', text: '#495057' };
  if (n.includes('content') || n.includes('journalism')) return { bg: '#FEFAE0', icon: '#E9EDC9', text: '#606C38' };
  if (n.includes('data science') || n.includes('analytics')) return { bg: '#E0FBFC', icon: '#9AD1D4', text: '#253237' };
  if (n.includes('delivery') || n.includes('driver')) return { bg: '#FFE5D9', icon: '#FEC89A', text: '#D08159' };
  if (n.includes('design') || n.includes('architecture')) return { bg: '#EAF4F4', icon: '#CCE3DE', text: '#6B9080' };
  if (n.includes('hardware') || n.includes('network')) return { bg: '#F1F1F1', icon: '#D6CCC2', text: '#5E503F' };
  if (n.includes('fashion') || n.includes('tailoring')) return { bg: '#FDE2E4', icon: '#FAD2E1', text: '#A4133C' };
  if (n.includes('healthcare') || n.includes('doctor') || n.includes('hospital')) return { bg: '#FFECEF', icon: '#FFB3C1', text: '#C9184A' };
  if (n.includes('hospitality') || n.includes('restaurant') || n.includes('tourism')) return { bg: '#FFF3E0', icon: '#FFCC80', text: '#E65100' };
  if (n.includes('house help') || n.includes('worker')) return { bg: '#F5F5F7', icon: '#E2E2E2', text: '#707070' };
  if (n.includes('human resources') || n.includes('hr')) return { bg: '#E8F5E9', icon: '#A5D6A7', text: '#2E7D32' };
  if (n.includes('it services') || n.includes('development')) return { bg: '#E3F2FD', icon: '#90CAF9', text: '#1565C0' };
  if (n.includes('labour') || n.includes('factory')) return { bg: '#F3E5F5', icon: '#CE93D8', text: '#7B1FA2' };
  if (n.includes('legal')) return { bg: '#ECEFF1', icon: '#B0BEC5', text: '#37474F' };
  if (n.includes('marketing')) return { bg: '#FFFDE7', icon: '#FFF59D', text: '#F9A825' };
  if (n.includes('media') || n.includes('entertainment')) return { bg: '#F5F3FF', icon: '#DDD6FE', text: '#5B21B6' };
  if (n.includes('operations')) return { bg: '#F0FDF4', icon: '#BBF7D0', text: '#166534' };
  if (n.includes('purchase') || n.includes('supply chain')) return { bg: '#FDF2F8', icon: '#FBCFE8', text: '#9D174D' };
  if (n.includes('sales')) return { bg: '#ECFDF5', icon: '#A7F3D0', text: '#065F46' };
  if (n.includes('security')) return { bg: '#F9FAFB', icon: '#E5E7EB', text: '#374151' };
  if (n.includes('sport') || n.includes('fitness')) return { bg: '#FFF7ED', icon: '#FFEDD5', text: '#9A3412' };
  if (n.includes('technician') || n.includes('vehicle')) return { bg: '#EEF2FF', icon: '#C7D2FE', text: '#3730A3' };
  return { bg: '#F8FAFC', icon: '#E2E8F0', text: '#475569' };
};

const JobCategoriesScreen: React.FC = () => {
  const { colors } = useTheme();
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

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('beauty')) return 'magic';
    if (n.includes('construction')) return 'building';
    if (n.includes('content') || n.includes('journalism')) return 'pencil';
    if (n.includes('data science') || n.includes('analytics')) return 'database';
    if (n.includes('delivery') || n.includes('driver')) return 'truck';
    if (n.includes('design') || n.includes('architecture')) return 'paint-brush';
    if (n.includes('hardware') || n.includes('network')) return 'server';
    if (n.includes('fashion') || n.includes('tailoring')) return 'scissors';
    if (n.includes('healthcare') || n.includes('doctor') || n.includes('hospital')) return 'user-md';
    if (n.includes('hospitality') || n.includes('restaurant') || n.includes('tourism')) return 'coffee';
    if (n.includes('house help') || n.includes('worker')) return 'home';
    if (n.includes('human resources') || n.includes('hr')) return 'users';
    if (n.includes('it services') || n.includes('development')) return 'code';
    if (n.includes('labour') || n.includes('factory')) return 'industry';
    if (n.includes('legal')) return 'balance-scale';
    if (n.includes('marketing')) return 'bullhorn';
    if (n.includes('media') || n.includes('entertainment')) return 'film';
    if (n.includes('operations')) return 'cogs';
    if (n.includes('purchase') || n.includes('supply chain')) return 'shopping-cart';
    if (n.includes('sales')) return 'line-chart';
    if (n.includes('security')) return 'shield';
    if (n.includes('sport') || n.includes('fitness')) return 'heartbeat';
    if (n.includes('technician') || n.includes('vehicle')) return 'wrench';
    return 'briefcase';
  };

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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
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
            const config = getCategoryColor(cat.name);
            
            if (viewMode === 'grid') {
              return (
                <Pressable
                  onPress={() => navigation.navigate('IndustryCategory', { categoryId: cat.id, categoryName: cat.name })}
                  style={[
                    styles.gridCard,
                    { 
                      backgroundColor: config.bg,
                      borderColor: config.icon + '30',
                    }
                  ]}>
                  <View style={[styles.gridIconBox, { backgroundColor: config.icon + '40' }]}>
                    <Icon name={getCategoryIcon(cat.name)} size={24} color={config.text} />
                  </View>
                  <Text style={[typography.labelMedium, { color: config.text, fontWeight: '700', textAlign: 'center', marginTop: 10 }]} numberOfLines={2}>
                    {cat.name}
                  </Text>
                  <Text style={[typography.tiny, { color: config.text, opacity: 0.7, marginTop: 4 }]}>
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
                <View style={[styles.iconBox, { backgroundColor: config.bg, borderRadius: 12 }]}>
                  <Icon name={getCategoryIcon(cat.name)} size={22} color={config.text} />
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
