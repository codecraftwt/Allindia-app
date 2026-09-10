import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Video from 'react-native-video';
import { typography, moderateScale } from '../theme/typography';
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

const BannerVideo = ({ uri, poster, paused, onEnd }: { uri: string; poster?: string; paused: boolean; onEnd: () => void }) => {
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
      poster={poster}
      posterResizeMode="cover"
      useTextureView={true}
      shutterColor="transparent"
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
  onPress: (slide?: any) => void;
  media?: any[];
}

const HeroBanner: React.FC<HeroBannerProps> = ({ colors, onPress, media }) => {
  const isFocused = useIsFocused();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = useMemo(() => {
    if (media && media.length > 0) {
      return [...media].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
    }
    return HERO_SLIDES;
  }, [media]);
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
    if (!isFocused) {
      stopAutoScroll();
      return;
    }
    const currentSlide = slides[activeIndex];
    const isCurrentSlideVideo = currentSlide && currentSlide.media_type === 'video';

    if (isCurrentSlideVideo) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [activeIndex, slides.length, isFocused]);

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
      const posterUri = item.thumbnail || item.poster || item.thumbnail_url;
      return (
        <Pressable
          onPress={() => onPress(item)}
          style={[
            styles.slide,
            {
              width: CAROUSEL_WIDTH,
              height: moderateScale(150),
              padding: 0,
              backgroundColor: colors.surfaceHighlight,
              borderRadius: radius.md,
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
            },
          ]}>
          {isVideo && isFocused ? (
            <BannerVideo
              uri={item.media_url}
              poster={posterUri}
              paused={activeIndex !== index || !isFocused}
              onEnd={handleVideoEnd}
            />
          ) : (
            <Image
              source={{ uri: posterUri || item.media_url }}
              style={{ width: '100%', height: '100%', borderRadius: radius.md }}
              resizeMode="cover"
            />
          )}
        </Pressable>
      );
    }

    return (
      <Pressable
        onPress={() => onPress(item)}
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
            <Text style={[typography.sectionTitle, { color: colors.onPrimary, fontSize: moderateScale(16), lineHeight: moderateScale(22) }]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text
              style={[
                typography.small,
                {
                  color: colors.onPrimary,
                  opacity: 0.92,
                  marginTop: 6,
                  lineHeight: moderateScale(15),
                  fontSize: moderateScale(11),
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
              <Text style={[typography.labelMedium, { color: colors.primary, fontSize: moderateScale(11) }]}>{item.cta}</Text>
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
                width: activeIndex === index ? moderateScale(16) : 6,
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
    width: moderateScale(110),
    height: moderateScale(110),
    borderRadius: moderateScale(55),
  },
  heroInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: moderateScale(105),
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroCta: {
    alignSelf: 'flex-start',
    paddingVertical: moderateScale(5),
    paddingHorizontal: moderateScale(12),
    borderRadius: radius.button,
  },
  heroVisual: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bannerImage: {
    width: moderateScale(72),
    height: moderateScale(72),
    resizeMode: 'cover',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: moderateScale(8),
    right: moderateScale(12),
    gap: 4,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
});

export default HeroBanner;
