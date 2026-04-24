import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Image, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchWishlist } from '../../redux/slice/profileSlice';
import { toggleWishlist } from '../../redux/slice/jobSlice';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { PrimaryButton } from '../../components/auth/PrimaryButton';
import { useTheme } from '../../context/ThemeContext';
import type { SavedStackParamList } from '../../navigation/types';
import type { ThemeColors } from '../../theme/colors';
import { components } from '../../theme/components';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type SavedNav = StackNavigationProp<SavedStackParamList, 'SavedJobs'>;

function SavedJobCard({
  job,
  colors,
  onRemove,
  onOpenDetail,
}: {
  job: any;
  colors: ThemeColors;
  onRemove: () => void;
  onOpenDetail: () => void;
}) {

  const company = job.employer?.company || {};
  const location = job.location?.label || 'Remote';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}>
      <View style={styles.cardHeader}>
        <Pressable onPress={onOpenDetail} style={styles.headerInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={[styles.logoContainer, { backgroundColor: colors.surfaceHighlight }]}>
              {company.company_logo_url ? (
                <Image source={{ uri: company.company_logo_url }} style={styles.logo} />
              ) : (
                <Icon name="briefcase" size={20} color={colors.primary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.labelMedium, { color: colors.textPrimary }]} numberOfLines={1}>
                {job.title}
              </Text>
              <Text style={[typography.small, { color: colors.textSecondary }]} numberOfLines={1}>
                {company.company_name || 'Anonymous Company'}
              </Text>
            </View>
          </View>
        </Pressable>
        
        <TouchableOpacity 
          onPress={() => {
       
            onRemove();
          }} 
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          style={styles.removeBtn}
          activeOpacity={0.6}
        >
          <Icon name="trash" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>

      <Pressable onPress={onOpenDetail} style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Icon name="map-marker" size={12} color={colors.textPlaceholder} />
          <Text style={[typography.tiny, { color: colors.textSecondary }]}>{location}</Text>
        </View>
        {/* <View style={styles.footerItem}>
          <Icon name="money" size={12} color={colors.textPlaceholder} />
          <Text style={[typography.tiny, { color: colors.textSecondary }]}>
            ₹{job.salary_min?.toLocaleString()} - ₹{job.salary_max?.toLocaleString()}
          </Text>
        </View> */}
        <View style={[styles.typeBadge, { backgroundColor: colors.surfaceHighlight }]}>
          <Text style={[typography.tiny, { color: colors.primary }]}>
            {job.job_type === 'full_time' ? 'Full Time' : job.job_type || 'Part Time'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const SavedJobsScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SavedNav>();
  const dispatch = useDispatch<AppDispatch>();
  const { wishlistJobs, loading } = useSelector((state: RootState) => state.profile);

  React.useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = React.useCallback((jobId: number) => {
   
    // Directly dispatching for testing to see if API hits
    dispatch(toggleWishlist({ jobId, isWishlisted: true }));
  }, [dispatch]);

  const handleOpenDetail = (jobId: number) => {
    navigation.navigate('JobDetail', { jobId: jobId.toString() });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[typography.appTitle, { color: colors.textPrimary }]}>Saved jobs</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          Jobs you have bookmarked
        </Text>
      </View>
      <FlatList
        data={wishlistJobs}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <SavedJobCard
            job={item}
            colors={colors}
            onRemove={() => {
          
              handleRemove(item.id);
            }}
            onOpenDetail={() => handleOpenDetail(item.id)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          wishlistJobs.length === 0 && styles.listEmpty,
          { paddingBottom: 0 },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyContainer}>
            <Icon name="heart-o" size={48} color={colors.border} />
            <Text style={[typography.labelMedium, { color: colors.textSecondary, marginTop: spacing.md }]}>
              No saved jobs yet
            </Text>
            <Text style={[typography.small, { color: colors.textPlaceholder }]}>
              Jobs you wishlist will appear here
            </Text>
          </View>
        ) : null}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={() => dispatch(fetchWishlist())} 
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  card: {
    ...components.jobCard,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerInfo: {
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
    marginLeft: 'auto',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    flex: 1,
  },
  removeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
});

export default SavedJobsScreen;
