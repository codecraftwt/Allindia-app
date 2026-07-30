import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import type { ThemeColors } from '../../../../theme/colors';
import { spacing } from '../../../../theme/spacing';
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
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
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
          <Icon name="times" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Pressable 
        onPress={() => setExpanded(!expanded)}
        style={[styles.wiCard, { backgroundColor: colors.surface, borderColor: colors.primary + '50' }]}
      >
        {/* Compact Status Row */}
        <View style={styles.compactRow}>
          <View style={[styles.wiJourneyCircle, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
          </View>
          
          <View style={styles.statusTextWrapper}>
            <Text style={[styles.wiJourneyText, { color: colors.textPrimary, fontWeight: '700' }]}>
              {employerObj.name || 'An HR'} sent you an invite!{' '}
            </Text>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Text style={{ fontSize: 16 }}>✨</Text>
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
            <Icon name={expanded ? "times" : "chevron-down"} size={14} color={colors.textSecondary} />
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
                  <Icon name="building" size={24} color={colors.primary} />
                )}
              </View>
              <View style={styles.wiHeaderInfo}>
                <Text style={[styles.wiJobTitle, { color: colors.textPrimary }]}>{titleText}</Text>
                <Text style={[styles.wiCompanyName, { color: colors.textSecondary }]}>{subtitleText}</Text>
              </View>
            </View>

            <View style={[styles.wiJourneyBox, { backgroundColor: colors.surfaceHighlight + '30', marginTop: 12 }]}>
              <View style={styles.wiJourneyRow}>
                <View style={styles.wiJourneyIconWrap}>
                  <View style={[styles.wiJourneyCircle, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
                  </View>
                </View>
                <View>
                  <Text style={[styles.wiJourneyText, { color: colors.textPrimary, fontWeight: '700' }]}>
                    Invited you {isJobApp ? 'to apply' : 'for interview'}
                  </Text>
                  {invitedAt ? <Text style={{ fontSize: 10, color: colors.textSecondary }}>{invitedAt}</Text> : null}
                </View>
              </View>
            </View>

            <TouchableOpacity 
              onPress={openInviteDetail}
              style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>View Details</Text>
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
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  wiCard: {
    padding: spacing.md,
    borderRadius: 16,
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
    gap: 12,
  },
  statusTextWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleBtn: {
    padding: 4,
    paddingLeft: 12,
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
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
  wiJourneyCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wiJourneyText: {
    fontSize: 14,
  },
});
