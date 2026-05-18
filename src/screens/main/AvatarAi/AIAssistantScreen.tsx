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
import { AtsScoreOrb } from './components/AtsScoreOrb';
import { AiProfileCoPilot } from './components/AiProfileCoPilot';
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
      if (currentScreen === 'WIZARD') {
        setCurrentScreen('LANDING');
        return true;
      }
      if (currentScreen === 'GENERATING') {
        setCurrentScreen('WIZARD');
        return true;
      }
      if (currentScreen === 'WORKSPACE') {
        setCurrentScreen('WIZARD');
        return true;
      }
      return false; // LANDING & SCANNING: allow default navigation back
    });
    return () => backHandler.remove();
  }, [currentScreen]);
  // Chat/Interview State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentQuestionKey, setCurrentQuestionKey] = useState<
    | 'education'
    | 'experience'
    | 'objective'
    | 'certifications'
    | 'languages'
    | 'achievements'
    | 'hobbies'
    | 'projects'
    | 'complete'
    | null
  >(null);
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef<ScrollView>(null);
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

  // Confirmation flags to prevent endless chat loops for education & experience
  const [educationConfirmed, setEducationConfirmed] = useState(false);
  const [experienceConfirmed, setExperienceConfirmed] = useState(false);

  // Resume Header fields and confirmation flags
  const [resumeEmail, setResumeEmail] = useState('');
  const [resumePhone, setResumePhone] = useState('');
  const [resumeLinkedin, setResumeLinkedin] = useState('');
  const [resumeGithub, setResumeGithub] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const [linkedinConfirmed, setLinkedinConfirmed] = useState(false);
  const [githubConfirmed, setGithubConfirmed] = useState(false);

  // Mutable refs to bypass closure stale state inside setTimeout callbacks
  const educationConfirmedRef = useRef(false);
  const experienceConfirmedRef = useRef(false);
  const emailConfirmedRef = useRef(false);
  const phoneConfirmedRef = useRef(false);
  const linkedinConfirmedRef = useRef(false);
  const githubConfirmedRef = useRef(false);
  
  // Section-specific confirmation states and mutable refs for local sections
  const [objectiveConfirmed, setObjectiveConfirmed] = useState(false);
  const [certificationsConfirmed, setCertificationsConfirmed] = useState(false);
  const [languagesConfirmed, setLanguagesConfirmed] = useState(false);
  const [achievementsConfirmed, setAchievementsConfirmed] = useState(false);
  const [hobbiesConfirmed, setHobbiesConfirmed] = useState(false);
  const [projectsConfirmed, setProjectsConfirmed] = useState(false);

  const objectiveConfirmedRef = useRef(false);
  const certificationsConfirmedRef = useRef(false);
  const languagesConfirmedRef = useRef(false);
  const achievementsConfirmedRef = useRef(false);
  const hobbiesConfirmedRef = useRef(false);
  const projectsConfirmedRef = useRef(false);

  // Dynamic AI custom suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isEditingFilledDetail, setIsEditingFilledDetail] = useState(false);
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

      // Initialize welcome message
      setChatMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hello ${profile?.personal?.name || 'there'}! I am your JobIndia AI Recruiter. I am going to analyze your profile and ask a few quick questions to compile your professional 11-section resume!`,
          timestamp: new Date(),
        },
      ]);

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

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages, isTyping]);

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

  // Chat Interview Starter
  const handleStartInterview = () => {
    setCurrentScreen('SCANNING');

    // Clear and initialize welcome message
    setChatMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: `Hello ${profile?.personal?.name || 'there'}! I am your JobIndia AI Recruiter. I am going to analyze your profile and ask a few quick questions to compile your professional 11-section resume!`,
        timestamp: new Date(),
      },
    ]);

    setTimeout(() => {
      setCurrentScreen('ATS_REPORT');
    }, 1800);
  };

  // Launch interview chat
  const handleProceedToInterview = () => {
    // Reset session states for header details
    setResumeEmail(profile?.personal?.email || '');
    setResumePhone(profile?.personal?.phone || profile?.personal?.mobile || '');
    setResumeLinkedin('');
    setResumeGithub('');
    setEmailConfirmed(false);
    setPhoneConfirmed(false);
    setLinkedinConfirmed(false);
    setGithubConfirmed(false);
    setEducationConfirmed(false);
    setExperienceConfirmed(false);

    // Reset local interview states
    setCareerObjective('');
    setCertifications('');
    setLanguages('');
    setAchievements('');
    setHobbies('');
    setProjects('');

    setObjectiveConfirmed(false);
    setCertificationsConfirmed(false);
    setLanguagesConfirmed(false);
    setAchievementsConfirmed(false);
    setHobbiesConfirmed(false);
    setProjectsConfirmed(false);

    // Reset ref flags to bypass closure lags
    emailConfirmedRef.current = false;
    phoneConfirmedRef.current = false;
    linkedinConfirmedRef.current = false;
    githubConfirmedRef.current = false;
    educationConfirmedRef.current = false;
    experienceConfirmedRef.current = false;
    objectiveConfirmedRef.current = false;
    certificationsConfirmedRef.current = false;
    languagesConfirmedRef.current = false;
    achievementsConfirmedRef.current = false;
    hobbiesConfirmedRef.current = false;
    projectsConfirmedRef.current = false;

    setCurrentScreen('CHAT');
    // Start exactly with 'email' question first
    triggerNextQuestion('email');
  };

  // Determine Sections to process in AI Chat Interview
  const getMissingSections = () => {
    const missing: (
      | 'email'
      | 'phone'
      | 'linkedin'
      | 'github'
      | 'education'
      | 'experience'
      | 'objective'
      | 'certifications'
      | 'languages'
      | 'achievements'
      | 'hobbies'
      | 'projects'
    )[] = [];

    // Prepend header sections first
    if (!emailConfirmedRef.current) missing.push('email');
    if (!phoneConfirmedRef.current) missing.push('phone');
    if (!linkedinConfirmedRef.current) missing.push('linkedin');
    if (!githubConfirmedRef.current) missing.push('github');

    // Always include education & experience in the interview flow to give the user review/edit options, but only if they haven't been confirmed in this session!
    if (!educationConfirmedRef.current) missing.push('education');
    if (!experienceConfirmedRef.current) missing.push('experience');

    // Check if local extra resume sections are empty using their confirmation refs
    if (!objectiveConfirmedRef.current) missing.push('objective');
    if (!certificationsConfirmedRef.current) missing.push('certifications');
    if (!languagesConfirmedRef.current) missing.push('languages');
    if (!achievementsConfirmedRef.current) missing.push('achievements');
    if (!hobbiesConfirmedRef.current) missing.push('hobbies');
    if (!projectsConfirmedRef.current) missing.push('projects');

    return missing;
  };

  // Helper to fetch horizontal quick suggestions for chat questions
  const getSuggestionsForQuestion = () => {
    if (currentQuestionKey === 'email') {
      if (profile?.personal?.email && !isEditingFilledDetail) {
        return ['Yes, use this email', 'No, let me enter new'];
      }
      return [];
    }
    if (currentQuestionKey === 'phone') {
      const existingPhone = profile?.personal?.phone || profile?.personal?.mobile;
      if (existingPhone && !isEditingFilledDetail) {
        return ['Yes, use this number', 'No, let me enter new'];
      }
      return [];
    }
    if (currentQuestionKey === 'linkedin') {
      return ['Skip this option'];
    }
    if (currentQuestionKey === 'github') {
      return ['Skip this option'];
    }
    if (currentQuestionKey === 'education') {
      const eduInfo = getEducationInfo();
      if (eduInfo && !isEditingFilledDetail) {
        return ['Yes, use this data', 'No, let me enter new'];
      }
      if (qualifications && qualifications.length > 0) {
        return qualifications.map((q: any) => q.name);
      }
      return ['B.Tech CS', 'MCA', 'BCA', 'MBA', 'B.Com', 'Diploma'];
    }
    if (currentQuestionKey === 'experience') {
      const expInfo = getExperienceInfo();
      if (expInfo && !isEditingFilledDetail) {
        return ['Yes, use this data', 'No, let me enter new'];
      }
      return [
        'I am a Fresher / No Experience',
        '1 year as React Native Developer at ABC Tech',
        '2 years as Software Engineer at TCS',
        '3 years as Frontend Developer at Infosys',
        '5+ years as Full Stack Engineer at Startup'
      ];
    }
    if (currentQuestionKey === 'objective') {
      return [
        'Seeking an entry-level coding position to utilize my core frontend skills.',
        'To secure a position as a software engineer and deliver clean scalable apps.',
        'Driven specialist looking to scale business operations and lead technical teams.',
      ];
    }
    if (currentQuestionKey === 'certifications') {
      return [
        'AWS Certified Cloud Practitioner',
        'Google UX Design Professional Certificate',
        'React Native Advanced Certificate',
        'None / Skip this section'
      ];
    }
    if (currentQuestionKey === 'languages') {
      return [
        'English, Hindi',
        'English, Spanish',
        'English, Hindi, Punjabi',
        'English, Hindi, Marathi',
      ];
    }
    if (currentQuestionKey === 'achievements') {
      return [
        'Won 1st Place in National Hackathon',
        'Awarded Best Performer of the Year',
        'Led critical project hitting 10k users',
        'None / Skip this section'
      ];
    }
    if (currentQuestionKey === 'hobbies') {
      return [
        'Coding, Reading, Gaming',
        'Cricket, Fitness, Music',
        'Photography, Traveling, Blogging',
        'None / Skip this section'
      ];
    }
    if (currentQuestionKey === 'projects') {
      return [
        'E-Commerce Mobile App built with React Native & Node.js',
        'Personal Portfolio Website using HTML5, CSS3 & Javascript',
        'Task Management System using React, Node and Firebase',
        'None / Skip this section'
      ];
    }
    return [];
  };

  // Chat: Ask next missing detail
  const triggerNextQuestion = (
    nextKey:
      | 'email'
      | 'phone'
      | 'linkedin'
      | 'github'
      | 'education'
      | 'experience'
      | 'objective'
      | 'certifications'
      | 'languages'
      | 'achievements'
      | 'hobbies'
      | 'projects'
      | 'complete'
  ) => {
    setIsTyping(true);
    setCurrentQuestionKey(nextKey);
    setTimeout(() => {
      setIsTyping(false);
      let text = '';
      if (nextKey === 'email') {
        if (profile?.personal?.email) {
          text = `Let's start by finalizing your Resume Header! ✉️\n\nI see your registered email is **${profile.personal.email}**. Do you want to use this on your resume?`;
        } else {
          text = `Let's start by finalizing your Resume Header! ✉️\n\nWhat email address would you like to put on your resume?`;
        }
      } else if (nextKey === 'phone') {
        const existingPhone = profile?.personal?.phone || profile?.personal?.mobile;
        if (existingPhone) {
          text = `Awesome! Next, what phone number should be on your resume? 📞\n\nI see your profile number is **${existingPhone}**. Do you want to use this?`;
        } else {
          text = `Awesome! Next, what phone number would you like to put on your resume? 📞`;
        }
      } else if (nextKey === 'linkedin') {
        text = `Great! Would you like to add your LinkedIn profile link to your resume? 🔗 (e.g. 'linkedin.com/in/username')\n\nIt is optional, you can tap skip if you don't want to add it!`;
      } else if (nextKey === 'github') {
        text = `Perfect! Would you like to also add your GitHub profile link? 💻 (e.g. 'github.com/username')\n\nIt is optional, you can tap skip if you don't want to add it!`;
      } else if (nextKey === 'education') {
        const eduInfo = getEducationInfo();
        if (eduInfo) {
          const eduText = `${eduInfo.qualification} from ${eduInfo.notes}`;
          text = `I see your profile already has **highest education** filled:\n🎓 *${eduText}*\n\nDo you want to use this data from your profile?`;
        } else {
          text = `First, let's complete your Education! 🎓\n\nWhat is your highest completed qualification? Please share your degree/course name and your college. (e.g., 'BTech in Computer Science from IIT Bombay')`;
        }
      } else if (nextKey === 'experience') {
        const expInfo = getExperienceInfo();
        if (expInfo) {
          const expText = expInfo.text;
          text = `I see your profile already has **work experience** filled:\n💼 *${expText}*\n\nDo you want to use this data from your profile?`;
        } else {
          text = `Got it! Next, let's add your Work History! 💼\n\nHow many years of experience do you have, and what was your last job designation and company? (e.g., '1 year as React Native Developer at ABC Tech' or 'I am a Fresher')`;
        }
      } else if (nextKey === 'objective') {
        text = `Awesome! Next, let's set a professional Career Objective! 🎯\n\nWhat statement best describes your near-term professional goals and career aspirations?`;
      } else if (nextKey === 'certifications') {
        text = `Do you have any Certifications? 🏆\n\nPlease list any professional certificates, credentials, or courses you have completed. (e.g. 'AWS Cloud Practitioner, React Developer from Meta' or select a suggestion)`;
      } else if (nextKey === 'languages') {
        text = `Great! Which Languages do you speak fluently? 🗣️\n\nListing multiple languages helps recruiters discover your communication skills!`;
      } else if (nextKey === 'achievements') {
        text = `Excellent! Next, let's add your Achievements! 🌟\n\nList any honors, awards, hackathon wins, or key milestones in your career.`;
      } else if (nextKey === 'hobbies') {
        text = `Nice! What are your Hobbies or personal interests? 🎨\n\nSharing a few hobbies helps show your team culture match and passions!`;
      } else if (nextKey === 'projects') {
        text = `Lastly, let's add a Key Project you built! 💻\n\nPlease share the project name, technologies used, and a brief description. (e.g., 'E-Commerce App built with React Native & Firebase, supporting 1k active users')`;
      } else {
        text = `Fantastic! 🎉 All missing sections (including dynamic local fields) have been successfully compiled!\n\nLet's head over to customize and generate your stunning, fully loaded 11-section AI Resume!`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `question_${nextKey}_${Date.now()}`,
          sender: 'ai',
          text,
          timestamp: new Date(),
        },
      ]);
    }, 1200);
  };

  // Central Response Processor supporting all 11 sections
  const processUserResponse = async (userText: string) => {
    try {
      if (currentQuestionKey === 'email') {
        if (profile?.personal?.email && !isEditingFilledDetail) {
          if (userText === 'Yes, use this email' || userText.toLowerCase().includes('yes') || userText === 'Keep and Continue' || userText.toLowerCase().includes('keep')) {
            setIsTyping(false);
            setResumeEmail(profile.personal.email);
            setEmailConfirmed(true);
            emailConfirmedRef.current = true;
            setChatMessages((prev) => [
              ...prev,
              {
                id: `email_keep_${Date.now()}`,
                sender: 'ai',
                text: `Perfect! Email verified. 👍`,
                timestamp: new Date(),
              },
            ]);
            setTimeout(() => {
              const remaining = getMissingSections();
              if (remaining.length > 0) {
                triggerNextQuestion(remaining[0]);
              } else {
                triggerNextQuestion('complete');
              }
            }, 1000);
            return;
          } else {
            setIsEditingFilledDetail(true);
            setChatMessages((prev) => [
              ...prev,
              {
                id: `email_prompt_edit_${Date.now()}`,
                sender: 'ai',
                text: `Sure! Please enter the email address you want on your resume:`,
                timestamp: new Date(),
              },
            ]);
            return;
          }
        }

        setIsEditingFilledDetail(false);
        setResumeEmail(userText);
        setEmailConfirmed(true);
        emailConfirmedRef.current = true;
        setIsTyping(false);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `email_success_${Date.now()}`,
            sender: 'ai',
            text: `Email address successfully set to **${userText}**! ✅`,
            timestamp: new Date(),
          },
        ]);
        setTimeout(() => {
          const remaining = getMissingSections();
          if (remaining.length > 0) {
            triggerNextQuestion(remaining[0]);
          } else {
            triggerNextQuestion('complete');
          }
        }, 1000);
        return;
      } else if (currentQuestionKey === 'phone') {
        const existingPhone = profile?.personal?.phone || profile?.personal?.mobile;
        if (existingPhone && !isEditingFilledDetail) {
          if (userText === 'Yes, use this number' || userText.toLowerCase().includes('yes') || userText === 'Keep and Continue' || userText.toLowerCase().includes('keep')) {
            setIsTyping(false);
            setResumePhone(existingPhone);
            setPhoneConfirmed(true);
            phoneConfirmedRef.current = true;
            setChatMessages((prev) => [
              ...prev,
              {
                id: `phone_keep_${Date.now()}`,
                sender: 'ai',
                text: `Perfect! Phone number verified. 👍`,
                timestamp: new Date(),
              },
            ]);
            setTimeout(() => {
              const remaining = getMissingSections();
              if (remaining.length > 0) {
                triggerNextQuestion(remaining[0]);
              } else {
                triggerNextQuestion('complete');
              }
            }, 1000);
            return;
          } else {
            setIsEditingFilledDetail(true);
            setChatMessages((prev) => [
              ...prev,
              {
                id: `phone_prompt_edit_${Date.now()}`,
                sender: 'ai',
                text: `Sure! Please enter the phone number you want on your resume:`,
                timestamp: new Date(),
              },
            ]);
            return;
          }
        }

        setIsEditingFilledDetail(false);
        setResumePhone(userText);
        setPhoneConfirmed(true);
        phoneConfirmedRef.current = true;
        setIsTyping(false);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `phone_success_${Date.now()}`,
            sender: 'ai',
            text: `Phone number successfully set to **${userText}**! ✅`,
            timestamp: new Date(),
          },
        ]);
        setTimeout(() => {
          const remaining = getMissingSections();
          if (remaining.length > 0) {
            triggerNextQuestion(remaining[0]);
          } else {
            triggerNextQuestion('complete');
          }
        }, 1000);
        return;
      } else if (currentQuestionKey === 'linkedin') {
        const isSkip = userText === 'Skip this option' || userText.toLowerCase().includes('skip') || userText.toLowerCase().includes('none') || userText.toLowerCase() === 'no';
        setResumeLinkedin(isSkip ? '' : userText);
        setLinkedinConfirmed(true);
        linkedinConfirmedRef.current = true;
        setIsTyping(false);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `linkedin_success_${Date.now()}`,
            sender: 'ai',
            text: isSkip ? `Skipped LinkedIn profile link. 👍` : `LinkedIn profile link saved successfully! 🔗`,
            timestamp: new Date(),
          },
        ]);
        setTimeout(() => {
          const remaining = getMissingSections();
          if (remaining.length > 0) {
            triggerNextQuestion(remaining[0]);
          } else {
            triggerNextQuestion('complete');
          }
        }, 1000);
        return;
      } else if (currentQuestionKey === 'github') {
        const isSkip = userText === 'Skip this option' || userText.toLowerCase().includes('skip') || userText.toLowerCase().includes('none') || userText.toLowerCase() === 'no';
        setResumeGithub(isSkip ? '' : userText);
        setGithubConfirmed(true);
        githubConfirmedRef.current = true;
        setIsTyping(false);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `github_success_${Date.now()}`,
            sender: 'ai',
            text: isSkip ? `Skipped GitHub profile link. 👍` : `GitHub profile link saved successfully! 💻`,
            timestamp: new Date(),
          },
        ]);
        setTimeout(() => {
          const remaining = getMissingSections();
          if (remaining.length > 0) {
            triggerNextQuestion(remaining[0]);
          } else {
            triggerNextQuestion('complete');
          }
        }, 1000);
        return;
      } else if (currentQuestionKey === 'education') {
        const eduInfo = getEducationInfo();
        if (eduInfo && !isEditingFilledDetail) {
          if (userText === 'Yes, use this data' || userText.toLowerCase().includes('yes') || userText === 'Keep and Continue' || userText.toLowerCase().includes('keep')) {
            setIsTyping(false);
            setEducationConfirmed(true); // Flag completed
            educationConfirmedRef.current = true;
            setChatMessages((prev) => [
              ...prev,
              {
                id: `edu_keep_${Date.now()}`,
                sender: 'ai',
                text: `Perfect! Using your profile education details. 👍`,
                timestamp: new Date(),
              },
            ]);
            setTimeout(() => {
              const remaining = getMissingSections();
              // Note: since educationConfirmed is true, it is excluded from remaining, so we splice experience if we want or just let it transition naturally!
              const nextIndex = remaining.indexOf('education');
              if (nextIndex > -1) remaining.splice(nextIndex, 1);
              if (remaining.length > 0) {
                triggerNextQuestion(remaining[0]);
              } else {
                triggerNextQuestion('complete');
              }
            }, 1000);
            return;
          } else {
            setIsEditingFilledDetail(true);
            setChatMessages((prev) => [
              ...prev,
              {
                id: `edu_prompt_edit_${Date.now()}`,
                sender: 'ai',
                text: `Sure! Please enter your highest education (e.g. BTech in Computer Science from IIT Bombay):`,
                timestamp: new Date(),
              },
            ]);
            return;
          }
        }

        setIsEditingFilledDetail(false);
        const matchedQual = qualifications.find((q: any) => q.name === userText);
        const qualification_id = matchedQual ? matchedQual.id : 2;

        await dispatch(
          updateEducation({
            qualification_id,
            education_notes: `Completed ${userText}`,
          })
        ).unwrap();

        await dispatch(fetchProfile()).unwrap();
        setEducationConfirmed(true); // Flag completed
        educationConfirmedRef.current = true;

        setIsTyping(false);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `edu_success_${Date.now()}`,
            sender: 'ai',
            text: `Awesome! Saved Education details in your profile! ✅`,
            timestamp: new Date(),
          },
        ]);
        
        // Trigger transition to next
        setTimeout(() => {
          const remaining = getMissingSections();
          if (remaining.length > 0) {
            triggerNextQuestion(remaining[0]);
          } else {
            triggerNextQuestion('complete');
          }
        }, 1000);
        return;
      } else if (currentQuestionKey === 'experience') {
        const expInfo = getExperienceInfo();
        if (expInfo && !isEditingFilledDetail) {
          if (userText === 'Yes, use this data' || userText.toLowerCase().includes('yes') || userText === 'Keep and Continue' || userText.toLowerCase().includes('keep')) {
            setIsTyping(false);
            setExperienceConfirmed(true); 
            experienceConfirmedRef.current = true;
            setChatMessages((prev) => [
              ...prev,
              {
                id: `exp_keep_${Date.now()}`,
                sender: 'ai',
                text: `Perfect! Using your profile experience details. 👍`,
                timestamp: new Date(),
              },
            ]);
            setTimeout(() => {
              const remaining = getMissingSections();
              const nextIndex = remaining.indexOf('experience');
              if (nextIndex > -1) remaining.splice(nextIndex, 1);
              if (remaining.length > 0) {
                triggerNextQuestion(remaining[0]);
              } else {
                triggerNextQuestion('complete');
              }
            }, 1000);
            return;
          } else {
            setIsEditingFilledDetail(true);
            setChatMessages((prev) => [
              ...prev,
              {
                id: `exp_prompt_edit_${Date.now()}`,
                sender: 'ai',
                text: `Sure! Please enter your experience (e.g. '1 year as Software Engineer at TCS' or 'Fresher'):`,
                timestamp: new Date(),
              },
            ]);
            return;
          }
        }

        setIsEditingFilledDetail(false);
        const numberMatches = userText.match(/\d+/);
        const years = numberMatches ? parseInt(numberMatches[0], 10) : 0;
        const isFresher = userText.toLowerCase().includes('fresher') || years === 0;

        await dispatch(
          updateExperience({
            experience_type: isFresher ? 'fresher' : 'experienced',
            total_experience_years: isFresher ? null : years,
          })
        ).unwrap();

        await dispatch(fetchProfile()).unwrap();
        setExperienceConfirmed(true); // Flag completed
        experienceConfirmedRef.current = true;

        setIsTyping(false);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `exp_success_${Date.now()}`,
            sender: 'ai',
            text: `Perfect! Saved Work History as ${isFresher ? 'Fresher' : `${years} years experience`} in your profile! ✅`,
            timestamp: new Date(),
          },
        ]);

        // Trigger transition to next
        setTimeout(() => {
          const remaining = getMissingSections();
          if (remaining.length > 0) {
            triggerNextQuestion(remaining[0]);
          } else {
            triggerNextQuestion('complete');
          }
        }, 1000);
        return;
      } else if (currentQuestionKey === 'objective') {
        setCareerObjective(userText);
        setObjectiveConfirmed(true);
        objectiveConfirmedRef.current = true;
        setIsTyping(false);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `obj_success_${Date.now()}`,
            sender: 'ai',
            text: `Wonderful Career Objective! Saved to your resume! 🎯`,
            timestamp: new Date(),
          },
        ]);
      } else if (currentQuestionKey === 'certifications') {
        setCertifications(userText.toLowerCase().includes('skip') || userText.toLowerCase().includes('none') ? '' : userText);
        setCertificationsConfirmed(true);
        certificationsConfirmedRef.current = true;
        setIsTyping(false);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `cert_success_${Date.now()}`,
            sender: 'ai',
            text: `Excellent! Recorded Certifications! 🏆`,
            timestamp: new Date(),
          },
        ]);
      } else if (currentQuestionKey === 'languages') {
        setLanguages(userText);
        setLanguagesConfirmed(true);
        languagesConfirmedRef.current = true;
        setIsTyping(false);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `lang_success_${Date.now()}`,
            sender: 'ai',
            text: `Got it! Added languages: ${userText} 🗣️`,
            timestamp: new Date(),
          },
        ]);
      } else if (currentQuestionKey === 'achievements') {
        setAchievements(userText.toLowerCase().includes('skip') || userText.toLowerCase().includes('none') ? '' : userText);
        setAchievementsConfirmed(true);
        achievementsConfirmedRef.current = true;
        setIsTyping(false);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `ach_success_${Date.now()}`,
            sender: 'ai',
            text: `Incredible achievement! This will really stand out! 🌟`,
            timestamp: new Date(),
          },
        ]);
      } else if (currentQuestionKey === 'hobbies') {
        setHobbies(userText.toLowerCase().includes('skip') || userText.toLowerCase().includes('none') ? '' : userText);
        setHobbiesConfirmed(true);
        hobbiesConfirmedRef.current = true;
        setIsTyping(false);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `hob_success_${Date.now()}`,
            sender: 'ai',
            text: `Aesthetic hobbies! Recorded successfully! 🎨`,
            timestamp: new Date(),
          },
        ]);
      } else if (currentQuestionKey === 'projects') {
        setProjects(userText.toLowerCase().includes('skip') || userText.toLowerCase().includes('none') ? '' : userText);
        setProjectsConfirmed(true);
        projectsConfirmedRef.current = true;
        setIsTyping(false);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `proj_success_${Date.now()}`,
            sender: 'ai',
            text: `Impressive project! Technology focus looks strong! 💻`,
            timestamp: new Date(),
          },
        ]);
      }

      // Scan remaining sections conversationally
      setTimeout(() => {
        const remaining = getMissingSections();
        if (remaining.length > 0) {
          triggerNextQuestion(remaining[0]);
        } else {
          triggerNextQuestion('complete');
        }
      }, 1000);

    } catch (err) {
      setIsTyping(false);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          sender: 'ai',
          text: `Oops! There was a slight issue saving that. Let's try again.`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  // Chat suggestion click handler - automatically submits selection to save time
  const handleSendSuggestion = async (suggestionText: string) => {
    setInputText('');
    setChatMessages((prev) => [
      ...prev,
      {
        id: `user_${Date.now()}`,
        sender: 'user' as const,
        text: suggestionText,
        timestamp: new Date(),
      },
    ]);

    setIsTyping(true);
    await processUserResponse(suggestionText);
  };

  // Chat: Handle User Message Submit
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setChatMessages((prev) => [
      ...prev,
      {
        id: `user_${Date.now()}`,
        sender: 'user',
        text: userText,
        timestamp: new Date(),
      },
    ]);
    setInputText('');

    setIsTyping(true);
    await processUserResponse(userText);
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
      setCurrentScreen('WIZARD');
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
      setCurrentScreen('WIZARD');
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {/* ==================== SCREEN 1: LANDING ==================== */}
        {currentScreen === 'LANDING' && (
          <Animated.View style={[styles.screenContainer, { transform: [{ scale: slideAnim }] }]}>
            {/* Header bar with Back button to exit to previous screen of the app */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              gap: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: colors.surface,
              width: '100%'
            }}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={({ pressed }) => ({
                  padding: 4,
                  opacity: pressed ? 0.7 : 1
                })}
              >
                <Icon name="arrow-back" size={24} color={colors.textPrimary} />
              </Pressable>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                AI Assistant
              </Text>
            </View>

            <ScrollView contentContainerStyle={styles.centerScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.landingLogoContainer}>
                <Animated.View style={[styles.landingOrb, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={[styles.landingOrbInner, { borderColor: ORANGE_COLOR }]}>
                    <Icon name="sparkles" size={54} color={ORANGE_COLOR} />
                  </View>
                </Animated.View>
              </View>



              <View style={{ width: '100%', gap: spacing.md, marginTop: 24, paddingHorizontal: spacing.sm }}>
                {/* Interactive Chat Option */}
                <Pressable
                  onPress={handleStartInterview}
                  style={({ pressed }) => [
                    styles.optionCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: ORANGE_COLOR + '40',
                      borderWidth: 1.5,
                      opacity: pressed ? 0.9 : 1,
                    }
                  ]}
                >
                  <View style={[styles.optionIconContainer, { backgroundColor: ORANGE_COLOR + '15' }]}>
                    <Icon name="chatbubbles-outline" size={24} color={ORANGE_COLOR} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                      AI Recruiter Interview Chat 💬
                    </Text>
                    <Text style={[typography.tiny, { color: colors.textSecondary, marginTop: 4, lineHeight: 15 }]}>
                      Talk to our interactive AI recruiter. We'll identify missing sections in your profile and auto-complete them for a perfect resume!
                    </Text>
                  </View>
                </Pressable>

                {/* Direct Wizard Option */}
                <Pressable
                  onPress={() => setCurrentScreen('WIZARD')}
                  style={({ pressed }) => [
                    styles.optionCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderWidth: 1.5,
                      opacity: pressed ? 0.9 : 1,
                    }
                  ]}
                >
                  <View style={[styles.optionIconContainer, { backgroundColor: colors.border + '30' }]}>
                    <Icon name="sparkles-outline" size={24} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                      Direct Resume Creator 📝
                    </Text>
                    <Text style={[typography.tiny, { color: colors.textSecondary, marginTop: 4, lineHeight: 15 }]}>
                      Skip the interview! Directly choose your target job role, select template themes, and instantly generate an ATS-optimized PDF resume.
                    </Text>
                  </View>
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        )}

        {/* ==================== SCREEN 2: SCANNING ==================== */}
        {currentScreen === 'SCANNING' && (
          <View style={[styles.centerScreen, { backgroundColor: colors.background }]}>
            {/* Centered Animated AI Radar Sparkles Icon */}
            <AnimatedAIIcon />

            {/* Grand Title: Job India AI */}
            <Text style={[typography.h3, { color: colors.textPrimary, fontWeight: 'bold', textAlign: 'center', letterSpacing: -0.3 }]}>
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
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              gap: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: colors.surface,
              width: '100%'
            }}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={({ pressed }) => ({
                  padding: 4,
                  opacity: pressed ? 0.7 : 1
                })}
              >
                <Icon name="arrow-back" size={24} color={colors.textPrimary} />
              </Pressable>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                ATS Score Report
              </Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
              <AtsScoreOrb score={getBaselineATSScore()} colors={colors} typography={typography} profile={profile} />

              {/* Premium Integrated AI Console Button */}
              <View style={{
                marginTop: 24,
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
                      width: '100%',
                      paddingVertical: 14,
                      borderRadius: 28,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 18,
                      shadowColor: ORANGE_COLOR,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.35,
                      shadowRadius: 12,
                      elevation: 6,
                      position: 'relative',
                      overflow: 'hidden',
                      transform: [{ scale: pressed ? 0.98 : 1 }]
                    }
                  ]}
                >
                  {/* Glossy top-edge reflection highlight line */}
                  <View style={{
                    position: 'absolute',
                    top: 1.5,
                    left: '5%',
                    right: '5%',
                    height: 1.8,
                    backgroundColor: 'rgba(255, 255, 255, 0.45)',
                    borderRadius: 1,
                  }} />

                  {/* Left Side: Branded Glowing AI Avatar Ring */}
                  <View style={{
                    borderWidth: 1.2,
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    padding: 2.5,
                    borderRadius: 10,
                    marginRight: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  }}>
                    <Icon name="sparkles" size={18} color="#fff" />
                  </View>

                  {/* Center: Double-Stacked Text (Action Title + Interactive Hint Subtitle!) */}
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 14.5, fontWeight: '900', letterSpacing: 0.3 }}>
                      Start Complelete your Detail With AI
                    </Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 9.5, fontWeight: '600', marginTop: 2 }}>
                      Fill missing details with AI best suggestions
                    </Text>
                  </View>

                  {/* Right Side: Glowing Chevron Circle */}
                  <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: 'rgba(255, 255, 255, 0.22)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon name="chevron-forward" size={16} color="#fff" />
                  </View>
                </Pressable>

                {/* 2. Sleek Secondary Action: Underlined Skip Link */}
                <Pressable
                  onPress={() => setCurrentScreen('WIZARD')}
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
                    Skip directly to template customizer
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
              currentQuestionKey={currentQuestionKey}
              chatMessages={chatMessages}
              inputText={inputText}
              setInputText={setInputText}
              isKeyboardVisible={isKeyboardVisible}
              colors={colors}
              isDark={isDark}
              getSuggestionsForQuestion={getSuggestionsForQuestion}
              handleSendSuggestion={handleSendSuggestion}
              handleSendMessage={handleSendMessage}
              setCurrentScreen={setCurrentScreen}
              profile={profile}
              ORANGE_COLOR={ORANGE_COLOR}
              isTyping={isTyping}
              handleGenerateResume={handleGenerateResumeFromChat}
            />
          </Animated.View>
        )}

        {/* ==================== SCREEN 4: WIZARD ==================== */}
        {currentScreen === 'WIZARD' && (
          <Animated.View style={[styles.screenContainer, { transform: [{ scale: slideAnim }] }]}>
            <View style={[styles.wizardHeader, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
              <Pressable
                onPress={() => setCurrentScreen('LANDING')}
                style={({ pressed }) => ({
                  padding: 4,
                  opacity: pressed ? 0.7 : 1
                })}
              >
                <Icon name="arrow-back" size={24} color={colors.textPrimary} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={[typography.h3, { color: colors.textPrimary }]}>Setup AI Customization</Text>
                <Text style={[typography.small, { color: colors.textSecondary }]}>
                  Match your profile experience dynamically against your target job
                </Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.wizardScroll} showsVerticalScrollIndicator={false}>
              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginBottom: 8 }]}>
                What is your target job title? 🎯
              </Text>
              <TextInput
                value={targetJob}
                onChangeText={setTargetJob}
                placeholder="e.g. Senior Frontend Developer, HR Manager..."
                placeholderTextColor={colors.textPlaceholder}
                style={[styles.wizardInput, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
              />

              {/* Wizard Target Job Quick Suggestions */}
              <View style={{ marginVertical: 8 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {['React Native Developer', 'Full Stack Developer', 'UI/UX Designer', 'HR Manager', 'Project Manager', 'Data Analyst'].map((job, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => setTargetJob(job)}
                      style={({ pressed }) => [
                        {
                          backgroundColor: colors.surface,
                          borderColor: ORANGE_COLOR + '20',
                          borderWidth: 1,
                          borderRadius: 16,
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          opacity: pressed ? 0.8 : 1,
                        }
                      ]}
                    >
                      <Text style={[typography.tiny, { color: colors.textPrimary, fontWeight: '600' }]}>
                        {job}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Expandable Quick Profile Info Card */}
              <View style={[styles.profileReviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Pressable
                  onPress={() => setShowQuickEdit(!showQuickEdit)}
                  style={styles.reviewHeader}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Icon name="create-outline" size={18} color={ORANGE_COLOR} />
                      <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                        Review & Edit Profile Data
                      </Text>
                    </View>
                    <Icon name={showQuickEdit ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} />
                  </View>
                </Pressable>

                {showQuickEdit && (
                  <View style={styles.reviewBody}>
                    <Text style={[typography.tiny, { color: colors.textSecondary, marginBottom: 4 }]}>Your Name</Text>
                    <TextInput
                      value={editedName}
                      onChangeText={setEditedName}
                      placeholder="Enter Full Name"
                      placeholderTextColor={colors.textPlaceholder}
                      style={[styles.wizardInput, { color: colors.textPrimary, backgroundColor: colors.background, borderColor: colors.border, height: 44, marginBottom: 12 }]}
                    />

                    <Text style={[typography.tiny, { color: colors.textSecondary, marginBottom: 4 }]}>Bio / Brief Summary</Text>
                    <TextInput
                      value={editedBio}
                      onChangeText={setEditedBio}
                      placeholder="Add brief career summary"
                      placeholderTextColor={colors.textPlaceholder}
                      multiline
                      style={[styles.wizardTextarea, { color: colors.textPrimary, backgroundColor: colors.background, borderColor: colors.border, height: 60, marginBottom: 12 }]}
                    />

                    <Text style={[typography.tiny, { color: colors.textSecondary, marginBottom: 4 }]}>Work Experience (Last designation & company)</Text>
                    <TextInput
                      value={editedExperience}
                      onChangeText={setEditedExperience}
                      placeholder="e.g. Software Engineer at Tech Corp"
                      placeholderTextColor={colors.textPlaceholder}
                      style={[styles.wizardInput, { color: colors.textPrimary, backgroundColor: colors.background, borderColor: colors.border, height: 44, marginBottom: 12 }]}
                    />

                    <Text style={[typography.tiny, { color: colors.textSecondary, marginBottom: 4 }]}>Highest Education (Degree & school)</Text>
                    <TextInput
                      value={editedEducation}
                      onChangeText={setEditedEducation}
                      placeholder="e.g. BTech in CS from XYZ University"
                      placeholderTextColor={colors.textPlaceholder}
                      style={[styles.wizardInput, { color: colors.textPrimary, backgroundColor: colors.background, borderColor: colors.border, height: 44, marginBottom: 16 }]}
                    />

                    <Pressable
                      onPress={handleSaveQuickEdit}
                      style={[styles.primaryOrangeBtn, { height: 40, width: '100%', marginTop: 0, alignSelf: 'center', shadowOpacity: 0.1 }]}
                    >
                      <Text style={[typography.small, { color: '#fff', fontWeight: 'bold' }]}>Save Profile Info</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: 16, marginBottom: 8 }]}>
                Select Resume Tone Style 🎨
              </Text>
              <View style={styles.tonesRow}>
                {(['Professional', 'Technical', 'Creative', 'Startup'] as const).map((tone) => (
                  <Pressable
                    key={tone}
                    onPress={() => setSelectedTone(tone)}
                    style={[
                      styles.toneCard,
                      { borderColor: colors.border, backgroundColor: colors.surface },
                      selectedTone === tone && { borderColor: ORANGE_COLOR, backgroundColor: ORANGE_COLOR + '10' },
                    ]}
                  >
                    <Text style={[typography.small, { color: selectedTone === tone ? ORANGE_COLOR : colors.textPrimary, fontWeight: 'bold' }]}>
                      {tone}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: 20, marginBottom: 8 }]}>
                Paste Job Description (Optional for ATS Optimization) 📊
              </Text>
              <TextInput
                value={jobDescription}
                onChangeText={setJobDescription}
                placeholder="Paste the target JD here to automatically scan and inject highly matching keywords..."
                placeholderTextColor={colors.textPlaceholder}
                multiline
                numberOfLines={6}
                style={[
                  styles.wizardTextarea,
                  { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              />

              <Pressable
                onPress={handleGenerateResume}
                disabled={!targetJob.trim()}
                style={[
                  styles.primaryOrangeBtn,
                  { opacity: targetJob.trim() ? 1 : 0.6, shadowColor: ORANGE_COLOR, marginBottom: 40 },
                ]}
              >
                <Icon name="sparkles" size={20} color="#fff" />
                <Text style={[typography.labelMedium, { color: '#fff', fontWeight: 'bold' }]}>
                  Generate ATS Optimized Resume
                </Text>
              </Pressable>
            </ScrollView>
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
          <Animated.View style={[styles.screenContainer, { transform: [{ scale: slideAnim }] }]}>
            <View style={[styles.workspaceHeader, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
              <Pressable
                onPress={() => setCurrentScreen('WIZARD')}
                style={({ pressed }) => ({
                  padding: 4,
                  opacity: pressed ? 0.7 : 1
                })}
              >
                <Icon name="arrow-back" size={24} color={colors.textPrimary} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={[typography.h3, { color: colors.textPrimary }]}>AI Resume Workspace</Text>
                <Text style={[typography.small, { color: colors.textSecondary }]}>
                  Tap any text card below to instantly edit inline!
                </Text>
              </View>

              <View style={[styles.scoreBadge, { backgroundColor: ORANGE_COLOR + '20' }]}>
                <Text style={[typography.h4, { color: ORANGE_COLOR }]}>{generatedResume.score}%</Text>
                <Text style={[typography.tiny, { color: ORANGE_COLOR }]}>ATS SCORE</Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.workspaceScroll} showsVerticalScrollIndicator={false}>
              {/* Theme Selector (5 Templates) */}
              <View style={[styles.editorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[typography.labelMedium, { color: colors.textPrimary, marginBottom: 8, fontWeight: 'bold' }]}>
                  Select Professional Template Layout (5 Styles) 🎨
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                  <Pressable
                    onPress={() => setSelectedTheme('OrangeGlow')}
                    style={[
                      styles.themePill,
                      selectedTheme === 'OrangeGlow' ? { borderColor: ORANGE_COLOR, backgroundColor: ORANGE_COLOR + '12' } : { borderColor: colors.border }
                    ]}
                  >
                    <View style={[styles.colorDot, { backgroundColor: ORANGE_COLOR }]} />
                    <Text style={[typography.tiny, { color: colors.textPrimary, fontWeight: '600' }]}>Orange Glow</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelectedTheme('MidnightSlate')}
                    style={[
                      styles.themePill,
                      selectedTheme === 'MidnightSlate' ? { borderColor: '#60a5fa', backgroundColor: '#60a5fa12' } : { borderColor: colors.border }
                    ]}
                  >
                    <View style={[styles.colorDot, { backgroundColor: '#60a5fa' }]} />
                    <Text style={[typography.tiny, { color: colors.textPrimary, fontWeight: '600' }]}>Midnight Slate</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelectedTheme('ForestMint')}
                    style={[
                      styles.themePill,
                      selectedTheme === 'ForestMint' ? { borderColor: '#10b981', backgroundColor: '#10b98112' } : { borderColor: colors.border }
                    ]}
                  >
                    <View style={[styles.colorDot, { backgroundColor: '#10b981' }]} />
                    <Text style={[typography.tiny, { color: colors.textPrimary, fontWeight: '600' }]}>Forest Mint</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelectedTheme('RoyalAmethyst')}
                    style={[
                      styles.themePill,
                      selectedTheme === 'RoyalAmethyst' ? { borderColor: '#a78bfa', backgroundColor: '#a78bfa12' } : { borderColor: colors.border }
                    ]}
                  >
                    <View style={[styles.colorDot, { backgroundColor: '#a78bfa' }]} />
                    <Text style={[typography.tiny, { color: colors.textPrimary, fontWeight: '600' }]}>Royal Amethyst</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelectedTheme('CrimsonRuby')}
                    style={[
                      styles.themePill,
                      selectedTheme === 'CrimsonRuby' ? { borderColor: '#f87171', backgroundColor: '#f8717112' } : { borderColor: colors.border }
                    ]}
                  >
                    <View style={[styles.colorDot, { backgroundColor: '#f87171' }]} />
                    <Text style={[typography.tiny, { color: colors.textPrimary, fontWeight: '600' }]}>Crimson Ruby</Text>
                  </Pressable>
                </ScrollView>
              </View>

              {/* Dynamic Styled Resume Template Sheet */}
              <View style={[
                styles.resumeSheet, 
                { 
                  backgroundColor: '#ffffff', 
                  borderColor: '#e2e8f0', 
                  borderTopWidth: 8,
                  borderTopColor: themeColors.accentLine || themeColors.accent
                }
              ]}>
                <Text style={[typography.h3, { color: themeColors.textAccent, fontWeight: 'bold' }]}>
                  {profile?.personal?.name || 'Your Name'}
                </Text>
                <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4 }]}>
                  Target Role: {targetJob}
                </Text>

                {/* Contact Information Row */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
                  {(profile?.personal?.phone || profile?.personal?.mobile) && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Icon name="call-outline" size={12} color={colors.textSecondary} />
                      <Text style={[typography.tiny, { color: colors.textSecondary }]}>
                        {profile?.personal?.phone || profile?.personal?.mobile}
                      </Text>
                    </View>
                  )}
                  {profile?.personal?.email && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Icon name="mail-outline" size={12} color={colors.textSecondary} />
                      <Text style={[typography.tiny, { color: colors.textSecondary }]}>{profile.personal.email}</Text>
                    </View>
                  )}
                  {profile?.personal?.city && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Icon name="location-outline" size={12} color={colors.textSecondary} />
                      <Text style={[typography.tiny, { color: colors.textSecondary }]}>{profile.personal.city}</Text>
                    </View>
                  )}
                </View>

                <View style={[styles.sheetDivider, { backgroundColor: themeColors.accent + '30' }]} />

                {/* Summary Section */}
                <Text style={[typography.labelMedium, { color: themeColors.textAccent, fontWeight: 'bold', marginBottom: 4 }]}>
                  PROFESSIONAL SUMMARY
                </Text>
                <TextInput
                  value={editedSummary}
                  onChangeText={setEditedSummary}
                  multiline
                  style={[styles.inlineInput, { color: colors.textPrimary }]}
                />

                {/* Career Objective Section */}
                {careerObjective ? (
                  <>
                    <View style={[styles.sheetDivider, { backgroundColor: themeColors.accent + '30' }]} />
                    <Text style={[typography.labelMedium, { color: themeColors.textAccent, fontWeight: 'bold', marginBottom: 4 }]}>
                      CAREER OBJECTIVE
                    </Text>
                    <TextInput
                      value={careerObjective}
                      onChangeText={setCareerObjective}
                      multiline
                      style={[styles.inlineInput, { color: colors.textPrimary }]}
                    />
                  </>
                ) : null}

                {/* Work History Section */}
                {profile?.experience && profile.experience.length > 0 && (
                  <>
                    <View style={[styles.sheetDivider, { backgroundColor: themeColors.accent + '30' }]} />
                    <Text style={[typography.labelMedium, { color: themeColors.textAccent, fontWeight: 'bold', marginBottom: 8 }]}>
                      WORK EXPERIENCE
                    </Text>
                    {profile.experience.map((exp: any, idx: number) => (
                      <View key={idx} style={{ marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={[typography.small, { color: colors.textPrimary, fontWeight: 'bold', flex: 1 }]}>
                            {exp.designation || 'Specialist'} at {exp.company || 'Company'}
                          </Text>
                          <Text style={[typography.tiny, { color: colors.textSecondary }]}>
                            {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date || ''}
                          </Text>
                        </View>
                        {idx === 0 && editedBullets.length > 0 ? (
                          editedBullets.map((bullet, bIdx) => (
                            <View key={bIdx} style={[styles.bulletRow, { marginTop: 4 }]}>
                              <Text style={{ color: themeColors.accent, marginRight: 8, fontSize: 14 }}>•</Text>
                              <TextInput
                                value={bullet}
                                onChangeText={(text) => {
                                  const newBullets = [...editedBullets];
                                  newBullets[bIdx] = text;
                                  setEditedBullets(newBullets);
                                }}
                                multiline
                                style={[styles.inlineInput, { flex: 1, color: colors.textPrimary, paddingVertical: 2 }]}
                              />
                            </View>
                          ))
                        ) : (
                          <Text style={[typography.tiny, { color: colors.textSecondary, marginTop: 4, fontStyle: 'italic' }]}>
                            {exp.description || 'Contributed to key projects and operational workflows.'}
                          </Text>
                        )}
                      </View>
                    ))}
                  </>
                )}

                {/* Education Section */}
                {profile?.education && profile.education.length > 0 && (
                  <>
                    <View style={[styles.sheetDivider, { backgroundColor: themeColors.accent + '30' }]} />
                    <Text style={[typography.labelMedium, { color: themeColors.textAccent, fontWeight: 'bold', marginBottom: 8 }]}>
                      EDUCATION
                    </Text>
                    {profile.education.map((edu: any, idx: number) => (
                      <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={[typography.small, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                            {edu.degree || 'Degree'}
                          </Text>
                          <Text style={[typography.tiny, { color: colors.textSecondary }]}>
                            {edu.school_university || 'University'}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={[typography.tiny, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                            {edu.gpa_percentage || ''}
                          </Text>
                          <Text style={[typography.tiny, { color: colors.textSecondary }]}>
                            Class of {edu.passing_year || ''}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}

                {/* Certifications Section */}
                {certifications ? (
                  <>
                    <View style={[styles.sheetDivider, { backgroundColor: themeColors.accent + '30' }]} />
                    <Text style={[typography.labelMedium, { color: themeColors.textAccent, fontWeight: 'bold', marginBottom: 4 }]}>
                      CERTIFICATIONS
                    </Text>
                    <TextInput
                      value={certifications}
                      onChangeText={setCertifications}
                      multiline
                      style={[styles.inlineInput, { color: colors.textPrimary }]}
                    />
                  </>
                ) : null}

                {/* Key Projects Section */}
                {projects ? (
                  <>
                    <View style={[styles.sheetDivider, { backgroundColor: themeColors.accent + '30' }]} />
                    <Text style={[typography.labelMedium, { color: themeColors.textAccent, fontWeight: 'bold', marginBottom: 4 }]}>
                      KEY PROJECTS
                    </Text>
                    <TextInput
                      value={projects}
                      onChangeText={setProjects}
                      multiline
                      style={[styles.inlineInput, { color: colors.textPrimary }]}
                    />
                  </>
                ) : null}

                {/* Languages Section */}
                {languages ? (
                  <>
                    <View style={[styles.sheetDivider, { backgroundColor: themeColors.accent + '30' }]} />
                    <Text style={[typography.labelMedium, { color: themeColors.textAccent, fontWeight: 'bold', marginBottom: 4 }]}>
                      LANGUAGES
                    </Text>
                    <TextInput
                      value={languages}
                      onChangeText={setLanguages}
                      multiline
                      style={[styles.inlineInput, { color: colors.textPrimary }]}
                    />
                  </>
                ) : null}

                {/* Achievements Section */}
                {achievements ? (
                  <>
                    <View style={[styles.sheetDivider, { backgroundColor: themeColors.accent + '30' }]} />
                    <Text style={[typography.labelMedium, { color: themeColors.textAccent, fontWeight: 'bold', marginBottom: 4 }]}>
                      ACHIEVEMENTS
                    </Text>
                    <TextInput
                      value={achievements}
                      onChangeText={setAchievements}
                      multiline
                      style={[styles.inlineInput, { color: colors.textPrimary }]}
                    />
                  </>
                ) : null}

                {/* Hobbies Section */}
                {hobbies ? (
                  <>
                    <View style={[styles.sheetDivider, { backgroundColor: themeColors.accent + '30' }]} />
                    <Text style={[typography.labelMedium, { color: themeColors.textAccent, fontWeight: 'bold', marginBottom: 4 }]}>
                      HOBBIES & INTERESTS
                    </Text>
                    <TextInput
                      value={hobbies}
                      onChangeText={setHobbies}
                      multiline
                      style={[styles.inlineInput, { color: colors.textPrimary }]}
                    />
                  </>
                ) : null}

                <View style={[styles.sheetDivider, { backgroundColor: themeColors.accent + '30' }]} />

                {/* Recommended Skills */}
                <Text style={[typography.labelMedium, { color: themeColors.textAccent, fontWeight: 'bold', marginBottom: 8 }]}>
                  ATS CRITICAL KEYWORDS & SKILLS
                </Text>
                <View style={styles.skillsContainer}>
                  {generatedResume.skills.map((skill, idx) => (
                    <View key={idx} style={[styles.skillBadge, { backgroundColor: themeColors.accent + '15' }]}>
                      <Icon name="checkmark-circle" size={14} color={themeColors.accent} />
                      <Text style={[typography.tiny, { color: themeColors.textAccent, fontWeight: 'bold' }]}>
                        {skill}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ gap: spacing.md, marginTop: spacing.md, width: '100%' }}>
                <Pressable
                  onPress={handleSaveToProfile}
                  style={[styles.workspaceBtn, { backgroundColor: ORANGE_COLOR, width: '100%' }]}
                >
                  <Icon name="cloud-upload-outline" size={18} color="#fff" />
                  <Text style={[typography.small, { color: '#fff', fontWeight: 'bold' }]}>
                    Sync & Save to Candidate Profile
                  </Text>
                </Pressable>

                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <Pressable
                    onPress={handleExportHtmlResume}
                    style={[styles.workspaceBtn, { flex: 1, borderColor: ORANGE_COLOR, borderWidth: 1.5, backgroundColor: ORANGE_COLOR + '08' }]}
                  >
                    <Icon name="download-outline" size={18} color={ORANGE_COLOR} />
                    <Text style={[typography.small, { color: ORANGE_COLOR, fontWeight: 'bold' }]}>
                      Download PDF
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleExportResume}
                    style={[styles.workspaceBtn, { flex: 1, borderColor: colors.border, borderWidth: 1.5, backgroundColor: 'transparent' }]}
                  >
                    <Icon name="share-social-outline" size={18} color={colors.textPrimary} />
                    <Text style={[typography.small, { color: colors.textPrimary, fontWeight: 'bold' }]}>
                      Share Text
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={() => setCurrentScreen('WIZARD')}
                style={[styles.textBtn, { marginBottom: 50 }]}
              >
                <Text style={[typography.small, { color: colors.textSecondary }]}>
                  ← Back to Customization Options
                </Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
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
