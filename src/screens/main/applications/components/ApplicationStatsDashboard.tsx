import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../../../../theme/colors';
import { spacing } from '../../../../theme/spacing';
import { radius } from '../../../../theme/radius';
import { typography, moderateScale } from '../../../../theme/typography';
import { useTheme } from '../../../../context/ThemeContext';

const StatShimmer = ({ colors }: { colors: ThemeColors }) => {
  const shimmerValue = useSharedValue(0.3);

  React.useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [shimmerValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: shimmerValue.value,
  }));

  return (
    <View style={styles.stepContainer}>
      <Animated.View style={[styles.stepCircle, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border + '40' }, animatedStyle]} />
      <Animated.View style={[{ width: moderateScale(40), height: moderateScale(10), backgroundColor: colors.surfaceHighlight, borderRadius: radius.xs, marginTop: moderateScale(8) }, animatedStyle]} />
    </View>
  );
};

const PipelineStep = ({ label, value, color, colors, isLast }: any) => {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.circleWrapper}>
        <View style={[styles.stepCircle, { backgroundColor: colors.surface, borderColor: color }]}>
          <Text style={[typography.labelMedium, styles.stepValue, { color: colors.textPrimary }]}>
            {String(value || 0).padStart(2, '0')}
          </Text>
        </View>
        {!isLast && <View style={[styles.stepLine, { backgroundColor: colors.border }]} />}
      </View>
      <Text style={[typography.tiny, styles.stepLabel, { color: colors.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

interface ApplicationStatsDashboardProps {
  applicationCounts: any;
  countsLoading: boolean;
}

const ApplicationStatsDashboard: React.FC<ApplicationStatsDashboardProps> = ({ applicationCounts, countsLoading }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const pipelineSteps = [
    { label: t('applications.statusApplied', 'Applied'), value: applicationCounts?.total_applied, color: '#3b82f6' },
    { label: t('applications.statusPendingShort', 'Pending'), value: applicationCounts?.pending, color: '#f59e0b' },
    { label: t('applications.statusInterviewShort', 'Interview'), value: applicationCounts?.interview_scheduled, color: '#6366f1' },
    { label: t('applications.statusSelectedShort', 'Selected'), value: applicationCounts?.selected, color: '#10b981' },
  ];

  const others = [
    { label: t('applications.statusShortlistedShort', 'Shortlisted'), value: applicationCounts?.shortlisted, color: '#06b6d4', icon: 'check-circle-o' },
    { label: t('applications.statusRejectedShort', 'Rejected'), value: applicationCounts?.rejected, color: '#ef4444', icon: 'times-circle-o' },
  ];

  return (
    <View style={[styles.dashboardCard, { backgroundColor: colors.surface, borderColor: colors.border + '60' }]}>
      <View style={styles.header}>
        <Text style={[typography.labelLarge, styles.title, { color: colors.textPrimary }]}>
          {t('applications.myActivity', 'My Activity')}
        </Text>
      </View>

      <View style={styles.pipelineRow}>
        {countsLoading || !applicationCounts ? (
          Array(4).fill(0).map((_, i) => <StatShimmer key={i} colors={colors} />)
        ) : (
          pipelineSteps.map((step, i) => (
            <PipelineStep 
              key={step.label}
              label={step.label}
              value={step.value}
              color={step.color}
              colors={colors}
              isLast={i === pipelineSteps.length - 1}
            />
          ))
        )}
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border + '40' }]} />

      <View style={styles.othersRow}>
        {others.map((item) => (
          <View key={item.label} style={styles.otherItem}>
            <View style={[styles.otherIconWrap, { backgroundColor: item.color + '15' }]}>
              <Icon name={item.icon} size={moderateScale(12)} color={item.color} />
            </View>
            <View>
              <Text style={[typography.labelMedium, styles.otherValue, { color: colors.textPrimary }]}>{item.value || 0}</Text>
              <Text style={[typography.tiny, styles.otherLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dashboardCard: {
    padding: moderateScale(10),
    borderRadius: radius.card,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  header: {
    marginBottom: moderateScale(8),
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  pipelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingHorizontal: moderateScale(4),
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  circleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginBottom: moderateScale(4),
  },
  stepCircle: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepLine: {
    height: 1.5,
    position: 'absolute',
    left: '50%',
    right: '-50%',
    zIndex: 1,
  },
  stepValue: {
    fontWeight: '800',
    fontSize: moderateScale(13),
  },
  stepLabel: {
    fontWeight: '700',
    textAlign: 'center',
    fontSize: moderateScale(10),
  },
  divider: {
    height: 1,
    marginVertical: moderateScale(6),
  },
  othersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: moderateScale(4),
  },
  otherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  otherIconWrap: {
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherValue: {
    fontWeight: '800',
    fontSize: moderateScale(13),
  },
  otherLabel: {
    fontWeight: '600',
    fontSize: moderateScale(10),
  },
});

export default ApplicationStatsDashboard;
