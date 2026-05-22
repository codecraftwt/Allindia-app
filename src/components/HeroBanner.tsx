import React, { useState, useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Video from 'react-native-video';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { components } from '../theme/components';
import type { ThemeColors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_WIDTH = SCREEN_WIDTH - spacing.md * 2;

interface SlideData {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  image: string;
  cta: string;
  color?: string;
}

const HERO_SLIDES: SlideData[] = [
  {
    id: '1',
    title: 'See how you can find a job quick',
    subtitle: 'Discover roles that match your skills and apply in minutes.',
    icon: 'briefcase',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=500&auto=format&fit=crop',
    cta: 'Read more',
  },
  {
    id: '2',
    title: 'Refer & Earn Rewards!',
    subtitle: 'Invite your friends to JobIndia and get exciting rewards on every hire.',
    icon: 'gift',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=500&auto=format&fit=crop',
    cta: 'Refer now',
  },
  {
    id: '3',
    title: 'Complete Your Profile',
    subtitle: 'Users with 100% complete profiles are 3x more likely to get hired.',
    icon: 'user-circle',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=500&auto=format&fit=crop',
    cta: 'Update now',
  },
  {
    id: '4',
    title: 'Nearby Opportunities',
    subtitle: 'Explore the best job openings right in your local area.',
    icon: 'map-marker',
    image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=500&auto=format&fit=crop',
    cta: 'Explore',
  },
];

const BannerVideo = ({ uri, paused, onEnd }: { uri: string; paused: boolean; onEnd: () => void }) => {
  const videoRef = useRef<any>(null);
  const prevPaused = useRef(paused);

  useEffect(() => {
    if (prevPaused.current && !paused) {
      videoRef.current?.seek(0);
    }
    prevPaused.current = paused;
  }, [paused]);

  return (
    <Video
      ref={videoRef}
      source={{ uri }}
      style={{ width: '100%', height: '100%' }}
      resizeMode="cover"
      muted={true}
      repeat={false}
      paused={paused}
      onEnd={onEnd}
      playInBackground={false}
      playWhenInactive={false}
      disableFocus={true}
    />
  );
};

interface HeroBannerProps {
  colors: ThemeColors;
  onPress: () => void;
  media?: any[];
}

const HeroBanner: React.FC<HeroBannerProps> = ({ colors, onPress, media }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  const slides = media && media.length > 0 ? media : HERO_SLIDES;
  const isApiMedia = media && media.length > 0;

  const handleVideoEnd = () => {
    const nextIndex = (activeIndex + 1) % slides.length;
    flatListRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
    setActiveIndex(nextIndex);
  };

  const startAutoScroll = () => {
    stopAutoScroll();
    autoScrollTimer.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3000);
  };

  const stopAutoScroll = () => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }
  };

  useEffect(() => {
    const currentSlide = slides[activeIndex];
    const isCurrentSlideVideo = currentSlide && currentSlide.media_type === 'video';

    if (isCurrentSlideVideo) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [activeIndex, slides.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / CAROUSEL_WIDTH);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (isApiMedia) {
      const isVideo = item.media_type === 'video';
      return (
        <Pressable
          onPress={onPress}
          style={[
            styles.slide,
            {
              width: CAROUSEL_WIDTH,
              height: 120,
              padding: 0,
              backgroundColor: colors.surfaceHighlight,
              borderRadius: radius.md,
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
            },
          ]}>
          {isVideo ? (
            <BannerVideo
              uri={item.media_url}
              paused={activeIndex !== index}
              onEnd={handleVideoEnd}
            />
          ) : (
            <Image
              source={{ uri: item.media_url }}
              style={{ width: '100%', height: '100%', borderRadius: radius.md }}
              resizeMode="cover"
            />
          )}
        </Pressable>
      );
    }

    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.slide,
          {
            width: CAROUSEL_WIDTH,
            backgroundColor: colors.primary,
          },
        ]}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View
            style={[
              styles.heroBlob,
              { backgroundColor: colors.onPrimary, opacity: 0.12, top: -24, right: -32 },
            ]}
          />
          <View
            style={[
              styles.heroBlob,
              { backgroundColor: colors.onPrimary, opacity: 0.08, bottom: -28, left: -16 },
            ]}
          />
        </View>
        <View style={styles.heroInner}>
          <View style={styles.heroCopy}>
            <Text style={[typography.sectionTitle, { color: colors.onPrimary, fontSize: 18, lineHeight: 24 }]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text
              style={[
                typography.small,
                {
                  color: colors.onPrimary,
                  opacity: 0.92,
                  marginTop: 6,
                  lineHeight: 16,
                },
              ]}
              numberOfLines={2}>
              {item.subtitle}
            </Text>
            <View
              style={[
                styles.heroCta,
                {
                  backgroundColor: colors.onPrimary,
                  marginTop: spacing.md,
                },
              ]}>
              <Text style={[typography.labelMedium, { color: colors.primary }]}>{item.cta}</Text>
            </View>
          </View>
          <View style={styles.heroVisual}>
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: colors.onPrimary,
                  opacity: 0.2,
                  borderRadius: radius.sm,
                },
              ]}
            />
            <Image source={{ uri: item.image }} style={styles.bannerImage} />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { shadowColor: colors.primaryDark }]}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => (item.id || item.created_at).toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        onScrollBeginDrag={stopAutoScroll}
        onScrollEndDrag={startAutoScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: CAROUSEL_WIDTH,
          offset: CAROUSEL_WIDTH * index,
          index,
        })}
      />
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: isApiMedia ? '#ffffff' : colors.onPrimary,
                opacity: activeIndex === index ? 1 : 0.4,
                width: activeIndex === index ? 16 : 6,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1,
                elevation: 1,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    marginTop: 8,
    overflow: 'hidden',
  },
  slide: {
    padding: spacing.sm,
    overflow: 'hidden',
  },
  heroBlob: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  heroInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 110,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroCta: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.button,
  },
  heroVisual: {
    width: 76,
    height: 76,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bannerImage: {
    width: 76,
    height: 76,
    resizeMode: 'cover',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 8,
    right: 12,
    gap: 4,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
});

export default HeroBanner;
