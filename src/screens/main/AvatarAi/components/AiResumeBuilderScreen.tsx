import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  ActivityIndicator,
  Easing,
  StyleSheet,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState, AppDispatch } from '../../../../redux/store';
import {
  fetchProfile,
  updateEducation,
  updateExperience,
  updatePersonalProfile,
} from '../../../../redux/slice/profileSlice';
import { fetchMetaQualifications } from '../../../../redux/slice/metaSlice';
import { generateAISuggestions, searchAICertifications } from '../../../../services/geminiService';
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface AiProfileCoPilotProps {
  colors: any;
  isDark: boolean;
  setCurrentScreen: (screen: 'LANDING' | 'SCANNING' | 'ATS_REPORT' | 'CHAT' | 'WIZARD' | 'GENERATING' | 'WORKSPACE') => void;
  ORANGE_COLOR: string;
  isKeyboardVisible: boolean;
  onInterviewComplete: (interviewData: {
    resumeHeadline: string;
    resumeEmail: string;
    resumePhone: string;
    resumeLinkedin: string;
    resumeGithub: string;
    careerObjective: string;
    certifications: string;
    languages: string;
    achievements: string;
    hobbies: string;
    projects: string;
    educationText: string;
    experienceText: string;
  }) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  suggestions?: string[];
  associatedKey?: string;
}

const SmallSpinningAIIcon: React.FC<{ ORANGE_COLOR: string }> = ({ ORANGE_COLOR }) => {
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
    <Animated.View style={{
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: ORANGE_COLOR + '15',
      alignItems: 'center',
      justifyContent: 'center',
      transform: [{ rotate }],
      borderWidth: 1,
      borderColor: ORANGE_COLOR + '40',
    }}>
      <Icon name="logo-electron" size={16} color={ORANGE_COLOR} />
    </Animated.View>
  );
};

