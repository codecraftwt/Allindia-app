import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Share,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { typography, fontFamilies } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import type { ThemeColors } from '../theme/colors';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

interface ActionForYouProps {
  colors: ThemeColors;
}

interface AdItem {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  ctaText: string;
  icon: string;
  actionType: 'share' | 'navigate' | 'alert';
  targetRoute?: string;
  alertTitle?: string;
  alertMsg?: string;
  
  // Custom attractive theme backgrounds (Light & Dark)
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  blobColor: string;
  accentColor: string; // Complementary blob color for rich gradient blend
  ctaBg: string;
  ctaTextClr: string;
}

const ActionForYou: React.FC<ActionForYouProps> = ({ colors }) => {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const { t } = useTranslation();

  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + 12));
    if (index >= 0 && index < ADS_DATA.length) {
      setActiveIndex(index);
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        title: 'Join JobIndia & Earn Coins!',
        message:
          'Hey! Use my referral code JOBIND500 to sign up on JobIndia and get 100 bonus coins to unlock premium jobs instantly! Download here: https://jobindia.app/invite',
      });
      if (result.action === Share.sharedAction) {
        Alert.alert('Success', 'Thank you for sharing JobIndia with your friends!');
      }
    } catch (error: any) {
      console.warn(error.message);
    }
  };

  const handleAdPress = (item: AdItem) => {
    if (item.actionType === 'share') {
      handleShare();
    } else if (item.actionType === 'navigate' && item.targetRoute) {
      try {
        navigation.navigate(item.targetRoute);
      } catch (err) {
        Alert.alert('CV Builder', 'Opening AI Resume Builder tool...');
      }
    } else if (item.actionType === 'alert') {
      Alert.alert(item.alertTitle || 'Premium', item.alertMsg || 'Feature coming soon!');
    }
  };

  const ADS_DATA: AdItem[] = [
    {
      id: 'ad-refer',
      badge: 'REFERRAL REWARDS',
      badgeColor: '#FFB020', // Vibrant Golden Amber
      title: t('home.promoReferTitle', 'Refer & Earn Coins!'),
      subtitle: t('home.promoReferSub', 'Invite friends & get 100 gold coins per referral. Use coins to unlock premium jobs!'),
      ctaText: t('home.promoReferCta', 'Invite Friends'),
      icon: 'gift-outline',
      actionType: 'share',
      bgLight: '#FFFBF0', // Soft warm cream
      bgDark: '#171204',  // Deep amber black
      borderLight: '#FFEAA7',
      borderDark: '#382A00',
      blobColor: '#FFD060',
      accentColor: '#FF7675', // Warm coral to blend golden-pink gradient
      ctaBg: '#FFB020',
      ctaTextClr: '#FFF',
    },
    {
      id: 'ad-cv',
      badge: 'AI CV BUILDER',
      badgeColor: '#3B82F6', // Tech Blue
      title: t('home.promoCvTitle', 'Free Professional CV'),
      subtitle: t('home.promoCvSub', 'Create a premium, recruiter-approved AI resume in less than 2 minutes!'),
      ctaText: t('home.promoCvCta', 'Build Resume'),
      icon: 'file-document-outline',
      actionType: 'navigate',
      targetRoute: 'AvatarAi',
      bgLight: '#F4F8FF', // Soft ice blue
      bgDark: '#081021',  // Tech deep dark blue
      borderLight: '#D3E4FF',
      borderDark: '#102244',
      blobColor: '#5C93F7',
      accentColor: '#A855F7', // Violet to blend blue-indigo gradient
      ctaBg: '#3B82F6',
      ctaTextClr: '#FFF',
    },
    {
      id: 'ad-premium',
      badge: 'VIP ACCESS',
      badgeColor: '#A855F7', // Violet
      title: t('home.promoVipTitle', 'Direct HR Contacts'),
      subtitle: t('home.promoVipSub', 'Upgrade to VIP member to get direct phone numbers of 500+ active recruiters.'),
      ctaText: t('home.promoVipCta', 'Get VIP Access'),
      icon: 'crown-outline',
      actionType: 'alert',
      alertTitle: 'Upgrade to VIP',
      alertMsg: 'VIP membership plans starting soon! Unlock unlimited direct calls to HRs.',
      bgLight: '#FAF7FF', // Soft lavender white
      bgDark: '#140824',  // Deep space violet
      borderLight: '#EAD6FF',
      borderDark: '#2E1055',
      blobColor: '#BC7CFC',
      accentColor: '#EC4899', // Pink to blend violet-magenta gradient
      ctaBg: '#A855F7',
      ctaTextClr: '#FFF',
    },
  ];

  return (
    <View style={styles.outerContainer}>
      <Text style={[typography.labelMedium, { color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.sm, marginHorizontal: spacing.xs }]}>
        {t('home.actionsAndPromos', 'Actions & Promos For You')}
      </Text>
      
      <FlatList
        data={ADS_DATA}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: spacing.xs, paddingBottom: 6 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const cardBgColor = isDark ? item.bgDark : item.bgLight;
          const cardBorderColor = isDark ? item.borderDark : item.borderLight;
          
          return (
            <Pressable
              onPress={() => handleAdPress(item)}
              style={({ pressed }) => [
                styles.container,
                {
                  width: CARD_WIDTH,
                  backgroundColor: cardBgColor,
                  borderColor: cardBorderColor,
                  shadowColor: isDark ? '#000' : item.badgeColor,
                  shadowOpacity: isDark ? 0.25 : 0.15,
                  shadowRadius: 12,
                  elevation: 5,
                  opacity: pressed ? 0.96 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}
            >
              {/* Overlapping Blob Background Shapes (Smooth Faux Gradients) */}
              <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                {/* Main Theme Blob */}
                <View
                  style={[
                    styles.blob,
                    {
                      backgroundColor: item.blobColor,
                      opacity: isDark ? 0.15 : 0.08,
                      width: 160,
                      height: 160,
                      borderRadius: 80,
                      top: -50,
                      right: -30,
                    },
                  ]}
                />
                {/* Accent Complementary Blob */}
                <View
                  style={[
                    styles.blob,
                    {
                      backgroundColor: item.accentColor,
                      opacity: isDark ? 0.1 : 0.06,
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                      bottom: -40,
                      left: -20,
                    },
                  ]}
                />
                {/* Secondary Center Glow */}
                <View
                  style={[
                    styles.blob,
                    {
                      backgroundColor: '#FFFFFF',
                      opacity: isDark ? 0.04 : 0.1,
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      top: 20,
                      left: 110,
                    },
                  ]}
                />
              </View>

              {/* Left side: Copy and CTA */}
              <View style={styles.leftCol}>
                <View style={[styles.badge, { borderColor: item.badgeColor + '40', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]}>
                  <Icon name="star-circle" size={12} color={item.badgeColor} style={{ marginRight: 4 }} />
                  <Text style={[styles.badgeText, { color: item.badgeColor }]}>{item.badge}</Text>
                </View>

                <Text style={[typography.sectionTitle, { fontFamily: fontFamilies.bold, color: colors.textPrimary, fontSize: 17, marginTop: 8 }]} numberOfLines={1}>
                  {item.title}
                </Text>

                <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4, lineHeight: 17, fontSize: 11.5 }]} numberOfLines={2}>
                  {item.subtitle}
                </Text>

                {/* Glassmorphic styled CTA button */}
                <View style={[styles.ctaButton, { backgroundColor: item.ctaBg, shadowColor: item.ctaBg }]}>
                  <Text style={[styles.ctaText, { color: item.ctaTextClr }]}>
                    {item.ctaText}
                  </Text>
                  <Icon
                    name={item.actionType === 'share' ? 'share-variant' : item.actionType === 'navigate' ? 'chevron-right' : 'lock-open-outline'}
                    size={13}
                    color={item.ctaTextClr}
                    style={{ marginLeft: 6 }}
                  />
                </View>
              </View>

              {/* Right side: Graphic Illustration container */}
              <View style={styles.rightCol}>
                {/* Outer Glowing Circle Orb */}
                <View style={[styles.circleBg, { backgroundColor: item.badgeColor + '12', borderColor: item.badgeColor + '20' }]}>
                  {/* Inner Glow Orb */}
                  <View style={[styles.innerCircleBg, { backgroundColor: item.badgeColor + '18' }]} />
                  
                  {/* The big themed Icon */}
                  <Icon name={item.icon} size={38} color={item.badgeColor} style={styles.adIcon} />
                  
                  {/* Premium floating coin/star accents */}
                  <View style={[styles.coin, { top: 2, left: 10, backgroundColor: '#fbbf24', width: 14, height: 14, borderRadius: 7 }]}>
                    <Icon name="currency-usd" size={9} color="#fff" />
                  </View>
                  
                  <View style={[styles.coin, { bottom: 12, right: 2, backgroundColor: '#fbbf24', width: 18, height: 18, borderRadius: 9 }]}>
                    <Icon name="currency-usd" size={11} color="#fff" />
                  </View>

                  <View style={[styles.starParticle, { top: 12, right: 8 }]}>
                    <Icon name="sparkles" size={12} color="#fbbf24" />
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
      />

      {/* Dynamic Themed Pagination Dots */}
      <View style={styles.paginationContainer}>
        {ADS_DATA.map((item, index) => {
          const isActive = index === activeIndex;
          const activeDotColor = ADS_DATA[activeIndex].badgeColor;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: isActive 
                    ? activeDotColor 
                    : (isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'),
                  width: isActive ? 18 : 6,
                }
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginVertical: spacing.md,
  },
  container: {
    marginRight: 12,
    padding: spacing.md,
    borderRadius: 24,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    overflow: 'hidden', // Ensures blobs don't leak out of border radius
  },
  leftCol: {
    flex: 1.35,
    paddingRight: spacing.xs,
    zIndex: 2, // Keeps text above background blobs
  },
  rightCol: {
    flex: 0.65,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  blob: {
    position: 'absolute',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: fontFamilies.bold,
    letterSpacing: 0.6,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  ctaText: {
    fontSize: 12,
    fontFamily: fontFamilies.bold,
  },
  circleBg: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  innerCircleBg: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  adIcon: {
    transform: [{ rotate: '-4deg' }],
    zIndex: 3,
  },
  coin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
    zIndex: 4,
  },
  starParticle: {
    position: 'absolute',
    zIndex: 4,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm + 4,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});

export default ActionForYou;
