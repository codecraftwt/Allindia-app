import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../context/ThemeContext';
import { spacing } from '../../../../theme/spacing';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const ORANGE_COLOR = '#FF9800';

interface AiResumeAnalyzerProps {
  profile: any;
}

export const AiResumeAnalyzer: React.FC<AiResumeAnalyzerProps> = ({ profile }) => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp<any>>();

  const handleGenerateResume = () => {
    // Navigate to the full-screen AIAssistantScreen with a param to automatically skip the chat
    navigation.navigate('AIAssistantScreen', { autoGenerate: true });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          AI Resume Generator
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Use Gemini AI to rebuild your existing CV and access premium downloadable templates instantly.
        </Text>
      </View>

      {/* Trigger Button State */}
      <View style={styles.emptyContainer}>
        <View style={[styles.infoIconWrapper, { backgroundColor: ORANGE_COLOR + '10' }]}>
          <Icon name="document-text-outline" size={32} color={ORANGE_COLOR} />
        </View>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Transform your profile data into an ATS-optimized professional resume. Choose from multiple stunning templates.
        </Text>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: ORANGE_COLOR, shadowColor: ORANGE_COLOR }]}
          onPress={handleGenerateResume}
          activeOpacity={0.85}
        >
          <Icon name="sparkles" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.actionBtnText}>Generate AI Resume</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});
