import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { ThemeColors } from '../../../../theme/colors';
import { spacing } from '../../../../theme/spacing';
import { radius } from '../../../../theme/radius';
import { useTheme } from '../../../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const StatShimmer = ({ colors }: { colors: ThemeColors }) => {
  const shimmerValue = useSharedValue(0.3);

  React.useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: shimmerValue.value,
  }));

  return (
    <View style={styles.stepContainer}>
      <Animated.View style={[styles.stepCircle, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border + '40' }, animatedStyle]} />
      <Animated.View style={[{ width: 40, height: 10, backgroundColor: colors.surfaceHighlight, borderRadius: 2, marginTop: 8 }, animatedStyle]} />
    </View>
  );
};

const PipelineStep = ({ label, value, color, colors, isLast }: any) => {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.circleWrapper}>
        <View style={[styles.stepCircle, { backgroundColor: colors.surface, borderColor: color }]}>
          <Text style={[styles.stepValue, { color: colors.textPrimary }]}>
            {String(value || 0).padStart(2, '0')}
          </Text>
        </View>
        {!isLast && <View style={[styles.stepLine, { backgroundColor: colors.border }]} />}
      </View>
      <Text style={[styles.stepLabel, { color: colors.textSecondary }]} numberOfLines={1}>
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

  const pipelineSteps = [
    { label: 'Applied', value: applicationCounts?.total_applied, color: '#3b82f6' },
    { label: 'Pending', value: applicationCounts?.pending, color: '#f59e0b' },
    { label: 'Interview', value: applicationCounts?.interview_scheduled, color: '#6366f1' },
    { label: 'Selected', value: applicationCounts?.selected, color: '#10b981' },
  ];

  const others = [
    { label: 'Shortlisted', value: applicationCounts?.shortlisted, color: '#06b6d4', icon: 'check-circle-o' },
    { label: 'Rejected', value: applicationCounts?.rejected, color: '#ef4444', icon: 'times-circle-o' },
  ];

  return (
    <View style={[styles.dashboardCard, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>My Activity</Text>
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
            <View style={[styles.otherIconWrap, { backgroundColor: item.color + '10' }]}>
              <Icon name={item.icon} size={12} color={item.color} />
            </View>
            <View>
              <Text style={[styles.otherValue, { color: colors.textPrimary }]}>{item.value || 0}</Text>
              <Text style={[styles.otherLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dashboardCard: {
    padding: 6,
    borderRadius: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 10,
    opacity: 0.6,
  },
  pipelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingHorizontal: 4,
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
    marginBottom: 2,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
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
    fontSize: 14,
    fontWeight: '800',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  othersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  otherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  otherIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  otherLabel: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.6,
  },
});

export default ApplicationStatsDashboard;
