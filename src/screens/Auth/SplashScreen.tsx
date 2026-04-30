import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const LOGO = require('../../assets/mainlogo.png');
const SPLASH_DELAY_MS = 40000;
const PROGRESS_BAR_W = 200;

type Props = StackScreenProps<AuthStackParamList, 'Splash'>;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.86)).current;
  const logoLift = useRef(new Animated.Value(14)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(10)).current;

  const tagOpacity = useRef(new Animated.Value(0)).current;
  const tagY = useRef(new Animated.Value(8)).current;

  const eyebrowOpacity = useRef(new Animated.Value(0)).current;

  const progress = useRef(new Animated.Value(0)).current;
  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, PROGRESS_BAR_W],
  });

  useEffect(() => {
    const enter = Animated.stagger(90, [
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 68,
          useNativeDriver: true,
        }),
        Animated.timing(logoLift, {
          toValue: 0,
          duration: 620,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(eyebrowOpacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(titleY, {
          toValue: 0,
          friction: 9,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(tagOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(tagY, {
          toValue: 0,
          friction: 9,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
    ]);

    enter.start();

    Animated.timing(progress, {
      toValue: 1,
      duration: SPLASH_DELAY_MS - 480,
      delay: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- entrance runs once; Animated.Value refs are stable
  }, []);

  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Login'), SPLASH_DELAY_MS);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.root}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View
            style={[
              styles.orb,
              styles.orbPrimary,
              { backgroundColor: `${colors.primary}14` },
            ]}
          />
          <View
            style={[
              styles.orb,
              styles.orbSecondary,
              { backgroundColor: `${colors.primaryLight}10` },
            ]}
          />
          <View
            style={[
              styles.orb,
              styles.orbAccent,
              { backgroundColor: `${colors.primary}0A` },
            ]}
          />
          <View
            style={[
              styles.horizon,
              {
                borderTopColor: `${colors.primary}12`,
                backgroundColor: `${colors.surfaceHighlight}40`,
              },
            ]}
          />
        </View>

        <View style={styles.center}>
          <Animated.View
            style={[
              styles.logoStack,
              {
                opacity: logoOpacity,
                transform: [{ translateY: logoLift }, { scale: logoScale }],
              },
            ]}>
            <View style={[styles.logoGlow, { backgroundColor: `${colors.primary}18` }]} />
            <View
              style={[
                styles.logoCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: `${colors.primary}2E`,
                  shadowColor: colors.shadow,
                },
              ]}>
              <View style={[styles.logoInnerRing, { borderColor: `${colors.primary}1F` }]}>
                <Image source={LOGO} style={styles.logo} resizeMode="contain" />
              </View>
            </View>
          </Animated.View>

          <Animated.Text
            style={[
              typography.small,
              styles.eyebrow,
              {
                opacity: eyebrowOpacity,
                color: colors.primary,
              },
            ]}>
            JOBINDIA
          </Animated.Text>

          <Animated.Text
            style={[
              typography.appTitle,
              styles.title,
              {
                opacity: titleOpacity,
                color: colors.textPrimary,
                transform: [{ translateY: titleY }],
              },
            ]}>
            Find work that fits
          </Animated.Text>

          <Animated.Text
            style={[
              typography.body,
              styles.tagline,
              {
                opacity: tagOpacity,
                color: colors.textSecondary,
                transform: [{ translateY: tagY }],
              },
            ]}>
            Verified listings, quick apply, and updates{'\n'}built for job seekers across India.
          </Animated.Text>
        </View>

        <View style={styles.footer}>
          <View
            style={[
              styles.track,
              {
                backgroundColor: colors.surfaceSecondary,
              },
            ]}>
            <Animated.View
              style={[
                styles.trackFill,
                {
                  width: barWidth,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[typography.small, styles.footerHint, { color: colors.textPlaceholder }]}>
            Preparing your experience
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbPrimary: {
    width: 320,
    height: 320,
    top: -120,
    right: -100,
  },
  orbSecondary: {
    width: 260,
    height: 260,
    bottom: -80,
    left: -90,
  },
  orbAccent: {
    width: 140,
    height: 140,
    top: '42%',
    left: -50,
  },
  horizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '18%',
    height: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  center: {
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
  },
  logoStack: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoGlow: {
    position: 'absolute',
    width: 124,
    height: 124,
    borderRadius: 40,
    transform: [{ scale: 1.15 }],
  },
  logoCard: {
    padding: spacing.sm + 2,
    borderRadius: radius.xl + 4,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  logoInnerRing: {
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 88,
    height: 88,
  },
  eyebrow: {
    letterSpacing: 3.5,
    fontSize: 11,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: -0.4,
    lineHeight: 30,
    marginBottom: spacing.md,
  },
  tagline: {
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  track: {
    width: PROGRESS_BAR_W,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
  },
  footerHint: {
    marginTop: spacing.md,
    letterSpacing: 0.2,
  },
});

export default SplashScreen;
