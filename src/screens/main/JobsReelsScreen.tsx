import React, { useState, useRef, useEffect } from 'react';
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
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [viewMode, setViewMode] = useState<'grid' | 'full'>('grid');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePress = (id: string) => {
    setLoadingId(id);
    setTimeout(() => {
      setLoadingId(null);
      setViewMode('full');
    }, 1500);
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
          <View style={styles.actionItem}>
            <View style={styles.iconCircle}>
              <Icon name="heart" size={24} color="#fff" />
            </View>
            <Text style={styles.actionValue}>{item.likes}</Text>
          </View>
          <View style={styles.actionItem}>
            <View style={styles.iconCircle}>
              <Icon name="comment" size={24} color="#fff" />
            </View>
            <Text style={styles.actionValue}>{item.comments}</Text>
          </View>
          <View style={styles.actionItem}>
            <View style={styles.iconCircle}>
              <Icon name="share" size={24} color="#fff" />
            </View>
            <Text style={styles.actionValue}>Share</Text>
          </View>
          <View style={styles.actionItem}>
            <View style={styles.iconCircle}>
              <Icon name="bookmark-o" size={24} color="#fff" />
            </View>
            <Text style={styles.actionValue}>Save</Text>
          </View>
        </View>

        <View style={styles.bottomDetails}>
          <View style={styles.companyRow}>
            <Image source={{ uri: item.logo }} style={styles.miniLogo} />
            <Text style={styles.companyName}>{item.company}</Text>
            <Icon name="check-circle" size={14} color="#0095f6" style={{ marginLeft: 6 }} />
            <Pressable style={styles.followBtn}>
              <Text style={styles.followText}>Follow</Text>
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
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'} />
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
});

export default JobsReelsScreen;
