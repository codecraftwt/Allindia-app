import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../context/ThemeContext';
import { spacing } from '../../../../theme/spacing';
import { radius } from '../../../../theme/radius';
import { typography, moderateScale } from '../../../../theme/typography';
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
          <Icon name="document-text-outline" size={moderateScale(30)} color={ORANGE_COLOR} />
        </View>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Transform your profile data into an ATS-optimized professional resume. Choose from multiple stunning templates.
        </Text>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            {
              backgroundColor: ORANGE_COLOR,
              shadowColor: ORANGE_COLOR
            }
          ]}
          onPress={handleGenerateResume}
          activeOpacity={0.85}
        >
          <Icon name="sparkles" size={moderateScale(16)} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.actionBtnText}>
            Generate AI Resume
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radius.card,
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
    fontSize: moderateScale(16),
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: moderateScale(10),
  },
  infoIconWrapper: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(12),
  },
  emptyText: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
    textAlign: 'center',
    marginBottom: moderateScale(16),
    paddingHorizontal: moderateScale(12),
  },
  actionBtn: {
    flexDirection: 'row',
    height: moderateScale(44),
    paddingHorizontal: moderateScale(20),
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: moderateScale(13),
    fontWeight: '800',
  },
});
