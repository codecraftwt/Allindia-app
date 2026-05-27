import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../context/ThemeContext';
import { spacing } from '../../../../theme/spacing';
import { analyzeResumeATS } from '../../../../services/giminiServiceNew';

const ORANGE_COLOR = '#FF9800';

interface AiResumeAnalyzerProps {
  profile: any;
}

export const AiResumeAnalyzer: React.FC<AiResumeAnalyzerProps> = ({ profile }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; suggestions: string[] } | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const response = await analyzeResumeATS(profile);
      setResult(response);
    } catch (error: any) {
      console.error('ATS Analysis Error:', error);
      const errorMsg = error?.message || 'Could not analyze your profile at this time. Please try again.';
      Alert.alert('Analysis Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return ORANGE_COLOR; // Orange/Yellow
    return '#ef4444'; // Red
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
      
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          AI Resume ATS Optimizer
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Analyze your resume details and get immediate recommendations from Gemini AI.
        </Text>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={ORANGE_COLOR} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Analyzing your resume keywords & sections with Gemini...
          </Text>
        </View>
      )}

      {/* Initial State / Trigger Button */}
      {!loading && !result && (
        <View style={styles.emptyContainer}>
          <View style={[styles.infoIconWrapper, { backgroundColor: ORANGE_COLOR + '10' }]}>
            <Icon name="analytics-outline" size={32} color={ORANGE_COLOR} />
          </View>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Find out how well your profile aligns with ATS scanners and get immediate suggestions for improvement.
          </Text>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: ORANGE_COLOR, shadowColor: ORANGE_COLOR }]}
            onPress={runAnalysis}
            activeOpacity={0.85}
          >
            <Icon name="pulse-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>Start Analyze</Text>
          </TouchableOpacity>
        </View>
      )}


      {/* Result State */}
      {!loading && result && (
        <View style={styles.resultContainer}>
          {/* ATS Score Row */}
          <View style={styles.scoreRow}>
            <View style={styles.scoreInfo}>
              <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>ATS Match Score</Text>
              <Text style={[styles.scoreText, { color: getScoreColor(result.score) }]}>{result.score}%</Text>
            </View>
            <View style={styles.barContainer}>
              <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${result.score}%`,
                      backgroundColor: getScoreColor(result.score),
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Recommendations List */}
          <View style={[styles.suggestionBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.suggestionHeader, { color: colors.textPrimary }]}>
              📝 AI Improvement Recommendations:
            </Text>

            {result.suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Icon
                  name={result.score >= 80 && index === 0 ? "checkmark-circle" : "close-circle"}
                  size={14}
                  color={result.score >= 80 && index === 0 ? "#10b981" : "#ef4444"}
                  style={styles.suggestionIcon}
                />
                <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>
                  {suggestion}
                </Text>
              </View>
            ))}
          </View>

          {/* Re-run button */}
          <TouchableOpacity
            style={[styles.reRunBtn, { borderColor: colors.border }]}
            onPress={runAnalysis}
            activeOpacity={0.7}
          >
            <Icon name="refresh" size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.reRunBtnText, { color: colors.textSecondary }]}>
              Re-analyze Profile
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ORANGE_COLOR + '18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: ORANGE_COLOR,
    textTransform: 'uppercase',
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
  loadingContainer: {
    paddingVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
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
  resultContainer: {
    width: '100%',
  },
  scoreRow: {
    marginBottom: 16,
  },
  scoreInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '900',
  },
  barContainer: {
    width: '100%',
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  suggestionBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  suggestionHeader: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  suggestionIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  suggestionText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  reRunBtn: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  reRunBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
  },
});
