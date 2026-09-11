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
import { AppDispatch, RootState } from '../../../redux/store';
import { searchJobs, fetchJobs, filterJobs } from '../../../redux/slice/jobSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../../context/ThemeContext';
import { typography, moderateScale } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import type { ThemeColors } from '../../../theme/colors';
import SideFilterHub from '../../../components/SideFilterHub';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const JobCard = React.memo(function JobCard({ job, colors, onPress }: { job: any; colors: ThemeColors; onPress: () => void }) {
  const company = job.employer?.company || {};
  const companyName = company.company_name || job.company_name || job.company || 'Hiring Company';
  const location = job.location?.label || (typeof job.location === 'string' ? job.location : job.location?.city) || 'Remote';
  const salary = job.salary_label || (job.salary_min && job.salary_max ? `₹${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` : 'Negotiable');
  const tags = job.tags || [];
  const isVerified = job.employer?.company?.verification_status === 'approved' || job.employer?.verification_status === 'approved';

  return (
    <Pressable 
      onPress={onPress}
      style={[styles.premiumCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}
    >
      <View style={[styles.cardTop, { marginBottom: moderateScale(8) }]}>
        <View style={[styles.logoBox, { backgroundColor: colors.surfaceHighlight }]}>
          {company.company_logo_url ? (
            <Image source={{ uri: company.company_logo_url }} style={styles.logoImage} resizeMode="contain" />
          ) : (
            <Icon name="briefcase" size={moderateScale(18)} color={colors.primary} />
          )}
        </View>
        <View style={[styles.titleInfo, { paddingRight: moderateScale(22) }]}>
          <Text style={[typography.jobTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
            {companyName}
          </Text>
        </View>
        {isVerified && (
          <View style={{ position: 'absolute', right: 0, top: 0 }}>
            <MaterialCommunityIcons name="check-decagram" size={moderateScale(16)} color="#3B82F6" />
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(8) }}>
        <View style={[styles.metaItem, { flex: 1, marginRight: moderateScale(8) }]}>
          <Icon name="map-marker" size={moderateScale(11)} color={colors.textPlaceholder} />
          <Text style={[typography.small, { color: colors.textSecondary, marginLeft: moderateScale(4), flexShrink: 1 }]} numberOfLines={1}>{location}</Text>
        </View>
        <Text style={[typography.labelMedium, { color: colors.success, fontWeight: '700' }]}>{salary}</Text>
      </View>

      <View style={[styles.cardFooter, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        {job.job_type ? (
          <View style={[styles.tagPill, { backgroundColor: colors.badgeBackground, paddingHorizontal: moderateScale(8), paddingVertical: moderateScale(3), borderRadius: moderateScale(6) }]}>
            <Text style={[typography.tiny, { color: colors.badgeText, fontWeight: '600', fontSize: moderateScale(10) }]}>
              {job.job_type}
            </Text>
          </View>
        ) : <View />}
        {tags.length > 0 && (
          <View style={[styles.tagPill, { backgroundColor: colors.primary + '15', paddingHorizontal: moderateScale(8), paddingVertical: moderateScale(3), borderRadius: moderateScale(6) }]}>
            <Text style={[typography.tiny, { color: colors.primary, fontWeight: 'bold', fontSize: moderateScale(10) }]} numberOfLines={1}>
              {typeof tags[0] === 'string' ? tags[0] : tags[0].name}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
});

const SearchResultsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const { searchResults, filteredJobs, loading, searchLoading } = useSelector((state: RootState) => state.jobs);
  const isLoading = loading || searchLoading;
  const [searchText, setSearchText] = useState(route.params?.query || '');
  const [activeFilter, setActiveFilter] = useState<any>(null);

  const displayJobs = activeFilter ? filteredJobs : searchResults;

  // Static/Local search filter
  const visibleJobs = useMemo(() => {
    if (!searchText.trim()) return displayJobs;
    const query = searchText.toLowerCase();
    return displayJobs.filter(job => 
      job.title?.toLowerCase().includes(query) || 
      job.employer?.company?.company_name?.toLowerCase().includes(query) ||
      job.location?.label?.toLowerCase().includes(query)
    );
  }, [displayJobs, searchText]);

  useEffect(() => {
    if (searchText) {
      dispatch(searchJobs(searchText));
    }
  }, [dispatch]);

  const handleSearch = React.useCallback(() => {
    if (searchText.trim()) {
      dispatch(searchJobs(searchText));
    }
  }, [dispatch, searchText]);

  const applyAdvancedFilters = React.useCallback((filters: any) => {
    setActiveFilter(filters);
    dispatch(filterJobs({ 
      q: searchText,
      ...filters
    }));
  }, [dispatch, searchText]);

  const keyExtractor = React.useCallback((item: any) => item.id.toString(), []);

  const renderJobItem = React.useCallback(({ item }: { item: any }) => (
    <JobCard 
      job={item} 
      colors={colors} 
      onPress={() => navigation.navigate('JobDetail', { jobId: item.id })} 
    />
  ), [colors, navigation]);

  const renderSeparator = React.useCallback(() => <View style={{ height: 12 }} />, []);

  const renderEmpty = React.useCallback(() => (
    <View style={styles.empty}>
      <Icon name="search" size={48} color={colors.border} />
      <Text style={[typography.labelMedium, { color: colors.textPlaceholder, marginTop: spacing.md }]}>
        No results found for "{searchText}"
      </Text>
    </View>
  ), [colors.border, colors.textPlaceholder, searchText]);

  return (
    <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: insets.top }]}>
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
              <Icon name="times-circle" size={14} color={colors.textPlaceholder} />
            </Pressable>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>Searching for jobs...</Text>
        </View>
      ) : (
        <FlatList
          data={visibleJobs}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 80 }
          ]}
          ItemSeparatorComponent={renderSeparator}
          renderItem={renderJobItem}
          ListEmptyComponent={renderEmpty}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
        />
      )}

      <SideFilterHub 
        colors={colors}
        activeFilter={activeFilter}
        onFilterSelect={applyAdvancedFilters}
      />
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: moderateScale(32),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: moderateScale(14),
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
    padding: moderateScale(12),
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBox: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  titleInfo: {
    flex: 1,
  },
  arrowBox: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
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