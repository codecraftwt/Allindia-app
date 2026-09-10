import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import type { ThemeColors } from '../../../../theme/colors';
import { spacing } from '../../../../theme/spacing';
import { radius } from '../../../../theme/radius';
import { moderateScale } from '../../../../theme/typography';
import { useTranslation } from 'react-i18next';
import api, { BASE_URL } from '../../../../api/axiosInstance';

export const HomeHRInviteStatus = ({ colors, invite, onHide }: { colors: ThemeColors; invite: any; onHide: () => void }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [expanded, setExpanded] = useState(false);
  const userToken = useSelector((state: any) => state.auth.token);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true, isInteraction: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true, isInteraction: false }),
      ])
    ).start();
  }, [pulseAnim]);

  const companyObj = invite.company || invite.employer || {};
  const employerObj = invite.employer || {};
  const invitedAt = invite.invited_at
    ? new Date(invite.invited_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
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
  
  const markAsRead = async () => {
    if (invite?.type && invite?.id) {
      try {
        await api.post(
          `api/candidate/profile/invitations/${invite.type}/${invite.id}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        );
      } catch (error) {
        console.error('Failed to mark invite as read:', error);
      }
    }
  };

  const openInviteDetail = () => {
    onHide(); // Hide from UI immediately
    markAsRead(); // Mark as read via API
    
    const hasJobDetails = invite.job_details && typeof invite.job_details === 'object' && Object.keys(invite.job_details).length > 0;
    
    if (hasJobDetails) {
      navigation.navigate('JobDetail', { 
        jobId: invite.job_details.slug || invite.job_details.id,
        initialJobData: invite.job_details,
        fromHrInvite: true
      });
    } else {
      navigation.navigate('Applications');
    }
  };

  const handleClose = () => {
    onHide(); // Hide from UI immediately
    markAsRead();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('home.hrInviteTitle', 'New HR Invite')}
        </Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Icon name="times" size={moderateScale(15)} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Pressable 
        onPress={() => setExpanded(!expanded)}
        style={[styles.wiCard, { backgroundColor: colors.surface, borderColor: colors.primary + '50' }]}
      >
        {/* Compact Status Row */}
        <View style={styles.compactRow}>
          <View style={[styles.wiJourneyCircle, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
            <View style={{ width: moderateScale(8), height: moderateScale(8), borderRadius: moderateScale(4), backgroundColor: colors.primary }} />
          </View>
          
          <View style={styles.statusTextWrapper}>
            <Text style={[styles.wiJourneyText, { color: colors.textPrimary, fontWeight: '700' }]}>
              {employerObj.name || 'An HR'} sent you an invite!{' '}
            </Text>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Text style={{ fontSize: moderateScale(15) }}>✨</Text>
            </Animated.View>
          </View>
          
          <TouchableOpacity 
            onPress={() => {
              if (expanded) {
                handleClose();
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
            <View style={styles.wiCardHeader}>
              <View style={[styles.wiLogoBox, { backgroundColor: colors.surfaceHighlight }]}>
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                ) : (
                  <Icon name="building" size={moderateScale(22)} color={colors.primary} />
                )}
              </View>
              <View style={styles.wiHeaderInfo}>
                <Text style={[styles.wiJobTitle, { color: colors.textPrimary }]}>{titleText}</Text>
                <Text style={[styles.wiCompanyName, { color: colors.textSecondary }]}>{subtitleText}</Text>
              </View>
            </View>

            <View style={[styles.wiJourneyBox, { backgroundColor: colors.surfaceHighlight + '30', marginTop: moderateScale(12) }]}>
              <View style={styles.wiJourneyRow}>
                <View style={styles.wiJourneyIconWrap}>
                  <View style={[styles.wiJourneyCircle, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
                    <View style={{ width: moderateScale(8), height: moderateScale(8), borderRadius: moderateScale(4), backgroundColor: colors.primary }} />
                  </View>
                </View>
                <View>
                  <Text style={[styles.wiJourneyText, { color: colors.textPrimary, fontWeight: '700' }]}>
                    Invited you {isJobApp ? 'to apply' : 'for interview'}
                  </Text>
                  {invitedAt ? <Text style={{ fontSize: moderateScale(10), color: colors.textSecondary }}>{invitedAt}</Text> : null}
                </View>
              </View>
            </View>

            <TouchableOpacity 
              onPress={openInviteDetail}
              style={{ backgroundColor: colors.primary, padding: moderateScale(11), borderRadius: radius.md, alignItems: 'center', marginTop: moderateScale(14) }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: moderateScale(13) }}>View Details</Text>
            </TouchableOpacity>
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
    paddingHorizontal: spacing.md,
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
  wiJourneyCircle: {
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wiJourneyText: {
    fontSize: moderateScale(13),
  },
});
