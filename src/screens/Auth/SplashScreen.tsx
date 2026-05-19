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
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const LOGO = require('../../assets/Job india Icon & logo file/Final logo Job india-02.png');
const SPLASH_DELAY_MS = 4000;
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

  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace('Main');
    }, SPLASH_DELAY_MS);
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
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
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
    width: 400,
    height: 400,
    top: -150,
    right: -120,
  },
  orbSecondary: {
    width: 300,
    height: 300,
    bottom: -100,
    left: -100,
  },
  orbAccent: {
    width: 180,
    height: 180,
    top: '35%',
    left: -80,
  },
  horizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '22%',
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
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 280,
    height: 280,
  },
  eyebrow: {
    letterSpacing: 4,
    fontSize: 10,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  title: {
    textAlign: 'center',
    fontSize: 26,
    letterSpacing: -0.5,
    lineHeight: 32,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  tagline: {
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xxl,
    alignItems: 'center',
  },
  track: {
    width: PROGRESS_BAR_W,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  trackFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  footerHint: {
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
});

export default SplashScreen;
