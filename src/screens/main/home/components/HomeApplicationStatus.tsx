import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { ThemeColors } from '../../../../theme/colors';
import { radius } from '../../../../theme/radius';
import { spacing } from '../../../../theme/spacing';
import { moderateScale } from '../../../../theme/typography';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '../../../../api/axiosInstance';

export const HomeApplicationStatus = ({
  colors,
  job,
  onHide,
  onPress,
}: {
  colors: ThemeColors;
  job?: any;
  onHide: () => void;
  onPress?: () => void;
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true, isInteraction: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true, isInteraction: false }),
      ])
    ).start();
  }, [pulseAnim]);

  if (!job) return null;

  const companyObj = job.employer?.company || job.company || {};
  const employerObj = job.employer || {};
  const application = job.application || {};
  const status = application.status || 'shortlisted';
  const jobTitle = job.title || 'Application';
  const companyName = companyObj.company_name || 'Company';
  const salaryLabel = job.salary || (job.salary_min && job.salary_max ? `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}` : 'Salary Negotiable');
  const locationLabel = job.location?.label || (typeof job.location === 'string' ? job.location : job.location?.city) || 'India';
  const appliedDate = application.applied_at
    ? new Date(application.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '';
  const managerName = employerObj.name || 'Manager';

  const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const rawLogo = companyObj.company_logo_url || employerObj.company_logo;
  const logoUri = rawLogo
    ? rawLogo.startsWith('http')
      ? rawLogo
      : `${cleanBaseUrl}${rawLogo.startsWith('/') ? '' : '/'}${rawLogo}`
    : null;

  const statusTitle = status === 'selected' ? 'Congratulations! Selected 🎉' : 'You are Shortlisted! 🎉';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('home.applicationStatus', 'Application Status')}
        </Text>
        <TouchableOpacity onPress={onHide} style={styles.closeBtn}>
          <Icon name="times" size={moderateScale(15)} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Pressable 
        onPress={() => setExpanded(!expanded)}
        style={[styles.wiCard, { backgroundColor: colors.surface, borderColor: '#10b98150' }]}
      >
        {/* Compact Status Row (Always visible) */}
        <View style={styles.compactRow}>
          <View style={[styles.wiJourneyCircle, { borderColor: '#10b981', backgroundColor: colors.surface }]}>
            <View style={{ width: moderateScale(8), height: moderateScale(8), borderRadius: moderateScale(4), backgroundColor: '#10b981' }} />
          </View>
          
          <View style={styles.statusTextWrapper}>
            <Text style={[styles.wiJourneyText, { color: colors.textPrimary, fontWeight: '700' }]}>
              {statusTitle}{' '}
            </Text>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Text style={{ fontSize: moderateScale(15) }}>🎉</Text>
            </Animated.View>
          </View>
          
          <TouchableOpacity 
            onPress={() => {
              if (expanded) {
                onHide();
              } else {
                setExpanded(true);
              }
            }} 
            style={styles.toggleBtn}
          >
            <Icon name={expanded ? "times" : "chevron-down"} size={moderateScale(13)} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Expanded Details */}
        {expanded && (
          <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
            <Pressable onPress={onPress} style={styles.wiCardHeader}>
              <View style={[styles.wiLogoBox, { backgroundColor: colors.surfaceHighlight }]}>
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                ) : (
                  <Icon name="building" size={moderateScale(22)} color={colors.primary} />
                )}
              </View>
              <View style={styles.wiHeaderInfo}>
                <Text style={[styles.wiJobTitle, { color: colors.textPrimary }]}>{jobTitle}</Text>
                <Text style={[styles.wiCompanyName, { color: colors.textSecondary }]}>{companyName}</Text>
              </View>
            </Pressable>

            <View style={styles.wiMetaSection}>
              <View style={styles.wiMetaItem}>
                <Icon name="money" size={moderateScale(13)} color={colors.textSecondary} />
                <Text style={[styles.wiMetaText, { color: colors.textPrimary }]}>{salaryLabel}</Text>
              </View>
              <View style={styles.wiMetaItem}>
                <Icon name="map-marker" size={moderateScale(13)} color={colors.textSecondary} />
                <Text style={[styles.wiMetaText, { color: colors.textPrimary }]}>{locationLabel}</Text>
              </View>
            </View>

            <View style={[styles.wiJourneyBox, { backgroundColor: colors.surfaceHighlight + '50' }]}>
              <View style={styles.wiJourneyRow}>
                <View style={styles.wiJourneyIconWrap}>
                  <View style={[styles.wiJourneyDot, { backgroundColor: '#10b981' }]}>
                    <Icon name="check" size={moderateScale(8)} color="#fff" />
                  </View>
                  <View style={[styles.wiJourneyLine, { borderColor: colors.border }]} />
                </View>
                <View>
                  <Text style={[styles.wiJourneyText, { color: colors.textPrimary, fontWeight: '700' }]}>
                    Applied successfully
                  </Text>
                  {appliedDate ? <Text style={{ fontSize: moderateScale(10), color: colors.textSecondary }}>{appliedDate}</Text> : null}
                </View>
              </View>
              <View style={[styles.wiJourneyRow, { marginTop: 4 }]}>
                <View style={styles.wiJourneyIconWrap}>
                  <View style={[styles.wiJourneyCircle, { borderColor: '#10b981', backgroundColor: colors.surface }]}>
                    <View style={{ width: moderateScale(8), height: moderateScale(8), borderRadius: moderateScale(4), backgroundColor: '#10b981' }} />
                  </View>
                </View>
                <Text style={[styles.wiJourneyText, { color: colors.textPrimary, fontWeight: '700' }]}>
                  {statusTitle}
                </Text>
              </View>
            </View>

            <View style={styles.wiManagerRow}>
              <Icon name="user-circle" size={moderateScale(15)} color={colors.textSecondary} />
              <Text style={[styles.wiManagerText, { color: colors.textSecondary }]}>{managerName} (Manager)</Text>
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  closeBtn: {
    padding: moderateScale(4),
  },
  wiCard: {
    padding: moderateScale(12),
    borderRadius: radius.lg,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  statusTextWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleBtn: {
    padding: moderateScale(4),
    paddingLeft: moderateScale(10),
  },
  expandedContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  wiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  wiLogoBox: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wiHeaderInfo: {
    flex: 1,
  },
  wiJobTitle: {
    fontSize: moderateScale(14),
    fontWeight: '800',
  },
  wiCompanyName: {
    fontSize: moderateScale(11),
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
    fontSize: moderateScale(12),
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
    height: moderateScale(14),
    borderStyle: 'dashed',
    borderWidth: 1,
    marginVertical: 2,
  },
  wiJourneyText: {
    fontSize: moderateScale(13),
  },
  wiManagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
  },
  wiManagerText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
});
