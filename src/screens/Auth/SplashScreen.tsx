import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const LOGO = require('../../assets/Job india Icon & logo file/Final logo Job india-02.png');
const SPLASH_DELAY_MS = 4000;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Word cloud: staggered positions for natural scattered look
const LANGUAGE_WORDS = [
  // y ~0.01
  { text: 'नौकरी', x: 0.03, y: 0.01, size: 18, opacity: 0.22 },
  { text: 'Job', x: 0.32, y: 0.02, size: 20, opacity: 0.18 },
  { text: 'ਨੌਕਰੀ', x: 0.54, y: 0.01, size: 18, opacity: 0.20 },
  { text: 'કામ', x: 0.84, y: 0.02, size: 20, opacity: 0.22 },
  // y ~0.05
  { text: 'रोजगार', x: 0.0, y: 0.05, size: 20, opacity: 0.25 },
  { text: 'ಕೆಲಸ', x: 0.26, y: 0.06, size: 22, opacity: 0.28 },
  { text: 'Job', x: 0.50, y: 0.05, size: 24, opacity: 0.20 },
  { text: 'નોકરી', x: 0.70, y: 0.06, size: 18, opacity: 0.22 },
  // y ~0.09
  { text: 'Job', x: 0.04, y: 0.09, size: 26, opacity: 0.18 },
  { text: 'नोकरी', x: 0.20, y: 0.10, size: 20, opacity: 0.28 },
  { text: 'ਰੋਜ਼ਗਾਰ', x: 0.44, y: 0.09, size: 18, opacity: 0.24 },
  { text: 'काम', x: 0.68, y: 0.10, size: 22, opacity: 0.20 },
  { text: 'ಉದ್ಯೋಗ', x: 0.82, y: 0.09, size: 16, opacity: 0.22 },
  // y ~0.13
  { text: 'ભરતી', x: 0.0, y: 0.13, size: 20, opacity: 0.22 },
  { text: 'काम', x: 0.22, y: 0.14, size: 24, opacity: 0.25 },
  { text: 'Job', x: 0.44, y: 0.13, size: 18, opacity: 0.16 },
  { text: 'नौकरी', x: 0.60, y: 0.14, size: 20, opacity: 0.22 },
  { text: 'ਨੌਕਰੀ', x: 0.82, y: 0.13, size: 18, opacity: 0.20 },
  // y ~0.17
  { text: 'ನೇಮಕ', x: 0.06, y: 0.17, size: 22, opacity: 0.26 },
  { text: 'રોજગાર', x: 0.32, y: 0.18, size: 16, opacity: 0.20 },
  { text: 'भर्ती', x: 0.56, y: 0.17, size: 26, opacity: 0.22 },
  { text: 'ಕೆಲಸ', x: 0.78, y: 0.18, size: 20, opacity: 0.24 },
  // y ~0.21
  { text: 'व्यवसाय', x: 0.0, y: 0.21, size: 20, opacity: 0.24 },
  { text: 'ਭਰਤੀ', x: 0.26, y: 0.22, size: 18, opacity: 0.20 },
  { text: 'Job', x: 0.48, y: 0.21, size: 22, opacity: 0.18 },
  { text: 'નોકરી', x: 0.66, y: 0.22, size: 20, opacity: 0.22 },
  { text: 'काम', x: 0.88, y: 0.21, size: 18, opacity: 0.20 },
  // y ~0.25
  { text: 'Job', x: 0.04, y: 0.25, size: 22, opacity: 0.18 },
  { text: 'नोकरी', x: 0.22, y: 0.26, size: 18, opacity: 0.25 },
  { text: 'ਕੰਮ', x: 0.44, y: 0.25, size: 24, opacity: 0.22 },
  { text: 'रोजगार', x: 0.64, y: 0.26, size: 18, opacity: 0.20 },
  { text: 'ಉದ್ಯೋಗ', x: 0.84, y: 0.25, size: 16, opacity: 0.18 },
  // y ~0.29
  { text: 'ಕೆಲಸ', x: 0.0, y: 0.29, size: 20, opacity: 0.22 },
  { text: 'કામ', x: 0.18, y: 0.30, size: 22, opacity: 0.25 },
  { text: 'भर्ती', x: 0.38, y: 0.29, size: 20, opacity: 0.20 },
  { text: 'Job', x: 0.58, y: 0.30, size: 18, opacity: 0.18 },
  { text: 'ਨੌਕਰੀ', x: 0.76, y: 0.29, size: 20, opacity: 0.22 },
  // y ~0.33
  { text: 'नौकरी', x: 0.02, y: 0.33, size: 18, opacity: 0.18 },
  { text: 'રોજગાર', x: 0.24, y: 0.34, size: 16, opacity: 0.16 },
  { text: 'ಉದ್ಯೋಗ', x: 0.46, y: 0.33, size: 18, opacity: 0.16 },
  { text: 'काम', x: 0.70, y: 0.34, size: 20, opacity: 0.18 },
  { text: 'Job', x: 0.90, y: 0.33, size: 16, opacity: 0.15 },
  // y ~0.37 — near logo
  { text: 'ਰੋਜ਼ਗਾਰ', x: 0.0, y: 0.37, size: 16, opacity: 0.14 },
  { text: 'નોકરી', x: 0.82, y: 0.37, size: 16, opacity: 0.15 },
  // y ~0.41
  { text: 'Job', x: 0.0, y: 0.41, size: 18, opacity: 0.14 },
  { text: 'काम', x: 0.88, y: 0.41, size: 18, opacity: 0.15 },
  // y ~0.45
  { text: 'नोकरी', x: 0.0, y: 0.45, size: 16, opacity: 0.14 },
  { text: 'ಕೆಲಸ', x: 0.86, y: 0.45, size: 16, opacity: 0.14 },
  // y ~0.49
  { text: 'ਕੰਮ', x: 0.0, y: 0.49, size: 18, opacity: 0.14 },
  { text: 'Job', x: 0.90, y: 0.49, size: 16, opacity: 0.13 },
  // y ~0.53
  { text: 'રોજી', x: 0.0, y: 0.53, size: 16, opacity: 0.13 },
  { text: 'नौकरी', x: 0.84, y: 0.53, size: 16, opacity: 0.14 },
  // y ~0.58
  { text: 'ਰੋਜ਼ਗਾਰ', x: 0.02, y: 0.58, size: 20, opacity: 0.24 },
  { text: 'Job', x: 0.24, y: 0.59, size: 24, opacity: 0.20 },
  { text: 'नोकरी', x: 0.44, y: 0.58, size: 22, opacity: 0.26 },
  { text: 'ಉದ್ಯೋಗ', x: 0.68, y: 0.59, size: 18, opacity: 0.22 },
  { text: 'કામ', x: 0.88, y: 0.58, size: 20, opacity: 0.20 },
  // y ~0.62
  { text: 'નોકરી', x: 0.0, y: 0.62, size: 18, opacity: 0.22 },
  { text: 'भरती', x: 0.20, y: 0.63, size: 20, opacity: 0.25 },
  { text: 'ಕೆಲಸ', x: 0.42, y: 0.62, size: 22, opacity: 0.22 },
  { text: 'Job', x: 0.62, y: 0.63, size: 20, opacity: 0.18 },
  { text: 'રોજગાર', x: 0.78, y: 0.62, size: 16, opacity: 0.20 },
  // y ~0.66
  { text: 'काम', x: 0.04, y: 0.66, size: 24, opacity: 0.22 },
  { text: 'ਕੰਮ', x: 0.22, y: 0.67, size: 20, opacity: 0.24 },
  { text: 'नोकरी', x: 0.42, y: 0.66, size: 18, opacity: 0.22 },
  { text: 'ಕೆಲಸ', x: 0.64, y: 0.67, size: 22, opacity: 0.20 },
  { text: 'Job', x: 0.84, y: 0.66, size: 18, opacity: 0.18 },
  // y ~0.70
  { text: 'रोजगार', x: 0.0, y: 0.70, size: 18, opacity: 0.22 },
  { text: 'ਨੌਕਰੀ', x: 0.22, y: 0.71, size: 20, opacity: 0.25 },
  { text: 'Job', x: 0.44, y: 0.70, size: 22, opacity: 0.18 },
  { text: 'રોજી', x: 0.64, y: 0.71, size: 18, opacity: 0.22 },
  { text: 'काम', x: 0.82, y: 0.70, size: 20, opacity: 0.20 },
  // y ~0.74
  { text: 'ಉದ್ಯೋಗ', x: 0.04, y: 0.74, size: 20, opacity: 0.24 },
  { text: 'नौकरी', x: 0.28, y: 0.75, size: 18, opacity: 0.20 },
  { text: 'નોકરી', x: 0.48, y: 0.74, size: 20, opacity: 0.25 },
  { text: 'भर्ती', x: 0.70, y: 0.75, size: 22, opacity: 0.22 },
  { text: 'ਰੋਜ਼ਗਾਰ', x: 0.86, y: 0.74, size: 14, opacity: 0.18 },
  // y ~0.78
  { text: 'Job', x: 0.0, y: 0.78, size: 20, opacity: 0.18 },
  { text: 'ಕೆಲಸ', x: 0.16, y: 0.79, size: 18, opacity: 0.20 },
  { text: 'काम', x: 0.36, y: 0.78, size: 22, opacity: 0.22 },
  { text: 'નોકરી', x: 0.56, y: 0.79, size: 18, opacity: 0.20 },
  { text: 'ਕੰਮ', x: 0.76, y: 0.78, size: 20, opacity: 0.22 },
  // y ~0.82
  { text: 'नोकरी', x: 0.02, y: 0.82, size: 18, opacity: 0.20 },
  { text: 'Job', x: 0.24, y: 0.83, size: 16, opacity: 0.16 },
  { text: 'ਨੌਕਰੀ', x: 0.40, y: 0.82, size: 20, opacity: 0.22 },
  { text: 'रोजगार', x: 0.62, y: 0.83, size: 16, opacity: 0.18 },
  { text: 'ಉದ್ಯೋಗ', x: 0.82, y: 0.82, size: 16, opacity: 0.18 },
  // y ~0.86
  { text: 'भर्ती', x: 0.0, y: 0.86, size: 20, opacity: 0.20 },
  { text: 'રોજી', x: 0.18, y: 0.87, size: 18, opacity: 0.18 },
  { text: 'Job', x: 0.38, y: 0.86, size: 22, opacity: 0.16 },
  { text: 'काम', x: 0.56, y: 0.87, size: 18, opacity: 0.18 },
  { text: 'ಕೆಲಸ', x: 0.74, y: 0.86, size: 20, opacity: 0.20 },
  // y ~0.90
  { text: 'ਕੰਮ', x: 0.04, y: 0.90, size: 18, opacity: 0.18 },
  { text: 'नौकरी', x: 0.22, y: 0.91, size: 16, opacity: 0.16 },
  { text: 'ಉದ್ಯೋಗ', x: 0.42, y: 0.90, size: 18, opacity: 0.18 },
  { text: 'Job', x: 0.66, y: 0.91, size: 20, opacity: 0.16 },
  { text: 'નોકરી', x: 0.84, y: 0.90, size: 16, opacity: 0.16 },
  // y ~0.94
  { text: 'Job', x: 0.0, y: 0.94, size: 16, opacity: 0.14 },
  { text: 'રોજગાર', x: 0.14, y: 0.95, size: 14, opacity: 0.14 },
  { text: 'काम', x: 0.38, y: 0.94, size: 16, opacity: 0.14 },
  { text: 'ਨੌਕਰੀ', x: 0.56, y: 0.95, size: 16, opacity: 0.14 },
  { text: 'ಕೆಲಸ', x: 0.78, y: 0.94, size: 14, opacity: 0.12 },
];