export const AiProfileCoPilot: React.FC<AiProfileCoPilotProps> = ({
  colors,
  isDark,
  setCurrentScreen,
  ORANGE_COLOR,
  isKeyboardVisible,
  onInterviewComplete,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const profile = useSelector((state: RootState) => state.profile?.data);
  const qualifications = useSelector((state: RootState) => state.meta?.qualifications) || [];

  const [localKeyboardVisible, setLocalKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setLocalKeyboardVisible(true);
      }
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      () => {
        setKeyboardHeight(0);
        setLocalKeyboardVisible(false);
      }
    );
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const [isInitializing, setIsInitializing] = useState(true);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const chatScrollRef = useRef<ScrollView>(null);

  const [isPendingSessionRestore, setIsPendingSessionRestore] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<any>(null);
  const [activeLongPressKey, setActiveLongPressKey] = useState<string | null>(null);

  const resetSessionStates = () => {
    setResumeEmail('');
    setResumePhone('');
    setResumeLinkedin('');
    setResumeGithub('');
    setResumeHeadline('');
    setEmailConfirmed(false);
    setPhoneConfirmed(false);
    setLinkedinConfirmed(false);
    setGithubConfirmed(true);
    setHeadlineConfirmed(false);
    setCareerObjective('');
    setCertifications('');
    setLanguages('');
    setSelectedLanguages([]);
    setAchievements('');
    setHobbies('');
    setProjects('');
    setEducationConfirmed(false);
    setExperienceConfirmed(false);
    setObjectiveConfirmed(false);
    setCertificationsConfirmed(false);
    setLanguagesConfirmed(false);
    setAchievementsConfirmed(false);
    setHobbiesConfirmed(false);
    setProjectsConfirmed(false);

    emailConfirmedRef.current = false;
    phoneConfirmedRef.current = false;
    linkedinConfirmedRef.current = false;
    githubConfirmedRef.current = true;
    headlineConfirmedRef.current = false;
    educationConfirmedRef.current = false;
    experienceConfirmedRef.current = false;
    objectiveConfirmedRef.current = false;
    certificationsConfirmedRef.current = false;
    languagesConfirmedRef.current = false;
    achievementsConfirmedRef.current = false;
    hobbiesConfirmedRef.current = false;
    projectsConfirmedRef.current = false;

    setHistoryStack([]);
    setRedoStack([]);
  };

  // Local Chat / Interview States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [historyStack, setHistoryStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentQuestionKey, setCurrentQuestionKey] = useState<
    | 'headline'
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
    | null
  >(null);
  const [isTyping, setIsTyping] = useState(false);

  // Resume Header fields and confirmation flags
  const [resumeEmail, setResumeEmail] = useState('');
  const [resumePhone, setResumePhone] = useState('');
  const [resumeLinkedin, setResumeLinkedin] = useState('');
  const [resumeGithub, setResumeGithub] = useState('');
  const [resumeHeadline, setResumeHeadline] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const [linkedinConfirmed, setLinkedinConfirmed] = useState(false);
  const [githubConfirmed, setGithubConfirmed] = useState(true);
  const [headlineConfirmed, setHeadlineConfirmed] = useState(false);

  // Extra resume sections loaded locally/conversationally
  const [careerObjective, setCareerObjective] = useState('');
  const [certifications, setCertifications] = useState('');
  const [languages, setLanguages] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [achievements, setAchievements] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [projects, setProjects] = useState('');

  // Section-specific confirmation states
  const [educationConfirmed, setEducationConfirmed] = useState(false);
  const [experienceConfirmed, setExperienceConfirmed] = useState(false);
  const [objectiveConfirmed, setObjectiveConfirmed] = useState(false);
  const [certificationsConfirmed, setCertificationsConfirmed] = useState(false);
  const [languagesConfirmed, setLanguagesConfirmed] = useState(false);
  const [achievementsConfirmed, setAchievementsConfirmed] = useState(false);
  const [hobbiesConfirmed, setHobbiesConfirmed] = useState(false);
  const [projectsConfirmed, setProjectsConfirmed] = useState(false);

  // Mutable refs to bypass closure stale state inside setTimeout callbacks
  const emailConfirmedRef = useRef(false);
  const phoneConfirmedRef = useRef(false);
  const linkedinConfirmedRef = useRef(false);
  const githubConfirmedRef = useRef(true);
  const headlineConfirmedRef = useRef(false);
  const educationConfirmedRef = useRef(false);
  const experienceConfirmedRef = useRef(false);
  const objectiveConfirmedRef = useRef(false);
  const certificationsConfirmedRef = useRef(false);
  const languagesConfirmedRef = useRef(false);
  const achievementsConfirmedRef = useRef(false);
  const hobbiesConfirmedRef = useRef(false);
  const projectsConfirmedRef = useRef(false);

  const applySnapshot = (snapshot: any) => {
    setChatMessages(snapshot.chatMessages);
    setCurrentQuestionKey(snapshot.currentQuestionKey);
    setResumeEmail(snapshot.resumeEmail);
    setResumePhone(snapshot.resumePhone);
    setResumeLinkedin(snapshot.resumeLinkedin);
    setResumeGithub(snapshot.resumeGithub);
    setResumeHeadline(snapshot.resumeHeadline);
    setEmailConfirmed(snapshot.emailConfirmed);
    setPhoneConfirmed(snapshot.phoneConfirmed);
    setLinkedinConfirmed(snapshot.linkedinConfirmed);
    setGithubConfirmed(snapshot.githubConfirmed);
    setHeadlineConfirmed(snapshot.headlineConfirmed);
    setCareerObjective(snapshot.careerObjective);
    setCertifications(snapshot.certifications);
    setLanguages(snapshot.languages);
    setSelectedLanguages(snapshot.selectedLanguages || []);
    setAchievements(snapshot.achievements);
    setHobbies(snapshot.hobbies);
    setProjects(snapshot.projects);
    setEducationConfirmed(snapshot.educationConfirmed);
    setExperienceConfirmed(snapshot.experienceConfirmed);
    setObjectiveConfirmed(snapshot.objectiveConfirmed);
    setCertificationsConfirmed(snapshot.certificationsConfirmed);
    setLanguagesConfirmed(snapshot.languagesConfirmed);
    setAchievementsConfirmed(snapshot.achievementsConfirmed);
    setHobbiesConfirmed(snapshot.hobbiesConfirmed);
    setProjectsConfirmed(snapshot.projectsConfirmed);

    // Sync refs
    emailConfirmedRef.current = snapshot.emailConfirmed;
    phoneConfirmedRef.current = snapshot.phoneConfirmed;
    linkedinConfirmedRef.current = snapshot.linkedinConfirmed;
    githubConfirmedRef.current = snapshot.githubConfirmed;
    headlineConfirmedRef.current = snapshot.headlineConfirmed;
    educationConfirmedRef.current = snapshot.educationConfirmed;
    experienceConfirmedRef.current = snapshot.experienceConfirmed;
    objectiveConfirmedRef.current = snapshot.objectiveConfirmed;
    certificationsConfirmedRef.current = snapshot.certificationsConfirmed;
    languagesConfirmedRef.current = snapshot.languagesConfirmed;
    achievementsConfirmedRef.current = snapshot.achievementsConfirmed;
    hobbiesConfirmedRef.current = snapshot.hobbiesConfirmed;
    projectsConfirmedRef.current = snapshot.projectsConfirmed;
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;

    // Save current state to Redo stack
    const currentSnapshot = {
      chatMessages: [...chatMessages],
      currentQuestionKey,
      resumeEmail,
      resumePhone,
      resumeLinkedin,
      resumeGithub,
      resumeHeadline,
      emailConfirmed,
      phoneConfirmed,
      linkedinConfirmed,
      githubConfirmed,
      headlineConfirmed,
      careerObjective,
      certifications,
      languages,
      selectedLanguages: [...selectedLanguages],
      achievements,
      hobbies,
      projects,
      educationConfirmed,
      experienceConfirmed,
      objectiveConfirmed,
      certificationsConfirmed,
      languagesConfirmed,
      achievementsConfirmed,
      hobbiesConfirmed,
      projectsConfirmed,
    };

    setRedoStack((prev) => [...prev, currentSnapshot]);

    // Pop previous state and apply
    const prevSnapshot = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    applySnapshot(prevSnapshot);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    // Save current state to History stack
    const currentSnapshot = {
      chatMessages: [...chatMessages],
      currentQuestionKey,
      resumeEmail,
      resumePhone,
      resumeLinkedin,
      resumeGithub,
      resumeHeadline,
      emailConfirmed,
      phoneConfirmed,
      linkedinConfirmed,
      githubConfirmed,
      headlineConfirmed,
      careerObjective,
      certifications,
      languages,
      selectedLanguages: [...selectedLanguages],
      achievements,
      hobbies,
      projects,
      educationConfirmed,
      experienceConfirmed,
      objectiveConfirmed,
      certificationsConfirmed,
      languagesConfirmed,
      achievementsConfirmed,
      hobbiesConfirmed,
      projectsConfirmed,
    };

    setHistoryStack((prev) => [...prev, currentSnapshot]);

    // Pop next state and apply
    const nextSnapshot = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    applySnapshot(nextSnapshot);
  };

  const [isEditingFilledDetail, setIsEditingFilledDetail] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Helper to resolve education info from profile
  const getEducationInfo = () => {
    if (!profile?.education) return null;
    let eduObj = null;
    if (Array.isArray(profile.education)) {
      if (profile.education.length > 0) eduObj = profile.education[0];
    } else {
      eduObj = profile.education;
    }
    if (!eduObj) return null;

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

    if (!qualName) qualName = eduObj.degree || eduObj.qualification || '';
    const notes = eduObj.education_notes || eduObj.notes || eduObj.school_university || '';

    if (!qualName && !notes) return null;
    return {
      qualification: qualName || 'Degree/Qualification',
      notes: notes || 'University/College details',
    };
  };

  // Helper to resolve experience info from profile
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
        text: 'Fresher',
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

  // Determine remaining sections conversational step
  const getMissingSections = () => {
    const missing: (
      | 'headline'
      | 'email'
      | 'phone'
      | 'linkedin'
      | 'education'
      | 'experience'
      | 'objective'
      | 'certifications'
      | 'languages'
      | 'achievements'
      | 'hobbies'
      | 'projects'
    )[] = [];

    if (!headlineConfirmedRef.current) missing.push('headline');
    if (!emailConfirmedRef.current) missing.push('email');
    if (!phoneConfirmedRef.current) missing.push('phone');
    if (!linkedinConfirmedRef.current) missing.push('linkedin');

    if (!educationConfirmedRef.current) missing.push('education');
    if (!experienceConfirmedRef.current) missing.push('experience');

    if (!objectiveConfirmedRef.current) missing.push('objective');
    if (!certificationsConfirmedRef.current) missing.push('certifications');
    if (!languagesConfirmedRef.current) missing.push('languages');
    if (!achievementsConfirmedRef.current) missing.push('achievements');
    if (!hobbiesConfirmedRef.current) missing.push('hobbies');
    if (!projectsConfirmedRef.current) missing.push('projects');

    return missing;
  };

  const fetchAiSuggestions = async (section: string, headline: string, append = false) => {
    if (!headline) return;
    setIsLoadingSuggestions(true);
    try {
      // Call actual Gemini AI service directly from the frontend
      const suggestions = await generateAISuggestions(section, headline, profile);
      if (suggestions && suggestions.length > 0) {
        setDynamicSuggestions(suggestions);
        setChatMessages((prev) => {
          const updated = [...prev];
          for (let i = updated.length - 1; i >= 0; i--) {
            if (updated[i].sender === 'ai') {
              if (append) {
                const existing = updated[i].suggestions || [];
                const combined = [...existing];
                suggestions.forEach((s) => {
                  if (!combined.includes(s)) combined.push(s);
                });
                updated[i] = {
                  ...updated[i],
                  suggestions: combined,
                };
              } else {
                updated[i] = {
                  ...updated[i],
                  suggestions: suggestions,
                };
              }
              break;
            }
          }
          return updated;
        });
      }
    } catch (err) {
      console.log('Gemini API failed, using local simulated AI fallback', err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Ask next missing detail
  const triggerNextQuestion = (
    nextKey:
      | 'headline'
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
    setDynamicSuggestions([]); // Clear previous dynamic suggestions

    // Trigger AI Fetch asynchronously while typing animation plays
    if (['experience', 'objective', 'certifications', 'projects', 'achievements', 'hobbies', 'languages'].includes(nextKey)) {
      // Use ref or state for headline. If headline is the next key, we don't have it yet.
      const currentHeadline = nextKey === 'headline' ? '' : resumeHeadline;
      if (currentHeadline) {
        fetchAiSuggestions(nextKey, currentHeadline);
      }
    }

    setTimeout(() => {
      setIsTyping(false);
      let text = '';
      if (nextKey === 'headline') {
        text = `Let's start by finalizing your Resume Header! 📝\n\nWhat is your Professional Headline or Job Title? (e.g., 'Software engineer,plumber,doctor,teacher...')`;
      } else if (nextKey === 'email') {
        if (profile?.personal?.email) {
          text = `Great! Now for your contact info. ✉️\n\nI see your registered email is **${profile.personal.email}**. Do you want to use this on your resume?`;
        } else {
          text = `Great! Now for your contact info. ✉️\n\nWhat email address would you like to put on your resume?`;
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
        text = `Which projects have you worked on? 💻\n\nPlease share the project name, technologies used, and a brief description.`;
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
          suggestions: getSuggestionsForQuestion(nextKey),
          associatedKey: nextKey,
        },
      ]);
    }, 1200);
  };

  // Central Response Processor
  const processUserResponse = async (userText: string) => {
    try {
      console.log(`\n--- 🗣️ CHAT RESPONSE CAPTURED ---`);
      console.log(`Question Section: "${currentQuestionKey}"`);
      console.log(`User Response: "${userText}"`);
      console.log(`--------------------------------\n`);

      if (!isPendingSessionRestore) {
        const snapshot = {
          chatMessages: [...chatMessages],
          currentQuestionKey,
          resumeEmail,
          resumePhone,
          resumeLinkedin,
          resumeGithub,
          resumeHeadline,
          emailConfirmed,
          phoneConfirmed,
          linkedinConfirmed,
          githubConfirmed,
          headlineConfirmed,
          careerObjective,
          certifications,
          languages,
          selectedLanguages: [...selectedLanguages],
          achievements,
          hobbies,
          projects,
          educationConfirmed,
          experienceConfirmed,
          objectiveConfirmed,
          certificationsConfirmed,
          languagesConfirmed,
          achievementsConfirmed,
          hobbiesConfirmed,
          projectsConfirmed,
        };
        setHistoryStack((prev) => [...prev, snapshot]);
        setRedoStack([]);
      }

      if (isPendingSessionRestore) {
        const isYes = userText.toLowerCase().includes('haan') || userText.toLowerCase().includes('yes') || userText.toLowerCase().includes('continue') || userText.toLowerCase().includes('aage');
        if (isYes) {
          setIsTyping(false);
          setIsPendingSessionRestore(false);
          if (savedSessionData) {
            // Restore all state variables
            setChatMessages(savedSessionData.chatMessages);
            setCurrentQuestionKey(savedSessionData.currentQuestionKey);
            setResumeEmail(savedSessionData.resumeEmail);
            setResumePhone(savedSessionData.resumePhone);
            setResumeLinkedin(savedSessionData.resumeLinkedin);
            setResumeGithub(savedSessionData.resumeGithub);
            setResumeHeadline(savedSessionData.resumeHeadline);
            setEmailConfirmed(savedSessionData.emailConfirmed);
            setPhoneConfirmed(savedSessionData.phoneConfirmed);
            setLinkedinConfirmed(savedSessionData.linkedinConfirmed);
            setGithubConfirmed(savedSessionData.githubConfirmed);
            setHeadlineConfirmed(savedSessionData.headlineConfirmed);
            setCareerObjective(savedSessionData.careerObjective);
            setCertifications(savedSessionData.certifications);
            setLanguages(savedSessionData.languages);
            setSelectedLanguages(savedSessionData.selectedLanguages || []);
            setAchievements(savedSessionData.achievements);
            setHobbies(savedSessionData.hobbies);
            setProjects(savedSessionData.projects);
            setEducationConfirmed(savedSessionData.educationConfirmed);
            setExperienceConfirmed(savedSessionData.experienceConfirmed);
            setObjectiveConfirmed(savedSessionData.objectiveConfirmed);
            setCertificationsConfirmed(savedSessionData.certificationsConfirmed);
            setLanguagesConfirmed(savedSessionData.languagesConfirmed);
            setAchievementsConfirmed(savedSessionData.achievementsConfirmed);
            setHobbiesConfirmed(savedSessionData.hobbiesConfirmed);
            setProjectsConfirmed(savedSessionData.projectsConfirmed);

            // Update refs
            emailConfirmedRef.current = savedSessionData.emailConfirmed;
            phoneConfirmedRef.current = savedSessionData.phoneConfirmed;
            linkedinConfirmedRef.current = savedSessionData.linkedinConfirmed;
            githubConfirmedRef.current = savedSessionData.githubConfirmed;
            headlineConfirmedRef.current = savedSessionData.headlineConfirmed;
            educationConfirmedRef.current = savedSessionData.educationConfirmed;
            experienceConfirmedRef.current = savedSessionData.experienceConfirmed;
            objectiveConfirmedRef.current = savedSessionData.objectiveConfirmed;
            certificationsConfirmedRef.current = savedSessionData.certificationsConfirmed;
            languagesConfirmedRef.current = savedSessionData.languagesConfirmed;
            achievementsConfirmedRef.current = savedSessionData.achievementsConfirmed;
            hobbiesConfirmedRef.current = savedSessionData.hobbiesConfirmed;
            projectsConfirmedRef.current = savedSessionData.projectsConfirmed;

            setChatMessages((prev) => [
              ...prev,
              {
                id: `restore_success_${Date.now()}`,
                sender: 'ai',
                text: `Previous session restored successfully! You can continue from here. 👍`,
                timestamp: new Date(),
              },
            ]);
          }
        } else {
          // Start Over
          setIsTyping(false);
          setIsPendingSessionRestore(false);
          setSavedSessionData(null);
          await AsyncStorage.removeItem('AI_RESUME_BUILDER_SESSION');
          resetSessionStates();

          setChatMessages([
            {
              id: 'welcome_restart',
              sender: 'ai',
              text: `Sure, let's start fresh! 📝`,
              timestamp: new Date(),
            },
          ]);
          setTimeout(() => {
            triggerNextQuestion('headline');
          }, 1000);
        }
        return;
      }

      if (currentQuestionKey === 'headline') {
        setResumeHeadline(userText);
        setHeadlineConfirmed(true);
        headlineConfirmedRef.current = true;
        setIsTyping(false);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `headline_success_${Date.now()}`,
            sender: 'ai',
            text: `Awesome headline set to **${userText}**! ✅`,
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
      } else if (currentQuestionKey === 'email') {
        if (profile?.personal?.email && !isEditingFilledDetail) {
          const isYes = userText === 'Yes, use this email' || userText.toLowerCase().includes('yes') || userText === 'Keep and Continue' || userText.toLowerCase().includes('keep');
          const isNo = userText === 'No, let me enter new' || userText.toLowerCase() === 'no' || userText.toLowerCase().includes('change') || userText.toLowerCase().includes('edit');

          if (isYes) {
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
          } else if (isNo) {
            setIsEditingFilledDetail(true);
            setIsTyping(false);
            setChatMessages((prev) => [
              ...prev,
              {
                id: `email_prompt_edit_${Date.now()}`,
                sender: 'ai',
                text: `Sure! Please enter the email address you want on your resume:`,
                timestamp: new Date(),
                suggestions: getSuggestionsForQuestion('email', true),
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
          const isYes = userText === 'Yes, use this number' || userText.toLowerCase().includes('yes') || userText === 'Keep and Continue' || userText.toLowerCase().includes('keep');
          const isNo = userText === 'No, let me enter new' || userText.toLowerCase() === 'no' || userText.toLowerCase().includes('change') || userText.toLowerCase().includes('edit');

          if (isYes) {
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
          } else if (isNo) {
            setIsEditingFilledDetail(true);
            setIsTyping(false);
            setChatMessages((prev) => [
              ...prev,
              {
                id: `phone_prompt_edit_${Date.now()}`,
                sender: 'ai',
                text: `Sure! Please enter the phone number you want on your resume:`,
                timestamp: new Date(),
                suggestions: getSuggestionsForQuestion('phone', true),
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
          const isYes = userText === 'Yes, use this data' || userText.toLowerCase().includes('yes') || userText === 'Keep and Continue' || userText.toLowerCase().includes('keep');
          const isNo = userText === 'No, let me enter new' || userText.toLowerCase() === 'no' || userText.toLowerCase().includes('change') || userText.toLowerCase().includes('edit');

          if (isYes) {
            setIsTyping(false);
            setEducationConfirmed(true);
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
              const nextIndex = remaining.indexOf('education');
              if (nextIndex > -1) remaining.splice(nextIndex, 1);
              if (remaining.length > 0) {
                triggerNextQuestion(remaining[0]);
              } else {
                triggerNextQuestion('complete');
              }
            }, 1000);
            return;
          } else if (isNo) {
            setIsEditingFilledDetail(true);
            setIsTyping(false);
            setChatMessages((prev) => [
              ...prev,
              {
                id: `edu_prompt_edit_${Date.now()}`,
                sender: 'ai',
                text: `Sure! Please enter your highest education (e.g. BTech in Computer Science from IIT Bombay):`,
                timestamp: new Date(),
                suggestions: getSuggestionsForQuestion('education', true),
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
        setEducationConfirmed(true);
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
          const isYes = userText === 'Yes, use this data' || userText.toLowerCase().includes('yes') || userText === 'Keep and Continue' || userText.toLowerCase().includes('keep');
          const isNo = userText === 'No, let me enter new' || userText.toLowerCase() === 'no' || userText.toLowerCase().includes('change') || userText.toLowerCase().includes('edit');

          if (isYes) {
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
          } else if (isNo) {
            setIsEditingFilledDetail(true);
            setIsTyping(false);
            setChatMessages((prev) => [
              ...prev,
              {
                id: `exp_prompt_edit_${Date.now()}`,
                sender: 'ai',
                text: `Sure! Please enter your experience (e.g. '1 year as Software Engineer at TCS' or 'Fresher'):`,
                timestamp: new Date(),
                suggestions: getSuggestionsForQuestion('experience', true),
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
        setExperienceConfirmed(true);
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
        const isSkip = userText.toLowerCase().includes('skip') || userText.toLowerCase().includes('none');
        const defaultSuggestions = getSuggestionsForQuestion('certifications');
        const isExactSelection = userText.toLowerCase().startsWith('use exactly: "') && userText.endsWith('"');
        const isSuggestion =
          defaultSuggestions.some(s => s.toLowerCase().trim() === userText.toLowerCase().trim()) ||
          dynamicSuggestions.some(s => s.toLowerCase().trim() === userText.toLowerCase().trim()) ||
          chatMessages.some(msg =>
            msg.sender === 'ai' &&
            msg.suggestions &&
            msg.suggestions.some(s => s.toLowerCase().trim() === userText.toLowerCase().trim())
          );

        if (isSkip) {
          setCertifications('');
          setCertificationsConfirmed(true);
          certificationsConfirmedRef.current = true;
          setIsTyping(false);
          setChatMessages((prev) => [
            ...prev,
            {
              id: `cert_success_${Date.now()}`,
              sender: 'ai',
              text: `Skipped Certifications section. 👍`,
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
        }

        if (isExactSelection) {
          const rawCert = userText.substring(13, userText.length - 1);
          setCertifications(rawCert);
          setCertificationsConfirmed(true);
          certificationsConfirmedRef.current = true;
          setIsTyping(false);
          setChatMessages((prev) => [
            ...prev,
            {
              id: `cert_success_${Date.now()}`,
              sender: 'ai',
              text: `Excellent! Recorded Certification: **${rawCert}**! 🏆`,
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
        }

        if (isSuggestion) {
          setCertifications(userText);
          setCertificationsConfirmed(true);
          certificationsConfirmedRef.current = true;
          setIsTyping(false);
          setChatMessages((prev) => [
            ...prev,
            {
              id: `cert_success_${Date.now()}`,
              sender: 'ai',
              text: `Excellent! Recorded Certification: **${userText}**! 🏆`,
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
        }

        // Custom entered text -> Search/Analyze for relevant certifications using Gemini
        setIsTyping(true);
        try {
          const results = await searchAICertifications(userText, resumeHeadline);
          const suggestionOptions = [`Use exactly: "${userText}"`, ...results];
          setDynamicSuggestions(suggestionOptions);
          setIsTyping(false);
          setChatMessages((prev) => [
            ...prev,
            {
              id: `cert_search_results_${Date.now()}`,
              sender: 'ai',
              text: `I analyzed your input. Here are some related professional certifications. Please select one:`,
              timestamp: new Date(),
              suggestions: suggestionOptions,
            },
          ]);
        } catch (e) {
          // Fallback if search fails
          setCertifications(userText);
          setCertificationsConfirmed(true);
          certificationsConfirmedRef.current = true;
          setIsTyping(false);
          setChatMessages((prev) => [
            ...prev,
            {
              id: `cert_success_${Date.now()}`,
              sender: 'ai',
              text: `Excellent! Recorded Certification: **${userText}**! 🏆`,
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
        }
        return;
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

  // Helper to fetch horizontal quick suggestions for chat questions
  const getSuggestionsForQuestion = (key?: any, overrideEditingDetail?: boolean) => {
    const qKey = key || currentQuestionKey;
    const isEditing = overrideEditingDetail !== undefined ? overrideEditingDetail : isEditingFilledDetail;
    if (qKey === 'headline') {
      return [
        'Doctor',
        'Frontend Engineer',
        'Teacher',
        'Plumber',
        'Electrician',
        'Data Analyst'
      ];
    }
    if (qKey === 'email') {
      if (profile?.personal?.email && !isEditing) {
        return ['Yes, use this email', 'No, let me enter new'];
      }
      return [];
    }
    if (qKey === 'phone') {
      const existingPhone = profile?.personal?.phone || profile?.personal?.mobile;
      if (existingPhone && !isEditing) {
        return ['Yes, use this number', 'No, let me enter new'];
      }
      return [];
    }
    if (qKey === 'linkedin') {
      return ['Skip this option'];
    }
    if (qKey === 'github') {
      return ['Skip this option'];
    }
    if (qKey === 'education') {
      const eduInfo = getEducationInfo();
      if (eduInfo && !isEditing) {
        return ['Yes, use this data', 'No, let me enter new'];
      }
      if (qualifications && qualifications.length > 0) {
        return qualifications.map((q: any) => q.name);
      }
      return ['B.Tech CS', 'MCA', 'BCA', 'MBA', 'B.Com', 'Diploma'];
    }
    if (qKey === 'experience') {
      if (dynamicSuggestions.length > 0) return dynamicSuggestions;

      const expInfo = getExperienceInfo();
      if (expInfo && !isEditing) {
        return ['Yes, use this data', 'No, let me enter new'];
      }

      return ['I am a Fresher / No Experience'];
    }
    if (qKey === 'objective') {
      const suggestions = dynamicSuggestions.length > 0 ? dynamicSuggestions : [];
      return [...suggestions, 'None / Skip this section'];
    }
    if (qKey === 'certifications') {
      const suggestions = dynamicSuggestions.length > 0 ? dynamicSuggestions : [];
      return [...suggestions, 'None / Skip this section'];
    }
    if (qKey === 'languages') {
      // Use dynamic suggestions (loaded from Gemini AI or service fallback)
      const options = [...dynamicSuggestions];

      if (selectedLanguages.length > 0) {
        options.unshift(`✔️ Confirm: ${selectedLanguages.join(', ')}`);
      }

      return [...options, 'None / Skip this section'];
    }
    if (qKey === 'achievements') {
      const suggestions = dynamicSuggestions.length > 0 ? dynamicSuggestions : [];
      return [...suggestions, 'None / Skip this section'];
    }
    if (qKey === 'hobbies') {
      const suggestions = dynamicSuggestions.length > 0 ? dynamicSuggestions : [];
      return [...suggestions, 'None / Skip this section'];
    }
    if (qKey === 'projects') {
      const suggestions = dynamicSuggestions.length > 0 ? dynamicSuggestions : [];
      return [...suggestions, 'None / Skip this section'];
    }
    return [];
  };

  // Suggestion pill click handler
  const handleSendSuggestion = async (suggestionText: string) => {
    if (currentQuestionKey === 'languages') {
      if (suggestionText === 'None / Skip this section') {
        setSelectedLanguages([]);
      } else if (suggestionText.startsWith('✔️ Confirm: ')) {
        const selectedStr = suggestionText.replace('✔️ Confirm: ', '');
        setSelectedLanguages([]);
        suggestionText = selectedStr;
      } else {
        // Toggle the language in selectedLanguages
        setSelectedLanguages((prev) => {
          if (prev.includes(suggestionText)) {
            return prev.filter((lang) => lang !== suggestionText);
          } else {
            return [...prev, suggestionText];
          }
        });
        return; // Return early, don't send message yet!
      }
    }

    setInputText('');
    setChatMessages((prev) => [
      ...prev,
      {
        id: `user_${Date.now()}`,
        sender: 'user' as const,
        text: suggestionText,
        timestamp: new Date(),
        associatedKey: currentQuestionKey || undefined,
      },
    ]);

    setIsTyping(true);
    await processUserResponse(suggestionText);
  };

  // User input message submit handler
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
        associatedKey: currentQuestionKey || undefined,
      },
    ]);
    setInputText('');

    setIsTyping(true);
    await processUserResponse(userText);
  };

  useEffect(() => {
    dispatch(fetchMetaQualifications());
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const loadSession = async () => {
      try {
        const stored = await AsyncStorage.getItem('AI_RESUME_BUILDER_SESSION');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.chatMessages && parsed.chatMessages.length > 0) {
            // Restore all state variables directly without the restore prompt
            setChatMessages(parsed.chatMessages);
            setHistoryStack(parsed.historyStack || []);
            setRedoStack(parsed.redoStack || []);
            setCurrentQuestionKey(parsed.currentQuestionKey);
            setResumeEmail(parsed.resumeEmail || '');
            setResumePhone(parsed.resumePhone || '');
            setResumeLinkedin(parsed.resumeLinkedin || '');
            setResumeGithub(parsed.resumeGithub || '');
            setResumeHeadline(parsed.resumeHeadline || '');
            setEmailConfirmed(parsed.emailConfirmed || false);
            setPhoneConfirmed(parsed.phoneConfirmed || false);
            setLinkedinConfirmed(parsed.linkedinConfirmed || false);
            setGithubConfirmed(parsed.githubConfirmed !== undefined ? parsed.githubConfirmed : true);
            setHeadlineConfirmed(parsed.headlineConfirmed || false);
            setCareerObjective(parsed.careerObjective || '');
            setCertifications(parsed.certifications || '');
            setLanguages(parsed.languages || '');
            setSelectedLanguages(parsed.selectedLanguages || []);
            setAchievements(parsed.achievements || '');
            setHobbies(parsed.hobbies || '');
            setProjects(parsed.projects || '');
            setEducationConfirmed(parsed.educationConfirmed || false);
            setExperienceConfirmed(parsed.experienceConfirmed || false);
            setObjectiveConfirmed(parsed.objectiveConfirmed || false);
            setCertificationsConfirmed(parsed.certificationsConfirmed || false);
            setLanguagesConfirmed(parsed.languagesConfirmed || false);
            setAchievementsConfirmed(parsed.achievementsConfirmed || false);
            setHobbiesConfirmed(parsed.hobbiesConfirmed || false);
            setProjectsConfirmed(parsed.projectsConfirmed || false);

            // Update refs
            emailConfirmedRef.current = parsed.emailConfirmed || false;
            phoneConfirmedRef.current = parsed.phoneConfirmed || false;
            linkedinConfirmedRef.current = parsed.linkedinConfirmed || false;
            githubConfirmedRef.current = parsed.githubConfirmed !== undefined ? parsed.githubConfirmed : true;
            headlineConfirmedRef.current = parsed.headlineConfirmed || false;
            educationConfirmedRef.current = parsed.educationConfirmed || false;
            experienceConfirmedRef.current = parsed.experienceConfirmed || false;
            objectiveConfirmedRef.current = parsed.objectiveConfirmed || false;
            certificationsConfirmedRef.current = parsed.certificationsConfirmed || false;
            languagesConfirmedRef.current = parsed.languagesConfirmed || false;
            achievementsConfirmedRef.current = parsed.achievementsConfirmed || false;
            hobbiesConfirmedRef.current = parsed.hobbiesConfirmed || false;
            projectsConfirmedRef.current = parsed.projectsConfirmed || false;

            setIsPendingSessionRestore(false);
            setIsInitializing(false);
            return;
          }
        }
      } catch (e) {
        console.log('Error reading saved session:', e);
      }

      // Fallback: Welcome message & launch
      setChatMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hi ${profile?.personal?.name || 'there'}! I'm JobIndia AI. Let's quickly complete a few questions to build your resume!`,
          timestamp: new Date(),
        },
      ]);

      const timeout = setTimeout(() => {
        setIsInitializing(false);
        triggerNextQuestion('email');
      }, 1400);
    };

    loadSession();
  }, []);

  // Auto-scroll scrollview on message updates & keyboard visibility changes
  useEffect(() => {
    if (!isInitializing) {
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages, isInitializing, isTyping, localKeyboardVisible]);

  // Persist session to AsyncStorage on state updates
  useEffect(() => {
    if (!isInitializing && !isPendingSessionRestore && chatMessages.length > 1) {
      const saveSession = async () => {
        try {
          const sessionData = {
            chatMessages,
            historyStack,
            redoStack,
            currentQuestionKey,
            resumeEmail,
            resumePhone,
            resumeLinkedin,
            resumeGithub,
            resumeHeadline,
            emailConfirmed,
            phoneConfirmed,
            linkedinConfirmed,
            githubConfirmed,
            headlineConfirmed,
            careerObjective,
            certifications,
            languages,
            selectedLanguages,
            achievements,
            hobbies,
            projects,
            educationConfirmed,
            experienceConfirmed,
            objectiveConfirmed,
            certificationsConfirmed,
            languagesConfirmed,
            achievementsConfirmed,
            hobbiesConfirmed,
            projectsConfirmed,
          };
          await AsyncStorage.setItem('AI_RESUME_BUILDER_SESSION', JSON.stringify(sessionData));
        } catch (e) {
          console.log('Error saving session:', e);
        }
      };
      saveSession();
    }
  }, [
    chatMessages,
    historyStack,
    redoStack,
    currentQuestionKey,
    resumeEmail,
    resumePhone,
    resumeLinkedin,
    resumeGithub,
    resumeHeadline,
    emailConfirmed,
    phoneConfirmed,
    linkedinConfirmed,
    githubConfirmed,
    headlineConfirmed,
    careerObjective,
    certifications,
    languages,
    selectedLanguages,
    achievements,
    hobbies,
    projects,
    educationConfirmed,
    experienceConfirmed,
    objectiveConfirmed,
    certificationsConfirmed,
    languagesConfirmed,
    achievementsConfirmed,
    hobbiesConfirmed,
    projectsConfirmed,
    isInitializing,
    isPendingSessionRestore,
  ]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleCompleteInterview = () => {

    // Build education text from chat session or profile
    const eduInfo = getEducationInfo();
    const chatEducationText = eduInfo
      ? `${eduInfo.qualification || 'Degree'} from ${eduInfo.notes || 'University'}`
      : '';

    // Build experience text from chat session or profile
    const expInfo = getExperienceInfo();
    const chatExperienceText = expInfo
      ? expInfo.isFresher
        ? 'Fresher'
        : expInfo.text || ''
      : '';

    const interviewDataObject = {
      resumeHeadline,
      resumeEmail,
      resumePhone,
      resumeLinkedin,
      resumeGithub,
      careerObjective,
      certifications,
      languages,
      achievements,
      hobbies,
      projects,
      educationText: chatEducationText,
      experienceText: chatExperienceText,
    };

    console.log("=========================================");
    console.log("📝 CHAT INTERVIEW COMPLETE: Captured Data");
    console.log("=========================================");
    console.log(JSON.stringify(interviewDataObject, null, 2));
    console.log("=========================================");

    onInterviewComplete(interviewDataObject);
  };

  const sectionDisplayNames: Record<string, string> = {
    headline: 'Professional Headline',
    email: 'Email Address',
    phone: 'Phone Number',
    linkedin: 'LinkedIn Link',
    github: 'GitHub Link',
    education: 'Highest Education',
    experience: 'Work History / Experience',
    objective: 'Career Objective',
    certifications: 'Certifications',
    languages: 'Fluent Languages',
    achievements: 'Honors & Achievements',
    hobbies: 'Hobbies & Interests',
    projects: 'Key Projects',
  };

  const initiateEditSection = (key: string) => {
    if (!key || key === 'complete') return;

    setCurrentQuestionKey(key as any);
    setIsEditingFilledDetail(true);
    setDynamicSuggestions([]);

    if (['experience', 'objective', 'certifications', 'projects', 'achievements', 'hobbies', 'languages'].includes(key)) {
      const currentHeadline = resumeHeadline;
      if (currentHeadline) {
        fetchAiSuggestions(key, currentHeadline);
      }
    }

    const displayName = sectionDisplayNames[key] || key;
    setChatMessages((prev) => [
      ...prev,
      {
        id: `edit_prompt_${key}_${Date.now()}`,
        sender: 'ai',
        text: `Sure! Let's update your **${displayName}**. ✏️\n\nPlease enter the new detail:`,
        timestamp: new Date(),
        suggestions: getSuggestionsForQuestion(key, true),
        associatedKey: key,
      },
    ]);
  };

  const handleLongPressMessage = (key: string) => {
    setActiveLongPressKey(key);
  };

  const getAssociatedKeyForMessage = (msg: ChatMessage, index: number): string | undefined => {
    if (msg.associatedKey) return msg.associatedKey;

    if (msg.id.startsWith('question_')) {
      const parts = msg.id.split('_');
      if (parts[1] && parts[1] !== 'complete') {
        return parts[1];
      }
    }

    if (msg.sender === 'user') {
      for (let i = index - 1; i >= 0; i--) {
        const prevMsg = chatMessages[i];
        if (prevMsg && prevMsg.sender === 'ai') {
          if (prevMsg.associatedKey) return prevMsg.associatedKey;
          if (prevMsg.id.startsWith('question_')) {
            const parts = prevMsg.id.split('_');
            if (parts[1] && parts[1] !== 'complete') {
              return parts[1];
            }
          }
        }
      }
    }

    if (msg.id.startsWith('edit_prompt_')) {
      const parts = msg.id.split('_');
      if (parts[2]) return parts[2];
    }

    return undefined;
  };

  const [showMenu, setShowMenu] = useState(false);

  const handleClearChat = async () => {
    setIsTyping(false);
    setSavedSessionData(null);
    await AsyncStorage.removeItem('AI_RESUME_BUILDER_SESSION');
    resetSessionStates();

    setChatMessages([
      {
        id: 'welcome_restart',
        sender: 'ai',
        text: `Session cleared. Let's start fresh! 📝`,
        timestamp: new Date(),
      },
    ]);
    setTimeout(() => {
      triggerNextQuestion('headline');
    }, 500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {isInitializing ? (
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Icon name="logo-electron" size={72} color={ORANGE_COLOR} />
          </Animated.View>
        </View>
      ) : (
        <View style={{ flex: 1, paddingBottom: Platform.OS === 'android' ? keyboardHeight : 0 }}>
          {/* Modern Single-Title Header Bar */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: colors.surface,
          }}>
            <Pressable
              onPress={() => setCurrentScreen('ATS_REPORT')}
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pressed ? colors.border + '40' : 'transparent',
              })}
            >
              <Icon name="arrow-back" size={24} color={colors.textPrimary} />
            </Pressable>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: ORANGE_COLOR + '15',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}>
                <Icon name="logo-electron" size={16} color={ORANGE_COLOR} />
              </View>
              <Text style={{
                fontSize: 18,
                color: colors.textPrimary,
                fontWeight: '800',
                letterSpacing: 0.3
              }}>
                AI Resume Builder
              </Text>
            </View>

            <View style={{ position: 'relative', zIndex: 100 }}>
              <Pressable
                onPress={() => setShowMenu(!showMenu)}
                style={({ pressed }) => ({
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: pressed ? colors.border + '40' : 'transparent',
                })}
              >
                <Icon name="ellipsis-vertical" size={22} color={colors.textPrimary} />
              </Pressable>

              {showMenu && (
                <View style={{
                  position: 'absolute',
                  top: 45,
                  right: 0,
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 5,
                  minWidth: 140,
                  zIndex: 100,
                  borderWidth: 1,
                  borderColor: colors.border + '40',
                }}>
                  <Pressable
                    onPress={() => {
                      setShowMenu(false);
                      handleUndo();
                    }}
                    disabled={historyStack.length === 0}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      backgroundColor: pressed ? colors.border + '30' : 'transparent',
                      borderRadius: 6,
                      gap: 8,
                      opacity: historyStack.length === 0 ? 0.4 : 1,
                    })}
                  >
                    <Icon name="arrow-undo-outline" size={18} color={colors.textPrimary} />
                    <Text style={{ fontSize: 13, color: colors.textPrimary, fontWeight: '600' }}>Undo</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setShowMenu(false);
                      handleRedo();
                    }}
                    disabled={redoStack.length === 0}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      backgroundColor: pressed ? colors.border + '30' : 'transparent',
                      borderRadius: 6,
                      gap: 8,
                      opacity: redoStack.length === 0 ? 0.4 : 1,
                    })}
                  >
                    <Icon name="arrow-redo-outline" size={18} color={colors.textPrimary} />
                    <Text style={{ fontSize: 13, color: colors.textPrimary, fontWeight: '600' }}>Redo</Text>
                  </Pressable>

                  <View style={{ height: 1, backgroundColor: colors.border + '30', marginVertical: 4 }} />

                  <Pressable
                    onPress={() => {
                      setShowMenu(false);
                      handleClearChat();
                    }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      backgroundColor: pressed ? colors.border + '30' : 'transparent',
                      borderRadius: 6,
                      gap: 8,
                    })}
                  >
                    <Icon name="trash-outline" size={18} color="#f87171" />
                    <Text style={{ fontSize: 13, color: '#f87171', fontWeight: '600' }}>Clear Chat</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          <ScrollView
            ref={chatScrollRef}
            onScrollBeginDrag={() => setShowMenu(false)}
            style={copilotStyles.chatScroll}
            contentContainerStyle={{ paddingVertical: 16 }}
          >
            {chatMessages.map((msg, index) => {
              const isLatestAiMessage = msg.id === chatMessages[chatMessages.length - 1]?.id;
              const assocKey = getAssociatedKeyForMessage(msg, index);
              return (
                <View
                  key={msg.id}
                  style={[
                    copilotStyles.chatBubbleContainer,
                    msg.sender === 'user' ? copilotStyles.bubbleRight : copilotStyles.bubbleLeft,
                  ]}
                >
                  {msg.sender === 'ai' && (
                    <View style={{ marginRight: 8, justifyContent: 'flex-end', marginBottom: 4 }}>
                      <SmallSpinningAIIcon ORANGE_COLOR={ORANGE_COLOR} />
                    </View>
                  )}

                  <View style={{ flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: msg.sender === 'ai' ? '85%' : '78%' }}>
                    <Pressable
                      onLongPress={() => {
                        if (assocKey) {
                          handleLongPressMessage(msg.id);
                        }
                      }}
                      delayLongPress={500}
                      style={[
                        copilotStyles.chatBubble,
                        msg.sender === 'user'
                          ? { backgroundColor: ORANGE_COLOR }
                          : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                        { maxWidth: '100%' }
                      ]}
                    >
                      <Text
                        style={[
                          typography.small,
                          msg.sender === 'user' ? { color: '#fff' } : { color: colors.textPrimary },
                        ]}
                      >
                        {msg.text}
                      </Text>

                      {/* Loader inside the bubble if we are actively fetching suggestions for this latest question and no suggestions exist yet */}
                      {isLatestAiMessage && msg.sender === 'ai' && isLoadingSuggestions && (!msg.suggestions || msg.suggestions.length === 0) && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingLeft: 4 }}>
                          <ActivityIndicator size="small" color={ORANGE_COLOR} />
                          <Text style={[typography.tiny, { color: colors.textSecondary }]}>AI is thinking of options...</Text>
                        </View>
                      )}

                      {/* Interactive suggestions inside the latest AI message bubble */}
                      {isLatestAiMessage && msg.sender === 'ai' && msg.suggestions && msg.suggestions.length > 0 && (
                        <View
                          style={
                            currentQuestionKey === 'education' || msg.suggestions.length > 4
                              ? { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }
                              : { marginTop: 12, gap: 8 }
                          }
                        >
                          {getSuggestionsForQuestion(currentQuestionKey).map((suggestion, idx) => {
                            const isSelected = currentQuestionKey === 'languages' && selectedLanguages.includes(suggestion);
                            return (
                              <Pressable
                                key={idx}
                                onPress={() => handleSendSuggestion(suggestion)}
                                style={({ pressed }) => [
                                  {
                                    backgroundColor: isSelected
                                      ? ORANGE_COLOR + '15'
                                      : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                                    borderColor: isSelected ? ORANGE_COLOR : (ORANGE_COLOR + '40'),
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    paddingHorizontal: 10,
                                    paddingVertical: 8,
                                    opacity: pressed ? 0.7 : 1,
                                  }
                                ]}
                              >
                                <Text style={[
                                  typography.tiny,
                                  {
                                    color: isSelected ? ORANGE_COLOR : colors.textPrimary,
                                    fontWeight: '600'
                                  }
                                ]}>
                                  {isSelected ? `✓ ${suggestion}` : suggestion}
                                </Text>
                              </Pressable>
                            );
                          })}

                          {/* Loader inside the bubble below suggestions if loading more */}
                          {isLoadingSuggestions && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4, paddingVertical: 4 }}>
                              <ActivityIndicator size="small" color={ORANGE_COLOR} />
                              <Text style={[typography.tiny, { color: colors.textSecondary }]}>Loading more options...</Text>
                            </View>
                          )}

                          {!isLoadingSuggestions && ['experience', 'objective', 'certifications', 'projects', 'achievements', 'hobbies', 'languages'].includes(currentQuestionKey) && (
                            <Pressable
                              onPress={() => fetchAiSuggestions(currentQuestionKey, resumeHeadline, true)}
                              style={({ pressed }) => [
                                {
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 6,
                                  paddingVertical: 6,
                                  marginTop: 4,
                                  borderStyle: 'dashed',
                                  borderColor: ORANGE_COLOR + '50',
                                  borderWidth: 1,
                                  borderRadius: 8,
                                  backgroundColor: ORANGE_COLOR + '08',
                                  opacity: pressed ? 0.6 : 1,
                                }
                              ]}
                            >
                              <Icon name="refresh-outline" size={12} color={ORANGE_COLOR} />
                              <Text style={[typography.tiny, { color: ORANGE_COLOR, fontWeight: '700' }]}>
                                Load More Suggestions
                              </Text>
                            </Pressable>
                          )}
                        </View>
                      )}
                    </Pressable>

                    {/* Small Inline Edit option pill */}
                    {activeLongPressKey === msg.id && assocKey && (
                      <Pressable
                        onPress={() => {
                          initiateEditSection(assocKey);
                          setActiveLongPressKey(null);
                        }}
                        style={({ pressed }) => [
                          {
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: colors.surface,
                            borderColor: ORANGE_COLOR,
                            borderWidth: 1,
                            borderRadius: 10,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            marginTop: 4,
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            opacity: pressed ? 0.7 : 1,
                            shadowColor: ORANGE_COLOR,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 3,
                            elevation: 2,
                          }
                        ]}
                      >
                        <Icon name="pencil" size={10} color={ORANGE_COLOR} style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: ORANGE_COLOR }}>
                          Edit this detail ✏️
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}

            {isTyping && (
              <View style={[copilotStyles.chatBubbleContainer, copilotStyles.bubbleLeft]}>
                <View style={{ marginRight: 8, justifyContent: 'flex-end', marginBottom: 4 }}>
                  <SmallSpinningAIIcon ORANGE_COLOR={ORANGE_COLOR} />
                </View>
                <View style={[copilotStyles.chatBubble, { backgroundColor: colors.surface, paddingVertical: 10 }]}>
                  <ActivityIndicator size="small" color={ORANGE_COLOR} />
                </View>
              </View>
            )}
          </ScrollView>

          {currentQuestionKey !== 'complete' ? (
            <View style={[
              copilotStyles.inputBar,
              {
                marginBottom: localKeyboardVisible
                  ? 40
                  : (Math.max(insets.bottom, 6) + (Platform.OS === 'ios' ? 10 : 2) + 64 + 4)
              }
            ]}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your answer here..."
                placeholderTextColor={colors.textPlaceholder}
                onSubmitEditing={handleSendMessage}
                style={[copilotStyles.chatInput, { color: colors.textPrimary, backgroundColor: colors.surface }]}
              />
              <Pressable onPress={handleSendMessage} style={copilotStyles.sendBtn}>
                <Icon name="send" size={20} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <View style={[
              copilotStyles.inputBar,
              {
                justifyContent: 'center',
                marginBottom: localKeyboardVisible
                  ? 40
                  : (Math.max(insets.bottom, 6) + (Platform.OS === 'ios' ? 10 : 2) + 64 + 0)
              }
            ]}>
              <Pressable
                onPress={handleCompleteInterview}
                style={[copilotStyles.primaryOrangeBtn, { width: '90%', marginTop: 0 }]}
              >
                <Text style={[typography.labelMedium, { color: '#fff', fontWeight: 'bold' }]}>
                  View Unlocked ATS Score Report 📊
                </Text>
                <Icon name="stats-chart" size={18} color="#fff" style={{ marginLeft: 6 }} />
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const copilotStyles = StyleSheet.create({
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
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryOrangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF9800',
    width: '85%',
    height: 50,
    borderRadius: 12,
    marginTop: 32,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 35,
    width: '100%',
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  secondaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
