import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  Pressable,
  Platform,
  StatusBar,
  ScrollView,
  ImageBackground,
  Animated,
  Easing,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Share,
  TouchableOpacity,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import { typography, moderateScale } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { useNavigation, useFocusEffect, useRoute, useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchAdminMedia } from '../../../redux/slice/mediaSlice';
import SkeletonPulse from '../../../components/SkeletonPulse';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');
const REEL_HEIGHT = height - (Platform.OS === 'ios' ? 90 : 80);

const isVideoMedia = (item: any) => {
  if (item?.media_type === 'video') return true;
  const url = item?.media_url || item?.image || '';
  return /\.(mp4|mov|mkv|webm|avi|m3u8)(\?.*)?$/i.test(url);
};

const CATEGORIES = [
  { id: '1', name: 'Software', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=200' },
  { id: '2', name: 'Design', img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=200' },
  { id: '3', name: 'Marketing', img: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=200' },
  { id: '4', name: 'Sales', img: 'https://images.unsplash.com/photo-1552581234-261207845094?q=80&w=200' },
  { id: '5', name: 'Finance', img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=200' },
];

const THREADS_DATA = [
  {
    id: 't1',
    user: 'Priya Verma',
    handle: '@rahul_tech',
    avatar: 'https://i.pravatar.cc/150?u=rahul',
    content: 'Just had an amazing interview at Google! The process was tough but very rewarding. 🚀 #InterviewTips #GoogleJobs',
    time: '2h',
    replies: 12,
    likes: 156,
  },
  {
    id: 't2',
    user: 'Rahul Sharma',
    handle: '@priya_ux',
    avatar: 'https://i.pravatar.cc/150?u=priya',
    content: 'UI/UX Designers! Portfolio is more important than your degree. Focus on case studies. 🎨✨',
    time: '4h',
    replies: 45,
    likes: 890,
  }
];

const VIDEOS_DATA = [
  {
    id: 'v1',
    title: 'How to crack Product Management roles in 2024',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000',
    channel: 'JobIndia Academy',
    views: '1.2M views',
    time: '2 days ago',
    duration: '12:45',
  },
  {
    id: 'v2',
    title: 'A day in the life of a Software Engineer at Microsoft',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000',
    channel: 'TechVlogs',
    views: '850K views',
    time: '1 week ago',
    duration: '08:20',
  }
];

const RotatingBorder = ({ colors }: any) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.absoluteLoader,
        {
          transform: [{ rotate: spin }],
          borderTopColor: colors.primary,
          borderRightColor: colors.primary,
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
        },
      ]}
    />
  );
};

const ShimmerLoader: React.FC<{ style?: any }> = ({ style }) => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          backgroundColor: colors.surfaceHighlight,
          opacity,
        },
      ]}
    />
  );
};

interface ReelItemProps {
  item: any;
  index: number;
  isActive: boolean;
  isPaused: boolean;
  isFocused: boolean;
  onTogglePause: () => void;
  onGoBack: () => void;
  insetsBottom: number;
}

