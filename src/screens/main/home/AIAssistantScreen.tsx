import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';

const AIAssistantScreen = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>AI Assistant</Text>
        <Text style={[typography.small, { color: colors.primary }]}>BETA</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.heroCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
          <View style={[styles.aiIconCircle, { backgroundColor: colors.primary }]}>
            <Icon name="sparkles" size={32} color="#fff" />
          </View>
          <Text style={[typography.h3, { color: colors.textPrimary, marginTop: 16 }]}>How can I help you?</Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
            I can help you find jobs, write summaries, or prepare for interviews.
          </Text>
        </View>

        <View style={styles.optionsGrid}>
          {[
            { id: 1, title: 'Find Jobs', icon: 'search-outline', desc: 'Find relevant jobs for your profile' },
            { id: 2, title: 'Optimize Resume', icon: 'document-text-outline', desc: 'Get AI tips for your resume' },
            { id: 3, title: 'Interview Prep', icon: 'mic-outline', desc: 'Practice with mock interviews' },
            { id: 4, title: 'Skill Analysis', icon: 'trending-up-outline', desc: 'Identify your next career move' },
          ].map(item => (
            <Pressable key={item.id} style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.optionIcon, { backgroundColor: colors.surfaceHighlight }]}>
                <Icon name={item.icon} size={20} color={colors.primary} />
              </View>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: 12 }]}>{item.title}</Text>
              <Text style={[typography.tiny, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={2}>{item.desc}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={[styles.inputPlaceholder, { backgroundColor: colors.surfaceHighlight }]}>
          <Text style={{ color: colors.textPlaceholder }}>Ask me anything...</Text>
        </View>
        <Pressable style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
          <Icon name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 8,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  heroCard: {
    borderRadius: radius.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 24,
  },
  aiIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  optionCard: {
    width: '47%',
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
  },
  inputPlaceholder: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default AIAssistantScreen;
