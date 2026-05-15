import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';

const AIAssistantScreen = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const primaryOrange = '#FF9800';

  const builderOptions = [
    { id: 'personal', title: 'Personal Info', icon: 'person-outline', color: '#3b82f6', status: 'Completed' },
    { id: 'experience', title: 'Work History', icon: 'briefcase-outline', color: '#10b981', status: '2 Added' },
    { id: 'education', title: 'Education', icon: 'school-outline', color: '#f59e0b', status: 'Missing' },
    { id: 'skills', title: 'Skills & Tools', icon: 'flash-outline', color: '#8b5cf6', status: '12 Added' },
    { id: 'projects', title: 'Key Projects', icon: 'code-working-outline', color: '#ec4899', status: 'Optional' },
    { id: 'summary', title: 'AI Summary', icon: 'sparkles-outline', color: '#06b6d4', status: 'Ready' },
  ];

  return (
    <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>AI Resume Builder</Text>
          <Text style={[typography.small, { color: colors.textPlaceholder }]}>Craft your perfect career profile</Text>
        </View>
        <Pressable style={[styles.betaBadge, { backgroundColor: primaryOrange + '15' }]}>
          <Text style={[typography.tiny, { color: primaryOrange, fontWeight: 'bold' }]}>PREMIUM</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Strength Dashboard */}
        <View style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreCircle}>
              <View style={[styles.scoreInner, { borderColor: primaryOrange }]}>
                <Text style={[typography.h2, { color: colors.textPrimary }]}>85%</Text>
                <Text style={[typography.tiny, { color: colors.textPlaceholder }]}>SCORE</Text>
              </View>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Profile Strength</Text>
              <Text style={[typography.small, { color: colors.textSecondary }]}>Your resume is better than 80% of candidates.</Text>
              <View style={[styles.miniProgressBase, { backgroundColor: colors.surfaceHighlight }]}>
                <View style={[styles.miniProgressFill, { backgroundColor: primaryOrange, width: '85%' }]} />
              </View>
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border + '30' }]} />
          
          <View style={styles.insightRow}>
            <Icon name="bulb-outline" size={16} color="#f59e0b" />
            <Text style={[typography.small, { color: colors.textSecondary, flex: 1 }]}>
              Add 2 more skills to reach 100% completeness.
            </Text>
            <Pressable>
              <Text style={[typography.small, { color: primaryOrange, fontWeight: 'bold' }]}>FIX NOW</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Resume Sections</Text>
          <Pressable>
            <Text style={[typography.small, { color: primaryOrange }]}>Edit All</Text>
          </Pressable>
        </View>

        <View style={styles.optionsGrid}>
          {builderOptions.map(item => (
            <Pressable key={item.id} style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.optionHeader]}>
                <View style={[styles.optionIcon, { backgroundColor: item.color + '15' }]}>
                  <Icon name={item.icon} size={20} color={item.color} />
                </View>
                <View style={[styles.statusDot, { backgroundColor: item.status === 'Missing' ? '#ef4444' : '#10b981' }]} />
              </View>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: 12 }]}>{item.title}</Text>
              <Text style={[typography.tiny, { color: item.status === 'Missing' ? '#ef4444' : colors.textPlaceholder, marginTop: 4 }]}>
                {item.status}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* AI Tools Section */}
        <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: 16, marginBottom: 12 }]}>AI Tools</Text>
        <Pressable style={[styles.aiToolCard, { backgroundColor: primaryOrange }]}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.labelMedium, { color: '#fff' }]}>Optimize for Job Description</Text>
            <Text style={[typography.small, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
              Paste a JD and let AI tailor your resume instantly.
            </Text>
          </View>
          <View style={styles.toolIconBox}>
            <Icon name="rocket-outline" size={24} color={primaryOrange} />
          </View>
        </Pressable>

        <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable style={[styles.previewBtn, { borderColor: primaryOrange }]}>
            <Icon name="eye-outline" size={20} color={primaryOrange} />
            <Text style={[typography.labelMedium, { color: primaryOrange }]}>Preview</Text>
          </Pressable>
          <Pressable style={[styles.downloadBtn, { backgroundColor: primaryOrange }]}>
            <Icon name="download-outline" size={20} color="#fff" />
            <Text style={[typography.labelMedium, { color: '#fff' }]}>Download PDF</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 8,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: 120,
  },
  scoreCard: {
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  scoreInner: {
    flex: 1,
    borderRadius: 30,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniProgressBase: {
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
    width: '100%',
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48.5%',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  aiToolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.md,
    gap: 12,
  },
  toolIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  betaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bottomBar: {
    marginTop: 16,
    padding: spacing.sm,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
  },
  previewBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  downloadBtn: {
    flex: 2,
    height: 44,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});

export default AIAssistantScreen;
