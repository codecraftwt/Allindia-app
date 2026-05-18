import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Dimensions, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const ORANGE_COLOR = '#FF9800';

interface AtsScoreOrbProps {
  score: number;
  colors: any;
  typography: any;
  profile?: any;
}

export const AtsScoreOrb: React.FC<AtsScoreOrbProps> = ({ score, colors, typography, profile }) => {
  // Dynamic User details from candidates real personal profile state
  const userName = profile?.personal?.name || "Vijay Kumar";
  const userEmail = profile?.personal?.email || "vijay.kumar@jobindia.in";
  const userPhone = profile?.personal?.mobile || profile?.personal?.phone || "+91 98765 43210";
  // AI score circle scan animations
  const orbOuterBlink = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(4)).current;

  // Continuous infinite looping scanner animations
  useEffect(() => {
    // 1. Outer radiating blink scale & opacity loop for ambient resume background
    const outerBlinkLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbOuterBlink, {
          toValue: 1.08,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(orbOuterBlink, {
          toValue: 0.96,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Laser scanning beam loop sweeping up & down across the resume card height (350px)
    const scannerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 390,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 4,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    outerBlinkLoop.start();
    scannerLoop.start();

    return () => {
      outerBlinkLoop.stop();
      scannerLoop.stop();
    };
  }, []);

  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 65, marginBottom: 18, justifyContent: 'center' }}>
        <Image
          source={require('../../../../assets/Job india Icon & logo file/Icon Job india.jpg')}
          style={{ width: 32, height: 32, borderRadius: 8, marginRight: 10 }}
          resizeMode="cover"
        />
        <Text style={{ fontSize: 22, color: colors.textPrimary, fontWeight: '900', letterSpacing: -0.5 }}>
          Job India <Text style={{ color: ORANGE_COLOR }}>AI Resume Builder</Text>
        </Text>

      </View>

      {/* Miniature simulated resume card containing vertical scan line */}
      <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 35, width: '100%', position: 'relative' }}>

        {/* Ambient Glowing Neon Halo Ring pulsing behind the resume card (Rendered first/back) */}
        <Animated.View style={{
          position: 'absolute',
          width: 328,
          height: 438,
          borderRadius: 20,
          borderWidth: 2.5,
          borderColor: ORANGE_COLOR + '25',
          transform: [{ scale: orbOuterBlink }],
          opacity: orbOuterBlink.interpolate({
            inputRange: [0.96, 1.08],
            outputRange: [0.8, 0.15],
          }),
          backgroundColor: ORANGE_COLOR + '02',
        }} />

        {/* ================= SCI-FI HUD FLOATING DIAGNOSTIC CALLOUTS ================= */}
        {/* 1. Top-Left Callout: Keywords Validated */}
        <View style={{
          position: 'absolute',
          left: -4,
          top: 40,
          backgroundColor: colors.card || '#ffffff',
          borderWidth: 1,
          borderColor: ORANGE_COLOR + '45',
          borderRadius: 14,
          paddingVertical: 5,
          paddingHorizontal: 8,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 3,
          zIndex: 10,
        }}>
          <Icon name="checkmark-circle" size={11} color={ORANGE_COLOR} style={{ marginRight: 4 }} />
          <Text style={{ fontSize: 8, fontWeight: '800', color: colors.textPrimary }}>
            Keywords OK
          </Text>
        </View>

        {/* 2. Mid-Right Callout: Format Checked */}
        <View style={{
          position: 'absolute',
          right: -4,
          top: 180,
          backgroundColor: colors.card || '#ffffff',
          borderWidth: 1,
          borderColor: '#10b981' + '45',
          borderRadius: 14,
          paddingVertical: 5,
          paddingHorizontal: 8,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 3,
          zIndex: 10,
        }}>
          <Icon name="shield-checkmark" size={11} color="#10b981" style={{ marginRight: 4 }} />
          <Text style={{ fontSize: 8, fontWeight: '800', color: colors.textPrimary }}>
            PDF Approved
          </Text>
        </View>

        {/* 3. Bottom-Left Callout: ATS Score Boosted */}
        <View style={{
          position: 'absolute',
          left: -4,
          top: 300,
          backgroundColor: colors.card || '#ffffff',
          borderWidth: 1,
          borderColor: ORANGE_COLOR + '45',
          borderRadius: 14,
          paddingVertical: 5,
          paddingHorizontal: 8,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 3,
          zIndex: 10,
        }}>
          <Icon name="trending-up" size={11} color={ORANGE_COLOR} style={{ marginRight: 4 }} />
          <Text style={{ fontSize: 8, fontWeight: '800', color: colors.textPrimary }}>
            ATS Boosted
          </Text>
        </View>

        {/* Paper Resume Card Sheet (Rendered second/front) */}
        <View style={{
          width: 310,
          height: 420,
          backgroundColor: colors.card || colors.surface || '#ffffff',
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: colors.border || '#e2e8f0',
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Simulated Real User Details Header Section */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.border + '40', paddingBottom: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: ORANGE_COLOR + '20', marginRight: 10, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="person" size={20} color={ORANGE_COLOR} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13.5, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.2 }} numberOfLines={1}>
                {userName}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Icon name="mail-outline" size={9} color={ORANGE_COLOR} style={{ marginRight: 3 }} />
                <Text style={{ fontSize: 8.5, color: colors.textSecondary, fontWeight: '600' }} numberOfLines={1}>
                  {userEmail}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Icon name="call-outline" size={9} color={ORANGE_COLOR} style={{ marginRight: 3 }} />
                <Text style={{ fontSize: 8.5, color: colors.textSecondary, fontWeight: '600' }} numberOfLines={1}>
                  {userPhone}
                </Text>
              </View>
            </View>
          </View>

          {/* Objective summary lines */}
          <View style={{ width: '100%', height: 4.5, backgroundColor: colors.textSecondary + '12', borderRadius: 2, marginBottom: 5 }} />
          <View style={{ width: '90%', height: 4.5, backgroundColor: colors.textSecondary + '12', borderRadius: 2, marginBottom: 20 }} />

          {/* Education Header & lines */}
          <View style={{ width: '35%', height: 7, backgroundColor: ORANGE_COLOR + '35', borderRadius: 2.5, marginBottom: 8 }} />
          <View style={{ width: '80%', height: 4.5, backgroundColor: colors.textSecondary + '12', borderRadius: 2, marginBottom: 5 }} />
          <View style={{ width: '65%', height: 4.5, backgroundColor: colors.textSecondary + '12', borderRadius: 2, marginBottom: 20 }} />

          {/* Experience Header & lines */}
          <View style={{ width: '40%', height: 7, backgroundColor: ORANGE_COLOR + '35', borderRadius: 2.5, marginBottom: 8 }} />
          <View style={{ width: '90%', height: 4.5, backgroundColor: colors.textSecondary + '12', borderRadius: 2, marginBottom: 5 }} />
          <View style={{ width: '75%', height: 4.5, backgroundColor: colors.textSecondary + '12', borderRadius: 2, marginBottom: 16 }} />

          {/* DYNAMIC GAMIFIED LOCK OVERLAY */}
          {score < 100 ? (
            <>
              {/* Semi-transparent frosted overlay */}
              <View style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                top: 92, // Keeps the header visible but blurs education/experience!
                backgroundColor: 'rgba(255, 255, 255, 0.78)',
                justifyContent: 'center',
                alignItems: 'center',
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
              }} />

              {/* Glowing Centered Lock Badge */}
              <View style={{
                position: 'absolute',
                top: '52%',
                left: '8%',
                right: '8%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surface || '#ffffff',
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: ORANGE_COLOR + '45',
                shadowColor: ORANGE_COLOR,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.18,
                shadowRadius: 6,
                elevation: 4,
              }}>
                <Icon name="lock-closed" size={24} color={ORANGE_COLOR} style={{ marginBottom: 6 }} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', letterSpacing: 0.2 }}>
                  Fill Details to Unlock PDF
                </Text>
              </View>
            </>
          ) : (
            /* UNLOCKED FLOATING STATE CELEBRATION BADGE */
            <View style={{
              position: 'absolute',
              top: '48%',
              left: '8%',
              right: '8%',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#10b981',
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 10,
              shadowColor: '#10b981',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.22,
              shadowRadius: 6,
              elevation: 4,
            }}>
              <Icon name="checkmark-circle" size={24} color="#fff" style={{ marginBottom: 6 }} />
              <Text style={{ fontSize: 11, fontWeight: '900', color: '#fff', textAlign: 'center' }}>
                🎉 Premium PDF Unlocked!
              </Text>
            </View>
          )}

          {/* AI Fit Match Badge overlayed at bottom right of the sheet */}
          <View style={{
            position: 'absolute',
            bottom: 14,
            right: 14,
            backgroundColor: score === 100 ? '#10b981' : ORANGE_COLOR,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 6,
            shadowColor: score === 100 ? '#10b981' : ORANGE_COLOR,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 4,
            elevation: 4,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Icon name="sparkles" size={12} color="#fff" style={{ marginRight: 4 }} />
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>
              {score}% AI
            </Text>
          </View>

          {/* Dynamic Laser Scanning Beam Overlay sweeping over the card */}
          <Animated.View style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: ORANGE_COLOR,
            opacity: 0.85,
            shadowColor: ORANGE_COLOR,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 6,
            elevation: 6,
            transform: [{ translateY: scanLineAnim }],
          }} />
        </View>

      </View>
    </View>
  );
};
