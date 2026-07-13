import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';

const features = [
  {
    id: 1,
    title: 'Resume Builder',
    subtitle: 'AI-Powered ATS Templates',
    isLocked: false,
    icon: 'document-text',
    badgeText: 'AVAILABLE',
    badgeColor: '#10b981',
  },
  {
    id: 2,
    title: 'Mock Interviewer',
    subtitle: 'Voice-based AI simulations',
    isLocked: true,
    icon: 'mic',
    badgeText: 'COMING SOON',
    badgeColor: '#F59E0B',
  },
  {
    id: 3,
    title: 'Doubt Clearer',
    subtitle: 'Instant career & concept answers',
    isLocked: true,
    icon: 'chatbubbles',
    badgeText: 'COMING SOON',
    badgeColor: '#F59E0B',
  },
  {
    id: 4,
    title: 'Skill Gap Analysis',
    subtitle: 'Personalized upskilling paths',
    isLocked: true,
    icon: 'analytics',
    badgeText: 'COMING SOON',
    badgeColor: '#F59E0B',
  },
  {
    id: 5,
    title: 'Audio Notifications',
    subtitle: 'Updates on the go',
    isLocked: true,
    icon: 'volume-high',
    badgeText: 'COMING SOON',
    badgeColor: '#F59E0B',
  },
];

const AiFeaturesScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const handlePress = (item: typeof features[0]) => {
    if (item.isLocked) {
      Alert.alert('Coming Soon', `${item.title} will be available in future updates.`);
    } else {
      if (item.id === 1) {
        // @ts-ignore
        navigation.navigate('ResumeScreen');
      }
    }
  };

  const renderCustomUI = (item: typeof features[0]) => {
    switch (item.id) {
      case 1:
        return (
          <View style={[styles.resumeSnippet, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <View style={[styles.resumeHeader, { backgroundColor: colors.primaryLight, opacity: 0.35 }]} />
            <View style={[styles.resumeLine, { backgroundColor: colors.muted }]} />
            <View style={[styles.resumeLineShort, { backgroundColor: colors.muted }]} />
            <View style={[styles.resumeLine, { marginTop: 6, backgroundColor: colors.muted }]} />
            <View style={[styles.resumeLineShort, { backgroundColor: colors.muted }]} />
            <View style={[styles.badgeUi, { backgroundColor: colors.successBackground }]}>
              <Icon name="checkmark-circle" size={10} color={colors.success} />
              <Text style={[styles.badgeUiText, { color: colors.success }]}>ATS Optimized</Text>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={[styles.chatSnippet, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={[styles.chatBubble, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
              <Text style={[styles.chatBubbleText, { color: colors.textSecondary }]}>
                "Can you describe a challenging bug?"
              </Text>
            </View>
            <View style={styles.waveformContainer}>
              {[1, 2, 4, 2, 5, 3, 4, 2, 1].map((h, i) => (
                <View key={i} style={[styles.waveBar, { height: h * 4.5, backgroundColor: colors.warning }]} />
              ))}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={[styles.chatSnippet, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={[styles.chatBubble, { alignSelf: 'flex-end', backgroundColor: colors.primary, paddingVertical: 6, paddingHorizontal: 10 }]}>
              <Text style={[styles.chatBubbleText, { color: colors.onPrimary }]}>Negotiate salary?</Text>
            </View>
            <View style={[styles.chatBubble, { marginTop: 6, backgroundColor: colors.surface, paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border }]}>
              <Text style={[styles.chatBubbleText, { color: colors.textSecondary }]}>Based on market trends...</Text>
            </View>
          </View>
        );
      case 4:
        return (
          <View style={[styles.skillSnippet, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <View style={styles.skillRow}>
              <Text style={[styles.skillLabel, { color: colors.textSecondary }]}>React Native</Text>
              <View style={[styles.progressBarBg, { backgroundColor: colors.progressTrack }]}>
                <View style={[styles.progressBarFill, { width: '80%', backgroundColor: colors.success }]} />
              </View>
            </View>
            <View style={styles.skillRow}>
              <Text style={[styles.skillLabel, { color: colors.textSecondary }]}>System Design</Text>
              <View style={[styles.progressBarBg, { backgroundColor: colors.progressTrack }]}>
                <View style={[styles.progressBarFill, { width: '40%', backgroundColor: colors.warning }]} />
              </View>
            </View>
          </View>
        );
      case 5:
        return (
          <View style={[styles.audioSnippet, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Icon name="notifications-outline" size={18} color={colors.primary} />
            <View style={[styles.audioWaveLine, { backgroundColor: colors.border }]} />
            <View style={[styles.audioDot, { backgroundColor: colors.warning }]} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.primaryDark }]} edges={['top', 'left', 'right']}>

      {/* ── Blue Hero Header — fixed, does not scroll ── */}
      <View style={[styles.heroSection, { backgroundColor: colors.primaryDark }]}>
        <View style={[styles.decorCircle1, { backgroundColor: colors.primary, opacity: 0.25 }]} />
        <View style={[styles.decorCircle2, { backgroundColor: colors.primaryLight, opacity: 0.15 }]} />
        <View style={styles.heroTextBlock}>
          <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Icon name="sparkles" size={11} color="#FBBF24" />
            <Text style={styles.heroBadgeText}>Powered by AI</Text>
          </View>
          <Text style={styles.heroTitle}>
            Job India <Text style={{ color: '#FBBF24' }}>AI Suite</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Unlock your career potential with advanced AI tools.
          </Text>
        </View>
      </View>

      {/* ── Cards Section — only this scrolls ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[styles.scrollArea, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        <View>
          {features.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handlePress(item)}
              style={({ pressed }) => [
                styles.cardContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.primaryDark,
                  opacity: pressed ? 0.93 : 1,
                },
              ]}
            >
              {/* Left accent bar */}
              <View style={[styles.cardAccentBar, { backgroundColor: item.isLocked ? colors.muted : colors.primary }]} />

              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                  <Icon name={item.icon} size={17} color={item.isLocked ? colors.textSecondary : colors.primary} />
                  {item.isLocked && (
                    <View style={[styles.lockDot, { backgroundColor: colors.error, borderColor: colors.surface }]}>
                      <Icon name="lock-closed" size={7} color="#fff" />
                    </View>
                  )}
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                </View>
                {/* Pill Badge — always visible */}
                <View style={[styles.pillBadge, { backgroundColor: item.badgeColor }]}>
                  <Text style={styles.pillBadgeText}>{item.badgeText}</Text>
                </View>
              </View>

              {/* Snippet */}
              <View style={styles.snippetContainer}>{renderCustomUI(item)}</View>

              {/* Footer */}
              <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                <View
                  style={[
                    styles.footerButton,
                    {
                      backgroundColor: item.isLocked ? colors.surfaceSecondary : colors.primary,
                      borderWidth: item.isLocked ? 1 : 0,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Icon
                    name={item.isLocked ? 'lock-closed' : 'arrow-forward'}
                    size={13}
                    color={item.isLocked ? colors.textSecondary : colors.onPrimary}
                  />
                  <Text style={[styles.footerButtonText, { color: item.isLocked ? colors.textSecondary : colors.onPrimary }]}>
                    {item.isLocked ? 'Locked' : 'Try Now'}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // ── Scroll area ──
  scrollArea: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 20,
    paddingBottom: 100,
  },
  // ── Hero ──
  heroSection: {
    paddingHorizontal: spacing.md,
    paddingTop: 18,
    paddingBottom: 36,
    overflow: 'hidden',
    position: 'relative',
  },
  decorCircle1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -50,
    right: -40,
  },
  decorCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    bottom: -20,
    left: 20,
  },
  heroTextBlock: {
    alignItems: 'center',
    zIndex: 1,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
    gap: 5,
  },
  heroBadgeText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── Cards ──
  cardContainer: {
    borderRadius: 16,
    marginBottom: 14,
    paddingTop: 14,
    paddingBottom: 0,
    paddingLeft: 18,
    paddingRight: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    position: 'relative',
  },
  cardAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginLeft: 6,
  },
  pillBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  lockDot: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 15,
    height: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  headerTextContainer: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  snippetContainer: { marginBottom: 6 },
  cardFooter: {
    borderTopWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 20,
  },
  footerButtonText: {
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 12,
  },

  // Snippets
  resumeSnippet: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    position: 'relative',
    minHeight: 70,
  },
  resumeHeader: { width: '40%', height: 6, borderRadius: 3, marginBottom: 8 },
  resumeLine: { width: '100%', height: 4, borderRadius: 2, marginBottom: 4 },
  resumeLineShort: { width: '70%', height: 4, borderRadius: 2 },
  badgeUi: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeUiText: { fontSize: 8, fontWeight: 'bold', marginLeft: 4 },
  chatSnippet: { borderRadius: 10, padding: 8 },
  chatBubble: {
    padding: 8,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    maxWidth: '85%',
  },
  chatBubbleText: { fontSize: 11, fontStyle: 'italic' },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 3,
  },
  waveBar: { width: 3, borderRadius: 1.5 },
  skillSnippet: { borderRadius: 10, padding: 10, borderWidth: 1 },
  skillRow: { marginBottom: 6 },
  skillLabel: { fontSize: 10, marginBottom: 3, fontWeight: '600' },
  progressBarBg: { height: 5, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  audioSnippet: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioWaveLine: { flex: 1, height: 1, marginHorizontal: 10 },
  audioDot: { width: 8, height: 8, borderRadius: 4 },
});

export default AiFeaturesScreen;
