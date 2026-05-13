import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchAdminMedia } from '../../../redux/slice/mediaSlice';
import SkeletonPulse from '../../../components/SkeletonPulse';

const { width, height } = Dimensions.get('window');
const REEL_HEIGHT = height - (Platform.OS === 'ios' ? 90 : 80);

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
    user: 'Rahul Sharma',
    handle: '@rahul_tech',
    avatar: 'https://i.pravatar.cc/150?u=rahul',
    content: 'Just had an amazing interview at Google! The process was tough but very rewarding. 🚀 #InterviewTips #GoogleJobs',
    time: '2h',
    replies: 12,
    likes: 156,
  },
  {
    id: 't2',
    user: 'Priya Verma',
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

const JobsReelsScreen: React.FC = () => {
  const { colors, mode, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<'grid' | 'full'>('grid');
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
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
  
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [activeReelId, setActiveReelId] = useState<string | null>(null);

  useEffect(() => {
    navigation.setParams({ 
      isFullScreen: viewMode === 'full' 
    });
  }, [viewMode, navigation]);

  useEffect(() => {
    const backAction = () => {
      if (viewMode === 'full') {
        setViewMode('grid');
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [viewMode]);

  const handlePress = (id: string) => {
    setLoadingId(id);
    setActiveReelId(id);
    setTimeout(() => {
      setLoadingId(null);
      setViewMode('full');
    }, 800);
  };

  const renderFullReel = ({ item }: any) => (
    <View style={styles.fullReel}>
      <Image source={{ uri: item.media_url || item.image }} style={styles.fullImage} resizeMode="cover" />
      <View style={styles.gradientOverlay} />
      <View style={styles.reelContent}>
        <View style={styles.topActions}>
          <Pressable style={styles.glassBtn} onPress={() => setViewMode('grid')}>
            <Icon name="chevron-left" size={24} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.sideActions}>
          <Pressable style={styles.actionItem} onPress={() => {
            const newLiked = new Set(likedReels);
            if (newLiked.has(item.id)) newLiked.delete(item.id);
            else newLiked.add(item.id);
            setLikedReels(newLiked);
          }}>
            <Icon name={likedReels.has(item.id) ? "heart" : "heart-outline"} size={32} color={likedReels.has(item.id) ? "#ff4b2b" : "#fff"} />
            <Text style={styles.actionValue}>{item.likes || '0'}</Text>
          </Pressable>
          <Pressable style={styles.actionItem}>
            <Icon name="comment-outline" size={30} color="#fff" />
            <Text style={styles.actionValue}>{item.comments || '0'}</Text>
          </Pressable>
          <Pressable style={styles.actionItem}>
            <Icon name="share-variant" size={28} color="#fff" />
            <Text style={styles.actionValue}>Share</Text>
          </Pressable>
        </View>

        <View style={[styles.bottomDetails, { bottom: 40 + insets.bottom }]}>
          <View style={styles.companyRow}>
            <Text style={styles.companyName}>{item.employer?.company?.company_name || 'JobIndia Partner'}</Text>
            <Icon name="check-decagram" size={16} color="#3B82F6" style={{ marginLeft: 6 }} />
          </View>
          <Text style={styles.fullJobTitle}>{item.title && !item.title.includes('.jpg') ? item.title : (item.category?.name || 'Job Opportunity')}</Text>
          <Pressable style={[styles.mainApplyBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.applyBtnLabel}>Apply Now</Text>
          </Pressable>
        </View>
      </View>
    </View>
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
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar hidden />
        <FlatList
          data={reels}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          keyExtractor={item => String(item.id)}
          renderItem={renderFullReel}
          initialScrollIndex={activeReelId ? Math.max(0, reels.findIndex(r => String(r.id) === String(activeReelId))) : 0}
          getItemLayout={(data, index) => ({ length: REEL_HEIGHT, offset: REEL_HEIGHT * index, index })}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>Discover</Text>
            <Text style={[typography.h2, { color: colors.textPrimary }]}>Job Reels</Text>
          </View>
          <Pressable style={[styles.headerIcon, { backgroundColor: colors.surfaceHighlight }]}>
            <Icon name="bookmark-outline" size={24} color={colors.primary} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {loading ? renderSkeleton() : (
            <>
              {/* Categories/Stories */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {CATEGORIES.map(cat => (
                  <Pressable key={cat.id} style={styles.catItem}>
                    <View style={[styles.catCircle, { borderColor: colors.primary }]}>
                      <Image source={{ uri: cat.img }} style={styles.catImg} />
                    </View>
                    <Text style={[typography.tiny, { color: colors.textPrimary, marginTop: 4, fontWeight: 'bold' }]}>{cat.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Trending Section */}
              <View style={styles.section}>
                <Text style={[typography.h4, { color: colors.textPrimary, marginLeft: 20, marginBottom: 15 }]}>Trending Reels</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reelGrid}>
                  {reels.map((reel: any) => (
                    <Pressable key={reel.id} style={styles.reelCard} onPress={() => handlePress(reel.id)}>
                      <Image source={{ uri: reel.media_url || reel.image }} style={styles.reelThumb} />
                      <View style={styles.reelOverlay}>
                        <Text style={styles.reelTitle} numberOfLines={1}>{reel.title && !reel.title.includes('.jpg') ? reel.title : (reel.category?.name || 'Job')}</Text>
                        <Text style={styles.reelCompany}>{reel.employer?.company?.company_name || 'JobIndia'}</Text>
                      </View>
                      {loadingId === reel.id && (
                        <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
                          <ActivityIndicator color="#fff" />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

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
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryScroll: { paddingHorizontal: 20, gap: 15, marginBottom: 30 },
  catItem: { alignItems: 'center' },
  catCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    padding: 3,
  },
  catImg: { width: '100%', height: '100%', borderRadius: 30 },
  section: { marginBottom: 30 },
  reelGrid: { paddingHorizontal: 20, gap: 15 },
  reelCard: {
    width: 160,
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
  },
  reelThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  reelOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  reelTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  reelCompany: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  loadingOverlay: { backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  threadsContainer: { paddingHorizontal: 20, gap: 15 },
  threadCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
  },
  threadAvatar: { width: 40, height: 40, borderRadius: 20 },
  threadContent: { flex: 1, marginLeft: 12 },
  threadHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  threadFooter: { flexDirection: 'row', marginTop: 12, gap: 20 },
  threadAction: { flexDirection: 'row', alignItems: 'center' },
  videoList: { paddingHorizontal: 20, gap: 20 },
  videoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  videoThumbLarge: { width: '100%', height: 180, resizeMode: 'cover' },
  videoInfo: { padding: 15 },
  fullReel: { width: width, height: REEL_HEIGHT, backgroundColor: '#000' },
  fullImage: { ...StyleSheet.absoluteFillObject },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  reelContent: { ...StyleSheet.absoluteFillObject, padding: 20 },
  topActions: { marginTop: Platform.OS === 'ios' ? 40 : 10 },
  glassBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideActions: {
    position: 'absolute',
    right: 20,
    bottom: 150,
    alignItems: 'center',
    gap: 25,
  },
  actionItem: { alignItems: 'center', gap: 5 },
  actionValue: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  bottomDetails: { position: 'absolute', left: 20, right: 80 },
  companyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  companyName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  fullJobTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  mainApplyBtn: {
    height: 54,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default JobsReelsScreen;
