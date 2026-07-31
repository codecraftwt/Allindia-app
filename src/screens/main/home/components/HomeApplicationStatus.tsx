import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { ThemeColors } from '../../../../theme/colors';
import { radius } from '../../../../theme/radius';
import { spacing } from '../../../../theme/spacing';
import { useTranslation } from 'react-i18next';

export const HomeApplicationStatus = ({ colors, onHide }: { colors: ThemeColors; onHide: () => void }) => {
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

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('home.applicationStatus', 'Application Status')}
        </Text>
        <TouchableOpacity onPress={onHide} style={styles.closeBtn}>
          <Icon name="times" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Pressable 
        onPress={() => setExpanded(!expanded)}
        style={[styles.wiCard, { backgroundColor: colors.surface, borderColor: colors.border + '80' }]}
      >
        {/* Compact Status Row (Always visible) */}
        <View style={styles.compactRow}>
          <View style={[styles.wiJourneyCircle, { borderColor: '#10b981', backgroundColor: colors.surface }]}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />
          </View>
          
          <View style={styles.statusTextWrapper}>
            <Text style={[styles.wiJourneyText, { color: colors.textPrimary, fontWeight: '700' }]}>
              You are Shortlisted!{' '}
            </Text>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Text style={{ fontSize: 16 }}>🎉</Text>
            </Animated.View>
          </View>
          
          <View style={styles.toggleBtn}>
            <Icon name={expanded ? "times" : "chevron-down"} size={14} color={colors.textSecondary} />
          </View>
        </View>

        {/* Expanded Details */}
        {expanded && (
          <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
            <View style={styles.wiCardHeader}>
              <View style={[styles.wiLogoBox, { backgroundColor: colors.surfaceHighlight }]}>
                <Icon name="building" size={24} color={colors.primary} />
              </View>
              <View style={styles.wiHeaderInfo}>
                <Text style={[styles.wiJobTitle, { color: colors.textPrimary }]}>Accountant Manager</Text>
                <Text style={[styles.wiCompanyName, { color: colors.textSecondary }]}>Global Tech Solution</Text>
              </View>
            </View>

            <View style={styles.wiMetaSection}>
              <View style={styles.wiMetaItem}>
                <Icon name="money" size={14} color={colors.textSecondary} />
                <Text style={[styles.wiMetaText, { color: colors.textPrimary }]}>Salary Negotiable</Text>
              </View>
              <View style={styles.wiMetaItem}>
                <Icon name="map-marker" size={14} color={colors.textSecondary} />
                <Text style={[styles.wiMetaText, { color: colors.textPrimary }]}>Dhule, MAHARASHTRA</Text>
              </View>
            </View>

            <View style={[styles.wiJourneyBox, { backgroundColor: colors.surfaceHighlight + '50' }]}>
              <View style={styles.wiJourneyRow}>
                <View style={styles.wiJourneyIconWrap}>
                  <View style={[styles.wiJourneyDot, { backgroundColor: '#10b981' }]}>
                    <Icon name="check" size={8} color="#fff" />
                  </View>
                  <View style={[styles.wiJourneyLine, { borderColor: colors.border }]} />
                </View>
                <View>
                  <Text style={[styles.wiJourneyText, { color: colors.textPrimary, fontWeight: '700' }]}>
                    Applied successfully
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.textSecondary }}>7 Jul</Text>
                </View>
              </View>
              <View style={[styles.wiJourneyRow, { marginTop: 4 }]}>
                <View style={styles.wiJourneyIconWrap}>
                  <View style={[styles.wiJourneyCircle, { borderColor: '#10b981', backgroundColor: colors.surface }]}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />
                  </View>
                </View>
                <Text style={[styles.wiJourneyText, { color: colors.textPrimary, fontWeight: '700' }]}>
                  You are Shortlisted! 🎉
                </Text>
              </View>
            </View>

            <View style={styles.wiManagerRow}>
              <Icon name="user-circle" size={16} color={colors.textSecondary} />
              <Text style={[styles.wiManagerText, { color: colors.textSecondary }]}>Ramesh (Manager)</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  wiJourneyLine: {
    width: 2,
    height: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    marginVertical: 2,
  },
  wiJourneyText: {
    fontSize: 14,
  },
  wiManagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wiManagerText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