type Props = StackScreenProps<AuthStackParamList, 'Splash'>;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();

  // Logo animations
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;

  // Tagline animations
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(20)).current;

  // Word cloud animations — each word fades in independently
  const wordAnims = useRef(
    LANGUAGE_WORDS.map(() => new Animated.Value(0))
  ).current;

  // Progress bar
  const progress = useRef(new Animated.Value(0)).current;
  const PROGRESS_BAR_W = 200;
  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, PROGRESS_BAR_W],
  });

  useEffect(() => {
    // 1. Fade in all words — 25ms stagger for smooth cascade within ~2.5s
    const wordFadeIns = wordAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: i * 25,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );

    // 2. Logo entrance
    const logoEntrance = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
    ]);

    // 3. Tagline entrance
    const taglineEntrance = Animated.parallel([
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(taglineY, {
        toValue: 0,
        friction: 9,
        tension: 70,
        useNativeDriver: true,
      }),
    ]);

    // All words start immediately, logo at 200ms, tagline right after
    Animated.parallel(wordFadeIns).start();

    Animated.sequence([
      Animated.delay(200),
      logoEntrance,
      Animated.delay(100),
      taglineEntrance,
    ]).start();

    // Progress bar
    Animated.timing(progress, {
      toValue: 1,
      duration: SPLASH_DELAY_MS - 500,
      delay: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace('Main');
    }, SPLASH_DELAY_MS);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Word Cloud Background */}
      <View style={StyleSheet.absoluteFill}>
        {LANGUAGE_WORDS.map((word, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.langWord,
              {
                left: word.x * SCREEN_W,
                top: word.y * SCREEN_H,
                fontSize: word.size,
                opacity: wordAnims[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, word.opacity],
                }),
                transform: [{
                  scale: wordAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                  }),
                }],
              },
            ]}
          >
            {word.text}
          </Animated.Text>
        ))}
      </View>

      {/* Center Content */}
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.centerContent}>
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </Animated.View>

          {/* Tagline */}
          <Animated.View
            style={[
              styles.taglineContainer,
              {
                opacity: taglineOpacity,
                transform: [{ translateY: taglineY }],
              },
            ]}
          >
            <Text style={styles.taglineText}>FIND JOBS FASTER WITH AI</Text>
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.track}>
            <Animated.View
              style={[
                styles.trackFill,
                { width: barWidth },
              ]}
            />
          </View>
          <Text style={styles.footerHint}>Preparing your experience</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a3a6b',
  },
  safe: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langWord: {
    position: 'absolute',
    color: '#ffffff',
    fontWeight: '700',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 15,
  },
  logo: {
    width: 260,
    height: 100,
  },
  taglineContainer: {
    marginTop: 16,
    backgroundColor: '#2d4a7c',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  taglineText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  track: {
    width: 200,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  trackFill: {
    height: '100%',
    borderRadius: 1.5,
    backgroundColor: '#f59e0b',
  },
  footerHint: {
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },
});

export default SplashScreen;
