import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { searchJobs, fetchJobs } from '../../redux/slice/jobSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import type { ThemeColors } from '../../theme/colors';
import SideFilterHub from '../../components/SideFilterHub';

function JobCard({ job, colors, onPress }: { job: any; colors: ThemeColors; onPress: () => void }) {
  const company = job.employer?.company || {};
  const location = job.location?.label || 'Remote';
  const salary = job.salary_label || 'Negotiable';
  const tags = job.tags || [];

  return (
    <Pressable 
      onPress={onPress}
      style={[styles.premiumCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.logoBox, { backgroundColor: colors.surfaceHighlight }]}>
          {company.company_logo_url ? (
            <Image source={{ uri: company.company_logo_url }} style={styles.logoImage} />
          ) : (
            <Icon name="briefcase" size={20} color={colors.primary} />
          )}
        </View>
        <View style={styles.titleInfo}>
          <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: '700', fontSize: 15 }]} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]}>
            {company.company_name || 'Hiring Company'}
          </Text>
        </View>
        <View style={styles.arrowBox}>
          <Icon name="chevron-right" size={12} color={colors.textPlaceholder} />
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="map-marker" size={12} color={colors.textPlaceholder} />
            <Text style={[typography.tiny, { color: colors.textSecondary, flexShrink: 1 }]} numberOfLines={1}>{location}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Icon name="money" size={12} color={colors.success} />
            <Text style={[typography.tiny, { color: colors.textSecondary }]}>{salary}</Text>
          </View>
        </View>
        {tags.length > 0 && (
          <View style={[styles.tagPill, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[typography.tiny, { color: colors.primary, fontWeight: 'bold' }]} numberOfLines={1}>
              {typeof tags[0] === 'string' ? tags[0] : tags[0].name}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const SearchResultsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const { searchResults, loading } = useSelector((state: RootState) => state.jobs);
  const [searchText, setSearchText] = useState(route.params?.query || '');
  const [activeFilter, setActiveFilter] = useState<any>(null);

  useEffect(() => {
    if (searchText) {
      dispatch(searchJobs(searchText));
    }
  }, [dispatch]);

  const handleSearch = () => {
    if (searchText.trim()) {
      dispatch(searchJobs(searchText));
    }
  };

  const applyAdvancedFilters = (filters: any) => {
    setActiveFilter(filters);
    dispatch(fetchJobs({ 
      q: searchText,
      ...filters,
      per_page: 50 
    }));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={[styles.searchBarContainer, { backgroundColor: colors.surfaceHighlight }]}>
          <Icon name="search" size={14} color={colors.textPlaceholder} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search jobs..."
            placeholderTextColor={colors.textPlaceholder}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <Icon name="times-circle" size={16} color={colors.textPlaceholder} />
            </Pressable>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>Searching for jobs...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 80 }
          ]}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <JobCard 
              job={item} 
              colors={colors} 
              onPress={() => navigation.navigate('JobDetail', { jobId: item.id })} 
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Icon name="search" size={48} color={colors.border} />
              <Text style={[typography.labelMedium, { color: colors.textPlaceholder, marginTop: spacing.md }]}>
                No results found for "{searchText}"
              </Text>
            </View>
          )}
        />
      )}

      <SideFilterHub 
        colors={colors}
        activeFilter={activeFilter}
        onFilterSelect={applyAdvancedFilters}
      />
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
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 0,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 6,
    paddingTop: spacing.md,
  },
  premiumCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleInfo: {
    flex: 1,
  },
  arrowBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: 100,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
});

export default SearchResultsScreen;
