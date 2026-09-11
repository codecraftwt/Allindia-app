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
  InteractionManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ApplicationsStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAppliedJobs, fetchApplicationCounts, fetchWishlist, fetchHRInvites, dismissHRInvite, markHRInviteAsRead } from '../../../redux/slice/profileSlice';
import { markNotificationAsRead } from '../../../redux/slice/notificationSlice';
import { toggleWishlist } from '../../../redux/slice/jobSlice';
import SkeletonPulse from '../../../components/SkeletonPulse';
import { typography, moderateScale } from '../../../theme/typography';
import { AuthHeadline } from '../../../components/auth';
import GuestView from '../../../components/GuestView';
import JobIndiaIcon from '../../../assets/Job india Icon & logo file/Icon Job india.jpg';
import ApplicationStatsDashboard from './components/ApplicationStatsDashboard';
import JobActionModal from '../../../components/JobActionModal';
import api, { BASE_URL } from '../../../api/axiosInstance';

const AppliedJobCard = React.memo(function AppliedJobCard({ job, colors, onPress, profileData }: { job: any; colors: ThemeColors; onPress: () => void; profileData: any }) {
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
      const userName = profileData?.personal?.name || 'Candidate';
      const userExp = profileData?.preferences?.experience_type || 'Fresh';
      const userLoc = profileData?.preferences?.current_city?.city || 'India';
      const userPhone = profileData?.personal?.phone || profileData?.personal?.mobile || '';
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
    const locationLabel = job.location?.label || 'Remote';
    Share.share({
      message: t('applications.shareMessage', "🚀 Exciting Job Opportunity!\n\n📌 Role: {{title}}\n📍 Location: {{location}}\n💰 Salary: {{salary}}\n\nDon't miss out on this great career move.\n\n👉 Apply here: {{link}}", { 
        title: job.title, 
        location: locationLabel,
        salary: salaryLabel,
        link: `https://jobindia.app/job/${job.slug || job.id}` 
      }),
      title: job.title,
    });
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
            <Icon name="building" size={moderateScale(22)} color={colors.primary} />
          )}
        </View>
        <View style={[styles.wiHeaderInfo, { paddingRight: moderateScale(32) }]}>
          <Text style={[typography.jobTitle, styles.wiJobTitle, { color: colors.textPrimary }]}>{job.title}</Text>
          <Text style={[typography.small, styles.wiCompanyName, { color: colors.textSecondary }]}>
            {company.company_name || t('applications.anonymousCompany', 'Anonymous Company')}
          </Text>
        </View>
        {(job.employer?.company?.verification_status === 'approved' || job.employer?.verification_status === 'approved') && (
          <View style={{ position: 'absolute', right: moderateScale(32), top: moderateScale(10) }}>
            <MaterialCommunityIcons name="check-decagram" size={moderateScale(16)} color="#3B82F6" />
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
          <Icon name="ellipsis-v" size={moderateScale(16)} color={colors.textPlaceholder} />
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
          <Icon name="money" size={moderateScale(13)} color={colors.textSecondary} />
          <Text style={[typography.small, styles.wiMetaText, { color: colors.textPrimary }]}>{salaryLabel}</Text>
        </View>
        <View style={styles.wiMetaItem}>
          <Icon name="map-marker" size={moderateScale(14)} color={colors.textSecondary} />
          <Text style={[typography.small, styles.wiMetaText, { color: colors.textPrimary }]}>{location}</Text>
        </View>
      </View>

      {/* Status Journey Box */}
      <View style={[styles.wiJourneyBox, { backgroundColor: colors.surfaceHighlight + '60' }]}>
        <View style={styles.wiJourneyRow}>
          <View style={styles.wiJourneyIconWrap}>
            <View style={[styles.wiJourneyDot, { backgroundColor: '#10b981' }]}>
              <Icon name="check" size={moderateScale(7)} color="#fff" />
            </View>
            <View style={[styles.wiJourneyLine, { borderColor: colors.border }]} />
          </View>
          <View>
            <Text style={[typography.small, styles.wiJourneyText, { color: colors.textPrimary, fontWeight: '700' }]}>{t('applications.appliedSuccessfully', 'Applied successfully')}</Text>
            {appliedDate ? <Text style={[typography.tiny, { color: colors.textSecondary }]}>{appliedDate}</Text> : null}
          </View>
        </View>
        <View style={[styles.wiJourneyRow, { marginTop: moderateScale(4) }]}>
          <View style={styles.wiJourneyIconWrap}>
            <View style={[styles.wiJourneyCircle, { borderColor: getStatusColor(status), backgroundColor: colors.surface }]}>
              {status !== 'pending' && <View style={{ width: moderateScale(8), height: moderateScale(8), borderRadius: moderateScale(4), backgroundColor: getStatusColor(status) }} />}
            </View>
          </View>
          <Text style={[typography.small, styles.wiJourneyText, { color: colors.textPrimary, fontWeight: status !== 'pending' ? '700' : '500' }]}>
            {getStatusLabel(status)}
          </Text>
        </View>
      </View>

      {/* Manager Info */}
      <View style={styles.wiManagerRow}>
        <Icon name="user-circle" size={moderateScale(15)} color={colors.textSecondary} />
        <Text style={[typography.small, styles.wiManagerText, { color: colors.textSecondary }]}>{managerName} {t('applications.managerRole', '(Manager)')}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.wiActionRow}>
        <TouchableOpacity style={[styles.wiBtn, styles.wiBtnWhatsapp, { backgroundColor: colors.surface, borderColor: '#22c55e' }]} onPress={handleWhatsApp}>
          <Icon name="whatsapp" size={moderateScale(18)} color="#22c55e" />
          <Text style={[typography.labelMedium, styles.wiBtnTextWhatsapp]}>{t('applications.whatsappBtn', 'WhatsApp')}</Text>
        </TouchableOpacity>
        {job.allow_calls !== false && (
          <TouchableOpacity style={[styles.wiBtn, styles.wiBtnCall, { backgroundColor: colors.primary }]} onPress={handleCall}>
            <Icon name="phone" size={moderateScale(16)} color="#fff" />
            <Text style={[typography.labelMedium, styles.wiBtnTextCall]}>{t('applications.callNowBtn', 'Call Now')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
});

const formatJobType = (type: string) => {
  if (!type) return 'Full Time';
  return type
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const SavedJobCard = React.memo(function SavedJobCard({
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
    <Pressable
      onPress={onOpenDetail}
      style={({ pressed }) => [
        styles.wiCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          opacity: pressed ? 0.95 : 1,
        },
      ]}>
      {/* Header Info */}
      <View style={styles.wiCardHeader}>
        <View style={[styles.wiLogoBox, { backgroundColor: colors.surfaceHighlight }]}>
          {company.company_logo_url ? (
            <Image source={{ uri: company.company_logo_url }} style={styles.wiLogo} />
          ) : (
            <Icon name="briefcase" size={moderateScale(22)} color={colors.primary} />
          )}
        </View>
        <View style={styles.wiHeaderInfo}>
          <Text style={[typography.jobTitle, styles.wiJobTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={[typography.small, styles.wiCompanyName, { color: colors.textSecondary }]} numberOfLines={1}>
            {company.company_name || 'Anonymous Company'}
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation();
            onRemove();
          }} 
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          style={{ backgroundColor: colors.error + '15', borderRadius: radius.sm, padding: moderateScale(8) }}
          activeOpacity={0.6}
        >
          <Icon name="trash" size={moderateScale(15)} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Meta Info */}
      <View style={[styles.wiMetaSection, { marginBottom: 0 }]}>
        <View style={styles.wiMetaItem}>
          <Icon name="map-marker" size={moderateScale(14)} color={colors.textSecondary} />
          <Text style={[typography.small, styles.wiMetaText, { color: colors.textPrimary }]}>{location}</Text>
        </View>
        <View style={[styles.wiMetaItem, { marginTop: moderateScale(4) }]}>
          <Icon name="briefcase" size={moderateScale(13)} color={colors.textSecondary} />
          <Text style={[typography.small, styles.wiMetaText, { color: colors.primary }]}>{formatJobType(job.job_type)}</Text>
        </View>
      </View>
    </Pressable>
  );
});

const HRInviteCard = React.memo(function HRInviteCard({
  invite,
  colors,
  onPress,
}: {
  invite: any;
  colors: ThemeColors;
  onPress: () => void;
  profileData?: any;
}) {
  const companyObj = invite.company || invite.employer || {};
  const employerObj = invite.employer || {};
  const jobDetails = invite.job_details;
  const isJobApp = invite.type === 'job_application' || !!jobDetails?.title;

  const invitedAt = invite.invited_at
    ? new Date(invite.invited_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const rawLogo = companyObj.company_logo_url || employerObj.company_logo || jobDetails?.employer?.company?.company_logo_url;
  const logoUri = rawLogo
    ? rawLogo.startsWith('http')
      ? rawLogo
      : `${cleanBaseUrl}${rawLogo.startsWith('/') ? '' : '/'}${rawLogo}`
    : null;

  const titleText = (isJobApp && jobDetails?.title) 
    ? jobDetails.title 
    : (companyObj.company_name || employerObj.company_name || 'Anonymous Company');

  const subtitleText = (isJobApp && jobDetails?.title) 
    ? (companyObj.company_name || employerObj.company_name || 'Anonymous Company') 
    : 'HR Interview Invite';

  const badgeText = isJobApp ? 'Application Invite' : 'Direct Invite';
  const badgeColor = isJobApp ? '#10B981' : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wiCard,
        { 
          backgroundColor: colors.surface, 
          borderColor: badgeColor + '30',
          borderWidth: 1.5,
          shadowColor: badgeColor,
          shadowOpacity: 0.08,
          shadowRadius: moderateScale(12),
          elevation: 3,
          overflow: 'hidden',
          opacity: pressed ? 0.96 : 1,
        },
      ]}>
      {/* Top Banner / Badge */}
      <View style={{
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: badgeColor + '15',
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(4),
        borderBottomLeftRadius: radius.md,
        zIndex: 1,
      }}>
        <Text style={[typography.tiny, { fontWeight: '700', color: badgeColor, textTransform: 'uppercase', letterSpacing: 0.5 }]}>
          {badgeText}
        </Text>
      </View>

      {/* Header Info */}
      <View style={[styles.wiCardHeader, { marginTop: moderateScale(4) }]}>
        <View style={[styles.wiLogoBox, { backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: colors.border + '50' }]}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.wiLogo} />
          ) : (
            <Icon name="building" size={moderateScale(22)} color={colors.primary} />
          )}
        </View>
        <View style={styles.wiHeaderInfo}>
          <Text style={[typography.jobTitle, styles.wiJobTitle, { color: colors.textPrimary, paddingRight: moderateScale(60) }]} numberOfLines={1}>
            {titleText}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(4), marginTop: moderateScale(2) }}>
            <Icon name={isJobApp ? "building" : "briefcase"} size={moderateScale(12)} color={colors.primary} />
            <Text style={[typography.small, styles.wiCompanyName, { color: colors.primary, fontWeight: '600', marginTop: 0 }]} numberOfLines={1}>
              {subtitleText}
            </Text>
          </View>
        </View>
      </View>

      {/* Manager Info */}
      <View style={[styles.wiManagerRow, { 
        backgroundColor: colors.surfaceHighlight + '40', 
        padding: moderateScale(10), 
        borderRadius: radius.sm,
        marginTop: moderateScale(4),
        marginBottom: 0,
      }]}>
        <View style={{ width: moderateScale(30), height: moderateScale(30), borderRadius: moderateScale(15), backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="user" size={moderateScale(15)} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: moderateScale(10) }}>
          <Text style={[typography.labelMedium, styles.wiManagerText, { color: colors.textPrimary, marginBottom: moderateScale(2) }]}>
            {employerObj.name || 'HR Manager'}
          </Text>
          {invitedAt ? (
            <Text style={[typography.tiny, { color: colors.textSecondary }]}>
              Invited you on {invitedAt}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
});

const ApplicationsSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.md, paddingVertical: spacing.sm }}>
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <SkeletonPulse style={styles.skeletonLogo} />
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonPulse style={{ height: moderateScale(16), width: '60%', borderRadius: 4 }} />
              <SkeletonPulse style={{ height: moderateScale(12), width: '40%', borderRadius: 4 }} />
            </View>
            <SkeletonPulse style={{ height: moderateScale(20), width: moderateScale(60), borderRadius: 10 }} />
          </View>
          <View style={{ height: 1, backgroundColor: colors.border + '30', marginVertical: 4 }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <SkeletonPulse style={{ height: moderateScale(12), width: moderateScale(80), borderRadius: 4 }} />
            <SkeletonPulse style={{ height: moderateScale(12), width: moderateScale(80), borderRadius: 4 }} />
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
  const { notifications = [] } = useSelector((state: RootState) => state.notifications);
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isPending, setIsPending] = useState(true);
  const [activeTab, setActiveTab] = useState<'applied' | 'saved' | 'invites'>('applied');
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; jobId: number | null }>({ visible: false, jobId: null });
  const [companyModal, setCompanyModal] = useState<{ visible: boolean; company: any }>({ visible: false, company: null });
  const navigation = useNavigation<StackNavigationProp<ApplicationsStackParamList>>();

  const openJobDetail = React.useCallback((job: any) => {
    navigation.navigate('JobDetail', { jobId: job.slug || job.id });
  }, [navigation]);

  const openInviteDetail = React.useCallback((invite: any) => {
    if (invite?.id) {
      const inviteIdStr = String(invite.id);
      dispatch(dismissHRInvite(invite.id));
      dispatch(markHRInviteAsRead({ inviteId: invite.id, type: invite.type }));

      if (Array.isArray(notifications) && notifications.length > 0) {
        const matchingNotifs = notifications.filter((n: any) => {
          if (!n || n.is_read) return false;
          const nData = n.data || {};
          if (nData.invitation_id && String(nData.invitation_id) === inviteIdStr) return true;
          if (nData.invite_id && String(nData.invite_id) === inviteIdStr) return true;
          if (nData.id && String(nData.id) === inviteIdStr) return true;
          if (n.message && invite.employer?.name && n.message.toLowerCase().includes(invite.employer.name.toLowerCase())) return true;
          if (n.title && invite.employer?.name && n.title.toLowerCase().includes(invite.employer.name.toLowerCase())) return true;
          return false;
        });
        matchingNotifs.forEach((notif: any) => {
          dispatch(markNotificationAsRead(notif.id));
        });
      }

      AsyncStorage.getItem('hidden_hr_invite_ids').then((stored) => {
        const parsed = stored ? JSON.parse(stored) : [];
        const next = [...parsed.filter((id: string) => id !== inviteIdStr), inviteIdStr];
        AsyncStorage.setItem('hidden_hr_invite_ids', JSON.stringify(next));
      }).catch(console.warn);
    }

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
  }, [dispatch, navigation, notifications]);

  const filteredAppliedJobs = React.useMemo(() => {
    let filtered = appliedJobs;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((job: any) => job.application?.status === statusFilter);
    }

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

  const renderEmpty = React.useCallback(() => {
    const isApplied = activeTab === 'applied';
    const isInvites = activeTab === 'invites';
    return (
      <View style={styles.emptyContainer}>
        <Icon name={searchQuery ? "search-minus" : (isApplied ? "file-text-o" : isInvites ? "envelope-open-o" : "heart-o")} size={moderateScale(44)} color={colors.border} />
        <Text style={[typography.labelMedium, { color: colors.textSecondary, marginTop: spacing.md }]}>
          {searchQuery ? t('applications.noMatching', "No matching applications") : (isApplied ? t('applications.noApplications', "No applications yet") : isInvites ? "No HR invites yet" : "No saved jobs yet")}
        </Text>
        <Text style={[typography.small, { color: colors.textPlaceholder, textAlign: 'center', marginTop: 8 }]}>
          {searchQuery ? t('applications.tryDifferentSearch', "Try a different search term") : (isApplied ? t('applications.appliedJobsAppearHere', "Applied jobs will appear here") : isInvites ? "When an HR invites you to apply, it will appear here." : "Jobs you wishlist will appear here")}
        </Text>
      </View>
    );
  }, [activeTab, searchQuery, colors.border, colors.textSecondary, colors.textPlaceholder, t]);

  const keyExtractor = React.useCallback((item: any) => item.id.toString(), []);

  useFocusEffect(
    React.useCallback(() => {
      InteractionManager.runAfterInteractions(() => {
        onRefresh();
      });
      StatusBar.setBarStyle('dark-content');
    }, [onRefresh])
  );

  const insets = useSafeAreaInsets();

  const renderJobItem = React.useCallback(({ item }: { item: any }) => {
    if (activeTab === 'applied') {
      return (
        <AppliedJobCard
          job={item}
          colors={colors}
          onPress={() => openJobDetail(item)}
          profileData={profileData}
        />
      );
    } else if (activeTab === 'saved') {
      return (
        <SavedJobCard
          job={item}
          colors={colors}
          onRemove={() => setConfirmModal({ visible: true, jobId: item.id })}
          onOpenDetail={() => openJobDetail(item)}
        />
      );
    } else if (activeTab === 'invites') {
      return (
        <HRInviteCard
          invite={item}
          colors={colors}
          onPress={() => openInviteDetail(item)}
          profileData={profileData}
        />
      );
    }
    return null;
  }, [activeTab, colors, profileData, openJobDetail, setConfirmModal, openInviteDetail]);

  const listHeader = React.useMemo(() => {
    return (
      <View style={{ marginBottom: spacing.xs }}>
        {/* Auth Headline */}
        <AuthHeadline
          colors={colors}
          title={t('applications.applicationsTitle', "Applications")}
          style={{ marginBottom: 4 }}
        />

        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'applied' && { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }]} 
            onPress={() => setActiveTab('applied')}
          >
            <Text style={[typography.labelMedium, { color: activeTab === 'applied' ? colors.primary : colors.textSecondary }]}>
              {t('applications.tabApplied', 'Applied Jobs')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'saved' && { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }]} 
            onPress={() => setActiveTab('saved')}
          >
            <Text style={[typography.labelMedium, { color: activeTab === 'saved' ? colors.primary : colors.textSecondary }]}>
              {t('applications.tabSaved', 'Saved Jobs')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'invites' && { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }]} 
            onPress={() => setActiveTab('invites')}
          >
            <Text style={[typography.labelMedium, { color: activeTab === 'invites' ? colors.primary : colors.textSecondary }]}>
              {t('applications.tabInvites', 'HR Invites')}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'applied' && (
          <View style={{ marginTop: spacing.sm }}>
            <ApplicationStatsDashboard
              applicationCounts={applicationCounts}
              countsLoading={countsLoading}
            />
            <View style={styles.sectionHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.sectionTitle, styles.sectionTitle, { color: colors.textPrimary }]}>
                  {t('applications.recentActivity', 'Recent Activity')}
                </Text>
                <Text style={[typography.tiny, { color: colors.textPlaceholder }]}>
                  {t('applications.applicationCount', '{{count}} Applications', { count: filteredAppliedJobs.length })}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowFilterMenu(true)}
                style={[styles.filterIconBtn, { backgroundColor: statusFilter !== 'all' ? colors.primary + '15' : colors.surface, borderColor: colors.border }]}
              >
                <Icon name="filter" size={moderateScale(16)} color={statusFilter !== 'all' ? colors.primary : colors.textSecondary} />
                {statusFilter !== 'all' && <View style={[styles.filterBadge, { backgroundColor: colors.primary, borderColor: colors.surface }]} />}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Icon name="search" size={moderateScale(15)} color={colors.textPlaceholder} />
          <TextInput
            placeholder={t('applications.searchPlaceholder', 'Search applications...')}
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="times-circle" size={moderateScale(15)} color={colors.textPlaceholder} />
            </TouchableOpacity>
          )}
        </View>

        {(loading || isPending) && (activeTab === 'applied' ? filteredAppliedJobs.length === 0 : activeTab === 'saved' ? filteredSavedJobs.length === 0 : filteredHRInvites.length === 0) ? (
          <ApplicationsSkeleton />
        ) : null}
      </View>
    );
  }, [colors, t, activeTab, applicationCounts, countsLoading, filteredAppliedJobs.length, filteredSavedJobs.length, filteredHRInvites.length, statusFilter, searchQuery, loading, isPending]);

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
          <FlatList
            data={activeTab === 'applied' ? filteredAppliedJobs : activeTab === 'saved' ? filteredSavedJobs : filteredHRInvites}
            keyExtractor={keyExtractor}
            renderItem={renderJobItem}
            ListHeaderComponent={listHeader}
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            windowSize={11}
            removeClippedSubviews={true}
            ListEmptyComponent={!(loading || isPending) ? renderEmpty : null}
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

      {/* Filter Dropdown Modal */}
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
                {statusFilter === f.value && <Icon name="check" size={moderateScale(13)} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
      
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
              <Icon name="trash" size={moderateScale(22)} color={colors.error} />
            </View>
            <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: 8 }]}>
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
            style={{ position: 'absolute', top: insets.top + 16, left: 16, zIndex: 20, width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(19), backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="arrow-left" size={moderateScale(16)} color="#FFFFFF" />
          </TouchableOpacity>

          {companyModal.company && (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: moderateScale(160) }} bounces={false}>
              
              {/* Cover Image */}
              <View style={{ height: moderateScale(200), backgroundColor: colors.border }}>
                {companyModal.company.company_cover_url ? (
                  <Image source={{ uri: companyModal.company.company_cover_url }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                ) : (
                  <View style={{ width: '100%', height: '100%', backgroundColor: colors.primary + '20' }} />
                )}
              </View>

              <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}>
                {/* Logo and Quick Actions */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -moderateScale(36), marginBottom: spacing.md }}>
                  <View style={[styles.wiLogoBox, { width: moderateScale(80), height: moderateScale(80), borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.surface, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 }]}>
                    {companyModal.company.company_logo_url || companyModal.company.company_logo ? (
                      <Image source={{ uri: companyModal.company.company_logo_url || `${BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL}${companyModal.company.company_logo}` }} style={styles.wiLogo} />
                    ) : (
                      <Icon name="building" size={moderateScale(34)} color={colors.primary} />
                    )}
                  </View>
                  {companyModal.company.website && (
                    <TouchableOpacity 
                      style={{ backgroundColor: colors.primary, paddingHorizontal: moderateScale(18), paddingVertical: moderateScale(9), borderRadius: radius.pill, elevation: 2, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 }} 
                      onPress={() => Linking.openURL(companyModal.company.website)}
                    >
                      <Text style={[typography.labelMedium, { color: '#FFFFFF' }]}>Visit Website</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Company Header */}
                <View style={{ marginBottom: spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '800' }]} numberOfLines={2}>
                      {companyModal.company.company_name}
                    </Text>
                    {companyModal.company.verification_status === 'approved' && (
                      <Icon name="check-circle" size={moderateScale(20)} color="#10B981" />
                    )}
                  </View>
                  {companyModal.company.industry_display_label && (
                    <Text style={[typography.body, { color: colors.textSecondary, fontWeight: '500' }]}>
                      {companyModal.company.industry_display_label}
                    </Text>
                  )}
                </View>

                {/* Highlights Grid */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
                  {companyModal.company.company_size && (
                    <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surfaceHighlight, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border + '30' }}>
                      <Icon name="users" size={moderateScale(16)} color={colors.primary} style={{ marginBottom: 8 }} />
                      <Text style={[typography.tiny, { color: colors.textSecondary, marginBottom: 2 }]}>Company Size</Text>
                      <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>{companyModal.company.company_size}</Text>
                    </View>
                  )}
                  {companyModal.company.established_year && (
                    <View style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surfaceHighlight, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border + '30' }}>
                      <Icon name="calendar" size={moderateScale(16)} color={colors.primary} style={{ marginBottom: 8 }} />
                      <Text style={[typography.tiny, { color: colors.textSecondary, marginBottom: 2 }]}>Founded In</Text>
                      <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>{companyModal.company.established_year}</Text>
                    </View>
                  )}
                </View>

                {/* Description */}
                {companyModal.company.description && (
                  <View style={{ marginBottom: spacing.lg }}>
                    <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: spacing.xs }]}>About Company</Text>
                    <Text style={[typography.body, { color: colors.textSecondary, lineHeight: moderateScale(22) }]}>
                      {companyModal.company.description}
                    </Text>
                  </View>
                )}

                {/* Contact & Location Info */}
                <View style={{ marginBottom: spacing.lg }}>
                  <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: spacing.sm }]}>Contact Info</Text>
                  <View style={{ gap: spacing.md, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border + '50', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}>
                    {(companyModal.company.company_phone_display || companyModal.company.company_phone) && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        <View style={{ width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(19), backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="phone" size={moderateScale(16)} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[typography.tiny, { color: colors.textSecondary, marginBottom: 2 }]}>Phone</Text>
                          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>{companyModal.company.company_phone_display || companyModal.company.company_phone}</Text>
                        </View>
                      </View>
                    )}
                    
                    {companyModal.company.company_email && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        <View style={{ width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(19), backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="envelope" size={moderateScale(15)} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[typography.tiny, { color: colors.textSecondary, marginBottom: 2 }]}>Email</Text>
                          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>{companyModal.company.company_email}</Text>
                        </View>
                      </View>
                    )}
                    
                    {(companyModal.company.address || companyModal.company.city || companyModal.company.state) && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        <View style={{ width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(19), backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="map-marker" size={moderateScale(16)} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[typography.tiny, { color: colors.textSecondary, marginBottom: 2 }]}>Location</Text>
                          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '500' }]}>
                            {[companyModal.company.address, companyModal.company.city, companyModal.company.state, companyModal.company.pincode].filter(Boolean).join(', ')}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                {/* Gallery */}
                {companyModal.company.gallery_media && companyModal.company.gallery_media.length > 0 && (
                  <View style={{ marginBottom: spacing.lg }}>
                    <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: spacing.sm }]}>Gallery</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                      {companyModal.company.gallery_media.map((img: any, idx: number) => (
                        <Image key={idx} source={{ uri: img.url }} style={{ width: moderateScale(180), height: moderateScale(120), borderRadius: radius.md, backgroundColor: colors.surfaceHighlight }} resizeMode="cover" />
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
    padding: moderateScale(4),
    borderRadius: radius.pill,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: moderateScale(8),
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: moderateScale(160),
  },
  wiCard: {
    padding: spacing.md,
    borderRadius: radius.card,
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
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: radius.md,
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
    letterSpacing: -0.2,
  },
  wiCompanyName: {
    marginTop: 2,
  },
  wiMetaSection: {
    gap: moderateScale(6),
    marginBottom: spacing.md,
  },
  wiMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  wiMetaText: {
    fontWeight: '600',
  },
  wiJourneyBox: {
    padding: moderateScale(10),
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  wiJourneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  wiJourneyIconWrap: {
    alignItems: 'center',
    width: moderateScale(18),
  },
  wiJourneyDot: {
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  wiJourneyCircle: {
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wiJourneyLine: {
    width: 2,
    height: moderateScale(16),
    borderStyle: 'dashed',
    borderWidth: 1,
    marginVertical: 2,
  },
  wiJourneyText: {
    lineHeight: moderateScale(18),
  },
  wiManagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    marginBottom: spacing.md,
  },
  wiManagerText: {
    fontWeight: '600',
  },
  wiActionRow: {
    flexDirection: 'row',
    gap: moderateScale(10),
    marginBottom: 4,
  },
  wiBtn: {
    flex: 1,
    height: moderateScale(44),
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
  },
  wiBtnWhatsapp: {
    borderWidth: 1.5,
  },
  wiBtnCall: {},
  wiBtnTextWhatsapp: {
    color: '#22c55e',
    fontWeight: '800',
  },
  wiBtnTextCall: {
    color: '#fff',
    fontWeight: '800',
  },
  wiAppliedDate: {
    fontSize: moderateScale(10),
    marginTop: moderateScale(6),
    textAlign: 'right',
  },
  inviteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: radius.pill,
  },
  wiMenuBtn: {
    padding: moderateScale(6),
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
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
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
    height: moderateScale(46),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    letterSpacing: -0.3,
  },
  filterIconBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    borderWidth: 1,
  },
  filterDropdownContent: {
    position: 'absolute',
    right: spacing.lg,
    top: moderateScale(240),
    width: moderateScale(190),
    borderRadius: radius.md,
    borderWidth: 1,
    padding: moderateScale(6),
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
    paddingVertical: moderateScale(9),
    paddingHorizontal: moderateScale(12),
    borderRadius: radius.sm,
  },
  filterMenuText: {
    fontSize: moderateScale(13),
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: moderateScale(44),
    borderRadius: radius.pill,
    borderWidth: 1,
    marginVertical: spacing.xs,
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
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: radius.md,
  },
});

export default ApplicationsScreen;
