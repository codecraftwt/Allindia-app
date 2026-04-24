import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { useNavigation } from '@react-navigation/native';


const { width, height } = Dimensions.get('window');
const REEL_HEIGHT = height - (Platform.OS === 'ios' ? 90 : 80);

const CATEGORIES = [
  { id: '1', name: 'Software', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=200' },
  { id: '2', name: 'Design', img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=200' },
  { id: '3', name: 'Marketing', img: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=200' },
  { id: '4', name: 'Sales', img: 'https://images.unsplash.com/photo-1552581234-261207845094?q=80&w=200' },
  { id: '5', name: 'Finance', img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=200' },
];

const REELS_DATA = [
  {
    id: 'r1',
    company: 'Google',
    logo: 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png',
    title: 'Senior UI/UX Designer',
    location: 'Bangalore',
    salary: '₹18L - ₹25L',
    image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=1000',
    likes: '12.4k',
    comments: '428',
    isTrending: true,
  },
  {
    id: 'r2',
    company: 'Amazon',
    logo: 'https://logo.clearbit.com/amazon.com',
    title: 'Cloud Architect',
    location: 'Remote',
    salary: '₹25L - ₹35L',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000',
    likes: '8.2k',
    comments: '156',
    isNew: true,
  },
  {
    id: 'r3',
    company: 'Netflix',
    logo: 'https://logo.clearbit.com/netflix.com',
    title: 'Content Strategist',
    location: 'Mumbai',
    salary: '₹15L - ₹20L',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000',
    likes: '5.1k',
    comments: '92',
  }
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


const POLL_DATA = {
  question: 'Which city is best for Software Engineers in 2024?',
  options: [
    { label: 'Bangalore', votes: '45%', isLeading: true },
    { label: 'Hyderabad', votes: '30%', isLeading: false },
    { label: 'Pune', votes: '15%', isLeading: false },
    { label: 'Remote', votes: '10%', isLeading: false },
  ]
};

const EVENTS_DATA = [
  {
    id: 'e1',
    title: 'Free Resume Workshop',
    date: 'Today, 6 PM',
    icon: 'file-text-o',
    color: '#4facfe',
  },
  {
    id: 'e2',
    title: 'Mock Interview Session',
    date: 'Tomorrow, 11 AM',
    icon: 'users',
    color: '#f093fb',
  }
];

const SUCCESS_DATA = [
  {
    id: 's1',
    name: 'Ankit Jain',
    text: 'Got hired at Google! Thanks JobIndia.',
    avatar: 'https://i.pravatar.cc/150?u=ankit',
  },
  {
    id: 's2',
    name: 'Sonal Singh',
    text: 'Landed my first UX role within 2 weeks.',
    avatar: 'https://i.pravatar.cc/150?u=sonal',
  }
];

const MOCK_COMMENTS = [
  { id: 'c1', user: 'Amit Raj', avatar: 'https://i.pravatar.cc/150?u=amit', text: 'This job looks perfect for my profile!', time: '2h ago', likes: 12 },
  { id: 'c2', user: 'Neha Gupta', avatar: 'https://i.pravatar.cc/150?u=neha', text: 'What is the interview process like?', time: '5h ago', likes: 8 },
  { id: 'c3', user: 'Vikram Sahay', avatar: 'https://i.pravatar.cc/150?u=vikram', text: 'Already applied! Finger crossed. 🤞', time: '1d ago', likes: 24 },
];

const SHARE_OPTIONS = [
  { name: 'WhatsApp', icon: 'whatsapp', color: '#25D366' },
  { name: 'LinkedIn', icon: 'linkedin', color: '#0077B5' },
  { name: 'Instagram', icon: 'instagram', color: '#E1306C' },
  { name: 'Copy Link', icon: 'link', color: '#777' },
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

const JobsReelsScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const navigation = useNavigation<any>();
  const [viewMode, setViewMode] = useState<'grid' | 'full'>('grid');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Interaction States
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [savedReels, setSavedReels] = useState<Set<string>>(new Set());
  const [followedCompanies, setFollowedCompanies] = useState<Set<string>>(new Set());
  const [threadLikes, setThreadLikes] = useState<Set<string>>(new Set());
  const [selectedPoll, setSelectedPoll] = useState<number | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [comments, setComments] = useState(MOCK_COMMENTS);

  // Handle Hardware Back Button
  useEffect(() => {
    const backAction = () => {
      if (viewMode === 'full') {
        setViewMode('grid');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [viewMode]);

  const toggleLike = (id: string) => {
    const newLiked = new Set(likedReels);
    if (newLiked.has(id)) newLiked.delete(id);
    else newLiked.add(id);
    setLikedReels(newLiked);
  };

  const toggleSave = (id: string) => {
    const newSaved = new Set(savedReels);
    if (newSaved.has(id)) newSaved.delete(id);
    else newSaved.add(id);
    setSavedReels(newSaved);
  };

  const toggleFollow = (company: string) => {
    const newFollowed = new Set(followedCompanies);
    if (newFollowed.has(company)) newFollowed.delete(company);
    else newFollowed.add(company);
    setFollowedCompanies(newFollowed);
  };

  const handlePress = (id: string) => {
    setLoadingId(id);
    setTimeout(() => {
      setLoadingId(null);
      setViewMode('full');
    }, 1500);
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: 'Check out this amazing job on JobIndia! 🚀',
        url: 'https://jobindia.app/reels/' + activeReelId,
      });
      if (result.action === Share.sharedAction) {
        setShowShare(false);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const openComments = (id: string) => {
    setActiveReelId(id);
    setShowComments(true);
  };

  const openShare = (id: string) => {
    setActiveReelId(id);
    setShowShare(true);
  };

  const renderFullReel = ({ item }: any) => (
    <View style={styles.fullReel}>
      <Image source={{ uri: item.image }} style={styles.fullImage} resizeMode="cover" />
      <View style={styles.gradientOverlay} />

      <View style={styles.reelContent}>
        <View style={styles.topActions}>
          <Pressable style={styles.glassBtn} onPress={() => setViewMode('grid')}>
            <Icon name="chevron-left" size={18} color="#fff" />
          </Pressable>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.sideActions}>
          <Pressable style={styles.actionItem} onPress={() => toggleLike(item.id)}>
            <View style={[styles.iconCircle, likedReels.has(item.id) && { backgroundColor: 'rgba(255, 75, 43, 0.3)', borderColor: '#ff4b2b' }]}>
              <Icon name={likedReels.has(item.id) ? "heart" : "heart-o"} size={24} color={likedReels.has(item.id) ? "#ff4b2b" : "#fff"} />
            </View>
            <Text style={styles.actionValue}>{likedReels.has(item.id) ? 'Liked' : item.likes}</Text>
          </Pressable>
          
          <Pressable style={styles.actionItem} onPress={() => openComments(item.id)}>
            <View style={styles.iconCircle}>
              <Icon name="comment-o" size={24} color="#fff" />
            </View>
            <Text style={styles.actionValue}>{item.comments}</Text>
          </Pressable>
          
          <Pressable style={styles.actionItem} onPress={() => openShare(item.id)}>
            <View style={styles.iconCircle}>
              <Icon name="share" size={24} color="#fff" />
            </View>
            <Text style={styles.actionValue}>Share</Text>
          </Pressable>
          
          <Pressable style={styles.actionItem} onPress={() => toggleSave(item.id)}>
            <View style={[styles.iconCircle, savedReels.has(item.id) && { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
              <Icon name={savedReels.has(item.id) ? "bookmark" : "bookmark-o"} size={24} color="#fff" />
            </View>
            <Text style={styles.actionValue}>{savedReels.has(item.id) ? 'Saved' : 'Save'}</Text>
          </Pressable>
        </View>

        <View style={styles.bottomDetails}>
          <View style={styles.companyRow}>
            <Image source={{ uri: item.logo }} style={styles.miniLogo} />
            <Text style={styles.companyName}>{item.company}</Text>
            <Icon name="check-circle" size={14} color="#0095f6" style={{ marginLeft: 6 }} />
            <Pressable 
              style={[styles.followBtn, followedCompanies.has(item.company) && { backgroundColor: '#fff' }]} 
              onPress={() => toggleFollow(item.company)}
            >
              <Text style={[styles.followText, followedCompanies.has(item.company) && { color: '#000' }]}>
                {followedCompanies.has(item.company) ? 'Following' : 'Follow'}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.fullJobTitle}>{item.title}</Text>
          <Text style={styles.fullJobMeta}><Icon name="map-marker" size={12} /> {item.location}  •  <Icon name="money" size={12} /> {item.salary}</Text>

          <Pressable style={[styles.mainApplyBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.applyBtnLabel}>Easy Apply</Text>
            <Icon name="bolt" size={16} color="#fff" style={{ marginLeft: 8 }} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  if (viewMode === 'full') {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <FlatList
          data={REELS_DATA}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={renderFullReel}
        />

        {/* Comment Modal */}
        <Modal
          visible={showComments}
          transparent
          animationType="slide"
          onRequestClose={() => setShowComments(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={{ flex: 1 }} onPress={() => setShowComments(false)} />
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={[styles.commentSheet, { backgroundColor: colors.surface }]}
            >
              <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Comments</Text>
                <Pressable onPress={() => setShowComments(false)}>
                  <Icon name="times" size={20} color={colors.textSecondary} />
                </Pressable>
              </View>
              
              <FlatList
                data={comments}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 20 }}
                renderItem={({ item }) => (
                  <View style={styles.commentItem}>
                    <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
                    <View style={styles.commentContent}>
                      <View style={styles.commentUserRow}>
                        <Text style={[styles.commentUser, { color: colors.textPrimary }]}>{item.user}</Text>
                        <Text style={[styles.commentTime, { color: colors.textSecondary }]}>{item.time}</Text>
                      </View>
                      <Text style={[styles.commentText, { color: colors.textPrimary }]}>{item.text}</Text>
                    </View>
                    <Pressable style={styles.commentLike}>
                      <Icon name="heart-o" size={14} color={colors.textSecondary} />
                      <Text style={[styles.commentLikeCount, { color: colors.textSecondary }]}>{item.likes}</Text>
                    </Pressable>
                  </View>
                )}
              />

              <View style={[styles.inputRow, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
                <Image source={{ uri: 'https://i.pravatar.cc/150?u=user' }} style={styles.inputAvatar} />
                <TextInput
                  style={[styles.commentInput, { color: colors.textPrimary, backgroundColor: colors.surfaceHighlight }]}
                  placeholder="Add a comment..."
                  placeholderTextColor={colors.textSecondary}
                  value={newComment}
                  onChangeText={setNewComment}
                />
                <TouchableOpacity 
                  disabled={!newComment.trim()} 
                  onPress={() => {
                    if (newComment.trim()) {
                      const post: any = {
                        id: Date.now().toString(),
                        user: 'You',
                        avatar: 'https://i.pravatar.cc/150?u=user',
                        text: newComment,
                        time: 'Just now',
                        likes: 0,
                      };
                      setComments([post, ...comments]);
                      setNewComment('');
                    }
                  }}
                >
                  <Text style={[styles.sendBtn, { color: newComment.trim() ? colors.primary : colors.textSecondary }]}>Post</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* Share Modal */}
        <Modal
          visible={showShare}
          transparent
          animationType="fade"
          onRequestClose={() => setShowShare(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={{ flex: 1 }} onPress={() => setShowShare(false)} />
            <View style={[styles.shareSheet, { backgroundColor: colors.surface }]}>
              <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
              <Text style={[styles.sheetTitle, { color: colors.textPrimary, textAlign: 'center', marginBottom: 20 }]}>Share to</Text>
              
              <View style={styles.shareOptionsRow}>
                {SHARE_OPTIONS.map((opt, i) => (
                  <TouchableOpacity key={i} style={styles.shareOpt} onPress={handleShare}>
                    <View style={[styles.shareIconWrap, { backgroundColor: opt.color + '20' }]}>
                      <Icon name={opt.icon} size={24} color={opt.color} />
                    </View>
                    <Text style={[styles.shareOptText, { color: colors.textPrimary }]}>{opt.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <Text style={[styles.sheetSubTitle, { color: colors.textPrimary }]}>Send to Friends</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 15 }}>
                {[1,2,3,4,5].map(i => (
                  <View key={i} style={styles.friendItem}>
                    <Image source={{ uri: `https://i.pravatar.cc/150?u=${i}` }} style={styles.friendAvatar} />
                    <Text style={[styles.friendName, { color: colors.textSecondary }]} numberOfLines={1}>User {i}</Text>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity style={[styles.cancelShareBtn, { backgroundColor: colors.surfaceHighlight }]} onPress={() => setShowShare(false)}>
                <Text style={[styles.cancelShareText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.premiumHeader}>
          <View>
            <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>Discover</Text>
            <Text style={[typography.appTitle, { color: colors.textPrimary, fontSize: 26 }]}>Job Reels</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('SavedPost')}
            style={[styles.headerIconBtn, { backgroundColor: colors.surfaceHighlight }]}
          >
            <Icon name="bookmark" size={18} color={colors.primary} />
          </Pressable>
        </View>

        {/* Stories with Rotating Border Loading */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyScroll}>
          {CATEGORIES.map(cat => (
            <Pressable key={cat.id} style={styles.storyWrap} onPress={() => handlePress(cat.id)}>
              <View style={styles.storyOuter}>
                {loadingId === cat.id && <RotatingBorder colors={colors} />}
                <View style={[styles.storyBorder, { borderColor: loadingId === cat.id ? 'transparent' : colors.primary }]}>
                  <Image source={{ uri: cat.img }} style={styles.storyImg} />
                </View>
              </View>
              <Text style={[styles.storyLabel, { color: colors.textPrimary }]}>{cat.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Trending Now</Text>
            <Pressable><Text style={{ color: colors.primary, fontWeight: 'bold' }}>See all</Text></Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalGrid}>
            {REELS_DATA.map(reel => (
              <Pressable key={reel.id} style={styles.premiumCard} onPress={() => handlePress(reel.id)}>
                <ImageBackground source={{ uri: reel.image }} style={styles.cardBg} imageStyle={{ borderRadius: radius.lg }}>
                  <View style={[styles.cardOverlay, loadingId === reel.id && { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    {loadingId === reel.id ? (
                      <View style={styles.fullCenter}>
                        <RotatingBorder colors={{ primary: '#fff' }} />
                      </View>
                    ) : (
                      <>
                        {reel.isTrending && (
                          <View style={styles.trendingBadge}>
                            <Icon name="line-chart" size={10} color="#fff" />
                            <Text style={styles.badgeText}>TRENDING</Text>
                          </View>
                        )}
                        <View style={{ flex: 1 }} />
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardTitle} numberOfLines={1}>{reel.title}</Text>
                          <Text style={styles.cardCompany}>{reel.company}</Text>
                        </View>
                      </>
                    )}
                  </View>
                </ImageBackground>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Popular Companies</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalGrid}>
            {REELS_DATA.slice().reverse().map(reel => (
              <Pressable key={`pop-${reel.id}`} style={styles.premiumCard} onPress={() => handlePress(`pop-${reel.id}`)}>
                <ImageBackground source={{ uri: reel.image }} style={styles.cardBg} imageStyle={{ borderRadius: radius.lg }}>
                  <View style={[styles.cardOverlay, loadingId === `pop-${reel.id}` && { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    {loadingId === `pop-${reel.id}` ? (
                      <View style={styles.fullCenter}>
                        <RotatingBorder colors={{ primary: '#fff' }} />
                      </View>
                    ) : (
                      <>
                        {reel.isNew && (
                          <View style={[styles.trendingBadge, { backgroundColor: '#10b981' }]}>
                            <Text style={styles.badgeText}>NEW</Text>
                          </View>
                        )}
                        <View style={{ flex: 1 }} />
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardTitle} numberOfLines={1}>{reel.title}</Text>
                          <Text style={styles.cardCompany}>{reel.company}</Text>
                        </View>
                      </>
                    )}
                  </View>
                </ImageBackground>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Threads Section (Twitter/Threads Style) */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Community Threads</Text>
            <Pressable><Text style={{ color: colors.primary, fontWeight: 'bold' }}>View all</Text></Pressable>
          </View>
          
          <View style={styles.threadsContainer}>
            {THREADS_DATA.map(thread => (
              <View key={thread.id} style={[styles.threadCard, { borderBottomColor: colors.border }]}>
                <View style={styles.threadSide}>
                  <Image source={{ uri: thread.avatar }} style={styles.threadAvatar} />
                  <View style={[styles.threadLine, { backgroundColor: colors.border }]} />
                </View>
                <View style={styles.threadContent}>
                  <View style={styles.threadUserRow}>
                    <Text style={[styles.threadUser, { color: colors.textPrimary }]}>{thread.user}</Text>
                    <Text style={[styles.threadHandle, { color: colors.textSecondary }]}>{thread.time}</Text>
                  </View>
                  <Text style={[styles.threadText, { color: colors.textPrimary }]}>{thread.content}</Text>
                  <View style={styles.threadActions}>
                    <Pressable 
                      style={styles.threadActionBtn} 
                      onPress={() => {
                        const newLikes = new Set(threadLikes);
                        if (newLikes.has(thread.id)) newLikes.delete(thread.id);
                        else newLikes.add(thread.id);
                        setThreadLikes(newLikes);
                      }}
                    >
                      <Icon 
                        name={threadLikes.has(thread.id) ? "heart" : "heart-o"} 
                        size={16} 
                        color={threadLikes.has(thread.id) ? "#ff4b2b" : colors.textSecondary} 
                      />
                      <Text style={[styles.threadActionText, { color: threadLikes.has(thread.id) ? "#ff4b2b" : colors.textSecondary }]}>
                        {threadLikes.has(thread.id) ? thread.likes + 1 : thread.likes}
                      </Text>
                    </Pressable>
                    <Pressable style={styles.threadActionBtn}>
                      <Icon name="comment-o" size={16} color={colors.textSecondary} />
                      <Text style={[styles.threadActionText, { color: colors.textSecondary }]}>{thread.replies}</Text>
                    </Pressable>
                    <Icon name="retweet" size={16} color={colors.textSecondary} />
                    <Icon name="paper-plane-o" size={16} color={colors.textSecondary} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Videos Section (YouTube Style) */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Job Insights</Text>
          </View>
          
          <View style={styles.videosContainer}>
            {VIDEOS_DATA.map(video => (
              <Pressable key={video.id} style={styles.videoCard}>
                <ImageBackground source={{ uri: video.thumbnail }} style={styles.videoThumb} imageStyle={{ borderRadius: radius.xl }}>
                  <View style={styles.playBtn}>
                    <Icon name="play" size={18} color="#fff" />
                  </View>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{video.duration}</Text>
                  </View>
                </ImageBackground>
                <View style={styles.videoInfo}>
                  <View style={[styles.videoChannelAvatar, { backgroundColor: colors.surfaceHighlight }]}>
                    <Icon name="youtube-play" size={20} color="#ff0000" />
                  </View>
                  <View style={styles.videoTextContent}>
                    <Text style={[styles.videoTitle, { color: colors.textPrimary }]} numberOfLines={2}>{video.title}</Text>
                    <Text style={[styles.videoMeta, { color: colors.textSecondary }]}>
                      {video.channel}  •  {video.views}  •  {video.time}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Daily Poll Section */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Daily Career Poll</Text>
          </View>
          <View style={[styles.pollCard, { backgroundColor: colors.surfaceHighlight }]}>
            <Text style={[styles.pollQuestion, { color: colors.textPrimary }]}>{POLL_DATA.question}</Text>
            {POLL_DATA.options.map((opt, idx) => (
              <Pressable key={idx} style={styles.pollOption} onPress={() => setSelectedPoll(idx)}>
                <View style={[styles.pollProgressBase, { backgroundColor: colors.border + '20' }]}>
                  <View style={[
                    styles.pollProgressFill, 
                    { 
                      width: opt.votes, 
                      backgroundColor: selectedPoll === idx ? colors.primary : (opt.isLeading ? colors.textPlaceholder + '60' : colors.textPlaceholder + '40') 
                    }
                  ]} />
                </View>
                <View style={styles.pollOptionLabel}>
                  <Text style={[styles.pollLabelText, { color: colors.textPrimary, fontWeight: selectedPoll === idx ? '900' : 'bold' }]}>
                    {opt.label} {selectedPoll === idx && '✓'}
                  </Text>
                  <Text style={[styles.pollVoteText, { color: colors.textSecondary }]}>{opt.votes}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Live Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Webinars & Events</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalGrid}>
            {EVENTS_DATA.map(event => (
              <View key={event.id} style={[styles.eventCard, { backgroundColor: event.color + '15', borderColor: event.color + '40' }]}>
                <View style={[styles.eventIconWrap, { backgroundColor: event.color }]}>
                  <Icon name={event.icon} size={20} color="#fff" />
                </View>
                <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>{event.title}</Text>
                <Text style={[styles.eventDate, { color: colors.textSecondary }]}>{event.date}</Text>
                <Pressable style={[styles.eventBtn, { backgroundColor: event.color }]}>
                  <Text style={styles.eventBtnText}>Register</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Success Stories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Success Stories</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalGrid}>
            {SUCCESS_DATA.map(story => (
              <View key={story.id} style={[styles.successCard, { borderColor: colors.border }]}>
                <Image source={{ uri: story.avatar }} style={styles.successAvatar} />
                <View style={styles.successInfo}>
                  <Text style={[styles.successName, { color: colors.textPrimary }]}>{story.name}</Text>
                  <Text style={[styles.successText, { color: colors.textSecondary }]} numberOfLines={2}>"{story.text}"</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyScroll: { paddingHorizontal: spacing.lg, gap: 18, marginBottom: spacing.xl },
  storyWrap: { alignItems: 'center', gap: 8 },
  storyOuter: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteLoader: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
  },
  storyBorder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImg: { width: '100%', height: '100%', borderRadius: 33 },
  storyLabel: { fontSize: 12, fontWeight: '700' },
  section: { marginBottom: spacing.xl },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  horizontalGrid: { paddingHorizontal: spacing.lg, gap: 14 },
  premiumCard: {
    width: 160,
    height: 260,
    borderRadius: radius.lg,
  },
  cardBg: { width: '100%', height: '100%' },
  cardOverlay: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullCenter: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  trendingBadge: {
    backgroundColor: '#ff4b2b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  cardInfo: { gap: 2, alignSelf: 'stretch' },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  cardCompany: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600' },

  // FULL REEL UI
  fullReel: { width: width, height: REEL_HEIGHT, backgroundColor: '#000' },
  fullImage: { ...StyleSheet.absoluteFillObject },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  reelContent: { ...StyleSheet.absoluteFillObject, padding: spacing.lg },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 10,
  },
  glassBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff0000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  sideActions: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    alignItems: 'center',
    gap: 24,
  },
  actionItem: { alignItems: 'center', gap: 6 },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionValue: { color: '#fff', fontSize: 12, fontWeight: '700' },
  bottomDetails: { position: 'absolute', bottom: 40, left: 20, right: 80 },
  companyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  miniLogo: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff' },
  companyName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  followBtn: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 4,
  },
  followText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  fullJobTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  fullJobMeta: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600', marginBottom: 24 },
  mainApplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    width: '100%',
    elevation: 10,
  },
  applyBtnLabel: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // Threads Styles
  threadsContainer: { paddingHorizontal: spacing.lg },
  threadCard: { flexDirection: 'row', paddingVertical: spacing.lg, borderBottomWidth: 1 },
  threadSide: { alignItems: 'center', marginRight: 12 },
  threadAvatar: { width: 42, height: 42, borderRadius: 21 },
  threadLine: { flex: 1, width: 2, marginTop: 8, borderRadius: 1 },
  threadContent: { flex: 1 },
  threadUserRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  threadUser: { fontSize: 14, fontWeight: 'bold' },
  threadHandle: { fontSize: 12 },
  threadText: { fontSize: 15, lineHeight: 20, marginBottom: 12 },
  threadActions: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  threadActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  threadActionText: { fontSize: 12, fontWeight: '600' },

  // Video Styles
  videosContainer: { paddingHorizontal: spacing.lg, gap: 24 },
  videoCard: { width: '100%' },
  videoThumb: { width: '100%', height: 200, justifyContent: 'center', alignItems: 'center' },
  playBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  durationBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  durationText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  videoInfo: { flexDirection: 'row', marginTop: 12, gap: 12 },
  videoChannelAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  videoTextContent: { flex: 1 },
  videoTitle: { fontSize: 16, fontWeight: 'bold', lineHeight: 22 },
  videoMeta: { fontSize: 13, marginTop: 4 },

  // Poll Styles
  pollCard: { padding: spacing.lg, borderRadius: radius.xl, marginHorizontal: spacing.lg },
  pollQuestion: { fontSize: 16, fontWeight: 'bold', marginBottom: spacing.lg },
  pollOption: { marginBottom: 16 },
  pollProgressBase: { height: 40, borderRadius: radius.md, overflow: 'hidden' },
  pollProgressFill: { height: '100%', borderRadius: radius.md },
  pollOptionLabel: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12 },
  pollLabelText: { fontSize: 13, fontWeight: 'bold' },
  pollVoteText: { fontSize: 12, fontWeight: 'bold' },

  // Event Styles
  eventCard: { width: 200, padding: spacing.lg, borderRadius: radius.xl, borderWidth: 1 },
  eventIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  eventTitle: { fontSize: 15, fontWeight: 'bold' },
  eventDate: { fontSize: 13, marginTop: 4, marginBottom: 12 },
  eventBtn: { paddingVertical: 8, alignItems: 'center', borderRadius: radius.pill },
  eventBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // Success Styles
  successCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, width: 240, gap: 12 },
  successAvatar: { width: 48, height: 48, borderRadius: 24 },
  successInfo: { flex: 1 },
  successName: { fontSize: 14, fontWeight: 'bold' },
  successText: { fontSize: 12, fontStyle: 'italic' },

  // Modal & Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  commentSheet: {
    height: '75%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 11,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentLike: {
    alignItems: 'center',
    paddingLeft: 10,
  },
  commentLikeCount: {
    fontSize: 11,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 0.5,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  sendBtn: {
    marginLeft: 12,
    fontWeight: 'bold',
    fontSize: 15,
  },

  // Share Sheet Styles
  shareSheet: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  shareOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  shareOpt: {
    alignItems: 'center',
    width: '23%',
  },
  shareIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareOptText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 25,
  },
  sheetSubTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  friendItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 60,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 6,
  },
  friendName: {
    fontSize: 11,
  },
  cancelShareBtn: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  cancelShareText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default JobsReelsScreen;
