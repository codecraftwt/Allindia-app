import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import type { ThemeColors } from '../theme/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AppRateProps {
  colors: ThemeColors;
}

const AppRate: React.FC<AppRateProps> = ({ colors }) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const checkRateStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('app_rate_status');
        if (!status) {
          setIsVisible(true);
        }
      } catch (err) {
        setIsVisible(true);
      }
    };
    checkRateStatus();
  }, []);

  const handleRate = (stars: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRating(stars);
  };

  const handleDismiss = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsVisible(false);
    try {
      await AsyncStorage.setItem('app_rate_status', 'dismissed');
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSubmit = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSubmitted(true);
    try {
      await AsyncStorage.setItem('app_rate_status', 'rated');
    } catch (err) {
      console.warn(err);
    }
    // Automatically close card after 3 seconds on submission success
    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsVisible(false);
    }, 3000);
  };

  if (!isVisible) return null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceHighlight || colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow || '#000',
        },
      ]}
    >
      {/* Dismiss Button */}
      {!isSubmitted && (
        <Pressable onPress={handleDismiss} style={styles.closeBtn} hitSlop={12}>
          <Icon name="times" size={16} color={colors.textPlaceholder} />
        </Pressable>
      )}

      {isSubmitted ? (
        <View style={styles.centerContent}>
          <Icon name="check-circle" size={42} color={colors.success || '#10b981'} style={{ marginBottom: 12 }} />
          <Text style={[typography.sectionTitle, { color: colors.textPrimary, textAlign: 'center' }]}>
            Thank You!
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
            Your feedback helps us make JobIndia better for everyone.
          </Text>
        </View>
      ) : (
        <View>
          <View style={styles.headerRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
              <Icon name="star" size={20} color={colors.primary} />
            </View>
            <View style={styles.titleCol}>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, fontSize: 16 }]}>
                Enjoying JobIndia?
              </Text>
              <Text style={[typography.small, { color: colors.textSecondary }]}>
                Please rate your experience with us!
              </Text>
            </View>
          </View>

          {/* 5-Star Row */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleRate(star)}
                activeOpacity={0.7}
                style={styles.starTouch}
              >
                <Icon
                  name={star <= rating ? 'star' : 'star-o'}
                  size={32}
                  color={star <= rating ? '#fbbf24' : colors.textPlaceholder}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Conditional Layouts based on Stars */}
          {rating > 0 && rating <= 3 && (
            <View style={styles.feedbackContainer}>
              <TextInput
                placeholder="What can we do to improve? Tell us here..."
                placeholderTextColor={colors.textPlaceholder}
                value={feedback}
                onChangeText={setFeedback}
                style={[
                  styles.textInput,
                  {
                    color: colors.textPrimary,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={[typography.labelMedium, { color: colors.onPrimary || '#fff' }]}>
                  Submit Feedback
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {rating >= 4 && (
            <View style={styles.successCta}>
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: 12 }]}>
                We're glad you love using JobIndia! Would you like to rate us on the Play Store?
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  onPress={handleDismiss}
                  style={[styles.subBtn, { borderColor: colors.border }]}
                >
                  <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>
                    Later
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[styles.submitBtn, { backgroundColor: colors.primary, flex: 1, marginLeft: 8 }]}
                >
                  <Text style={[typography.labelMedium, { color: colors.onPrimary || '#fff' }]}>
                    Rate Now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.card || 16,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginVertical: spacing.sm,
  },
  starTouch: {
    padding: 4,
  },
  feedbackContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  textInput: {
    borderRadius: radius.md || 8,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    paddingVertical: 12,
    borderRadius: radius.button || 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCta: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  subBtn: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.button || 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
});

export default AppRate;
