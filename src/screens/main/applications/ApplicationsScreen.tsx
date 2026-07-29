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
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ApplicationsStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { components } from '../../../theme/components';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { fetchAppliedJobs, fetchApplicationCounts, fetchWishlist, fetchHRInvites } from '../../../redux/slice/profileSlice';
import { toggleWishlist } from '../../../redux/slice/jobSlice';
import SkeletonPulse from '../../../components/SkeletonPulse';
import { typography } from '../../../theme/typography';
import { AuthHeadline } from '../../../components/auth';
import GuestView from '../../../components/GuestView';
import JobIndiaIcon from '../../../assets/Job india Icon & logo file/Icon Job india.jpg';
import ApplicationStatsDashboard from './components/ApplicationStatsDashboard';
import JobActionModal from '../../../components/JobActionModal';
import { BASE_URL } from '../../../api/axiosInstance';



function AppliedJobCard({ job, colors, onPress, profileData }: { job: any; colors: ThemeColors; onPress: () => void; profileData: any }) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState({ top: 0, right: 0 });
  const application = job.application || {};
  const status = application.status || 'pending';

  const company = job.employer?.company || {};
  const location = job.location?.label || t('applications.remote', 'Remote');
  const managerName = job.employer?.name || t('applications.manager', 'Manager');

  const appliedDate = application.applied_at
    ? new Date(application.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '';

  const salaryLabel = job.salary_min && job.salary_max
    ? t('applications.salaryRange', 'Rs. {{min}} - Rs. {{max}} / month', { min: job.salary_min.toLocaleString(), max: job.salary_max.toLocaleString() })
    : t('applications.salaryNegotiable', 'Salary Negotiable');

  const getStatusLabel = (s: string) => {
    const statusLower = s.toLowerCase();
    if (statusLower === 'pending') return t('applications.statusPending', 'In Review / Pending');
    if (statusLower === 'shortlisted') return t('applications.statusShortlisted', 'You are Shortlisted! 🎉');
    if (statusLower === 'contacted') return t('applications.statusContacted', 'HR has contacted you');
    if (statusLower === 'interview_scheduled') return t('applications.statusInterview', 'Interview Scheduled');
    if (statusLower === 'selected') return t('applications.statusSelected', 'Congratulations! Selected');
    if (statusLower === 'rejected') return t('applications.statusRejected', 'Application Rejected');
    return t('applications.statusReviewing', 'HR is reviewing your profile');
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

      const message = t('applications.whatsappMessage', `Dear {{managerName}},\nI came across your job posting on *Job India*, Job Title - *{{jobTitle}}*.\nI tried to contact you over the phone but could not reach you. I am interested in the profile. Please find my details below;\n\n*Full Name*: {{userName}}\n*Experience*: {{userExp}}\n*Location*: {{userLoc}}\n*Mobile No*: {{userPhone}}\n*Qualification*: {{userQual}}\n*Resume Link*: {{userResume}}\n*Skills*: {{userSkills}}`, {
        managerName,
        jobTitle: job.title,
        userName,
        userExp,
        userLoc,
        userPhone,
        userQual,
        userResume,
        userSkills
      });

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
    const companyName = job.employer?.company?.company_name || t('applications.anonymousCompany', 'Hiring Company');
    Share.share({
      message: t('applications.shareMessage', 'Check out this job: {{title}} at {{company}}\nApply here: {{link}}', { title: job.title, company: companyName, link: `https://jobindia.app/job/${job.slug || job.id}` }),
      title: t('applications.shareTitle', 'Job Opening'),
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
        <View style={[styles.wiHeaderInfo, { paddingRight: 32 }]}>
          <Text style={[styles.wiJobTitle, { color: colors.textPrimary }]}>{job.title}</Text>
          <Text style={[styles.wiCompanyName, { color: colors.textSecondary }]}>
            {company.company_name || t('applications.anonymousCompany', 'Anonymous Company')}
          </Text>
        </View>
        {(job.employer?.company?.verification_status === 'approved' || job.employer?.verification_status === 'approved') && (
          <View style={{ position: 'absolute', right: 32, top: 12 }}>
            <MaterialCommunityIcons name="check-decagram" size={16} color="#3B82F6" />
          </View>
        )}
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
            <Text style={[styles.wiJourneyText, { color: colors.textPrimary, fontWeight: '700' }]}>{t('applications.appliedSuccessfully', 'Applied successfully')}</Text>
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
        <Text style={[styles.wiManagerText, { color: colors.textSecondary }]}>{managerName} {t('applications.managerRole', '(Manager)')}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.wiActionRow}>
        <TouchableOpacity style={[styles.wiBtn, styles.wiBtnWhatsapp, { backgroundColor: colors.surface, borderColor: '#22c55e' }]} onPress={handleWhatsApp}>
          <Icon name="whatsapp" size={18} color="#22c55e" />
          <Text style={styles.wiBtnTextWhatsapp}>{t('applications.whatsappBtn', 'WhatsApp')}</Text>
        </TouchableOpacity>
        {job.allow_calls !== false && (
          <TouchableOpacity style={[styles.wiBtn, styles.wiBtnCall, { backgroundColor: colors.primary }]} onPress={handleCall}>
            <Icon name="phone" size={18} color="#fff" />
            <Text style={styles.wiBtnTextCall}>{t('applications.callNowBtn', 'Call Now')}</Text>
            <Icon name="arrow-right" size={14} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
}

const formatJobType = (type: string) => {
  if (!type) return 'Full Time';
  return type
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

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
        styles.wiCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}>
      {/* Header Info */}
      <View style={styles.wiCardHeader}>
        <View style={[styles.wiLogoBox, { backgroundColor: colors.surfaceHighlight }]}>
          {company.company_logo_url ? (
            <Image source={{ uri: company.company_logo_url }} style={styles.wiLogo} />
          ) : (
            <Icon name="briefcase" size={24} color={colors.primary} />
          )}
        </View>
        <Pressable onPress={onOpenDetail} style={styles.wiHeaderInfo}>
          <Text style={[styles.wiJobTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={[styles.wiCompanyName, { color: colors.textSecondary }]} numberOfLines={1}>
            {company.company_name || 'Anonymous Company'}
          </Text>
        </Pressable>
        
        <TouchableOpacity 
          onPress={onRemove} 
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          style={{ backgroundColor: colors.error + '15', borderRadius: 8, padding: 8 }}
          activeOpacity={0.6}
        >
          <Icon name="trash" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Meta Info */}
      <Pressable onPress={onOpenDetail} style={[styles.wiMetaSection, { marginBottom: 0 }]}>
        <View style={styles.wiMetaItem}>
          <Icon name="map-marker" size={14} color={colors.textSecondary} />
          <Text style={[styles.wiMetaText, { color: colors.textPrimary }]}>{location}</Text>
        </View>
        <View style={[styles.wiMetaItem, { marginTop: 4 }]}>
          <Icon name="briefcase" size={14} color={colors.textSecondary} />
          <Text style={[styles.wiMetaText, { color: colors.primary }]}>{formatJobType(job.job_type)}</Text>
        </View>
      </Pressable>
    </View>
  );
}

function HRInviteCard({ invite, colors, onPress }: { invite: any; colors: ThemeColors; onPress: () => void }) {
  const companyObj = invite.company || invite.employer || {};
  const employerObj = invite.employer || {};
  const invitedAt = invite.invited_at
    ? new Date(invite.invited_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const rawLogo = companyObj.company_logo_url || employerObj.company_logo;
  const logoUri = rawLogo
    ? rawLogo.startsWith('http')
      ? rawLogo
      : `${cleanBaseUrl}${rawLogo.startsWith('/') ? '' : '/'}${rawLogo}`
    : null;

  const isJobApp = invite.type === 'job_application';
  const jobDetails = invite.job_details;

  const titleText = isJobApp && jobDetails?.title ? jobDetails.title : (companyObj.company_name || 'Anonymous Company');
  const subtitleText = isJobApp && jobDetails?.title ? (companyObj.company_name || 'Anonymous Company') : 'HR Interview Invite';
  const badgeText = isJobApp ? 'Application Invite' : 'Direct Invite';
  const badgeColor = isJobApp ? '#10B981' : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.wiCard,
        { 
          backgroundColor: colors.surface, 
          borderColor: badgeColor + '30',
          borderWidth: 1.5,
          shadowColor: badgeColor,
          shadowOpacity: 0.08,
          shadowRadius: 15,
          elevation: 4,
          overflow: 'hidden',
        },
      ]}>
      {/* Top Banner / Badge */}
      <View style={{
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: badgeColor + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderBottomLeftRadius: 12,
        zIndex: 1,
      }}>
        <Text style={{ fontSize: 10, fontWeight: '700', color: badgeColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>{badgeText}</Text>
      </View>

      {/* Header Info */}
      <View style={[styles.wiCardHeader, { marginTop: 4 }]}>
        <View style={[styles.wiLogoBox, { backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: colors.border + '50' }]}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.wiLogo} />
          ) : (
            <Icon name="building" size={24} color={colors.primary} />
          )}
        </View>
        <View style={styles.wiHeaderInfo}>
          <Text style={[styles.wiJobTitle, { color: colors.textPrimary, fontSize: 18, marginBottom: 2, paddingRight: 60 }]} numberOfLines={1}>
            {titleText}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name={isJobApp ? "building" : "briefcase"} size={12} color={colors.primary} />
            <Text style={[styles.wiCompanyName, { color: colors.primary, fontWeight: '600', marginTop: 0 }]} numberOfLines={1}>
              {subtitleText}
            </Text>
          </View>
        </View>
      </View>

      {/* Manager Info */}
      <View style={[styles.wiManagerRow, { 
        backgroundColor: colors.surfaceHighlight + '40', 
        padding: 10, 
        borderRadius: 8,
        marginTop: 4,
        marginBottom: 0
      }]}>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="user" size={16} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.wiManagerText, { color: colors.textPrimary, fontSize: 13, marginBottom: 2 }]}>
            {employerObj.name || 'HR Manager'}
          </Text>
          {invitedAt && (
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>
              Invited you on {invitedAt}
            </Text>
          )}
        </View>
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
  const { t } = useTranslation();
  const { appliedJobs, applicationCounts, loading, countsLoading, data: profileData, wishlistJobs, hrInvites } = useSelector((state: RootState) => state.profile);
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isPending, setIsPending] = useState(true);
  const [activeTab, setActiveTab] = useState<'applied' | 'saved' | 'invites'>('applied');
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; jobId: number | null }>({ visible: false, jobId: null });
  const [companyModal, setCompanyModal] = useState<{ visible: boolean; company: any }>({ visible: false, company: null });
  const navigation = useNavigation<StackNavigationProp<ApplicationsStackParamList>>();

  const openJobDetail = (job: any) => {
    navigation.navigate('JobDetail', { jobId: job.slug || job.id });
  };

  const openInviteDetail = (invite: any) => {
    // Check if job_details exists and actually has data (not just an empty object or array)
    const hasJobDetails = invite.job_details && typeof invite.job_details === 'object' && Object.keys(invite.job_details).length > 0;
    
    if (hasJobDetails) {
      navigation.navigate('JobDetail', { 
        jobId: invite.job_details.slug || invite.job_details.id,
        initialJobData: invite.job_details,
        fromHrInvite: true
      });
    } else if (invite.company || invite.employer) {
      setCompanyModal({ visible: true, company: invite.company || invite.employer });
    } else {
      Alert.alert('Notice', 'No details available for this invite.');
    }
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

  const filteredSavedJobs = React.useMemo(() => {
    if (!searchQuery) return wishlistJobs;
    return wishlistJobs.filter((job: any) => 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.employer?.company?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [wishlistJobs, searchQuery]);

  const filteredHRInvites = React.useMemo(() => {
    if (!searchQuery) return hrInvites || [];
    return (hrInvites || []).filter((invite: any) => 
      invite.employer?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invite.employer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [hrInvites, searchQuery]);

  const onRefresh = React.useCallback(() => {
    setIsPending(true);
    dispatch(fetchAppliedJobs());
    dispatch(fetchApplicationCounts());
    dispatch(fetchWishlist());
    dispatch(fetchHRInvites());
    setTimeout(() => setIsPending(false), 100);
  }, [dispatch]);

  const handleConfirmRemove = async () => {
    if (confirmModal.jobId) {
      await dispatch(toggleWishlist({ jobId: confirmModal.jobId, isWishlisted: true }));
      dispatch(fetchWishlist());
      setConfirmModal({ visible: false, jobId: null });
    }
  };

  const renderEmpty = () => {
    const isApplied = activeTab === 'applied';
    const isInvites = activeTab === 'invites';
    return (
      <View style={styles.emptyContainer}>
        <Icon name={searchQuery ? "search-minus" : (isApplied ? "file-text-o" : isInvites ? "envelope-open-o" : "heart-o")} size={48} color={colors.border} />
        <Text style={[typography.labelMedium, { color: colors.textSecondary, marginTop: spacing.md }]}>
          {searchQuery ? t('applications.noMatching', "No matching applications") : (isApplied ? t('applications.noApplications', "No applications yet") : isInvites ? "No HR invites yet" : "No saved jobs yet")}
        </Text>
        <Text style={[typography.small, { color: colors.textPlaceholder, textAlign: 'center', marginTop: 8 }]}>
          {searchQuery ? t('applications.tryDifferentSearch', "Try a different search term") : (isApplied ? t('applications.appliedJobsAppearHere', "Applied jobs will appear here") : isInvites ? "When an HR invites you to apply, it will appear here." : "Jobs you wishlist will appear here")}
        </Text>
      </View>
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      onRefresh();
      StatusBar.setBarStyle('dark-content');
    }, [onRefresh])
  );

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {!isLoggedIn ? (
        <GuestView
          title={t('applications.trackSuccess', "Track Your Success")}
          subtitle={t('applications.registerToTrack', "Register now to keep track of all your job applications and their current status.")}
          image={JobIndiaIcon}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
            <AuthHeadline
              colors={colors}
              title={t('applications.applicationsTitle', "Applications")}
              style={{ marginBottom: 4 }}
            />

            {/* Tab Switcher */}
            <View style={[styles.tabContainer, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
              <TouchableOpacity 
                style={[styles.tabBtn, activeTab === 'applied' && { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }]} 
                onPress={() => setActiveTab('applied')}
              >
                <Text style={[typography.labelMedium, { color: activeTab === 'applied' ? colors.primary : colors.textSecondary }]}>Applied Jobs</Text>
              </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.tabBtn, activeTab === 'saved' && { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }]} 
                    onPress={() => setActiveTab('saved')}
                  >
                    <Text style={[typography.labelMedium, { color: activeTab === 'saved' ? colors.primary : colors.textSecondary }]}>Saved Jobs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.tabBtn, activeTab === 'invites' && { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }]} 
                    onPress={() => setActiveTab('invites')}
                  >
                    <Text style={[typography.labelMedium, { color: activeTab === 'invites' ? colors.primary : colors.textSecondary }]}>HR Invites</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ height: spacing.xs }} />

                {activeTab === 'applied' && (
                  <>
                    <ApplicationStatsDashboard
                      applicationCounts={applicationCounts}
                      countsLoading={countsLoading}
                    />
                    <View style={styles.sectionHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('applications.recentActivity', 'Recent Activity')}</Text>
                        <Text style={{ color: colors.textPlaceholder, fontSize: 12 }}>{t('applications.applicationCount', '{{count}} Applications', { count: filteredAppliedJobs.length })}</Text>
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
                        { label: t('applications.filterAll', 'All Applications'), value: 'all' },
                        { label: t('applications.filterShortlisted', 'Shortlisted'), value: 'shortlisted' },
                        { label: t('applications.filterPending', 'Pending'), value: 'pending' },
                        { label: t('applications.filterInterview', 'Interview Scheduled'), value: 'interview_scheduled' },
                        { label: t('applications.filterRejected', 'Rejected'), value: 'rejected' }
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
                  </>
                )}

              {/* Search Bar */}
              <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Icon name="search" size={16} color={colors.textPlaceholder} />
                <TextInput
                  placeholder={t('applications.searchPlaceholder', 'Search applications...')}
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

              {(loading || isPending) && (activeTab === 'applied' ? filteredAppliedJobs.length === 0 : activeTab === 'saved' ? filteredSavedJobs.length === 0 : filteredHRInvites.length === 0) ? (
                <ApplicationsSkeleton />
              ) : null}
            </View>

              <FlatList
                data={activeTab === 'applied' ? filteredAppliedJobs : activeTab === 'saved' ? filteredSavedJobs : filteredHRInvites}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  activeTab === 'applied' ? (
                    <AppliedJobCard
                      job={item}
                      colors={colors}
                      onPress={() => openJobDetail(item)}
                      profileData={profileData}
                    />
                  ) : activeTab === 'saved' ? (
                    <SavedJobCard
                      job={item}
                      colors={colors}
                      onRemove={() => setConfirmModal({ visible: true, jobId: item.id })}
                      onOpenDetail={() => openJobDetail(item)}
                    />
                  ) : activeTab === 'invites' ? (
                    <HRInviteCard
                      invite={item}
                      colors={colors}
                      onPress={() => openInviteDetail(item)}
                    />
                  ) : null
                )}
                ListEmptyComponent={!(loading || isPending) ? renderEmpty() : null}
                contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading && (activeTab === 'applied' ? filteredAppliedJobs.length > 0 : activeTab === 'saved' ? filteredSavedJobs.length > 0 : filteredHRInvites.length > 0)}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        />
        </View>
      )}
      
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

      {/* Company Info Modal */}
      <Modal
        visible={companyModal.visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCompanyModal({ visible: false, company: null })}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Floating Back Button */}
          <TouchableOpacity 
            onPress={() => setCompanyModal({ visible: false, company: null })} 
            style={{ position: 'absolute', top: insets.top + 16, left: 16, zIndex: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="arrow-left" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {companyModal.company && (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }} bounces={false}>
              
              {/* Cover Image */}
              <View style={{ height: 220, backgroundColor: colors.border }}>
                {companyModal.company.company_cover_url ? (
                  <Image source={{ uri: companyModal.company.company_cover_url }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                ) : (
                  <View style={{ width: '100%', height: '100%', backgroundColor: colors.primary + '20' }} />
                )}
              </View>

              <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl }}>
                {/* Logo and Quick Actions */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -40, marginBottom: spacing.md }}>
                  <View style={[styles.wiLogoBox, { width: 90, height: 90, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.surface, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 }]}>
                    {companyModal.company.company_logo_url || companyModal.company.company_logo ? (
                      <Image source={{ uri: companyModal.company.company_logo_url || `${BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL}${companyModal.company.company_logo}` }} style={styles.wiLogo} />
                    ) : (
                      <Icon name="building" size={40} color={colors.primary} />
                    )}
                  </View>
                  {companyModal.company.website && (
                    <TouchableOpacity 
                      style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, elevation: 2, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 }} 
                      onPress={() => Linking.openURL(companyModal.company.website)}
                    >
                      <Text style={[typography.labelMedium, { color: '#FFFFFF', fontWeight: 'bold' }]}>Visit Website</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Company Header */}
                <View style={{ marginBottom: spacing.lg }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '800' }]} numberOfLines={2}>
                      {companyModal.company.company_name}
                    </Text>
                    {companyModal.company.verification_status === 'approved' && (
                      <Icon name="check-circle" size={22} color="#10B981" />
                    )}
                  </View>
                  {companyModal.company.industry_display_label && (
                    <Text style={[typography.body, { color: colors.textSecondary, fontSize: 16, fontWeight: '500' }]}>
                      {companyModal.company.industry_display_label}
                    </Text>
                  )}
                </View>

                {/* Highlights Grid */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl }}>
                  {companyModal.company.company_size && (
                    <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surfaceHighlight, padding: spacing.md, borderRadius: 16, borderWidth: 1, borderColor: colors.border + '30' }}>
                      <Icon name="users" size={18} color={colors.primary} style={{ marginBottom: 10 }} />
                      <Text style={[typography.labelSmall, { color: colors.textSecondary, marginBottom: 2 }]}>Company Size</Text>
                      <Text style={[typography.labelMedium, { color: colors.textPrimary, fontSize: 15 }]}>{companyModal.company.company_size}</Text>
                    </View>
                  )}
                  {companyModal.company.established_year && (
                    <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surfaceHighlight, padding: spacing.md, borderRadius: 16, borderWidth: 1, borderColor: colors.border + '30' }}>
                      <Icon name="calendar" size={18} color={colors.primary} style={{ marginBottom: 10 }} />
                      <Text style={[typography.labelSmall, { color: colors.textSecondary, marginBottom: 2 }]}>Founded In</Text>
                      <Text style={[typography.labelMedium, { color: colors.textPrimary, fontSize: 15 }]}>{companyModal.company.established_year}</Text>
                    </View>
                  )}
                </View>

                {/* Description */}
                {companyModal.company.description && (
                  <View style={{ marginBottom: spacing.xl }}>
                    <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.sm, fontWeight: '700' }]}>About Company</Text>
                    <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 24 }]}>
                      {companyModal.company.description}
                    </Text>
                  </View>
                )}

                {/* Contact & Location Info */}
                <View style={{ marginBottom: spacing.xl }}>
                  <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md, fontWeight: '700' }]}>Contact Info</Text>
                  <View style={{ gap: spacing.lg, backgroundColor: colors.surface, padding: spacing.lg, borderRadius: 20, borderWidth: 1, borderColor: colors.border + '50', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}>
                    {(companyModal.company.company_phone_display || companyModal.company.company_phone) && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="phone" size={18} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[typography.labelMedium, { color: colors.textSecondary, fontSize: 13, marginBottom: 2 }]}>Phone</Text>
                          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600', fontSize: 16 }]}>{companyModal.company.company_phone_display || companyModal.company.company_phone}</Text>
                        </View>
                      </View>
                    )}
                    
                    {companyModal.company.company_email && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="envelope" size={16} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[typography.labelMedium, { color: colors.textSecondary, fontSize: 13, marginBottom: 2 }]}>Email</Text>
                          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600', fontSize: 16 }]}>{companyModal.company.company_email}</Text>
                        </View>
                      </View>
                    )}
                    
                    {(companyModal.company.address || companyModal.company.city || companyModal.company.state) && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="map-marker" size={18} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[typography.labelMedium, { color: colors.textSecondary, fontSize: 13, marginBottom: 2 }]}>Location</Text>
                          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '500', fontSize: 15, lineHeight: 22 }]}>
                            {[companyModal.company.address, companyModal.company.city, companyModal.company.state, companyModal.company.pincode].filter(Boolean).join(', ')}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                {/* Gallery */}
                {companyModal.company.gallery_media && companyModal.company.gallery_media.length > 0 && (
                  <View style={{ marginBottom: spacing.xl }}>
                    <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md, fontWeight: '700' }]}>Gallery</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
                      {companyModal.company.gallery_media.map((img: any, idx: number) => (
                        <Image key={idx} source={{ uri: img.url }} style={{ width: 200, height: 140, borderRadius: 16, backgroundColor: colors.surfaceHighlight }} resizeMode="cover" />
                      ))}
                    </ScrollView>
                  </View>
                )}

              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  skeletonLogo: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
  },
});

export default ApplicationsScreen;
