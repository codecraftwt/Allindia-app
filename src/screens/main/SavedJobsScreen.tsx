import React, { useState, useMemo } from 'react';
import { 
  FlatList, 
  Pressable, 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  RefreshControl, 
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchWishlist } from '../../redux/slice/profileSlice';
import { toggleWishlist } from '../../redux/slice/jobSlice';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../context/ThemeContext';
import type { SavedStackParamList } from '../../navigation/types';
import type { ThemeColors } from '../../theme/colors';
import { components } from '../../theme/components';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const { width } = Dimensions.get('window');

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
          onPress={onRemove} 
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

  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; jobId: number | null }>({
    visible: false,
    jobId: null,
  });

  React.useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const filteredJobs = useMemo(() => {
    if (!searchQuery) return wishlistJobs;
    return wishlistJobs.filter((job: any) => 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.employer?.company?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [wishlistJobs, searchQuery]);

  const handleConfirmRemove = () => {
    if (confirmModal.jobId) {
      dispatch(toggleWishlist({ jobId: confirmModal.jobId, isWishlisted: true }));
      setConfirmModal({ visible: false, jobId: null });
    }
  };

  const handleOpenDetail = (jobId: number) => {
    navigation.navigate('JobDetail', { jobId: jobId.toString() });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[typography.appTitle, { color: colors.textPrimary }]}>Saved jobs</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              {wishlistJobs.length} jobs bookmarked
            </Text>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.surfaceHighlight }]}>
          <Icon name="search" size={16} color={colors.textPlaceholder} />
          <TextInput
            placeholder="Search saved jobs..."
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="times-circle" size={16} color={colors.textPlaceholder} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <SavedJobCard
            job={item}
            colors={colors}
            onRemove={() => setConfirmModal({ visible: true, jobId: item.id })}
            onOpenDetail={() => handleOpenDetail(item.id)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          filteredJobs.length === 0 && styles.listEmpty,
        ]}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyContainer}>
            <Icon name={searchQuery ? "search-minus" : "heart-o"} size={48} color={colors.border} />
            <Text style={[typography.labelMedium, { color: colors.textSecondary, marginTop: spacing.md }]}>
              {searchQuery ? "No matching jobs" : "No saved jobs yet"}
            </Text>
            <Text style={[typography.small, { color: colors.textPlaceholder }]}>
              {searchQuery ? "Try a different search term" : "Jobs you wishlist will appear here"}
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

      {/* Confirmation Modal */}
      <Modal
        visible={confirmModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModal({ visible: false, jobId: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIcon, { backgroundColor: colors.error + '20' }]}>
              <Icon name="trash" size={24} color={colors.error} />
            </View>
            <Text style={[typography.labelLarge, { color: colors.textPrimary, marginBottom: 8 }]}>
              Remove Saved Job?
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }]}>
              Are you sure you want to remove this job from your bookmarks?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={() => setConfirmModal({ visible: false, jobId: null })}
                style={[styles.modalBtn, { backgroundColor: colors.surfaceHighlight }]}
              >
                <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleConfirmRemove}
                style={[styles.modalBtn, { backgroundColor: colors.error }]}
              >
                <Text style={[typography.labelMedium, { color: '#fff' }]}>Remove</Text>
              </TouchableOpacity>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    gap: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
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
    paddingVertical: spacing.xxl,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: width - spacing.xl * 2,
    maxWidth: 400,
    padding: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SavedJobsScreen;
