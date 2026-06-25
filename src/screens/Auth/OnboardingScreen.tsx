import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

// If PrimaryButton doesn't exist at this path, use a fallback component
// import { PrimaryButton } from '../../components/auth';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    image: require('../../assets/onbg1.png'),
    title: 'Direct HR Connection',
    description: 'Connect directly with top companies and hiring managers. Say goodbye to middlemen and accelerate your career growth with direct communication.',
  },
  {
    id: '2',
    image: require('../../assets/onbg2.png'),
    title: 'Smart AI Matching',
    description: 'Our advanced AI analyzes your unique skills and experience to match you perfectly with the right job openings, saving you hours of searching.',
  },
  {
    id: '3',
    image: require('../../assets/onbg3.png'),
    title: 'Instant Status Alerts',
    description: 'Stay in the loop with real-time tracking. Get instantly notified the moment an employer views your profile or shortlists your application.',
  },
];

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

const OnboardingScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('Main');
    } catch (e) {
      console.log('Failed to save onboarding state', e);
      navigation.replace('Main');
    }
  };

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={completeOnboarding}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        data={SLIDES}
        renderItem={({ item, index }) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1, 0.8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <View style={[styles.slide, { width }]}>
              <Animated.View style={[styles.imageContainer, { transform: [{ scale }], opacity }]}>
                <LinearGradient
                  colors={[colors.primary + '20', colors.primary + '00']}
                  style={styles.imageBlob}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Image source={item.image} style={styles.image} resizeMode="contain" />
              </Animated.View>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                  {item.description}
                </Text>
              </View>
            </View>
          );
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View style={styles.footer}>
        <View style={styles.paginationContainer}>
          {SLIDES.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index.toString()}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity, backgroundColor: colors.primary },
                ]}
              />
            );
          })}
        </View>

        {/* Modern Gradient Button */}
        <TouchableOpacity 
          style={styles.buttonContainer}
          onPress={scrollToNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, '#1E40AF']} // A slightly darker shade of blue for the gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  skipText: {
    fontSize: 16,
    fontFamily: typography.body.fontFamily,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  imageContainer: {
    flex: 0.55,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.xl,
  },
  imageBlob: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    top: '15%',
  },
  image: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  textContainer: {
    flex: 0.45,
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontFamily: typography.appTitle.fontFamily,
    fontWeight: '800',
    marginBottom: spacing.lg,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    fontFamily: typography.body.fontFamily,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
  },
  buttonContainer: {
    height: 56,
    borderRadius: radius.lg,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    flex: 1,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: typography.labelLarge.fontFamily,
    letterSpacing: 0.5,
  },
});

export default OnboardingScreen;
