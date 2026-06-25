import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';

const { width } = Dimensions.get('window');

const features = [
  {
    id: 1,
    title: 'Resume Builder',
    subtitle: 'AI-Powered ATS Templates',
    isLocked: false,
    icon: 'document-text',
    badgeText: 'AVAILABLE',
    badgeColor: '#10b981',
    renderCustomUI: () => (
      <View style={styles.resumeSnippet}>
        <View style={styles.resumeHeader} />
        <View style={styles.resumeLine} />
        <View style={styles.resumeLineShort} />
        <View style={[styles.resumeLine, { marginTop: 6 }]} />
        <View style={styles.resumeLineShort} />
        <View style={styles.badgeUi}>
          <Icon name="checkmark-circle" size={10} color="#10b981" />
          <Text style={styles.badgeUiText}>ATS Optimized</Text>
        </View>
      </View>
    ),
  },
  {
    id: 2,
    title: 'Mock Interviewer',
    subtitle: 'Voice-based AI simulations',
    isLocked: true,
    icon: 'mic',
    badgeText: 'COMING SOON',
    badgeColor: '#f59e0b',
    renderCustomUI: () => (
      <View style={styles.chatSnippet}>
        <View style={styles.chatBubble}>
          <Text style={styles.chatBubbleText}>"Can you describe a challenging bug?"</Text>
        </View>
        <View style={styles.waveformContainer}>
          {[1, 2, 4, 2, 5, 3, 4, 2, 1].map((h, i) => (
            <View key={i} style={[styles.waveBar, { height: h * 4.5 }]} />
          ))}
        </View>
      </View>
    ),
  },
  {
    id: 3,
    title: 'Doubt Clearer',
    subtitle: 'Instant career & concept answers',
    isLocked: true,
    icon: 'chatbubbles',
    badgeText: 'COMING SOON',
    badgeColor: '#f59e0b',
    renderCustomUI: () => (
      <View style={styles.chatSnippet}>
        <View style={[styles.chatBubble, { alignSelf: 'flex-end', backgroundColor: '#3b82f6', paddingVertical: 6, paddingHorizontal: 10 }]}>
          <Text style={[styles.chatBubbleText, { color: '#ffffff' }]}>Negotiate salary?</Text>
        </View>
        <View style={[styles.chatBubble, { marginTop: 6, backgroundColor: '#1e293b', paddingVertical: 6, paddingHorizontal: 10 }]}>
          <Text style={styles.chatBubbleText}>Based on market trends...</Text>
        </View>
      </View>
    ),
  },
  {
    id: 4,
    title: 'Skill Gap Analysis',
    subtitle: 'Personalized upskilling paths',
    isLocked: true,
    icon: 'analytics',
    badgeText: 'COMING SOON',
    badgeColor: '#f59e0b',
    renderCustomUI: () => (
      <View style={styles.skillSnippet}>
        <View style={styles.skillRow}>
          <Text style={styles.skillLabel}>React Native</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '80%', backgroundColor: '#10b981' }]} />
          </View>
        </View>
        <View style={styles.skillRow}>
          <Text style={styles.skillLabel}>System Design</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '40%', backgroundColor: '#f59e0b' }]} />
          </View>
        </View>
      </View>
    ),
  },
  {
    id: 5,
    title: 'Audio Notifications',
    subtitle: 'Updates on the go',
    isLocked: true,
    icon: 'volume-high',
    badgeText: 'COMING SOON',
    badgeColor: '#f59e0b',
    renderCustomUI: () => (
      <View style={styles.audioSnippet}>
        <Icon name="notifications-outline" size={18} color="#94a3b8" />
        <View style={styles.audioWaveLine} />
        <View style={styles.audioDot} />
      </View>
    ),
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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingTop: 10, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.titleText}>
            Job India <Text style={{ color: '#f59e0b' }}>AI Suite</Text>
          </Text>
          <Text style={styles.subtitleText}>Unlock your career potential with advanced AI tools.</Text>
        </View>

        <View style={styles.listContainer}>
          {features.map((item) => (
            <Pressable key={item.id} onPress={() => handlePress(item)} style={styles.cardContainer}>
              {/* Ribbon */}
              <View style={[styles.ribbonContainer, { backgroundColor: item.badgeColor }]}>
                <Text style={styles.ribbonText}>{item.badgeText}</Text>
              </View>

              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={styles.iconWrapper}>
                  <Icon name={item.icon} size={16} color="#ffffff" />
                  {item.isLocked && (
                    <View style={styles.lockDot}>
                      <Icon name="lock-closed" size={7} color="#ffffff" />
                    </View>
                  )}
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
              </View>

              {/* Custom UI Snippet (Short but Sweet) */}
              <View style={styles.snippetContainer}>
                {item.renderCustomUI()}
              </View>

              {/* Bottom Action Area */}
              <View style={styles.cardFooter}>
                <View style={styles.footerButton}>
                  <Icon name={item.isLocked ? "lock-closed" : "arrow-forward"} size={14} color={item.isLocked ? "#94a3b8" : "#f59e0b"} />
                  <Text style={[styles.footerButtonText, { color: item.isLocked ? '#94a3b8' : '#f59e0b' }]}>
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
  safe: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 0,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 4,
  },
  cardContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    marginBottom: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  ribbonContainer: {
    position: 'absolute',
    top: 14,
    right: -30,
    transform: [{ rotate: '45deg' }],
    paddingVertical: 3,
    paddingHorizontal: 30,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  ribbonText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingRight: 40, // Space for ribbon
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  lockDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#ef4444',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0f172a',
  },
  headerTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  snippetContainer: {
    marginVertical: 6,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 10,
    marginTop: 6,
    alignItems: 'center',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  footerButtonText: {
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 12,
  },
  // -- Snippet Styles --
  resumeSnippet: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
  },
  resumeHeader: {
    width: '40%',
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    marginBottom: 8,
  },
  resumeLine: {
    width: '100%',
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    marginBottom: 4,
  },
  resumeLineShort: {
    width: '70%',
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
  },
  badgeUi: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064e3b',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeUiText: {
    color: '#34d399',
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  chatSnippet: {
    backgroundColor: '#0f172a',
  },
  chatBubble: {
    backgroundColor: '#1e293b',
    padding: 8,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    maxWidth: '85%',
  },
  chatBubbleText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontStyle: 'italic',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 3,
  },
  waveBar: {
    width: 3,
    backgroundColor: '#f59e0b',
    borderRadius: 1.5,
  },
  skillSnippet: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  skillRow: {
    marginBottom: 6,
  },
  skillLabel: {
    color: '#94a3b8',
    fontSize: 10,
    marginBottom: 2,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#0f172a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  audioSnippet: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioWaveLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
    marginHorizontal: 10,
  },
  audioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
  },
});

export default AiFeaturesScreen;
