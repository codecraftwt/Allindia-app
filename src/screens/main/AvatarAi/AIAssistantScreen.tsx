import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Animated,
  Easing,
  Share,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  NativeModules,
  BackHandler,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import {
  fetchProfile,
  updateEducation,
  updateExperience,
  updatePersonalProfile,
} from '../../../redux/slice/profileSlice';
import { fetchMetaQualifications } from '../../../redux/slice/metaSlice';
import { generateAIResume, AIResumeResponse, generateAISuggestions } from '../../../services/geminiService';
import GuestView from '../../../components/GuestView';
import { AiProfileCoPilot } from './components/AiResumeBuilderScreen';
import { AiResumeWorkspace } from './components/AiResumeWorkspace';
import { generatePDF } from 'react-native-html-to-pdf';

const { width } = Dimensions.get('window');
const ORANGE_COLOR = '#FF9800';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

const AnimatedAIIcon = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }], marginBottom: 24 }}>
      <Icon name="logo-electron" size={84} color={ORANGE_COLOR} />
    </Animated.View>
  );
};

interface AtsScoreOrbProps {
  score: number;
  colors: any;
  typography: any;
  profile?: any;
}

const AtsScoreOrb: React.FC<AtsScoreOrbProps> = ({ score, colors, typography, profile }) => {
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
      Animated.timing(orbOuterBlink, {
        toValue: 1.08,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
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
          source={require('../../../assets/Job india Icon & logo file/Icon Job india.jpg')}
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
          width: 310, // Match exact width of the card below
          height: 420, // Match exact height of the card below
          borderRadius: 16,
          backgroundColor: ORANGE_COLOR,
          transform: [
            {
              scale: orbOuterBlink.interpolate({
                inputRange: [1, 1.08],
                outputRange: [1, 1.15],
              })
            }
          ],
          opacity: orbOuterBlink.interpolate({
            inputRange: [1, 1.08],
            outputRange: [0.5, 0],
          }),
        }} />

        {/* ================= SCI-FI HUD FLOATING DIAGNOSTIC CALLOUTS ================= */}
        {/* 1. Top-Left Callout: Keywords Validated */}
        <View style={{
          position: 'absolute',
          left: -4,
          top: 40,
          backgroundColor: colors.surface,
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
          backgroundColor: colors.surface,
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
          backgroundColor: colors.surface,
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
          minHeight: 280,
          paddingBottom: 32,
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

          {/* Summary / Bio */}
          {profile?.personal?.bio ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 9, fontWeight: '900', color: ORANGE_COLOR, marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' }}>SUMMARY</Text>
              <Text style={{ fontSize: 7.5, color: colors.textSecondary, lineHeight: 11 }} numberOfLines={3}>{profile.personal.bio}</Text>
            </View>
          ) : (
            <View style={{ marginBottom: 12 }}>
              <View style={{ width: '100%', height: 4.5, backgroundColor: colors.textSecondary + '12', borderRadius: 2, marginBottom: 5 }} />
              <View style={{ width: '90%', height: 4.5, backgroundColor: colors.textSecondary + '12', borderRadius: 2, marginBottom: 5 }} />
            </View>
          )}

          {/* Experience Section */}
          {profile?.experience && profile.experience.length > 0 ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 9, fontWeight: '900', color: ORANGE_COLOR, marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' }}>EXPERIENCE</Text>
              {profile.experience.slice(0, 2).map((exp: any, idx: number) => (
                <View key={idx} style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 8.5, fontWeight: 'bold', color: colors.textPrimary }} numberOfLines={1}>{exp.designation || 'Specialist'} at {exp.company || 'Company'}</Text>
                  <Text style={{ fontSize: 7, color: colors.textSecondary }}>{exp.start_date} - {exp.is_current ? 'Present' : exp.end_date || ''}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ marginBottom: 12 }}>
              <View style={{ width: '40%', height: 7, backgroundColor: ORANGE_COLOR + '35', borderRadius: 2.5, marginBottom: 8 }} />
              <View style={{ width: '90%', height: 4.5, backgroundColor: colors.textSecondary + '12', borderRadius: 2, marginBottom: 5 }} />
              <View style={{ width: '75%', height: 4.5, backgroundColor: colors.textSecondary + '12', borderRadius: 2, marginBottom: 5 }} />
            </View>
          )}

          {/* Education Section */}
          {profile?.education && profile.education.length > 0 ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 9, fontWeight: '900', color: ORANGE_COLOR, marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' }}>EDUCATION</Text>
              {profile.education.slice(0, 2).map((edu: any, idx: number) => (
                <View key={idx} style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 8.5, fontWeight: 'bold', color: colors.textPrimary }} numberOfLines={1}>{edu.degree || 'Degree'} - {edu.school_university || 'University'}</Text>
                  <Text style={{ fontSize: 7, color: colors.textSecondary }}>Class of {edu.passing_year || ''}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ marginBottom: 12 }}>
              <View style={{ width: '35%', height: 7, backgroundColor: ORANGE_COLOR + '35', borderRadius: 2.5, marginBottom: 8 }} />
              <View style={{ width: '80%', height: 4.5, backgroundColor: colors.textSecondary + '12', borderRadius: 2, marginBottom: 5 }} />
              <View style={{ width: '65%', height: 4.5, backgroundColor: colors.textSecondary + '12', borderRadius: 2, marginBottom: 5 }} />
            </View>
          )}

          {/* DYNAMIC GAMIFIED LOCK OVERLAY */}
          {score < 60 ? (
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
            backgroundColor: score >= 60 ? '#10b981' : ORANGE_COLOR,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 6,
            shadowColor: score >= 60 ? '#10b981' : ORANGE_COLOR,
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



const AIAssistantScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const isLoggedIn = useSelector((state: RootState) => state.auth?.isLoggedIn) ?? false;
  const profile = useSelector((state: RootState) => state.profile?.data);
  const completion = useSelector((state: RootState) => state.profile?.completion);
  const profileLoading = useSelector((state: RootState) => state.profile?.loading) ?? false;
  const qualifications = useSelector((state: RootState) => state.meta?.qualifications) || [];

  // Robust education checker and text generator
  const getEducationInfo = () => {
    if (!profile?.education) return null;
    let eduObj = null;
    if (Array.isArray(profile.education)) {
      if (profile.education.length > 0) eduObj = profile.education[0];
    } else {
      eduObj = profile.education;
    }
    if (!eduObj) return null;

    // Extract qualification name
    let qualName = '';
    const qIdObj = eduObj.qualification_id;
    if (qIdObj) {
      if (typeof qIdObj === 'object') {
        qualName = qIdObj.name || '';
      } else if (typeof qIdObj === 'number' || typeof qIdObj === 'string') {
        const matched = qualifications.find((q: any) => q.id === Number(qIdObj));
        if (matched) qualName = matched.name;
      }
    }

    // Fallbacks
    if (!qualName) qualName = eduObj.degree || eduObj.qualification || '';
    const notes = eduObj.education_notes || eduObj.notes || eduObj.school_university || '';

    if (!qualName && !notes) return null;
    return {
      qualification: qualName || 'Degree/Qualification',
      notes: notes || 'University/College details',
    };
  };

  // Robust experience checker and text generator
  const getExperienceInfo = () => {
    if (!profile?.experience) return null;
    let expObj = null;
    if (Array.isArray(profile.experience)) {
      if (profile.experience.length > 0) expObj = profile.experience[0];
    } else {
      expObj = profile.experience;
    }
    if (!expObj) return null;

    const type = expObj.experience_type || '';
    const years = expObj.total_experience_years;
    const designation = expObj.designation || '';
    const company = expObj.company || '';

    if (type === 'fresher' || expObj.is_fresher) {
      return {
        text: 'Fresher (No past work history)',
        isFresher: true,
      };
    }

    if (designation && company) {
      return {
        text: `${designation} at ${company}`,
        isFresher: false,
      };
    }

    if (years !== undefined && years !== null) {
      return {
        text: `${years} Year(s) of Experience`,
        isFresher: false,
      };
    }

    return null;
  };

  // Keyboard visibility listener to avoid tab bar overlap
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Screen States: 'LANDING' | 'SCANNING' | 'ATS_REPORT' | 'CHAT' | 'WIZARD' | 'GENERATING' | 'WORKSPACE'
  const [currentScreen, setCurrentScreen] = useState<'LANDING' | 'SCANNING' | 'ATS_REPORT' | 'CHAT' | 'WIZARD' | 'GENERATING' | 'WORKSPACE'>('SCANNING');

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Android hardware back button interception
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentScreen === 'CHAT') {
        setCurrentScreen('ATS_REPORT');
        return true; // prevent default (exiting screen)
      }
      if (currentScreen === 'ATS_REPORT') {
        navigation.goBack();
        return true;
      }
      if (currentScreen === 'GENERATING') {
        setCurrentScreen('CHAT');
        return true;
      }
      if (currentScreen === 'WORKSPACE') {
        setCurrentScreen('CHAT');
        return true;
      }
      return false; // LANDING & SCANNING: allow default navigation back
    });
    return () => backHandler.remove();
  }, [currentScreen]);
  // Scan control
  const initialScanDone = useRef(false);

  // Wizard state
  const [targetJob, setTargetJob] = useState('');
  const [selectedTone, setSelectedTone] = useState<'Professional' | 'Technical' | 'Creative' | 'Startup'>('Professional');
  const [jobDescription, setJobDescription] = useState('');

  // Loading Screen Subtitle state
  const [loadingSubtitle, setLoadingSubtitle] = useState('Initializing Gemini AI...');

  // Generated Resume State
  const [generatedResume, setGeneratedResume] = useState<AIResumeResponse | null>(null);
  const [editedSummary, setEditedSummary] = useState('');
  const [editedBullets, setEditedBullets] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<'OrangeGlow' | 'MidnightSlate' | 'ForestMint' | 'RoyalAmethyst' | 'CrimsonRuby'>('OrangeGlow');

  // Extra resume sections loaded locally/conversationally
  const [careerObjective, setCareerObjective] = useState('');
  const [certifications, setCertifications] = useState('');
  const [languages, setLanguages] = useState('');
  const [achievements, setAchievements] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [projects, setProjects] = useState('');

  // Confirmation flags to prevent endless loops & manage ATS unlocking
  const [educationConfirmed, setEducationConfirmed] = useState(false);
  const [experienceConfirmed, setExperienceConfirmed] = useState(false);

  // Resume Header fields
  const [resumeEmail, setResumeEmail] = useState('');
  const [resumePhone, setResumePhone] = useState('');
  const [resumeLinkedin, setResumeLinkedin] = useState('');
  const [resumeGithub, setResumeGithub] = useState('');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Quick profile review wizard state
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedEducation, setEditedEducation] = useState('');
  const [editedExperience, setEditedExperience] = useState('');

  // Sync internal state when profile loads
  useEffect(() => {
    if (profile) {
      setEditedName(profile?.personal?.name || '');
      setEditedBio(profile?.personal?.bio || '');

      const eduInfo = getEducationInfo();
      setEditedEducation(eduInfo ? `${eduInfo.qualification} from ${eduInfo.notes}` : '');

      const expInfo = getExperienceInfo();
      setEditedExperience(expInfo ? expInfo.text : '');
    }
  }, [profile]);

  const handleSaveQuickEdit = async () => {
    try {
      // 1. Save Personal Details
      await dispatch(
        updatePersonalProfile({
          name: editedName,
          bio: editedBio,
        })
      ).unwrap();

      // 2. Parse and Save Education
      if (editedEducation.trim()) {
        const eduParts = editedEducation.split(' from ');
        const degree = eduParts[0]?.trim() || '';
        const university = eduParts[1]?.trim() || '';
        await dispatch(
          updateEducation({
            degree,
            school_university: university,
            passing_year: profile?.education?.[0]?.passing_year || 2026,
            gpa_percentage: profile?.education?.[0]?.gpa_percentage || '80%',
          })
        ).unwrap();
      }

      // 3. Parse and Save Experience
      if (editedExperience.trim()) {
        const expParts = editedExperience.split(' at ');
        const designation = expParts[0]?.trim() || '';
        const company = expParts[1]?.trim() || '';
        await dispatch(
          updateExperience({
            designation,
            company,
            start_date: profile?.experience?.[0]?.start_date || '2025-01-01',
            end_date: profile?.experience?.[0]?.end_date || null,
            is_current: profile?.experience?.[0]?.is_current ?? true,
          })
        ).unwrap();
      }

      // Refresh
      await dispatch(fetchProfile()).unwrap();
      alert('Profile details successfully updated! ✅');
      setShowQuickEdit(false);
    } catch (err) {
      alert('Failed to update profile details.');
    }
  };

  // 1. Load profile data and qualifications ONCE on mount
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchProfile());
      dispatch(fetchMetaQualifications());
    }
  }, [isLoggedIn, dispatch]);

  // 2. Trigger initial scan on mount to guarantee transition to ATS_REPORT within 1.8s
  useEffect(() => {
    if (!initialScanDone.current) {
      initialScanDone.current = true;

      setCurrentScreen('SCANNING');
      const timer = setTimeout(() => {
        setCurrentScreen('ATS_REPORT');
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, []);

  // Pulsing animation for AI elements
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Handle auto-focus screen animation
  useEffect(() => {
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [currentScreen, slideAnim]);

  // Handle typing dynamic loading subtitles
  useEffect(() => {
    if (currentScreen === 'GENERATING') {
      const subtitles = [
        'Reading your newly completed profile data...',
        'Running ATS optimization filters...',
        'Matching keywords against ideal job profiles...',
        'Synthesizing metric-driven career milestones...',
        'Polishing professional summary to perfection...',
      ];
      let idx = 0;
      setLoadingSubtitle(subtitles[0]);
      const t = setInterval(() => {
        idx = (idx + 1) % subtitles.length;
        setLoadingSubtitle(subtitles[idx]);
      }, 2000);
      return () => clearInterval(t);
    }
  }, [currentScreen]);



  if (!isLoggedIn) {
    return <GuestView title="AI Resume Builder" subtitle="Login to access the AI Recruiter and build your premium ATS resume!" />;
  }



  // Dynamic baseline ATS score calculator
  const getBaselineATSScore = () => {
    let score = 35; // base score for candidate profile
    if (profile?.personal?.name && profile?.personal?.email && (profile?.personal?.phone || profile?.personal?.mobile)) score += 15;
    if (getEducationInfo()) score += 15;
    if (getExperienceInfo()) score += 15;

    // Check extra sections
    if (careerObjective) score += 5;
    if (certifications) score += 5;
    if (languages) score += 5;
    if (achievements) score += 5;
    if (hobbies) score += 5;
    if (projects) score += 5;

    return Math.min(score, 90);
  };

  // Launch interview chat
  const handleProceedToInterview = () => {
    setCurrentScreen('CHAT');
  };

  // Wizard: Generate premium resume
  const handleGenerateResume = async () => {
    if (!targetJob.trim()) return;

    setCurrentScreen('GENERATING');

    try {
      const enrichedProfile = {
        ...profile,
        personal: {
          ...profile?.personal,
          email: resumeEmail || profile?.personal?.email,
          phone: resumePhone || profile?.personal?.phone || profile?.personal?.mobile,
          mobile: resumePhone || profile?.personal?.mobile || profile?.personal?.phone,
          linkedin: resumeLinkedin,
          github: resumeGithub,
        }
      };

      const response = await generateAIResume(
        enrichedProfile,
        targetJob,
        selectedTone,
        jobDescription
      );

      setGeneratedResume(response);
      setEditedSummary(response.summary);
      setEditedBullets(response.experienceBullets);
      setCurrentScreen('WORKSPACE');
    } catch (error) {
      setCurrentScreen('CHAT');
      alert('Failed to connect to Gemini AI. Please try again.');
    }
  };

  // Generate resume directly from chat completion
  const handleGenerateResumeFromChat = async () => {
    let jobRole = targetJob.trim();
    if (!jobRole) {
      jobRole = profile?.experience?.[0]?.designation || profile?.personal?.name || 'Professional Candidate';
      setTargetJob(jobRole);
    }

    setCurrentScreen('GENERATING');

    try {
      const enrichedProfile = {
        ...profile,
        personal: {
          ...profile?.personal,
          email: resumeEmail || profile?.personal?.email,
          phone: resumePhone || profile?.personal?.phone || profile?.personal?.mobile,
          mobile: resumePhone || profile?.personal?.mobile || profile?.personal?.phone,
          linkedin: resumeLinkedin,
          github: resumeGithub,
        }
      };

      const response = await generateAIResume(
        enrichedProfile,
        jobRole,
        selectedTone,
        jobDescription
      );

      setGeneratedResume(response);
      setEditedSummary(response.summary);
      setEditedBullets(response.experienceBullets);
      setCurrentScreen('WORKSPACE');
    } catch (error) {
      setCurrentScreen('CHAT');
      alert('Failed to connect to Gemini AI. Please try again.');
    }
  };

  // Workspace: Save generated professional summary back to candidate profile bio
  const handleSaveToProfile = async () => {
    try {
      await dispatch(
        updatePersonalProfile({
          name: profile?.personal?.name || '',
          bio: editedSummary,
        })
      ).unwrap();
      alert('Resume summary successfully synced and saved to your Candidate Bio! ✅');
    } catch (e) {
      alert('Failed to sync summary with profile.');
    }
  };

  // Workspace: Export Styled HTML Resume as PDF
  const handleExportHtmlResume = async () => {
    if (!generatedResume) return;
    setIsExportingPdf(true);
    try {
      const colorsMap = {
        MidnightSlate: { accent: '#475569', textAccent: '#0f172a', bg: '#ffffff', accentLine: '#3b82f6' },
        ForestMint: { accent: '#059669', textAccent: '#064e3b', bg: '#ffffff', accentLine: '#10b981' },
        RoyalAmethyst: { accent: '#7c3aed', textAccent: '#4c1d95', bg: '#ffffff', accentLine: '#8b5cf6' },
        CrimsonRuby: { accent: '#dc2626', textAccent: '#7f1d1d', bg: '#ffffff', accentLine: '#ef4444' },
        OrangeGlow: { accent: ORANGE_COLOR, textAccent: '#7c2d12', bg: '#ffffff', accentLine: ORANGE_COLOR }
      };
      const activeColors = colorsMap[selectedTheme] || colorsMap.OrangeGlow;

      const experienceHtml = profile?.experience && profile.experience.length > 0
        ? profile.experience.map((exp: any, idx: number) => `
          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; color: #1e293b; margin-bottom: 4px;">
              <span>${exp.designation || 'Specialist'} at ${exp.company || 'Company'}</span>
              <span style="font-size: 13px; color: #64748b; font-weight: normal;">${exp.start_date} - ${exp.is_current ? 'Present' : exp.end_date || ''}</span>
            </div>
            ${idx === 0 ? `
              <ul class="bullet-list" style="margin-top: 6px; padding-left: 20px;">
                ${editedBullets.map(bullet => `<li class="bullet-item" style="font-size: 14px; margin-bottom: 6px; color: #334155; line-height: 1.6;">${bullet}</li>`).join('')}
              </ul>
            ` : `
              <p class="summary-text" style="font-size: 14.5px; margin-top: 6px; font-style: italic; color: #64748b; line-height: 1.6;">${exp.description || 'Contributed to key projects and operational workflows.'}</p>
            `}
          </div>
        `).join('')
        : `<p class="summary-text" style="font-style: italic;">No work experience listed.</p>`;

      const educationHtml = profile?.education && profile.education.length > 0
        ? profile.education.map((edu: any) => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 14.5px;">
            <div>
              <div style="font-weight: bold; color: #1e293b;">${edu.degree || 'Degree'}</div>
              <div style="color: #64748b; margin-top: 2px;">${edu.school_university || 'University'}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: bold; color: #1e293b;">${edu.gpa_percentage || ''}</div>
              <div style="color: #64748b; margin-top: 2px;">Class of ${edu.passing_year || ''}</div>
            </div>
          </div>
        `).join('')
        : `<p class="summary-text" style="font-style: italic;">No education details listed.</p>`;

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume - ${profile?.personal?.name || 'Candidate'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #ffffff;
      color: #334155;
      margin: 0;
      padding: 0;
    }
    .resume-card {
      max-width: 800px;
      width: 100%;
      background: #ffffff;
      padding: 40px;
      box-sizing: border-box;
      border-top: 12px solid ${activeColors.accentLine || activeColors.accent};
    }
    .header {
      margin-bottom: 24px;
    }
    .name {
      font-size: 32px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.025em;
      margin: 0 0 6px 0;
    }
    .title {
      font-size: 18px;
      font-weight: 600;
      color: ${activeColors.textAccent};
      margin: 0;
    }
    .contact-info {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 12px;
      font-size: 14px;
      color: #64748b;
    }
    .contact-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 24px 0;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: ${activeColors.textAccent};
      margin: 0 0 16px 0;
    }
    .summary-text {
      line-height: 1.7;
      font-size: 15px;
      color: #334155;
      margin: 0;
    }
    .bullet-list {
      padding-left: 20px;
      margin: 0;
    }
    .bullet-item {
      line-height: 1.7;
      font-size: 15px;
      color: #334155;
      margin-bottom: 12px;
    }
    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    .skill-badge {
      background: ${activeColors.accent}15;
      color: ${activeColors.textAccent};
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid ${activeColors.accent}25;
    }
    @media print {
      body {
        padding: 0;
        background: #ffffff;
      }
      .resume-card {
        box-shadow: none;
        padding: 0;
        border-top: none;
      }
    }
  </style>
</head>
<body>
  <div class="resume-card">
    <div class="header">
      <h1 class="name">${profile?.personal?.name || 'Your Name'}</h1>
      <div class="title">${targetJob}</div>
      <div class="contact-info">
        ${(resumePhone || profile?.personal?.phone || profile?.personal?.mobile) ? `<div class="contact-item">📞 ${resumePhone || profile?.personal?.phone || profile?.personal?.mobile}</div>` : ''}
        ${(resumeEmail || profile?.personal?.email) ? `<div class="contact-item">✉️ ${resumeEmail || profile.personal.email}</div>` : ''}
        ${profile?.personal?.city ? `<div class="contact-item">📍 ${profile.personal.city}</div>` : ''}
        ${resumeLinkedin ? `<div class="contact-item">🔗 LinkedIn: <a href="${resumeLinkedin.startsWith('http') ? resumeLinkedin : `https://${resumeLinkedin}`}" target="_blank" style="color: #64748b; text-decoration: none;">${resumeLinkedin.replace(/^https?:\/\/(www\.)?/, '')}</a></div>` : ''}
        ${resumeGithub ? `<div class="contact-item">💻 GitHub: <a href="${resumeGithub.startsWith('http') ? resumeGithub : `https://${resumeGithub}`}" target="_blank" style="color: #64748b; text-decoration: none;">${resumeGithub.replace(/^https?:\/\/(www\.)?/, '')}</a></div>` : ''}
      </div>
    </div>
    
    <div class="divider"></div>
    
    <div class="section-title">Professional Summary</div>
    <p class="summary-text">${editedSummary}</p>
    
    ${careerObjective ? `
    <div class="divider"></div>
    <div class="section-title">Career Objective</div>
    <p class="summary-text">${careerObjective}</p>
    ` : ''}

    <div class="divider"></div>
    
    <div class="section-title">Work Experience & Accomplishments</div>
    ${experienceHtml}
    
    <div class="divider"></div>
    
    <div class="section-title">Education History</div>
    ${educationHtml}
    
    ${certifications ? `
    <div class="divider"></div>
    <div class="section-title">Certifications & Accreditation</div>
    <p class="summary-text">${certifications}</p>
    ` : ''}

    ${projects ? `
    <div class="divider"></div>
    <div class="section-title">Key Projects & Repositories</div>
    <p class="summary-text">${projects}</p>
    ` : ''}

    ${languages ? `
    <div class="divider"></div>
    <div class="section-title">Languages Spoken</div>
    <p class="summary-text">${languages}</p>
    ` : ''}

    ${achievements ? `
    <div class="divider"></div>
    <div class="section-title">Honors & Achievements</div>
    <p class="summary-text">${achievements}</p>
    ` : ''}

    ${hobbies ? `
    <div class="divider"></div>
    <div class="section-title">Hobbies & Interests</div>
    <p class="summary-text">${hobbies}</p>
    ` : ''}

    <div class="divider"></div>
    
    <div class="section-title">ATS Core Skills & Competencies</div>
    <div class="skills-grid">
      ${generatedResume.skills.map(skill => `<span class="skill-badge">${skill}</span>`).join('')}
    </div>
  </div>
</body>
</html>`;

      const options = {
        html: htmlContent,
        fileName: `Resume_${profile?.personal?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Candidate'}_${selectedTheme}`,
      };

      // Bulletproof resolver: Check named export generatePDF, NativeModules, or TurboModuleRegistry
      const convertFn = generatePDF || (NativeModules.HtmlToPdf && NativeModules.HtmlToPdf.convert) || (NativeModules.RNHTMLtoPDF && NativeModules.RNHTMLtoPDF.convert);

      if (typeof convertFn !== 'function') {
        setIsExportingPdf(false);
        alert("Native Module 'HtmlToPdf' is not compiled in your current app binary.\n\n👉 Please close the app, stop your Metro server (Ctrl+C), and run 'npm run android' in your terminal to compile the PDF generator!");
        console.log("PDF converter is not available! Checked generatePDF:", generatePDF, "NativeModules.HtmlToPdf:", NativeModules.HtmlToPdf, "NativeModules.RNHTMLtoPDF:", NativeModules.RNHTMLtoPDF);
        return;
      }

      const file = await convertFn(options);
      setIsExportingPdf(false);

      if (file.filePath) {
        await Share.share({
          url: Platform.OS === 'ios' ? file.filePath : `file://${file.filePath}`,
          title: `Download Resume PDF`,
        });
        alert(`PDF successfully generated & downloaded! ✅\nSaved to: ${file.filePath}`);
      } else {
        alert('Failed to generate PDF file.');
      }
    } catch (e: any) {
      setIsExportingPdf(false);
      alert('Failed to generate export file: ' + (e?.message || e));
    }
  };

  // Workspace: Share / Export Text & Markdown Resume
  const handleExportResume = async () => {
    try {
      const experienceMarkdown = profile?.experience && profile.experience.length > 0
        ? profile.experience.map((exp: any, idx: number) => `
### ${exp.designation || 'Specialist'} | ${exp.company || 'Company'}
*Duration: ${exp.start_date} - ${exp.is_current ? 'Present' : exp.end_date || ''}*
${idx === 0 ? editedBullets.map((bullet) => `* ${bullet}`).join('\n') : `* ${exp.description || 'Contributed to key projects.'}`}
        `).join('\n')
        : '*No experience listed.*';

      const educationMarkdown = profile?.education && profile.education.length > 0
        ? profile.education.map((edu: any) => `
### ${edu.degree || 'Degree'} | ${edu.school_university || 'University'}
*Graduation: ${edu.passing_year} | GPA: ${edu.gpa_percentage || 'N/A'}*
        `).join('\n')
        : '*No education listed.*';

      const markdownContent = `
# ${profile?.personal?.name || 'Resume'}
## Target Role: ${targetJob}
---
### Contact Information
${(profile?.personal?.phone || profile?.personal?.mobile) ? `* Phone: ${profile?.personal?.phone || profile?.personal?.mobile}` : ''}
${profile?.personal?.email ? `* Email: ${profile.personal.email}` : ''}
${profile?.personal?.city ? `* City: ${profile.personal.city}` : ''}

---
### Professional Summary
${editedSummary}

${careerObjective ? `
---
### Career Objective
${careerObjective}
` : ''}

---
### Work History & Accomplishments (Enhanced by Gemini AI)
${experienceMarkdown}

---
### Education History
${educationMarkdown}

${certifications ? `
---
### Certifications
${certifications}
` : ''}

${projects ? `
---
### Key Projects
${projects}
` : ''}

${languages ? `
---
### Languages
${languages}
` : ''}

${achievements ? `
---
### Achievements & Awards
${achievements}
` : ''}

${hobbies ? `
---
### Hobbies & Interests
${hobbies}
` : ''}

---
### ATS Core Skills
${generatedResume?.skills.join(', ')}
      `;

      await Share.share({
        message: markdownContent,
        title: `${profile?.personal?.name || 'Candidate'} AI Resume`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  // Theme styling based on active workspace selection
  const getThemeColors = () => {
    switch (selectedTheme) {
      case 'MidnightSlate':
        return { accent: '#475569', textAccent: '#0f172a', bg: '#f8fafc', accentLine: '#3b82f6' };
      case 'ForestMint':
        return { accent: '#059669', textAccent: '#064e3b', bg: '#f0fdf4', accentLine: '#10b981' };
      case 'RoyalAmethyst':
        return { accent: '#7c3aed', textAccent: '#4c1d95', bg: '#f5f3ff', accentLine: '#8b5cf6' };
      case 'CrimsonRuby':
        return { accent: '#dc2626', textAccent: '#7f1d1d', bg: '#fef2f2', accentLine: '#ef4444' };
      case 'OrangeGlow':
      default:
        return { accent: ORANGE_COLOR, textAccent: '#7c2d12', bg: '#fff7ed', accentLine: ORANGE_COLOR };
    }
  };

  const themeColors = getThemeColors();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>


        {/* ==================== SCREEN 2: SCANNING ==================== */}
        {currentScreen === 'SCANNING' && (
          <View style={[styles.centerScreen, { backgroundColor: colors.background }]}>
            {/* Centered Animated AI Radar Sparkles Icon */}
            <AnimatedAIIcon />

            {/* Grand Title: Job India AI */}
            <Text style={[typography.sectionTitle, { color: colors.textPrimary, fontWeight: 'bold', textAlign: 'center', letterSpacing: -0.3 }]}>
              Job India AI
            </Text>

            {/* Subtitle Scanning Messages */}
            <Text style={[typography.labelMedium, { color: ORANGE_COLOR, marginTop: 12, fontWeight: '700', textAlign: 'center' }]}>
              Analyzing profile metrics...
            </Text>

          </View>
        )}

        {/* ==================== SCREEN: ATS REPORT ==================== */}
        {currentScreen === 'ATS_REPORT' && (
          <Animated.View style={[styles.screenContainer, { transform: [{ scale: slideAnim }] }]}>
            {/* Header bar with Back button to go back to LANDING screen */}

            <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
              <AtsScoreOrb score={getBaselineATSScore()} colors={colors} typography={typography} profile={profile} />

              {/* Premium Integrated AI Console Button */}
              <View style={{
                marginTop: 2,
                marginBottom: 40,
                paddingHorizontal: 16,
                width: '100%',
                alignItems: 'center'
              }}>

                {/* 1. Main Action Button: Grand Double-Stacked Branded Console */}
                <Pressable
                  onPress={handleProceedToInterview}
                  style={({ pressed }) => [
                    {
                      backgroundColor: ORANGE_COLOR,
                      width: '85%',
                      paddingVertical: 16,
                      borderRadius: 24,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 20,
                      shadowColor: ORANGE_COLOR,
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.45,
                      shadowRadius: 14,
                      elevation: 8,
                      position: 'relative',
                      overflow: 'hidden',
                      borderWidth: 1.5,
                      borderColor: 'rgba(255,255,255,0.2)',
                      transform: [{ scale: pressed ? 0.97 : 1 }]
                    }
                  ]}
                >

                  {/* Center: Double-Stacked Text (Action Title + Interactive Hint Subtitle!) */}
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 }}>
                      Auto-Complete With AI
                    </Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 11, fontWeight: '600', marginTop: 2, letterSpacing: 0.3 }}>
                      Fill missing details instantly
                    </Text>
                  </View>

                  {/* Right Side: Glowing Chevron Circle */}
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: 'rgba(0,0,0,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon name="chevron-forward" size={16} color="#fff" />
                  </View>
                </Pressable>

                {/* 2. Sleek Secondary Action: Underlined Skip Link */}
                <Pressable
                  onPress={handleGenerateResumeFromChat}
                  style={({ pressed }) => [
                    {
                      marginTop: 18,
                      paddingVertical: 6,
                      paddingHorizontal: 16,
                      opacity: pressed ? 0.6 : 0.85,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }
                  ]}
                >
                  <Text style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    fontWeight: '700',
                    letterSpacing: 0.1,
                    textDecorationLine: 'underline',
                  }}>
                    Skip and build resume now
                  </Text>
                  <Icon name="chevron-forward" size={13} color={colors.textSecondary} style={{ marginLeft: 3 }} />
                </Pressable>

              </View>
            </ScrollView>
          </Animated.View>
        )}

        {/* ==================== SCREEN 3: CHAT INTERVIEW (AI PROFILE CO-PILOT) ==================== */}
        {currentScreen === 'CHAT' && (
          <Animated.View style={[styles.screenContainer, { transform: [{ scale: slideAnim }] }]}>
            <AiProfileCoPilot
              colors={colors}
              isDark={isDark}
              setCurrentScreen={setCurrentScreen}
              ORANGE_COLOR={ORANGE_COLOR}
              isKeyboardVisible={isKeyboardVisible}
              onInterviewComplete={async (interviewData) => {
                setResumeEmail(interviewData.resumeEmail);
                setResumePhone(interviewData.resumePhone);
                setResumeLinkedin(interviewData.resumeLinkedin);
                setResumeGithub(interviewData.resumeGithub);
                setCareerObjective(interviewData.careerObjective);
                setCertifications(interviewData.certifications);
                setLanguages(interviewData.languages);
                setAchievements(interviewData.achievements);
                setHobbies(interviewData.hobbies);
                setProjects(interviewData.projects);

                const jobRole = interviewData.resumeHeadline || targetJob || profile?.experience?.[0]?.designation || profile?.personal?.name || 'Professional Candidate';
                setTargetJob(jobRole);

                setEducationConfirmed(true);
                setExperienceConfirmed(true);

                // Auto-generate AI Resume and switch directly to WORKSPACE screen
                setCurrentScreen('GENERATING');
                try {
                  const enrichedProfile = {
                    ...profile,
                    personal: {
                      ...profile?.personal,
                      email: interviewData.resumeEmail || profile?.personal?.email,
                      phone: interviewData.resumePhone || profile?.personal?.phone || profile?.personal?.mobile,
                      mobile: interviewData.resumePhone || profile?.personal?.mobile || profile?.personal?.phone,
                      linkedin: interviewData.resumeLinkedin,
                      github: interviewData.resumeGithub,
                    }
                  };

                  const response = await generateAIResume(
                    enrichedProfile,
                    jobRole,
                    selectedTone,
                    jobDescription
                  );

                  setGeneratedResume(response);
                  setEditedSummary(response.summary);
                  setEditedBullets(response.experienceBullets);
                  setCurrentScreen('WORKSPACE');
                } catch (error) {
                  setCurrentScreen('ATS_REPORT');
                  alert('Resume updated, but failed to generate AI summary automatically.');
                }
              }}
            />
          </Animated.View>
        )}



        {/* ==================== SCREEN 5: GENERATING ==================== */}
        {currentScreen === 'GENERATING' && (
          <View style={styles.centerScreen}>
            <Animated.View style={[styles.loadingOrb, { transform: [{ scale: pulseAnim }] }]}>
              <View style={[styles.loadingOrbInner, { borderColor: ORANGE_COLOR }]}>
                <Icon name="sparkles" size={48} color={ORANGE_COLOR} />
              </View>
            </Animated.View>
            <ActivityIndicator size="small" color={ORANGE_COLOR} style={{ marginTop: 24 }} />
            <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: 16, textAlign: 'center' }]}>
              {loadingSubtitle}
            </Text>
            <Text style={[typography.tiny, { color: colors.textPlaceholder, marginTop: 6 }]}>
              Google Gemini is crafting your career milestones...
            </Text>
          </View>
        )}

        {/* ==================== SCREEN 6: WORKSPACE EDITOR ==================== */}
        {currentScreen === 'WORKSPACE' && generatedResume && (
          <AiResumeWorkspace
            colors={colors}
            isDark={isDark}
            profile={profile}
            generatedResume={generatedResume}
            targetJob={targetJob}
            setTargetJob={setTargetJob}
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            themeColors={themeColors}
            editedSummary={editedSummary}
            setEditedSummary={setEditedSummary}
            editedBullets={editedBullets}
            setEditedBullets={setEditedBullets}
            careerObjective={careerObjective}
            setCareerObjective={setCareerObjective}
            certifications={certifications}
            setCertifications={setCertifications}
            languages={languages}
            setLanguages={setLanguages}
            projects={projects}
            setProjects={setProjects}
            achievements={achievements}
            setAchievements={setAchievements}
            hobbies={hobbies}
            setHobbies={setHobbies}
            resumeEmail={resumeEmail}
            resumePhone={resumePhone}
            resumeLinkedin={resumeLinkedin}
            resumeGithub={resumeGithub}
            handleSaveToProfile={handleSaveToProfile}
            handleExportHtmlResume={handleExportHtmlResume}
            handleExportResume={handleExportResume}
            setCurrentScreen={setCurrentScreen}
            slideAnim={slideAnim}
            ORANGE_COLOR={ORANGE_COLOR}
          />
        )}
      </SafeAreaView>
      {isExportingPdf && (
        <View style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0,0,0,0.6)',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <View style={{
            backgroundColor: colors.surface,
            padding: 24,
            borderRadius: 16,
            alignItems: 'center',
            width: '80%',
            gap: 16,
            elevation: 5,
          }}>
            <ActivityIndicator size="large" color={ORANGE_COLOR} />
            <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: 'bold', textAlign: 'center' }]}>
              Generating Premium PDF... 📄
            </Text>
            <Text style={[typography.tiny, { color: colors.textSecondary, textAlign: 'center', lineHeight: 18 }]}>
              Applying active color-accent lines and formatting professional bullets to guarantee 99% ATS match score!
            </Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  screenContainer: { flex: 1 },
  centerScroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  landingLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  landingOrb: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 152, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  landingOrbInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
  },
  primaryOrangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ORANGE_COLOR,
    width: '85%',
    height: 50,
    borderRadius: radius.card,
    marginTop: 32,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatarDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatScroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  chatBubbleContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    width: '100%',
  },
  bubbleLeft: {
    justifyContent: 'flex-start',
  },
  bubbleRight: {
    justifyContent: 'flex-end',
  },
  chatBubble: {
    maxWidth: '75%',
    padding: spacing.md - 2,
    borderRadius: radius.md,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderTopWidth: 1,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    height: 44,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ORANGE_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wizardHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  wizardScroll: {
    paddingHorizontal: spacing.md,
  },
  wizardInput: {
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  tonesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  toneCard: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  wizardTextarea: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  loadingOrb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 152, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOrbInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 12,
  },
  scoreBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceScroll: {
    paddingHorizontal: spacing.md,
  },
  editorCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themePillActive: {
    borderColor: ORANGE_COLOR,
    backgroundColor: ORANGE_COLOR + '08',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  resumeSheet: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: spacing.md,
  },
  sheetDivider: {
    height: 1.5,
    marginVertical: 14,
  },
  inlineInput: {
    paddingVertical: 4,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  workspaceActions: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  workspaceBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  textBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.card,
    gap: spacing.md,
    width: '100%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: spacing.xs,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileReviewCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reviewHeader: {
    paddingVertical: 4,
  },
  reviewBody: {
    marginTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: spacing.md,
  },
  atsHeader: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 6,
  },
  atsScoreCard: {
    borderWidth: 1.5,
    borderRadius: radius.card,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  atsGaugeContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: 'rgba(255, 152, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.03)',
    marginBottom: 12,
  },
  atsScoreLabel: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  checklistGrid: {
    gap: 10,
    marginTop: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
});

export default AIAssistantScreen;
