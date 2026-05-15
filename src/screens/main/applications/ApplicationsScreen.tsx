import React, { useState } from 'react';
import {
  RefreshControl,
  Pressable,
  View,

  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Linking,
  Alert,
  Share,
  Modal,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ApplicationsStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { components } from '../../../theme/components';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { fetchAppliedJobs, fetchApplicationCounts } from '../../../redux/slice/profileSlice';
import SkeletonPulse from '../../../components/SkeletonPulse';
import { typography } from '../../../theme/typography';
import { AuthHeadline } from '../../../components/auth';
import GuestView from '../../../components/GuestView';
import ApplicationStatsDashboard from './components/ApplicationStatsDashboard';
import JobActionModal from '../../../components/JobActionModal';



function AppliedJobCard({ job, colors, onPress, profileData }: { job: any; colors: ThemeColors; onPress: () => void; profileData: any }) {
  const [showMenu, setShowMenu] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState({ top: 0, right: 0 });
  const application = job.application || {};
  const status = application.status || 'pending';

  const company = job.employer?.company || {};
  const location = job.location?.label || 'Remote';
  const managerName = job.employer?.name || 'Manager';

  const appliedDate = application.applied_at
    ? new Date(application.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '';

  const salaryLabel = job.salary_min && job.salary_max
    ? `Rs. ${job.salary_min.toLocaleString()} - Rs. ${job.salary_max.toLocaleString()} / month`
    : 'Salary Negotiable';

  const getStatusLabel = (s: string) => {
    const statusLower = s.toLowerCase();
    if (statusLower === 'pending') return 'In Review / Pending';
    if (statusLower === 'shortlisted') return 'You are Shortlisted! 🎉';
    if (statusLower === 'contacted') return 'HR has contacted you';
    if (statusLower === 'interview_scheduled') return 'Interview Scheduled';
    if (statusLower === 'selected') return 'Congratulations! Selected';
    if (statusLower === 'rejected') return 'Application Rejected';
    return 'HR is reviewing your profile';
  };

  const getStatusColor = (s: string) => {
    const statusLower = s.toLowerCase();
    if (statusLower === 'shortlisted' || statusLower === 'selected') return '#10b981';
    if (statusLower === 'rejected') return '#ef4444';
    if (statusLower === 'pending') return '#f59e0b';
    return '#3b82f6';
  };

  const handleWhatsApp = () => {
    const phone = job.employer?.phone || job.employer?.company?.company_phone;
    if (phone) {
      // Dynamic User Data
      const userName = profileData?.personal?.name || 'Candidate';
      const userExp = profileData?.preferences?.experience_type || 'Fresh';
      const userLoc = profileData?.preferences?.current_city?.city || 'India';
      const userPhone = profileData?.personal?.phone || '';
      const userQual = profileData?.preferences?.qualification?.name || 'Graduate';
      const userResume = profileData?.resume_url || 'Resume attached to profile';
      const userSkills = profileData?.skills?.map((s: any) => s.name).join(', ') || 'Skills mentioned in profile';

      const message = `Dear ${managerName},\nI came across your job posting on *Job India*, Job Title - *${job.title}*.\nI tried to contact you over the phone but could not reach you. I am interested in the profile. Please find my details below;\n\n*Full Name*: ${userName}\n*Experience*: ${userExp}\n*Location*: ${userLoc}\n*Mobile No*: ${userPhone}\n*Qualification*: ${userQual}\n*Resume Link*: ${userResume}\n*Skills*: ${userSkills}`;

      const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
      Linking.openURL(url).catch(() => Alert.alert('Error', 'WhatsApp is not installed'));
    }
  };

  const handleCall = () => {
    const phone = job.employer?.phone || job.employer?.company?.company_phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleShare = () => {
    setShowMenu(false);
    const companyName = job.employer?.company?.company_name || 'Hiring Company';
    Share.share({
      message: `Check out this job: ${job.title} at ${companyName}\nApply here: https://jobindia.app/job/${job.slug || job.id}`,
      title: 'Job Opening',
    });
  };

  const handleReport = () => {
    // Handled by JobActionModal
  };

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.wiCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}>
      {/* Header Info */}
      <View style={styles.wiCardHeader}>
        <View style={[styles.wiLogoBox, { backgroundColor: colors.surfaceHighlight }]}>
          {company.company_logo_url ? (
            <Image source={{ uri: company.company_logo_url }} style={styles.wiLogo} />
          ) : (
            <Icon name="building" size={24} color={colors.primary} />
          )}
        </View>
        <View style={styles.wiHeaderInfo}>
          <Text style={[styles.wiJobTitle, { color: colors.textPrimary }]}>{job.title}</Text>
          <Text style={[styles.wiCompanyName, { color: colors.textSecondary }]}>{company.company_name || 'Anonymous Company'}</Text>
        </View>
        <TouchableOpacity
          onPress={(event) => {
            const { pageY } = event.nativeEvent;
            setMenuAnchor({ top: pageY - 10, right: spacing.lg });
            setShowMenu(true);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.wiMenuBtn}
        >
          <Icon name="ellipsis-v" size={16} color={colors.textPlaceholder} />
        </TouchableOpacity>

        {/* Dynamic Action Modal/Dropdown */}
        <JobActionModal
          visible={showMenu}
          onClose={() => setShowMenu(false)}
          job={job}
          colors={colors}
          onShare={handleShare}
          type="dropdown"
          anchorPosition={menuAnchor}
        />
      </View>

      {/* Meta Info */}
      <View style={styles.wiMetaSection}>
        <View style={styles.wiMetaItem}>
          <Icon name="money" size={14} color={colors.textSecondary} />
          <Text style={[styles.wiMetaText, { color: colors.textPrimary }]}>{salaryLabel}</Text>
        </View>
        <View style={styles.wiMetaItem}>
          <Icon name="map-marker" size={14} color={colors.textSecondary} />
          <Text style={[styles.wiMetaText, { color: colors.textPrimary }]}>{location}</Text>
        </View>
      </View>

      {/* Status Journey Box */}
      <View style={[styles.wiJourneyBox, { backgroundColor: colors.surfaceHighlight + '50' }]}>
        <View style={styles.wiJourneyRow}>
          <View style={styles.wiJourneyIconWrap}>
            <View style={[styles.wiJourneyDot, { backgroundColor: '#10b981' }]}>
              <Icon name="check" size={8} color="#fff" />
            </View>
            <View style={[styles.wiJourneyLine, { borderColor: colors.border }]} />
          </View>
          <View>
            <Text style={[styles.wiJourneyText, { color: colors.textPrimary, fontWeight: '700' }]}>Applied successfully</Text>
            {appliedDate ? <Text style={{ fontSize: 10, color: colors.textSecondary }}>{appliedDate}</Text> : null}
          </View>
        </View>
        <View style={[styles.wiJourneyRow, { marginTop: 4 }]}>
          <View style={styles.wiJourneyIconWrap}>
            <View style={[styles.wiJourneyCircle, { borderColor: getStatusColor(status), backgroundColor: colors.surface }]}>
              {status !== 'pending' && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getStatusColor(status) }} />}
            </View>
          </View>
          <Text style={[styles.wiJourneyText, { color: colors.textPrimary, fontWeight: status !== 'pending' ? '700' : '500' }]}>
            {getStatusLabel(status)}
          </Text>
        </View>
      </View>

      {/* Manager Info */}
      <View style={styles.wiManagerRow}>
        <Icon name="user-circle" size={16} color={colors.textSecondary} />
        <Text style={[styles.wiManagerText, { color: colors.textSecondary }]}>{managerName} (Manager)</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.wiActionRow}>
        <TouchableOpacity style={[styles.wiBtn, styles.wiBtnWhatsapp, { backgroundColor: colors.surface, borderColor: '#22c55e' }]} onPress={handleWhatsApp}>
          <Icon name="whatsapp" size={18} color="#22c55e" />
          <Text style={styles.wiBtnTextWhatsapp}>WhatsApp</Text>
        </TouchableOpacity>
        {job.allow_calls !== false && (
          <TouchableOpacity style={[styles.wiBtn, styles.wiBtnCall, { backgroundColor: colors.primary }]} onPress={handleCall}>
            <Icon name="phone" size={18} color="#fff" />
            <Text style={styles.wiBtnTextCall}>Call Now</Text>
            <Icon name="arrow-right" size={14} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
}

const ApplicationsSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.md }}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <SkeletonPulse style={styles.skeletonLogo} />
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonPulse style={{ height: 16, width: '60%', borderRadius: 4 }} />
              <SkeletonPulse style={{ height: 12, width: '40%', borderRadius: 4 }} />
            </View>
            <SkeletonPulse style={{ height: 20, width: 60, borderRadius: 10 }} />
          </View>
          <View style={{ height: 1, backgroundColor: colors.border + '30', marginVertical: 4 }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <SkeletonPulse style={{ height: 12, width: 80, borderRadius: 4 }} />
            <SkeletonPulse style={{ height: 12, width: 80, borderRadius: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
};


const ApplicationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { appliedJobs, applicationCounts, loading, countsLoading, data: profileData } = useSelector((state: RootState) => state.profile);
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const navigation = useNavigation<StackNavigationProp<ApplicationsStackParamList>>();

  const openJobDetail = (job: any) => {
    navigation.navigate('JobDetail', { jobId: job.slug || job.id });
  };

  const filteredAppliedJobs = React.useMemo(() => {
    let filtered = appliedJobs;

    // Status Filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((job: any) => job.application?.status === statusFilter);
    }

    // Search Filter
    if (searchQuery) {
      filtered = filtered.filter((job: any) =>
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.employer?.company?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [appliedJobs, searchQuery, statusFilter]);

  const onRefresh = React.useCallback(() => {
    dispatch(fetchAppliedJobs());
    dispatch(fetchApplicationCounts());
  }, [dispatch]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name={searchQuery ? "search-minus" : "file-text-o"} size={48} color={colors.border} />
      <Text style={[typography.labelMedium, { color: colors.textSecondary, marginTop: spacing.md }]}>
        {searchQuery ? "No matching applications" : "No applications yet"}
      </Text>
      <Text style={[typography.small, { color: colors.textPlaceholder }]}>
        {searchQuery ? "Try a different search term" : "Applied jobs will appear here"}
      </Text>
    </View>
  );

  React.useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {!isLoggedIn ? (
        <GuestView
          title="Track Your Success"
          subtitle="Register now to keep track of all your job applications and their current status."
          icon="briefcase"
        />
      ) : (
        <FlatList
          data={filteredAppliedJobs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <AppliedJobCard
              job={item}
              colors={colors}
              onPress={() => openJobDetail(item)}
              profileData={profileData}
            />
          )}
          ListHeaderComponent={
            <>
              <AuthHeadline
                colors={colors}
                title="Applications"
              />
              <View style={{ height: spacing.xs }} />

              {/* Job Application Stats Dashboard - Horizontal Scroll */}
              <ApplicationStatsDashboard
                applicationCounts={applicationCounts}
                countsLoading={countsLoading}
              />
              <View style={styles.sectionHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
                  <Text style={{ color: colors.textPlaceholder, fontSize: 12 }}>{filteredAppliedJobs.length} Applications</Text>
                </View>

                <TouchableOpacity
                  onPress={() => setShowFilterMenu(true)}
                  style={[styles.filterIconBtn, { backgroundColor: statusFilter !== 'all' ? colors.primary + '15' : colors.surface, borderColor: colors.border }]}
                >
                  <Icon name="filter" size={18} color={statusFilter !== 'all' ? colors.primary : colors.textSecondary} />
                  {statusFilter !== 'all' && <View style={[styles.filterBadge, { backgroundColor: colors.primary, borderColor: colors.surface }]} />}
                </TouchableOpacity>

                {/* Filter Dropdown */}
                <Modal
                  visible={showFilterMenu}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowFilterMenu(false)}
                >
                  <Pressable style={styles.menuOverlay} onPress={() => setShowFilterMenu(false)}>
                    <View style={[styles.filterDropdownContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      {[
                        { label: 'All Applications', value: 'all' },
                        { label: 'Shortlisted', value: 'shortlisted' },
                        { label: 'Pending', value: 'pending' },
                        { label: 'Interview Scheduled', value: 'interview_scheduled' },
                        { label: 'Rejected', value: 'rejected' }
                      ].map((f) => (
                        <TouchableOpacity
                          key={f.value}
                          onPress={() => {
                            setStatusFilter(f.value);
                            setShowFilterMenu(false);
                          }}
                          style={[
                            styles.filterMenuItem,
                            { backgroundColor: statusFilter === f.value ? colors.primary + '10' : 'transparent' }
                          ]}
                        >
                          <Text style={[
                            styles.filterMenuText,
                            { color: statusFilter === f.value ? colors.primary : colors.textPrimary }
                          ]}>
                            {f.label}
                          </Text>
                          {statusFilter === f.value && <Icon name="check" size={14} color={colors.primary} />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Pressable>
                </Modal>
              </View>

              {/* Search Bar */}
              <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Icon name="search" size={16} color={colors.textPlaceholder} />
                <TextInput
                  placeholder="Search applications..."
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

              {loading && filteredAppliedJobs.length === 0 && (
                <ApplicationsSkeleton />
              )}
            </>
          }
          ListEmptyComponent={!loading ? renderEmpty() : null}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading && filteredAppliedJobs.length > 0}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 120,
  },
  wiCard: {
    padding: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: spacing.md,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  wiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  wiLogoBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wiLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  wiHeaderInfo: {
    flex: 1,
  },
  wiJobTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  wiCompanyName: {
    fontSize: 12,
    marginTop: 2,
  },
  wiMetaSection: {
    gap: 8,
    marginBottom: spacing.md,
  },
  wiMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wiMetaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  wiJourneyBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  wiJourneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wiJourneyIconWrap: {
    alignItems: 'center',
    width: 20,
  },
  wiJourneyDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wiJourneyCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  wiJourneyLine: {
    width: 2,
    height: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    marginVertical: 2,
  },
  wiJourneyText: {
    fontSize: 13,
  },
  wiManagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  wiManagerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  wiActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  wiBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  wiBtnWhatsapp: {
    borderWidth: 1.5,
  },
  wiBtnCall: {
    // Background color set dynamically
  },
  wiBtnTextWhatsapp: {
    color: '#22c55e',
    fontWeight: '800',
    fontSize: 14,
  },
  wiBtnTextCall: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  wiAppliedDate: {
    fontSize: 10,
    marginTop: 8,
    textAlign: 'right',
  },
  wiMenuBtn: {
    padding: 4,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  filterIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  filterDropdownContent: {
    position: 'absolute',
    right: spacing.lg,
    top: 270,
    width: 180,
    borderRadius: 12,
    borderWidth: 1,
    padding: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  filterMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterMenuText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    padding: 0,
  },
  skeletonCard: {
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  skeletonLogo: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
  },
});

export default ApplicationsScreen;
