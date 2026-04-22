import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  type NavigationProp,
  type ParamListBase,
  type RouteProp,
} from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { PrimaryButton } from '../../components/auth';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { components } from '../../theme/components';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchJobDetail, clearCurrentJob, applyJob, toggleWishlist } from '../../redux/slice/jobSlice';

export type JobDetailRouteParams = { jobId: string };

type JobDetailRoute = RouteProp<{ JobDetail: JobDetailRouteParams }, 'JobDetail'>;

function SectionTitle({ title, colors }: { title: string; colors: ThemeColors }) {
  return (
    <Text style={[typography.sectionTitle, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
      {title}
    </Text>
  );
}

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

const JobDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<JobDetailRoute>();
  const jobId = route.params?.jobId ?? '';
  const dispatch = useDispatch<AppDispatch>();
  const { currentJob, loading, error } = useSelector((state: RootState) => state.jobs);

  useEffect(() => {
    if (jobId) {
      dispatch(fetchJobDetail(jobId));
    }
    return () => {
      dispatch(clearCurrentJob());
    };
  }, [dispatch, jobId]);

  useEffect(() => {
    if (currentJob) {
      setSaved(!!currentJob.is_wishlisted);
    }
  }, [currentJob]);

  const [saved, setSaved] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});

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
  }, [currentJob, saved, isWishlisting, dispatch]);

  const callEmployer = useCallback(() => {
    if (!telHref) {
      return;
    }
    Linking.openURL(telHref).catch(() => {
      Alert.alert('Could not start call', 'Try again or dial the number manually.');
    });
  }, [telHref]);

  const applyNow = useCallback(async () => {
    if (!currentJob) return;

    // Validate required questions
    const missingRequired = currentJob.questions?.filter(
      (q: any) => q.is_required && !answers[q.id.toString()]
    );

    if (missingRequired && missingRequired.length > 0) {
      Alert.alert('Required Answers', 'Please answer all required screening questions before applying.');
      return;
    }

    try {
      const resultAction = await dispatch(applyJob({ jobId: currentJob.id, answers })).unwrap();
      Alert.alert('Success', resultAction.message || 'Application submitted successfully!');
      // Optionally refresh job detail to update application status if needed
      dispatch(fetchJobDetail(currentJob.id));
    } catch (err: any) {
      Alert.alert('Application Failed', err || 'Something went wrong while applying.');
    }
  }, [currentJob, answers, dispatch]);

  if (loading && !currentJob) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconBtn}>
            <Icon name="chevron-left" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentJob) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
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
      </SafeAreaView>
    );
  }

  const companyName = currentJob.employer?.company?.company_name || currentJob.employer?.name || 'Unknown Company';
  const locationLabel = currentJob.location?.label || 'Remote';
  const salaryLabel = currentJob.salary_min && currentJob.salary_max 
    ? `₹${currentJob.salary_min.toLocaleString()} - ${currentJob.salary_max.toLocaleString()}` 
    : 'Negotiable';
  const postedDate = currentJob.created_at ? new Date(currentJob.created_at).toLocaleDateString() : 'Recently';
  const jobTypeLabel = currentJob.job_type_label || currentJob.job_type || 'Full Time';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconBtn} accessibilityLabel="Go back">
          <Icon name="chevron-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.labelMedium, { color: colors.textPrimary, flex: 1, textAlign: 'left' }]} numberOfLines={1}>
          Job details
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
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.lg + Math.max(insets.bottom, spacing.md) },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={[typography.appTitle, { color: colors.textPrimary }]}>{currentJob.title}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>{companyName}</Text>

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
            {jobTypeLabel} · Posted {postedDate}
          </Text>
        </View>

        <View style={styles.keyHighlights}>
          <SectionTitle title="Key Highlights" colors={colors} />
          <View style={styles.infoGrid}>
            <InfoRow label="Gender" value={currentJob.gender || 'Any'} icon="venus-mars" colors={colors} />
            <InfoRow label="Openings" value={`${currentJob.openings || 0} Positions`} icon="users" colors={colors} />
            <InfoRow label="Category" value={currentJob.category?.name || 'General'} icon="th-large" colors={colors} />
            <InfoRow label="Experience" value={currentJob.experience_label || 'Fresher/Experience'} icon="briefcase" colors={colors} />
            {currentJob.working_hours && (
              <InfoRow label="Working Hours" value={currentJob.working_hours} icon="clock-o" colors={colors} />
            )}
            {currentJob.application_deadline && (
              <InfoRow label="Deadline" value={new Date(currentJob.application_deadline).toLocaleDateString()} icon="calendar-times-o" colors={colors} />
            )}
          </View>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <SectionTitle title="Description" colors={colors} />
          <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 22 }]}>
            {currentJob.description || 'No description provided.'}
          </Text>
        </View>

        {currentJob.employer?.company && (
          <View style={styles.companySection}>
            <SectionTitle title="About Company" colors={colors} />
            <View style={styles.companyHeader}>
              {currentJob.employer.company.company_logo_url ? (
                <Image 
                  source={{ uri: currentJob.employer.company.company_logo_url }} 
                  style={styles.companyLogo} 
                />
              ) : (
                <View style={[styles.companyLogo, { backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center' }]}>
                  <Icon name="building" size={24} color={colors.primary} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>
                  {currentJob.employer.company.company_name}
                </Text>
                <Text style={[typography.small, { color: colors.textSecondary }]}>
                  {currentJob.employer.company.industry || 'General Industry'} · {currentJob.employer.company.company_size || 'Unknown Size'}
                </Text>
              </View>
            </View>
            {currentJob.employer.company.description && (
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 }]}>
                {currentJob.employer.company.description}
              </Text>
            )}
            <View style={styles.companyMeta}>
              {currentJob.employer.company.established_year && (
                <Text style={[typography.small, { color: colors.textPlaceholder }]}>
                  Established: {currentJob.employer.company.established_year}
                </Text>
              )}
              {currentJob.employer.company.website && (
                <Pressable onPress={() => Linking.openURL(currentJob.employer.company.website)}>
                  <Text style={[typography.small, { color: colors.primary }]}>Visit Website</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {currentJob.questions && currentJob.questions.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <SectionTitle title="Screening Questions" colors={colors} />
            {currentJob.questions.map((q: any) => (
              <View key={q.id} style={styles.questionBlock}>
                <Text style={[typography.labelMedium, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
                  {q.question} {q.is_required ? <Text style={{ color: colors.error }}>*</Text> : ''}
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
            paddingBottom: spacing.md,
          },
        ]}>
        <PrimaryButton 
          title={loading ? "Processing..." : (currentJob.is_applied ? "Already Applied" : "Apply now")} 
          onPress={applyNow} 
          colors={colors} 
          disabled={loading || currentJob.is_applied}
        />
        <View style={styles.footerRow}>
          <PrimaryButton
            title="Call employer"
            onPress={callEmployer}
            colors={colors}
            variant="secondary"
            style={styles.callBtn}
          />
       
        </View>
      </View>
    </SafeAreaView>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    maxWidth: 520,
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
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
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
  footer: {
    ...components.jobCard,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    shadowOpacity: 0.08,
    elevation: 8,
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
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});

export default JobDetailScreen;
