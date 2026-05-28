import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  Modal,
  StatusBar,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  type NavigationProp,
  type ParamListBase,
  type RouteProp,
} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { PrimaryButton } from '../../../components/auth';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { components } from '../../../theme/components';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import SkeletonPulse from '../../../components/SkeletonPulse';
import JobActionModal from '../../../components/JobActionModal';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchJobDetail, clearCurrentJob, applyJob, toggleWishlist, reportJob } from '../../../redux/slice/jobSlice';
import { fetchWishlist } from '../../../redux/slice/profileSlice';

const REPORT_REASONS = [
  'Fake Job / Scam',
  'Asking for Money',
  'Inappropriate Content',
  'Already Filled / Closed',
  'Wrong Category / Details',
];

const formatJobType = (type: string) => {
  if (!type) return 'Full Time';
  return type
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const cleanIconName = (icon: string) => {
  if (!icon) return 'check-circle';
  return icon.replace(/fas fa-|fa-|fab fa-|far fa-/g, '').trim();
};

const TagCycling = ({ tags, colors }: { tags: any[], colors: any }) => {
  const [index, setIndex] = React.useState(0);
  const fade = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (tags.length <= 1) return;
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -10, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        setIndex((prev) => (prev + 1) % tags.length);
        translateY.setValue(10);
        Animated.parallel([
          Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [tags.length, index]);

  const tag = tags[index];
  const isApplied = typeof tag !== 'string';
  const tagName = isApplied ? tag.name : tag;
  const tagIcon = isApplied ? cleanIconName(tag.icon) : 'tag';
  const tagColor = isApplied ? (tag.icon_color || colors.primary) : colors.primary;

  return (
    <Animated.View style={[
      styles.cornerBadge,
      {
        backgroundColor: colors.surface,
        borderColor: tagColor + '60',
        opacity: fade,
        transform: [{ translateY }]
      }
    ]}>
      <Icon name={tagIcon} size={14} color={tagColor} />
      <Text style={[styles.cornerBadgeText, { color: tagColor }]}>
        {tagName}
      </Text>
    </Animated.View>
  );
};

export type JobDetailRouteParams = { jobId: string };

type JobDetailRoute = RouteProp<{ JobDetail: JobDetailRouteParams }, 'JobDetail'>;

function SectionTitle({ title, colors }: { title: string; colors: ThemeColors }) {
  return (
    <Text style={[typography.sectionTitle, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
      {title}
    </Text>
  );
}

const formatDescription = (html: string) => {
  if (!html) return '';

  let text = html;
  // Replace common block tags with newlines
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<p>/gi, '');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<li>/gi, '• ');
  text = text.replace(/<\/?[^>]+(>|$)/g, ''); // Strip remaining tags

  // Decode common entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');

  return text.trim();
};
function InfoRow({ label, value, icon, colors }: { label: string; value: string; icon: string; colors: ThemeColors }) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: colors.surfaceHighlight }]}>
        <Icon name={icon} size={14} color={colors.primary} />
      </View>
      <View>
        <Text style={[typography.small, { color: colors.textPlaceholder }]}>{label}</Text>
        <Text style={[typography.body, { color: colors.textPrimary, marginTop: 1 }]}>{value}</Text>
      </View>
    </View>
  );
}

const JobDetailSkeleton: React.FC = () => {
  return (
    <View style={styles.skeletonContainer}>
      <SkeletonPulse style={styles.skeletonTitle} />
      <SkeletonPulse style={styles.skeletonSubTitle} />

      <View style={styles.skeletonMetaRow}>
        <SkeletonPulse style={styles.skeletonPill} />
        <SkeletonPulse style={styles.skeletonPill} />
      </View>

      <SkeletonPulse style={styles.skeletonSectionTitle} />
      <View style={styles.skeletonGrid}>
        {[1, 2, 3, 4].map(i => <SkeletonPulse key={i} style={styles.skeletonGridItem} />)}
      </View>

      <SkeletonPulse style={styles.skeletonSectionTitle} />
      <SkeletonPulse style={styles.skeletonLongText} />
      <SkeletonPulse style={styles.skeletonLongText} />
    </View>
  );
};

