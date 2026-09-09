import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Share,
  FlatList,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
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
  targetTab?: string;
  targetScreen?: string;
  alertTitle?: string;
  alertSubtitle?: string;
  alertPerks?: string[];
  alertBtnText?: string;
  
  // Custom attractive theme backgrounds (Light & Dark)
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  blobColor: string;
  accentColor: string;
  ctaBg: string;
  ctaTextClr: string;
}

const ActionForYou: React.FC<ActionForYouProps> = ({ colors }) => {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const { t } = useTranslation();

  const [activeIndex, setActiveIndex] = useState(0);
  const [promoModalItem, setPromoModalItem] = useState<AdItem | null>(null);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openPromoModal = (item: AdItem) => {
    setPromoModalItem(item);
    scaleAnim.setValue(0.9);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 70,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closePromoModal = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPromoModalItem(null);
    });
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + 12));
    if (index >= 0 && index < ADS_DATA.length) {
      setActiveIndex(index);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'JobIndia - Find Verified Jobs & Direct HR Contacts',
        message:
          '🚀 Looking for a new job or know someone who is?\n\nCheck out JobIndia! Discover thousands of verified jobs and connect directly with hiring HRs and recruiters.\n\n👉 Download now: https://play.google.com/store/apps/details?id=com.jobsindia',
      });
    } catch (error: any) {
      console.warn(error.message);
    }
  };

  const handleAdPress = (item: AdItem) => {
    if (item.actionType === 'share') {
      handleShare();
    } else if (item.actionType === 'navigate') {
      try {
        if (item.targetTab && item.targetScreen) {
          navigation.navigate(item.targetTab, { screen: item.targetScreen });
        } else if (item.targetTab) {
          navigation.navigate(item.targetTab);
        } else if (item.targetRoute) {
          navigation.navigate(item.targetRoute);
        }
      } catch (err) {
        try {
          navigation.getParent()?.navigate(item.targetTab || 'AIAssistant', item.targetScreen ? { screen: item.targetScreen } : undefined);
        } catch (e) {
          console.warn('Navigation error:', e);
        }
      }
    } else if (item.actionType === 'alert') {
      openPromoModal(item);
    }
  };

  const ADS_DATA: AdItem[] = [
    {
      id: 'ad-refer',
      badge: 'INVITE FRIENDS',
      badgeColor: '#FFB020',
      title: t('home.promoReferTitle', 'Refer Friends'),
      subtitle: t('home.promoReferSub', 'Help friends find jobs & direct HR contacts.'),
      ctaText: t('home.promoReferCta', 'Invite Friends'),
      icon: 'account-multiple-plus-outline',
      actionType: 'share',
      bgLight: '#FFFBF0',
      bgDark: '#171204',
      borderLight: '#FFEAA7',
      borderDark: '#382A00',
      blobColor: '#FFD060',
      accentColor: '#FF7675',
      ctaBg: '#FFB020',
      ctaTextClr: '#FFF',
    },
    {
      id: 'ad-cv',
      badge: 'AI CV BUILDER',
      badgeColor: '#3B82F6',
      title: t('home.promoCvTitle', 'Free AI Resume'),
      subtitle: t('home.promoCvSub', 'Create a recruiter-ready AI resume in 2 minutes.'),
      ctaText: t('home.promoCvCta', 'Build Resume'),
      icon: 'file-document-outline',
      actionType: 'navigate',
      targetTab: 'AIAssistant',
      targetScreen: 'ResumeScreen',
      bgLight: '#F4F8FF',
      bgDark: '#081021',
      borderLight: '#D3E4FF',
      borderDark: '#102244',
      blobColor: '#5C93F7',
      accentColor: '#A855F7',
      ctaBg: '#3B82F6',
      ctaTextClr: '#FFF',
    },
    {
      id: 'ad-premium',
      badge: 'VIP ACCESS',
      badgeColor: '#A855F7',
      title: t('home.promoVipTitle', 'Direct HR Contacts'),
      subtitle: t('home.promoVipSub', 'Get direct phone & WhatsApp of 500+ top recruiters.'),
      ctaText: t('home.promoVipCta', 'Get VIP Access'),
      icon: 'crown-outline',
      actionType: 'alert',
      alertTitle: 'Upgrade to VIP Access',
      alertSubtitle: 'VIP membership plans are launching very soon! Get ready for direct recruiter connect.',
      alertPerks: [
        'Direct phone numbers of 500+ verified recruiters',
        'Direct WhatsApp connect with hiring managers',
        'Instant priority resume highlight',
        'Exclusive early-access job notifications',
      ],
      alertBtnText: 'Got It, Thanks!',
      bgLight: '#FAF7FF',
      bgDark: '#140824',
      borderLight: '#EAD6FF',
      borderDark: '#2E1055',
      blobColor: '#BC7CFC',
      accentColor: '#EC4899',
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
              {/* Overlapping Blob Background Shapes */}
              <View pointerEvents="none" style={StyleSheet.absoluteFill}>
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
                <View style={[styles.circleBg, { backgroundColor: item.badgeColor + '12', borderColor: item.badgeColor + '20' }]}>
                  <View style={[styles.innerCircleBg, { backgroundColor: item.badgeColor + '18' }]} />
                  <Icon name={item.icon} size={38} color={item.badgeColor} style={styles.adIcon} />
                  
                  <View style={[styles.starParticle, { top: 6, left: 10 }]}>
                    <Icon name="sparkles" size={14} color={item.badgeColor} />
                  </View>
                  
                  <View style={[styles.starParticle, { bottom: 10, right: 6 }]}>
                    <Icon name="star" size={12} color={item.badgeColor} />
                  </View>

                  <View style={[styles.starParticle, { top: 12, right: 8 }]}>
                    <Icon name="sparkles" size={10} color={item.accentColor} />
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

      {/* CUSTOM PROMO / VIP MODAL */}
      <Modal
        visible={!!promoModalItem}
        transparent
        animationType="none"
        onRequestClose={closePromoModal}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closePromoModal} />
          
          {promoModalItem && (
            <Animated.View
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: promoModalItem.badgeColor + '40',
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {/* Close 'x' button */}
              <Pressable
                onPress={closePromoModal}
                style={[styles.modalCloseBtn, { backgroundColor: colors.surfaceHighlight }]}
                hitSlop={10}
              >
                <FeatherIcon name="x" size={18} color={colors.textSecondary} />
              </Pressable>

              {/* Glowing Icon Header */}
              <View
                style={[
                  styles.modalIconWrap,
                  {
                    backgroundColor: promoModalItem.badgeColor + '18',
                    borderColor: promoModalItem.badgeColor + '35',
                  },
                ]}
              >
                <Icon name={promoModalItem.icon} size={36} color={promoModalItem.badgeColor} />
              </View>

              {/* Badge */}
              <View style={[styles.modalBadge, { backgroundColor: promoModalItem.badgeColor + '15', borderColor: promoModalItem.badgeColor + '30' }]}>
                <Icon name="crown" size={12} color={promoModalItem.badgeColor} style={{ marginRight: 4 }} />
                <Text style={[styles.modalBadgeText, { color: promoModalItem.badgeColor }]}>
                  {promoModalItem.badge}
                </Text>
              </View>

              {/* Title & Subtitle */}
              <Text style={[typography.h3, { color: colors.textPrimary, fontWeight: '800', textAlign: 'center', marginTop: 10 }]}>
                {promoModalItem.alertTitle || promoModalItem.title}
              </Text>
              <Text style={[typography.small, { color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 18, paddingHorizontal: 12 }]}>
                {promoModalItem.alertSubtitle || promoModalItem.subtitle}
              </Text>

              {/* Perks List */}
              {promoModalItem.alertPerks && promoModalItem.alertPerks.length > 0 && (
                <View style={[styles.perksContainer, { backgroundColor: colors.surfaceHighlight + '80', borderColor: colors.border }]}>
                  {promoModalItem.alertPerks.map((perk, i) => (
                    <View key={i} style={styles.perkRow}>
                      <View style={[styles.perkCheckCircle, { backgroundColor: promoModalItem.badgeColor + '20' }]}>
                        <FeatherIcon name="check" size={12} color={promoModalItem.badgeColor} />
                      </View>
                      <Text style={[styles.perkText, { color: colors.textPrimary }]}>
                        {perk}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* CTA Action Button */}
              <Pressable
                onPress={closePromoModal}
                style={({ pressed }) => [
                  styles.modalCtaBtn,
                  {
                    backgroundColor: promoModalItem.ctaBg,
                    shadowColor: promoModalItem.ctaBg,
                  },
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
              >
                <Text style={[styles.modalCtaText, { color: promoModalItem.ctaTextClr }]}>
                  {promoModalItem.alertBtnText || 'Got It'}
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
      </Modal>
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
    overflow: 'hidden',
  },
  leftCol: {
    flex: 1.35,
    paddingRight: spacing.xs,
    zIndex: 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 28,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  modalIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  modalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  perksContainer: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 16,
    gap: 10,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perkCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  perkText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  modalCtaBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalCtaText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default ActionForYou;
