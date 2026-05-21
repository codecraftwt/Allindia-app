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
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import type { ThemeColors } from '../theme/colors';

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
}

const ActionForYou: React.FC<ActionForYouProps> = ({ colors }) => {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();

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
      badgeColor: '#fbbf24', // Gold
      title: 'Refer & Earn Coins!',
      subtitle: 'Invite friends & get 100 gold coins per referral. Use coins to unlock premium jobs!',
      ctaText: 'Invite Friends',
      icon: 'gift',
      actionType: 'share',
      bgLight: '#fffbeb', // Light gold
      bgDark: '#291d03',  // Dark gold/brown
      borderLight: '#fef08a',
      borderDark: '#451a03',
      blobColor: '#fbbf24',
    },
    {
      id: 'ad-cv',
      badge: 'AI CV BUILDER',
      badgeColor: '#3b82f6', // Blue
      title: 'Free Professional CV',
      subtitle: 'Create a premium, recruiter-approved AI resume in less than 2 minutes!',
      ctaText: 'Build Resume',
      icon: 'file-document-outline',
      actionType: 'navigate',
      targetRoute: 'AvatarAi',
      bgLight: '#eff6ff', // Light blue
      bgDark: '#0c1a30',  // Dark navy/blue
      borderLight: '#bfdbfe',
      borderDark: '#172554',
      blobColor: '#3b82f6',
    },
    {
      id: 'ad-premium',
      badge: 'VIP ACCESS',
      badgeColor: '#a855f7', // Purple
      title: 'Direct HR Contacts',
      subtitle: 'Upgrade to VIP member to get direct phone numbers of 500+ active recruiters.',
      ctaText: 'Get VIP Access',
      icon: 'crown-outline',
      actionType: 'alert',
      alertTitle: 'Upgrade to VIP',
      alertMsg: 'VIP membership plans starting soon! Unlock unlimited direct calls to HRs.',
      bgLight: '#faf5ff', // Light purple
      bgDark: '#1e0c2f',  // Dark violet
      borderLight: '#f3e8ff',
      borderDark: '#3b0764',
      blobColor: '#a855f7',
    },
  ];

  return (
    <View style={styles.outerContainer}>
      <Text style={[typography.labelMedium, { color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.sm, marginHorizontal: spacing.lg }]}>
        Actions & Promos For You
      </Text>
      
      <FlatList
        data={ADS_DATA}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 4 }}
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
                  shadowColor: isDark ? '#000' : colors.shadow || '#000',
                  opacity: pressed ? 0.95 : 1,
                  transform: [{ scale: pressed ? 0.995 : 1 }],
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
                      opacity: isDark ? 0.12 : 0.08,
                      width: 140,
                      height: 140,
                      borderRadius: 70,
                      top: -40,
                      right: -30,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.blob,
                    {
                      backgroundColor: item.blobColor,
                      opacity: isDark ? 0.08 : 0.05,
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      bottom: -40,
                      left: -20,
                    },
                  ]}
                />
              </View>

              {/* Left side: Copy and CTA */}
              <View style={styles.leftCol}>
                <View style={[styles.badge, { backgroundColor: item.badgeColor + '20' }]}>
                  <Icon name="star-circle" size={12} color={item.badgeColor} style={{ marginRight: 4 }} />
                  <Text style={[styles.badgeText, { color: item.badgeColor }]}>{item.badge}</Text>
                </View>

                <Text style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 16, marginTop: spacing.xs }]} numberOfLines={1}>
                  {item.title}
                </Text>

                <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4, lineHeight: 18, fontSize: 12 }]} numberOfLines={2}>
                  {item.subtitle}
                </Text>

                <View style={[styles.ctaButton, { backgroundColor: colors.primary }]}>
                  <Text style={[typography.labelMedium, { color: colors.onPrimary || '#fff', fontSize: 12, fontWeight: '700' }]}>
                    {item.ctaText}
                  </Text>
                  <Icon
                    name={item.actionType === 'share' ? 'share-variant' : item.actionType === 'navigate' ? 'chevron-right' : 'lock-open-outline'}
                    size={12}
                    color={colors.onPrimary || '#fff'}
                    style={{ marginLeft: 6 }}
                  />
                </View>
              </View>

              {/* Right side: Graphic Illustration container */}
              <View style={styles.rightCol}>
                <View style={[styles.circleBg, { backgroundColor: item.badgeColor + '18' }]}>
                  {/* The big themed Icon */}
                  <Icon name={item.icon} size={36} color={item.badgeColor} style={styles.adIcon} />
                  
                  {/* Secondary floating coin/accents */}
                  <View style={[styles.coin, { top: 10, left: 14, backgroundColor: '#fbbf24', width: 14, height: 14, borderRadius: 7 }]}>
                    <Icon name="currency-usd" size={9} color="#fff" />
                  </View>
                  <View style={[styles.coin, { bottom: 12, right: 10, backgroundColor: '#fbbf24', width: 18, height: 18, borderRadius: 9 }]}>
                    <Icon name="currency-usd" size={11} color="#fff" />
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
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
    borderRadius: radius.card || 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden', // Ensures blobs don't leak out of border radius
  },
  leftCol: {
    flex: 1.3,
    paddingRight: spacing.sm,
    zIndex: 2, // Keeps text above background blobs
  },
  rightCol: {
    flex: 0.7,
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
    borderRadius: radius.sm || 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.button || 20,
  },
  circleBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  adIcon: {
    transform: [{ rotate: '-5deg' }],
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
  },
});

export default ActionForYou;