const isQuestionRequired = (q: any): boolean => {
  if (!q) return false;
  const val = q.is_required;
  return val === true || val === 1 || val === '1' || val === 'true' || val === 'yes';
};

const JobDetailScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<JobDetailRoute>();
  const jobId = route.params?.jobId ?? '';
  const dispatch = useDispatch<AppDispatch>();
  const { currentJob, loading, error } = useSelector((state: RootState) => state.jobs);
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  const { wishlistJobs } = useSelector((state: RootState) => state.profile);
  const { t } = useTranslation();

  useEffect(() => {
    if (jobId) {
      dispatch(fetchJobDetail(jobId));
    }
    if (isLoggedIn && wishlistJobs.length === 0) {
      dispatch(fetchWishlist());
    }
    return () => {
      dispatch(clearCurrentJob());
    };
  }, [dispatch, jobId, isLoggedIn]);

  useEffect(() => {
    if (currentJob) {
      const isWishlisted = !!(
        currentJob.is_wishlisted ||
        currentJob.wishlisted ||
        wishlistJobs.some((j: any) => j.id === currentJob.id)
      );
      setSaved(isWishlisted);
    }
  }, [currentJob, wishlistJobs]);

  const [saved, setSaved] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [justApplied, setJustApplied] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Toast State
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    visible: false,
    message: '',
    type: 'success',
  });
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);

  // Image Preview State
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);

  const handleOpenPreview = useCallback((images: string[], index: number) => {
    setPreviewImages(images);
    setPreviewIndex(index);
  }, []);
  const toastAnim = useRef(new Animated.Value(-100)).current;

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
    Animated.spring(toastAnim, {
      toValue: 20,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToast(prev => ({ ...prev, visible: false })));
    }, 3500);
  }, [toastAnim]);

  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId.toString()]: optionId,
    }));
  };

  const telHref = useMemo(() => {
    const phone = currentJob?.employer?.phone || currentJob?.employer?.company?.company_phone;
    if (!phone) {
      return '';
    }
    const raw = phone.replace(/\s/g, '');
    return raw.startsWith('+') ? `tel:${raw}` : `tel:+${raw.replace(/^\+/, '')}`;
  }, [currentJob]);

  const handleToggleWishlist = useCallback(async () => {

    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    if (!currentJob || isWishlisting) return;

    setIsWishlisting(true);
    try {

      await dispatch(toggleWishlist({ jobId: currentJob.id, isWishlisted: saved })).unwrap();
      setSaved(!saved);
    } catch (err: any) {

      Alert.alert('Error', err || 'Failed to update wishlist');
    } finally {
      setIsWishlisting(false);
    }
  }, [currentJob, saved, isWishlisting, dispatch, isLoggedIn, navigation]);

  const callEmployer = useCallback(() => {
    if (!telHref) {
      return;
    }
    Linking.openURL(telHref).catch(() => {
      Alert.alert('Could not start call', 'Try again or dial the number manually.');
    });
  }, [telHref]);

  const applyNow = useCallback(async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    if (!currentJob) return;

    // Validate required questions
    const missingRequired = currentJob.questions?.filter(
      (q: any) => isQuestionRequired(q) && (answers[q.id.toString()] === undefined || answers[q.id.toString()] === null)
    );

    if (missingRequired && missingRequired.length > 0) {
      setShowValidationModal(true);
      return;
    }

    setIsApplying(true);
    try {
      const resultAction = await dispatch(applyJob({ jobId: currentJob.id, answers })).unwrap();
      // Use API message or fallback
      const msg = resultAction.message || 'Application submitted successfully!';
      showToast(msg, msg.includes('already') ? 'info' : 'success');

      if (!msg.toLowerCase().includes('already')) {
        setJustApplied(true);
      }

      // Refresh job detail to update application status
      dispatch(fetchJobDetail(currentJob.id));
    } catch (err: any) {
      showToast(err || 'Something went wrong while applying.', 'error');
    } finally {
      setIsApplying(false);
    }
  }, [currentJob, answers, dispatch, showToast, isLoggedIn, navigation]);

  const companyName = currentJob?.employer?.company?.company_name || currentJob?.employer?.name || 'Unknown Company';
  const locationLabel = currentJob?.location?.label || 'Remote';
  const salaryLabel = currentJob?.salary_min && currentJob?.salary_max
    ? `₹${currentJob.salary_min.toLocaleString()} - ${currentJob.salary_max.toLocaleString()}`
    : 'Negotiable';
  const postedDate = currentJob?.created_at ? new Date(currentJob.created_at).toLocaleDateString() : 'Recently';
  const jobTypeLabel = formatJobType(currentJob?.job_type_label || currentJob?.job_type || 'Full Time');

  const handleShare = useCallback(async () => {
    if (!currentJob) return;
    try {
      const jobLink = `https://jobindia.app/job/${currentJob.id}`;
      // Indeed-style clean format: Title - Location - Site
      const shareMessage = `${currentJob.title} - ${locationLabel} - JobIndia.app\n${companyName}\n\nApply here: ${jobLink}`;

      await Share.share({
        message: shareMessage,
        url: jobLink, // For iOS to show the link preview correctly
        title: `${currentJob.title} at ${companyName}`,
      });
    } catch (error: any) {
      Alert.alert('Error', 'Could not open share menu');
    }
  }, [currentJob, companyName, locationLabel]);

  const handleShareApp = useCallback(async () => {
    try {
      await Share.share({
        message: 'Hey! Join JobIndia and find your dream job quickly. Download now: https://jobindia.app/refer',
        title: 'Refer JobIndia',
      });
    } catch (error: any) {
      Alert.alert('Error', 'Could not open share menu');
    }
  }, []);

  const openActions = () => {
    setShowActionModal(true);
  };

  const actualTop = insets.top;

  if (loading || (!currentJob && !error)) {
    return (
      <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: actualTop }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        <View style={[styles.topBar, { borderBottomWidth: 0 }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconBtn}>
            <Icon name="chevron-left" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
        <JobDetailSkeleton />
      </View>
    );
  }

  if (!currentJob && error) {
    return (
      <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: actualTop }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        <View style={[styles.topBar, { borderBottomWidth: 0 }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconBtn}>
            <Icon name="chevron-left" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            {error || 'This job could not be found.'}
          </Text>
          <PrimaryButton title="Go back" onPress={() => navigation.goBack()} colors={colors} style={styles.emptyBtn} />
        </View>
      </View>
    );
  }



  return (
    <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: actualTop }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      {/* Animated Toast */}
      {toast.visible && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              transform: [{ translateY: toastAnim }],
              backgroundColor: toast.type === 'success' ? colors.success : (toast.type === 'error' ? colors.error : colors.primary)
            }
          ]}>
          <Icon
            name={toast.type === 'success' ? 'check-circle' : (toast.type === 'error' ? 'exclamation-circle' : 'info-circle')}
            size={18}
            color="#FFFFFF"
          />
          <Text style={[typography.labelMedium, { color: '#FFFFFF', marginLeft: spacing.sm, flexShrink: 1 }]}>
            {toast.message}
          </Text>
        </Animated.View>
      )}

      <View style={[styles.topBar, { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconBtn} accessibilityLabel={t('jobDetail.goBack', 'Go back')}>
          <Icon name="chevron-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.labelMedium, { color: colors.textPrimary, flex: 1, textAlign: 'left' }]} numberOfLines={1}>
          {t('jobDetail.title', 'Job details')}
        </Text>

        <Pressable
          onPress={handleToggleWishlist}
          disabled={isWishlisting}
          hitSlop={12}
          style={[styles.iconBtn, { backgroundColor: colors.surfaceHighlight }]}
          accessibilityLabel={saved ? 'Remove from saved' : 'Save job'}>
          {isWishlisting ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Icon name={saved ? 'heart' : 'heart-o'} size={20} color={saved ? colors.error : colors.textSecondary} />
          )}
        </Pressable>
        <Pressable
          onPress={openActions}
          hitSlop={12}
          style={[styles.iconBtn, { marginRight: spacing.xs }]}
          accessibilityLabel="More actions">
          <Icon name="ellipsis-v" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.lg + Math.max(insets.bottom, spacing.md) },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Already Applied Status Banner */}
        {currentJob.is_applied && (
          <Pressable
            onPress={() => navigation.navigate('Applications', { screen: 'ApplicationsList' })}
            style={{
              backgroundColor: colors.successBackground,
              borderWidth: 1,
              borderColor: colors.success + '40',
              padding: spacing.md,
              borderRadius: radius.md,
              marginBottom: spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            <Icon name="check-circle" size={24} color={colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={[typography.labelMedium, { color: colors.success, fontWeight: 'bold' }]}>
                {justApplied ? t('jobDetail.appliedSuccess', 'You have successfully applied!') : t('jobDetail.alreadyApplied', 'You have already applied!')}
              </Text>
              <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]}>
                {t('jobDetail.checkStatus', 'Tap here to check your application status.')}
              </Text>
            </View>
            <Icon name="chevron-right" size={14} color={colors.success} />
          </Pressable>
        )}

        {/* Header Section with Logo, Title, and Tags */}
        <View style={styles.headerHero}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
            <View style={[styles.heroLogoContainer, { backgroundColor: colors.surfaceHighlight }]}>
              {currentJob.employer?.company?.company_logo_url ? (
                <Pressable
                  onPress={() => handleOpenPreview([currentJob.employer.company.company_logo_url], 0)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                >
                  <Image
                    source={{ uri: currentJob.employer.company.company_logo_url }}
                    style={styles.heroLogo}
                  />
                </Pressable>
              ) : (
                <Icon name="briefcase" size={24} color={colors.primary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { color: colors.textPrimary }]} numberOfLines={2}>
                {currentJob.title}
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                {companyName}
              </Text>
            </View>
          </View>

          {(currentJob.applied_tags?.length > 0 || currentJob.tags?.length > 0) && (
            <TagCycling
              tags={currentJob.applied_tags?.length > 0 ? currentJob.applied_tags : currentJob.tags}
              colors={colors}
            />
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.metaPill, { backgroundColor: colors.successBackground }]}>
            <Icon name="money" size={14} color={colors.success} />
            <Text style={[typography.labelMedium, { color: colors.success }]}>{salaryLabel}</Text>
          </View>
          <View style={[styles.metaPill, { backgroundColor: colors.surfaceHighlight }]}>
            <Icon name="map-marker" size={14} color={colors.primary} />
            <Text style={[typography.small, { color: colors.textPrimary, flexShrink: 1 }]} numberOfLines={2}>
              {locationLabel}
            </Text>
          </View>
        </View>
        <View style={[styles.typePill, { backgroundColor: colors.badgeBackground, alignSelf: 'flex-start' }]}>
          <Text style={[typography.small, { color: colors.badgeText, fontFamily: typography.labelMedium.fontFamily }]}>
            {jobTypeLabel} · {t('jobDetail.posted', 'Posted')} {postedDate}
          </Text>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SectionTitle title={t('jobDetail.keyHighlights', 'Key Highlights')} colors={colors} />
          <View style={styles.infoGrid}>
            <InfoRow label={t('jobDetail.gender', 'Gender')} value={currentJob.gender || t('jobDetail.any', 'Any')} icon="venus-mars" colors={colors} />
            <InfoRow label={t('jobDetail.openings', 'Openings')} value={`${currentJob.openings || 0} ${t('jobDetail.positions', 'Positions')}`} icon="users" colors={colors} />
            <InfoRow label={t('jobDetail.category', 'Category')} value={currentJob.category?.name || t('jobDetail.general', 'General')} icon="th-large" colors={colors} />
            <InfoRow label={t('jobDetail.experience', 'Experience')} value={currentJob.experience_label || '-'} icon="briefcase" colors={colors} />
            {currentJob.working_hours && (
              <InfoRow label={t('jobDetail.workingHours', 'Working Hours')} value={currentJob.working_hours} icon="clock-o" colors={colors} />
            )}
            {currentJob.application_deadline && (
              <InfoRow label={t('jobDetail.deadline', 'Deadline')} value={new Date(currentJob.application_deadline).toLocaleDateString()} icon="calendar-times-o" colors={colors} />
            )}
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: spacing.md }]}>
          <SectionTitle title={t('jobDetail.description', 'Description')} colors={colors} />
          <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 22 }]}>
            {formatDescription(currentJob.description) || t('jobDetail.noDescription', 'No description provided.')}
          </Text>
        </View>

        {currentJob.employer?.company && (
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: spacing.md }]}>
            <SectionTitle title={t('jobDetail.aboutCompany', 'About Company')} colors={colors} />

            <View style={styles.companyHeader}>
              <View>
                {currentJob.employer.company.company_logo_url ? (
                  <Pressable
                    onPress={() => handleOpenPreview([currentJob.employer.company.company_logo_url], 0)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  >
                    <Image
                      source={{ uri: currentJob.employer.company.company_logo_url }}
                      style={styles.companyLogo}
                    />
                  </Pressable>
                ) : (
                  <View style={[styles.companyLogo, { backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center' }]}>
                    <Icon name="building" size={24} color={colors.primary} />
                  </View>
                )}
                {currentJob.employer.company.verification_status === 'approved' && (
                  <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
                    <Icon name="check" size={8} color="#fff" />
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>
                    {currentJob.employer.company.company_name}
                  </Text>
                </View>
                <Text style={[typography.small, { color: colors.textSecondary }]}>
                  {currentJob.employer.company.industry || 'General Industry'} · {currentJob.employer.company.company_size || 'Mid Scale'}
                </Text>
              </View>
            </View>

            {/* Gallery Media */}
            {currentJob.employer.company.gallery_media?.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.galleryScroll}
                contentContainerStyle={{ gap: 10, paddingRight: 20 }}
              >
                {currentJob.employer.company.gallery_media.map((media: any, idx: number) => (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      const urls = currentJob.employer.company.gallery_media.map((m: any) => m.url);
                      handleOpenPreview(urls, idx);
                    }}
                    style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                  >
                    <Image
                      source={{ uri: media.url }}
                      style={styles.galleryImage}
                    />
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {currentJob.employer.company.description && (
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md, lineHeight: 20 }]}>
                {currentJob.employer.company.description}
              </Text>
            )}

            {/* Address Section */}
            {(currentJob.employer.company.address || currentJob.employer.company.city) && (
              <View style={styles.addressBox}>
                <View style={[styles.addressIcon, { backgroundColor: colors.surfaceHighlight }]}>
                  <Icon name="map-marker" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.small, { color: colors.textPlaceholder }]}>{t('jobDetail.address', 'Address')}</Text>
                  <Text style={[typography.body, { color: colors.textPrimary, fontSize: 13 }]} numberOfLines={2}>
                    {[
                      currentJob.employer.company.address,
                      currentJob.employer.company.city,
                      currentJob.employer.company.state,
                      currentJob.employer.company.pincode
                    ].filter(Boolean).join(', ')}
                  </Text>
                </View>
              </View>
            )}

            {/* Key Company Stats */}
            <View style={styles.companyStatsGrid}>
              <View style={styles.companyStatItem}>
                <Text style={[typography.small, { color: colors.textPlaceholder }]}>{t('jobDetail.employees', 'Employees')}</Text>
                <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>
                  {currentJob.employer.company.employee_count || '50+'}
                </Text>
              </View>
              <View style={styles.companyStatItem}>
                <Text style={[typography.small, { color: colors.textPlaceholder }]}>{t('jobDetail.type', 'Type')}</Text>
                <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>
                  {currentJob.employer.company.register_as_label || 'Company'}
                </Text>
              </View>
              <View style={styles.companyStatItem}>
                <Text style={[typography.small, { color: colors.textPlaceholder }]}>{t('jobDetail.size', 'Size')}</Text>
                <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>
                  {currentJob.employer.company.company_size || 'Mid Scale'}
                </Text>
              </View>
            </View>

            {/* Hiring Manager Info */}
            <View style={[styles.employerCard, { backgroundColor: colors.surfaceHighlight }]}>
              <View style={styles.employerAvatar}>
                <Icon name="user-circle" size={32} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.small, { color: colors.textPlaceholder }]}>{t('jobDetail.hiringManager', 'Hiring Manager')}</Text>
                <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>{currentJob.employer.name}</Text>
              </View>
            </View>

            <View style={styles.companyMeta}>
              {currentJob.employer.company.established_year && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="calendar" size={12} color={colors.textPlaceholder} />
                  <Text style={[typography.small, { color: colors.textPlaceholder }]}>
                    Est: {currentJob.employer.company.established_year}
                  </Text>
                </View>
              )}
              {currentJob.employer.company.website && (
                <Pressable
                  onPress={() => Linking.openURL(currentJob.employer.company.website)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <Icon name="external-link" size={12} color={colors.primary} />
                  <Text style={[typography.small, { color: colors.primary }]}>Visit Website</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Share & Refer Poster Card */}
        <View style={[styles.referCard, { backgroundColor: colors.primary }]}>
          {/* Decorative Background Art */}
          <View style={[styles.referBlob1, { backgroundColor: '#FFFFFF', opacity: 0.12 }]} />
          <View style={[styles.referBlob2, { backgroundColor: '#FFFFFF', opacity: 0.08 }]} />

          <View style={styles.referHeader}>
            <View style={[styles.referIconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Icon name="gift" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.referTextContainer}>
              <View style={[styles.referBadge, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                <Text style={styles.referBadgeText}>{t('jobDetail.referSpreadWord', 'REFER & SPREAD THE WORD')}</Text>
              </View>
              <Text style={[typography.labelMedium, { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginTop: 6 }]}>
                {t('jobDetail.knowSomeone', 'Know someone who fits this?')}
              </Text>
              <Text style={[typography.small, { color: 'rgba(255, 255, 255, 0.85)', marginTop: 4, lineHeight: 18 }]}>
                {t('jobDetail.helpFriends', 'Help friends get hired by sharing this job opening or refer them to JobIndia app.')}
              </Text>
            </View>
          </View>
          <View style={styles.referActions}>
            <TouchableOpacity
              onPress={handleShare}
              style={[styles.referBtnSecondary, { borderColor: 'rgba(255, 255, 255, 0.4)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
              activeOpacity={0.8}
            >
              <Icon name="share-alt" size={14} color="#FFFFFF" />
              <Text style={[typography.small, { color: '#FFFFFF', fontWeight: 'bold' }]}>
                {t('jobDetail.shareJob', 'Share Job')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShareApp}
              style={[styles.referBtnPrimary, { backgroundColor: '#FFFFFF' }]}
              activeOpacity={0.8}
            >
              <Icon name="paper-plane" size={14} color={colors.primary} />
              <Text style={[typography.small, { color: colors.primary, fontWeight: 'bold' }]}>
                {t('jobDetail.shareApp', 'Share App')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {currentJob.questions && currentJob.questions.length > 0 && (
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: spacing.md }]}>
            <SectionTitle title={t('jobDetail.screeningQuestions', 'Screening Questions')} colors={colors} />
            {currentJob.questions.map((q: any) => (
              <View key={q.id} style={styles.questionBlock}>
                <Text style={[typography.labelMedium, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
                  {q.question} {isQuestionRequired(q) ? <Text style={{ color: colors.error }}>*</Text> : ''}
                </Text>
                <View style={styles.optionsWrap}>
                  {q.options?.map((opt: any) => {
                    const isSelected = answers[q.id.toString()] === opt.id;
                    return (
                      <Pressable
                        key={opt.id}
                        onPress={() => handleSelectOption(q.id, opt.id)}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: isSelected ? colors.surfaceHighlight : colors.surface,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}>
                        <Text
                          style={[
                            typography.small,
                            {
                              color: isSelected ? colors.primary : colors.textSecondary,
                              fontFamily: isSelected ? typography.labelMedium.fontFamily : undefined,
                            },
                          ]}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: 60,
          },
        ]}>
        <View style={styles.footerContent}>
          <PrimaryButton
            title={isApplying ? t('jobDetail.processing', "Processing...") : (currentJob.is_applied ? t('jobDetail.alreadyApplied', "Already Applied") : t('jobDetail.applyNow', "Apply now"))}
            onPress={applyNow}
            colors={colors}
            disabled={isApplying || currentJob.is_applied}
          />
          {currentJob.allow_calls !== false && (
            <View style={styles.footerRow}>
              <PrimaryButton
                title={t('jobDetail.callEmployer', "Call employer")}
                onPress={callEmployer}
                colors={colors}
                variant="secondary"
                style={styles.callBtn}
              />
            </View>
          )}
        </View>
      </View>

      {/* Validation Modal */}
      <Modal
        visible={showValidationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowValidationModal(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowValidationModal(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIconBox, { backgroundColor: colors.error + '15' }]}>
              <Icon name="exclamation-triangle" size={24} color={colors.error} />
            </View>
            <Text style={[typography.h4, { color: colors.textPrimary, marginTop: spacing.md }]}>
              Required Answers
            </Text>
            <Text style={[typography.labelMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
              Please answer all required screening questions before applying for this job.
            </Text>
            <Pressable
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowValidationModal(false)}>
              <Text style={[typography.labelMedium, { color: '#FFFFFF', fontWeight: '700' }]}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Auth Prompt Modal */}
      <Modal
        visible={showAuthModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAuthModal(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowAuthModal(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIconBox, { backgroundColor: colors.primary + '15' }]}>
              <Icon name="user-circle-o" size={28} color={colors.primary} />
            </View>
            <Text style={[typography.h4, { color: colors.textPrimary, marginTop: spacing.md, textAlign: 'center' }]}>
              Registration Required
            </Text>
            <Text style={[typography.labelMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 }]}>
              Please register or log in to apply for jobs and unlock all features.
            </Text>

            <View style={{ width: '100%', gap: spacing.sm, marginTop: spacing.xl }}>
              <PrimaryButton
                title="Register Now"
                onPress={() => {
                  setShowAuthModal(false);
                  navigation.navigate('SignIn');
                }}
                colors={colors}
              />
              <Pressable
                onPress={() => {
                  setShowAuthModal(false);
                  navigation.navigate('EmailLogin');
                }}
                style={{ alignItems: 'center', paddingVertical: 12 }}
              >
                <Text style={[typography.labelMedium, { color: colors.primary }]}>Already have an account? Log In</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <JobActionModal
        visible={showActionModal}
        onClose={() => setShowActionModal(false)}
        job={currentJob}
        colors={colors}
        onShare={handleShare}
        type="dropdown"
        anchorPosition={{ top: actualTop + 35, right: spacing.lg }}
      />

      {/* Image Preview Modal */}
      <Modal
        visible={previewIndex >= 0}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewIndex(-1)}
      >
        <View style={styles.previewOverlay}>
          <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.95)" />
          <Pressable style={styles.previewBackdrop} onPress={() => setPreviewIndex(-1)} />
          
          <TouchableOpacity 
            style={[styles.previewCloseBtn, { top: actualTop + 10 }]} 
            onPress={() => setPreviewIndex(-1)}
            activeOpacity={0.7}
          >
            <Icon name="times" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {previewImages.length > 1 && (
            <View style={[styles.previewIndicator, { top: actualTop + 12 }]}>
              <Text style={styles.previewIndicatorText}>
                {previewIndex + 1} of {previewImages.length}
              </Text>
            </View>
          )}

          <View style={styles.previewContainer}>
            {previewImages.length > 1 ? (
              <TouchableOpacity
                style={styles.previewArrowBtn}
                onPress={() => setPreviewIndex((prev) => (prev > 0 ? prev - 1 : previewImages.length - 1))}
                activeOpacity={0.7}
              >
                <Icon name="chevron-left" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 44 }} />
            )}

            {previewIndex >= 0 && previewIndex < previewImages.length && (
              <Image
                source={{ uri: previewImages[previewIndex] }}
                style={styles.previewImageLarge}
                resizeMode="contain"
              />
            )}

            {previewImages.length > 1 ? (
              <TouchableOpacity
                style={styles.previewArrowBtn}
                onPress={() => setPreviewIndex((prev) => (prev < previewImages.length - 1 ? prev + 1 : 0))}
                activeOpacity={0.7}
              >
                <Icon name="chevron-right" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 44 }} />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 56,
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center',
  },
  headerHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: 8,
  },
  heroLogoContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  heroLogo: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
  },
  cornerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
  },
  cornerBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.button,
    maxWidth: '100%',
  },
  typePill: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  sectionCard: {
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    marginTop: spacing.lg,
  },
  footer: {
    ...components.jobCard,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.08,
    elevation: 8,
    paddingBottom: 100,
  },
  footerContent: {
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center',
    gap: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  callBtn: {
    flex: 1,
  },
  saveBtn: {
    width: 52,
    height: 48,
    borderRadius: radius.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyBtn: {
    maxWidth: 200,
  },
  questionBlock: {
    marginBottom: spacing.md,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  optionChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.button,
    borderWidth: 1,
  },
  keyHighlights: {
    marginTop: spacing.lg,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '45%',
    marginBottom: spacing.xs,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companySection: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: radius.card,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    resizeMode: 'contain',
  },
  companyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  galleryScroll: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  galleryImage: {
    width: 140,
    height: 90,
    borderRadius: radius.md,
    backgroundColor: '#eee',
  },
  employerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  employerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  addressIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyStatsGrid: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
    gap: spacing.xl,
    justifyContent: 'space-between',
  },
  companyStatItem: {
    flex: 1,
  },
  // Skeleton Styles
  skeletonContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  skeletonTitle: {
    height: 32,
    width: '80%',
    borderRadius: radius.sm,
  },
  skeletonSubTitle: {
    height: 20,
    width: '40%',
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  skeletonMetaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  skeletonPill: {
    height: 36,
    width: 120,
    borderRadius: radius.button,
  },
  skeletonSectionTitle: {
    height: 24,
    width: 150,
    borderRadius: radius.sm,
    marginTop: spacing.lg,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  skeletonGridItem: {
    height: 60,
    width: '45%',
    borderRadius: radius.md,
  },
  skeletonLongText: {
    height: 16,
    width: '100%',
    borderRadius: radius.xs,
    marginTop: spacing.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  // Toast Styles
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    elevation: 20,
  },
  modalIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtn: {
    marginTop: spacing.xl,
    width: '100%',
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Image Preview Modal Styles
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 12, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  previewCloseBtn: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  previewIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 9,
  },
  previewIndicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '80%',
    paddingHorizontal: 10,
  },
  previewImageLarge: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  previewArrowBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  referCard: {
    padding: spacing.lg,
    borderRadius: radius.card,
    marginTop: spacing.md,
    gap: spacing.md,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  referBlob1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: -40,
    right: -30,
  },
  referBlob2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    bottom: -30,
    left: -30,
  },
  referHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  referIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  referBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  referTextContainer: {
    flex: 1,
  },
  referActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  referBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.button,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  referBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.button,
    borderWidth: 1,
    gap: 8,
  },
});

export default JobDetailScreen;
