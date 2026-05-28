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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { typography, fontFamilies } from '../theme/typography';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

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
      {/* Decorative Overlapping Faux Gradient Blobs */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View
          style={[
            styles.blob,
            {
              backgroundColor: rating >= 4 ? '#EAB308' : colors.primary,
              opacity: rating >= 4 ? 0.06 : 0.04,
              width: 140,
              height: 140,
              borderRadius: 70,
              top: -30,
              left: -30,
            },
          ]}
        />
        <View
          style={[
            styles.blob,
            {
              backgroundColor: '#EAB308',
              opacity: rating > 0 ? 0.08 : 0.03,
              width: 120,
              height: 120,
              borderRadius: 60,
              bottom: -40,
              right: -30,
            },
          ]}
        />
      </View>

      {/* Dismiss Button */}
      {!isSubmitted && (
        <Pressable onPress={handleDismiss} style={styles.closeBtn} hitSlop={12}>
          <Icon name="close" size={18} color={colors.textPlaceholder} />
        </Pressable>
      )}

      {isSubmitted ? (
        <View style={styles.centerContent}>
          <View style={[styles.successIconWrapper, { backgroundColor: colors.success + '15' }]}>
            <Icon name="check-decagram" size={48} color={colors.success || '#10b981'} />
          </View>
          <Text style={[typography.sectionTitle, { fontFamily: fontFamilies.bold, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.sm }]}>
            {t('appRate.thankYou')}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 6, paddingHorizontal: 12 }]}>
            {t('appRate.feedbackSuccessSub')}
          </Text>
        </View>
      ) : (
        <View>
          <View style={styles.headerRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
              <Icon name="star-face" size={22} color={colors.primary} />
            </View>
            <View style={styles.titleCol}>
              <Text style={[typography.labelMedium, { fontFamily: fontFamilies.bold, color: colors.textPrimary, fontSize: 16 }]}>
                {t('appRate.enjoyingTitle')}
              </Text>
              <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]}>
                {t('appRate.enjoyingSub')}
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
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={star <= rating ? '#fbbf24' : colors.textPlaceholder}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Conditional Layouts based on Stars */}
          {rating > 0 && rating <= 3 && (
            <View style={styles.feedbackContainer}>
              <TextInput
                placeholder={t('appRate.placeholderImprove')}
                placeholderTextColor={colors.textPlaceholder}
                value={feedback}
                onChangeText={setFeedback}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={[
                  styles.textInput,
                  {
                    color: colors.textPrimary,
                    borderColor: isFocused ? colors.primary : colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.8}
                style={[styles.submitBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
              >
                <Text style={[typography.labelMedium, { fontFamily: fontFamilies.bold, color: colors.onPrimary || '#fff' }]}>
                  {t('appRate.submitFeedback')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {rating >= 4 && (
            <View style={styles.successCta}>
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: 16, lineHeight: 20 }]}>
                {t('appRate.ratingCtaPlayStore')}
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  onPress={handleDismiss}
                  activeOpacity={0.8}
                  style={[styles.subBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Text style={[typography.labelMedium, { fontFamily: fontFamilies.semiBold, color: colors.textSecondary }]}>
                    {t('appRate.later')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                  style={[styles.submitBtn, { backgroundColor: colors.primary, shadowColor: colors.primary, flex: 1, marginLeft: 12 }]}
                >
                  <Text style={[typography.labelMedium, { fontFamily: fontFamilies.bold, color: colors.onPrimary || '#fff' }]}>
                    {t('appRate.rateNow')}
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
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    padding: spacing.lg,
    borderRadius: 24,
    borderWidth: 1.5,
    elevation: 4,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
    gap: 12,
    marginVertical: spacing.md,
  },
  starTouch: {
    padding: 4,
  },
  feedbackContainer: {
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  textInput: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    height: 90,
    textAlignVertical: 'top',
    fontFamily: fontFamilies.regular,
  },
  submitBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  successCta: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  subBtn: {
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
});

export default AppRate;