const ReelItem = React.memo<ReelItemProps>(
  ({
    item,
    index,
    isActive,
    isPaused,
    isFocused,
    onTogglePause,
    onGoBack,
    insetsBottom,
  }) => {
    const isVideo = isVideoMedia(item);
    const mediaUri = item.media_url || item.image;
    const thumbnailUri = item.thumbnail || item.poster || item.thumbnail_url;
    const videoSource = useMemo(() => ({ uri: mediaUri }), [mediaUri]);

    return (
      <View style={[styles.fullReel, { height }]}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {isVideo ? (
            isActive && isFocused ? (
              <Video
                source={videoSource}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                useTextureView={true}
                shutterColor="transparent"
                repeat={true}
                paused={isPaused}
                muted={false}
                disableFocus={true}
                playInBackground={false}
                playWhenInactive={false}
                ignoreSilentSwitch="ignore"
                poster={thumbnailUri}
                posterResizeMode="cover"
              />
            ) : (
              <Image
                source={{ uri: thumbnailUri || mediaUri }}
                style={styles.fullImage}
                resizeMode="cover"
              />
            )
          ) : (
            <Image
              source={{ uri: thumbnailUri || mediaUri }}
              style={styles.fullImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.gradientOverlay} />
        </View>

        {/* Tap area on video to toggle Play / Pause */}
        <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={onTogglePause}
        />

        {/* Play/Pause indicator on tap */}
        {isVideo && isPaused && (
          <View style={styles.playPauseOverlay} pointerEvents="none">
            <View style={styles.playPauseCircle}>
              <Icon name="play" size={38} color="#fff" />
            </View>
          </View>
        )}

        <View style={styles.reelContent} pointerEvents="box-none">
          <View style={styles.topActions} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.glassBtn}
              onPress={onGoBack}
              activeOpacity={0.7}
            >
              <Icon name="chevron-left" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={[styles.bottomDetails, { bottom: 40 + insetsBottom }]} pointerEvents="box-none">
            <View style={styles.companyRow}>
              <Text style={styles.companyName}>{item.employer?.company?.company_name || 'JobIndia Partner'}</Text>
              {(item.employer?.company?.verification_status === 'approved' || item.employer?.verification_status === 'approved') && (
                <Icon name="check-decagram" size={16} color="#3B82F6" style={{ marginLeft: 6 }} />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  },
  (prev, next) => (
    prev.isActive === next.isActive &&
    prev.isPaused === next.isPaused &&
    prev.isFocused === next.isFocused &&
    prev.item?.id === next.item?.id &&
    prev.insetsBottom === next.insetsBottom
  )
);

// ─── Instagram-style Story Viewer ───────────────────────────────────────────
const STORY_DURATION = 5000; // ms per story

const StoryViewer: React.FC<{
  stories: any[];
  startIndex: number;
  onClose: () => void;
}> = ({ stories, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const progressAnims = useRef(stories.map(() => new Animated.Value(0))).current;
  const progressRef = useRef<Animated.CompositeAnimation | null>(null);

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  }, [currentIndex]);

  // Reset & animate progress bar for current story
  useEffect(() => {
    // Reset all bars
    progressAnims.forEach((anim, i) => {
      anim.setValue(i < currentIndex ? 1 : 0);
    });
    // Animate current bar
    progressRef.current?.stop();
    const anim = Animated.timing(progressAnims[currentIndex], {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });
    progressRef.current = anim;
    anim.start(({ finished }) => {
      if (finished) goNext();
    });
    return () => progressRef.current?.stop();
  }, [currentIndex]);

  const story = stories[currentIndex];
  const mediaUri = story?.media_url || story?.image || story?.thumbnail;
  const isVideo = isVideoMedia(story);
  const label = story?.title && !story.title.includes('.mp4') && !story.title.includes('.jpg')
    ? story.title
    : (story?.employer?.company?.company_name || story?.category?.name || 'Story');

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Media */}
        {isVideo ? (
          <Video
            source={{ uri: mediaUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            paused={false}
            muted={false}
            repeat={false}
            onEnd={goNext}
          />
        ) : (
          <Image
            source={{ uri: mediaUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}

        {/* Dark top gradient */}
        <View style={storyStyles.topGradient} />

        {/* Progress bars */}
        <View style={storyStyles.progressRow}>
          {stories.map((_, i) => (
            <View key={i} style={storyStyles.progressTrack}>
              <Animated.View
                style={[
                  storyStyles.progressFill,
                  {
                    width: progressAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header: label + close */}
        <View style={storyStyles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={storyStyles.avatarRing}>
              <Image
                source={{ uri: story?.thumbnail || story?.employer?.company?.logo || mediaUri }}
                style={storyStyles.avatar}
              />
            </View>
            <Text style={storyStyles.label} numberOfLines={1}>{label}</Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Icon name="close" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tap zones: left = prev, right = next */}
        <View style={storyStyles.tapZones} pointerEvents="box-none">
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={goPrev} />
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={goNext} />
        </View>
      </View>
    </Modal>
  );
};

const storyStyles = StyleSheet.create({
  topGradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: moderateScale(160),
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  progressRow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 36,
    left: moderateScale(12), right: moderateScale(12),
    flexDirection: 'row',
    gap: moderateScale(4),
  },
  progressTrack: {
    flex: 1,
    height: moderateScale(2.5),
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: moderateScale(2),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: moderateScale(2),
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 66 : 50,
    left: moderateScale(12), right: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarRing: {
    width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(18),
    borderWidth: 2, borderColor: '#fff',
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  label: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontWeight: '700',
    maxWidth: moderateScale(220),
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    top: moderateScale(120),
  },
});
// ─────────────────────────────────────────────────────────────────────────────

const TrendingReelCard = React.memo<{
  reel: any;
  onPress: (id: string | number) => void;
}>(
  ({ reel, onPress }) => {
    const isVideo = isVideoMedia(reel);
    const mediaUri = reel.media_url || reel.image;
    const thumbnailUri = reel.thumbnail || reel.poster || reel.thumbnail_url || (!isVideo ? mediaUri : null);
    // Safe to use a single paused <Video> here — only 1 card is ever shown in the grid.
    // The hardware decoder conflict only occurs with MULTIPLE concurrent Video instances.
    const videoSource = useMemo(() => ({ uri: mediaUri }), [mediaUri]);

    return (
      <TouchableOpacity
        style={styles.reelCard}
        activeOpacity={0.85}
        onPress={() => onPress(reel.id)}
      >
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {thumbnailUri ? (
            <Image
              source={{ uri: thumbnailUri }}
              style={styles.reelThumb}
              resizeMode="cover"
            />
          ) : isVideo ? (
            // Single paused video — shows the first frame as a live preview thumbnail.
            // Only 1 instance ever exists in the grid so no surface-sharing issue.
            <Video
              source={videoSource}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              paused={true}
              muted={true}
              repeat={false}
              disableFocus={true}
              playInBackground={false}
              playWhenInactive={false}
            />
          ) : (
            <Image
              source={{ uri: mediaUri }}
              style={styles.reelThumb}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Centered play icon overlay */}
        {isVideo && (
          <View style={styles.centerPlayIcon} pointerEvents="none">
            <View style={styles.playCircle}>
              <Icon name="play" size={28} color="#fff" style={{ marginLeft: 3 }} />
            </View>
          </View>
        )}

        <View style={styles.reelOverlay} pointerEvents="none">
          <Text style={styles.reelTitle} numberOfLines={1}>
            {reel.title && !reel.title.includes('.jpg') && !reel.title.includes('.jpeg') && !reel.title.includes('.mp4')
              ? reel.title
              : (reel.category?.name || 'Job')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.reelCompany, { flexShrink: 1 }]} numberOfLines={1}>
              {reel.employer?.company?.company_name || 'JobIndia'}
            </Text>
            {(reel.employer?.company?.verification_status === 'approved' || reel.employer?.verification_status === 'approved') && (
              <Icon name="check-circle" size={12} color="#3B82F6" style={{ marginLeft: 4 }} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) =>
    prev.reel?.id === next.reel?.id &&
    prev.reel?.thumbnail === next.reel?.thumbnail &&
    prev.reel?.media_url === next.reel?.media_url
);

const JobsReelsScreen: React.FC = () => {
  const { colors, mode, isDark } = useTheme();
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const fromScreen = route.params?.from || 'Profile';
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<'grid' | 'full'>('grid');
  const [loading, setLoading] = useState(true);
  
  const dispatch = useDispatch<AppDispatch>();
  const { reels, loading: apiLoading } = useSelector((state: RootState) => state.media);

  useEffect(() => {
    dispatch(fetchAdminMedia({ media_section: 'reel', limit: 20 }));
  }, [dispatch]);

  useEffect(() => {
    if (!apiLoading) {
      setLoading(false);
    }
  }, [apiLoading]);
  
  // Separate status and reel media
  const statusList = useMemo(() => {
    return (reels || []).filter((item: any) => item.reel_status === 'status');
  }, [reels]);

  const reelsList = useMemo(() => {
    return (reels || []).filter((item: any) => item.reel_status !== 'status');
  }, [reels]);

  const [activeType, setActiveType] = useState<'reel' | 'status'>('reel');
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [storyStartIndex, setStoryStartIndex] = useState(0);

  const currentFullList = useMemo(() => {
    return activeType === 'status' ? statusList : reelsList;
  }, [activeType, statusList, reelsList]);

  useEffect(() => {
    if (route.params?.isFullScreen !== (viewMode === 'full')) {
      navigation.setParams({ 
        isFullScreen: viewMode === 'full' 
      });
    }
  }, [viewMode, navigation, route.params?.isFullScreen]);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        if (viewMode === 'full') {
          setViewMode('grid');
          return true;
        }
        const parentNav = navigation.getParent();
        if (parentNav) {
          parentNav.navigate(fromScreen);
          return true;
        }
        return false;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }, [viewMode, navigation, fromScreen])
  );

  const flatListRef = useRef<FlatList>(null);

  const handlePress = useCallback((id: string | number, type: 'reel' | 'status' = 'reel') => {
    if (type === 'status') {
      // Open Instagram-style story viewer instead of full-screen reel
      const idx = statusList.findIndex((r: any) => String(r.id) === String(id));
      setStoryStartIndex(Math.max(0, idx));
      setStoryViewerVisible(true);
      return;
    }
    setActiveType(type);
    setActiveReelId(String(id));
    const list = reelsList;
    const idx = list.findIndex((r: any) => String(r.id) === String(id));
    if (idx !== -1) {
      setCurrentVisibleIndex(idx);
    }
    setIsPaused(false);
    setViewMode('full');
  }, [statusList, reelsList]);

  const handleTogglePause = useCallback(() => {
    setIsPaused(p => !p);
  }, []);

  const handleGoBack = useCallback(() => {
    setIsPaused(false);
    setViewMode('grid');
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setCurrentVisibleIndex(idx);
      setActiveReelId(String(viewableItems[0].item?.id));
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <ReelItem
        item={item}
        index={index}
        isActive={currentVisibleIndex === index}
        isPaused={isPaused}
        isFocused={isFocused && viewMode === 'full'}
        onTogglePause={handleTogglePause}
        onGoBack={handleGoBack}
        insetsBottom={insets.bottom}
      />
    ),
    [currentVisibleIndex, isPaused, isFocused, viewMode, handleTogglePause, handleGoBack, insets.bottom]
  );

  const renderSkeleton = () => (
    <View style={{ padding: 20 }}>
      <SkeletonPulse style={{ height: 100, borderRadius: 20, marginBottom: 20 }} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <SkeletonPulse style={{ flex: 1, height: 250, borderRadius: 20 }} />
        <SkeletonPulse style={{ flex: 1, height: 250, borderRadius: 20 }} />
      </View>
    </View>
  );

  if (viewMode === 'full') {
    const initialIndex = activeReelId
      ? Math.max(0, currentFullList.findIndex((r: any) => String(r.id) === String(activeReelId)))
      : 0;

    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar hidden />
        <FlatList
          ref={flatListRef}
          data={currentFullList}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialScrollIndex={initialIndex >= 0 && initialIndex < currentFullList.length ? initialIndex : 0}
          getItemLayout={(data, index) => ({ length: height, offset: height * index, index })}
          removeClippedSubviews={false}
          windowSize={5}
          maxToRenderPerBatch={3}
          initialNumToRender={currentFullList.length}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
            }, 50);
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Instagram-style Story Viewer */}
      {storyViewerVisible && statusList.length > 0 && (
        <StoryViewer
          stories={statusList}
          startIndex={storyStartIndex}
          onClose={() => setStoryViewerVisible(false)}
        />
      )}
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={() => {
                const parentNav = navigation.getParent();
                if (parentNav) {
                  parentNav.navigate(fromScreen);
                }
              }}
              style={{
                padding: 4,
              }}
            >
              <FeatherIcon name="arrow-left" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <View>
              <Text style={[typography.h2, { color: colors.textPrimary }]}>Job Bites</Text>
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {loading ? renderSkeleton() : (
            <>
              {/* Upper Section: Dynamic Status Stories */}
              {statusList.length > 0 && (
                <View style={{ marginBottom: 20 }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    {statusList.map((status: any) => (
                      <TouchableOpacity
                        key={status.id}
                        style={styles.catItem}
                        activeOpacity={0.8}
                        onPress={() => handlePress(status.id, 'status')}
                      >
                        <View style={[styles.catCircle, { borderColor: colors.primary }]}>
                          <Image
                            source={{ uri: status.thumbnail || status.media_url || status.image }}
                            style={styles.catImg}
                            resizeMode="cover"
                          />
                        </View>
                        <Text
                          style={[typography.tiny, { color: colors.textPrimary, marginTop: 4, fontWeight: 'bold', maxWidth: 70 }]}
                          numberOfLines={1}
                        >
                          {status.title && !status.title.includes('.jpg') && !status.title.includes('.jpeg') && !status.title.includes('.mp4')
                            ? status.title
                            : (status.category?.name || status.employer?.company?.company_name || 'Status')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Trending Bites — show 1 featured card; tap to open full reel player */}
              {reelsList.length > 0 && (
                <View style={styles.section}>
                  <Text style={[typography.h4, { color: colors.textPrimary, marginLeft: 20, marginBottom: 15 }]}>Trending Bites</Text>
                  {/* Only the FIRST reel is shown as a preview card */}
                  <View style={styles.reelGrid}>
                    <TrendingReelCard
                      reel={reelsList[0]}
                      onPress={(id) => handlePress(id, 'reel')}
                    />
                  </View>
                </View>
              )}

              {/* Community Threads */}
              <View style={styles.section}>
                <Text style={[typography.h4, { color: colors.textPrimary, marginLeft: 20, marginBottom: 15 }]}>Community</Text>
                <View style={styles.threadsContainer}>
                  {THREADS_DATA.map(thread => (
                    <View key={thread.id} style={[styles.threadCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Image source={{ uri: thread.avatar }} style={styles.threadAvatar} />
                      <View style={styles.threadContent}>
                        <View style={styles.threadHeader}>
                          <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: 'bold' }]}>{thread.user}</Text>
                          <Text style={[typography.tiny, { color: colors.textSecondary }]}>{thread.time}</Text>
                        </View>
                        <Text style={[typography.body, { color: colors.textPrimary, marginTop: 4 }]}>{thread.content}</Text>
                        <View style={styles.threadFooter}>
                          <View style={styles.threadAction}>
                            <Icon name="heart-outline" size={16} color={colors.textSecondary} />
                            <Text style={[typography.tiny, { color: colors.textSecondary, marginLeft: 4 }]}>{thread.likes}</Text>
                          </View>
                          <View style={styles.threadAction}>
                            <Icon name="comment-outline" size={16} color={colors.textSecondary} />
                            <Text style={[typography.tiny, { color: colors.textSecondary, marginLeft: 4 }]}>{thread.replies}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Videos Section */}
              <View style={styles.section}>
                <Text style={[typography.h4, { color: colors.textPrimary, marginLeft: 20, marginBottom: 15 }]}>Insights</Text>
                <View style={styles.videoList}>
                  {VIDEOS_DATA.map(video => (
                    <View key={video.id} style={[styles.videoCard, { backgroundColor: colors.surface }]}>
                      <Image source={{ uri: video.thumbnail }} style={styles.videoThumbLarge} />
                      <View style={styles.videoInfo}>
                        <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: 'bold' }]} numberOfLines={2}>{video.title}</Text>
                        <Text style={[typography.tiny, { color: colors.textSecondary, marginTop: 4 }]}>{video.channel} • {video.views}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(15),
  },
  headerIcon: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryScroll: { paddingHorizontal: moderateScale(20), gap: moderateScale(15), marginBottom: moderateScale(20) },
  catItem: { alignItems: 'center' },
  catCircle: {
    width: moderateScale(68),
    height: moderateScale(68),
    borderRadius: moderateScale(34),
    borderWidth: 2,
    padding: moderateScale(3),
  },
  catImg: { width: '100%', height: '100%', borderRadius: moderateScale(30) },
  section: { marginBottom: moderateScale(24) },
  reelGrid: {
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(16),
  },
  reelCard: {
    width: width - moderateScale(40),
    height: moderateScale(360),
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  reelThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a2e',
  },
  centerPlayIcon: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  reelOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: moderateScale(12),
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  reelTitle: { color: '#fff', fontSize: moderateScale(14), fontWeight: 'bold' },
  reelCompany: { color: 'rgba(255,255,255,0.8)', fontSize: moderateScale(11) },
  loadingOverlay: { backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  absoluteLoader: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: moderateScale(34),
    borderWidth: moderateScale(2),
  },
  threadsContainer: { paddingHorizontal: moderateScale(20), gap: moderateScale(15) },
  threadCard: {
    flexDirection: 'row',
    padding: moderateScale(15),
    borderRadius: radius.card,
    borderWidth: 1,
  },
  threadAvatar: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20) },
  threadContent: { flex: 1, marginLeft: moderateScale(12) },
  threadHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  threadFooter: { flexDirection: 'row', marginTop: moderateScale(12), gap: moderateScale(20) },
  threadAction: { flexDirection: 'row', alignItems: 'center' },
  videoList: { paddingHorizontal: moderateScale(20), gap: moderateScale(20) },
  videoCard: {
    borderRadius: radius.card,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  videoThumbLarge: { width: '100%', height: moderateScale(180), resizeMode: 'cover' },
  videoInfo: { padding: moderateScale(15) },
  fullReel: { width: width, height: height, backgroundColor: '#000' },
  fullImage: { ...StyleSheet.absoluteFillObject },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playPauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playPauseCircle: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(36),
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBadge: {
    position: 'absolute',
    top: moderateScale(10),
    right: moderateScale(10),
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelContent: { ...StyleSheet.absoluteFillObject, padding: moderateScale(20) },
  topActions: { marginTop: Platform.OS === 'ios' ? 40 : 10 },
  glassBtn: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomDetails: { position: 'absolute', left: moderateScale(20), right: moderateScale(20) },
  companyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: moderateScale(10) },
  companyName: { color: '#fff', fontSize: moderateScale(16), fontWeight: 'bold' },
  fullJobTitle: { color: '#fff', fontSize: moderateScale(26), fontWeight: 'bold', marginBottom: moderateScale(20) },
  mainApplyBtn: {
    height: moderateScale(54),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnLabel: { color: '#fff', fontSize: moderateScale(16), fontWeight: 'bold' },
});

export default JobsReelsScreen;
