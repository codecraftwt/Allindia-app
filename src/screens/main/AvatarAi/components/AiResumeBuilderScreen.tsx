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
import { generateAISuggestions } from '../../../../services/geminiService';
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
  }) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  suggestions?: string[];
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

  const resetSessionStates = () => {
    setResumeEmail('');
    setResumePhone('');
    setResumeLinkedin('');
    setResumeGithub('');
    setResumeHeadline('');
    setEmailConfirmed(false);
    setPhoneConfirmed(false);
    setLinkedinConfirmed(false);
    setGithubConfirmed(false);
    setHeadlineConfirmed(false);
    setCareerObjective('');
    setCertifications('');
    setLanguages('');
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
    githubConfirmedRef.current = false;
    headlineConfirmedRef.current = false;
    educationConfirmedRef.current = false;
    experienceConfirmedRef.current = false;
    objectiveConfirmedRef.current = false;
    certificationsConfirmedRef.current = false;
    languagesConfirmedRef.current = false;
    achievementsConfirmedRef.current = false;
    hobbiesConfirmedRef.current = false;
    projectsConfirmedRef.current = false;
  };

  // Local Chat / Interview States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
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
  const [githubConfirmed, setGithubConfirmed] = useState(false);
  const [headlineConfirmed, setHeadlineConfirmed] = useState(false);

  // Extra resume sections loaded locally/conversationally
  const [careerObjective, setCareerObjective] = useState('');
  const [certifications, setCertifications] = useState('');
  const [languages, setLanguages] = useState('');
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
  const githubConfirmedRef = useRef(false);
  const headlineConfirmedRef = useRef(false);
  const educationConfirmedRef = useRef(false);
  const experienceConfirmedRef = useRef(false);
  const objectiveConfirmedRef = useRef(false);
  const certificationsConfirmedRef = useRef(false);
  const languagesConfirmedRef = useRef(false);
  const achievementsConfirmedRef = useRef(false);
  const hobbiesConfirmedRef = useRef(false);
  const projectsConfirmedRef = useRef(false);

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

  // Determine remaining sections conversational step
  const getMissingSections = () => {
    const missing: (
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
    )[] = [];

    if (!headlineConfirmedRef.current) missing.push('headline');
    if (!emailConfirmedRef.current) missing.push('email');
    if (!phoneConfirmedRef.current) missing.push('phone');
    if (!linkedinConfirmedRef.current) missing.push('linkedin');
    if (!githubConfirmedRef.current) missing.push('github');

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
    if (['experience', 'objective', 'certifications', 'projects', 'achievements', 'hobbies'].includes(nextKey)) {
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
        text = `Let's start by finalizing your Resume Header! 📝\n\nWhat is your Professional Headline or Job Title? (This sits right under your name, e.g., 'React Native Developer')`;
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
          suggestions: getSuggestionsForQuestion(nextKey),
        },
      ]);
    }, 1200);
  };

  // Central Response Processor
  const processUserResponse = async (userText: string) => {
    try {
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
                suggestions: getSuggestionsForQuestion('email'),
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
                suggestions: getSuggestionsForQuestion('phone'),
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
                suggestions: getSuggestionsForQuestion('education'),
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
                suggestions: getSuggestionsForQuestion('experience'),
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
  const getSuggestionsForQuestion = (key?: any) => {
    const qKey = key || currentQuestionKey;
    if (qKey === 'headline') {
      return [
        'React Native Developer',
        'Frontend Engineer',
        'Full Stack Developer',
        'Software Engineer',
        'UI/UX Designer',
        'Data Analyst'
      ];
    }
    if (qKey === 'email') {
      if (profile?.personal?.email && !isEditingFilledDetail) {
        return ['Yes, use this email', 'No, let me enter new'];
      }
      return [];
    }
    if (qKey === 'phone') {
      const existingPhone = profile?.personal?.phone || profile?.personal?.mobile;
      if (existingPhone && !isEditingFilledDetail) {
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
      if (eduInfo && !isEditingFilledDetail) {
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
      if (expInfo && !isEditingFilledDetail) {
        return ['Yes, use this data', 'No, let me enter new'];
      }

      return ['I am a Fresher / No Experience'];
    }
    if (qKey === 'objective') {
      if (dynamicSuggestions.length > 0) return dynamicSuggestions;
      return ['None / Skip this section'];
    }
    if (qKey === 'certifications') {
      if (dynamicSuggestions.length > 0) return dynamicSuggestions;
      return ['None / Skip this section'];
    }
    if (qKey === 'languages') {
      return [
        'English, Hindi',
        'English, Spanish',
        'English, Hindi, Punjabi',
        'English, Hindi, Marathi',
      ];
    }
    if (qKey === 'achievements') {
      if (dynamicSuggestions.length > 0) return dynamicSuggestions;
      return ['None / Skip this section'];
    }
    if (qKey === 'hobbies') {
      if (dynamicSuggestions.length > 0) return dynamicSuggestions;
      return ['None / Skip this section'];
    }
    if (qKey === 'projects') {
      if (dynamicSuggestions.length > 0) return dynamicSuggestions;
      return ['None / Skip this section'];
    }
    return [];
  };

  // Suggestion pill click handler
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
      },
    ]);
    setInputText('');

    setIsTyping(true);
    await processUserResponse(userText);
  };

  useEffect(() => {
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
          if (parsed && parsed.chatMessages && parsed.chatMessages.length > 1) {
            setSavedSessionData(parsed);
            setIsPendingSessionRestore(true);
            setChatMessages([
              {
                id: 'welcome_restore',
                sender: 'ai',
                text: `Hi ${profile?.personal?.name || 'there'}! I found your previous resume progress. Do you want to continue from where you left off?`,
                timestamp: new Date(),
                suggestions: ['Yes, Continue', 'No, Start Over'],
              },
            ]);
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
    AsyncStorage.removeItem('AI_RESUME_BUILDER_SESSION').catch((err) =>
      console.log('Error clearing session:', err)
    );

    onInterviewComplete({
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
    });
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
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
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

            {/* Empty view to balance the header layout for perfect centering */}
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            ref={chatScrollRef}
            style={copilotStyles.chatScroll}
            contentContainerStyle={{ paddingVertical: 16 }}
          >
            {chatMessages.map((msg, index) => {
              const isLatestAiMessage = msg.id === chatMessages[chatMessages.length - 1]?.id;
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

                  <View
                    style={[
                      copilotStyles.chatBubble,
                      msg.sender === 'user'
                        ? { backgroundColor: ORANGE_COLOR }
                        : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                      msg.sender === 'ai' && { maxWidth: '85%' },
                    ]}
                  >
                    <Text
                      style={[
                        typography.body,
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
                      <View style={{ marginTop: 12, gap: 8 }}>
                        {msg.suggestions.map((suggestion, idx) => (
                          <Pressable
                            key={idx}
                            onPress={() => handleSendSuggestion(suggestion)}
                            style={({ pressed }) => [
                              {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                borderColor: ORANGE_COLOR + '40',
                                borderWidth: 1,
                                borderRadius: 8,
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                opacity: pressed ? 0.7 : 1,
                              }
                            ]}
                          >
                            <Text style={[typography.small, { color: colors.textPrimary, fontWeight: '600' }]}>
                              {suggestion}
                            </Text>
                          </Pressable>
                        ))}

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
                                paddingVertical: 8,
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
                            <Icon name="refresh-outline" size={14} color={ORANGE_COLOR} />
                            <Text style={[typography.small, { color: ORANGE_COLOR, fontWeight: '700' }]}>
                              Load More Suggestions
                            </Text>
                          </Pressable>
                        )}
                      </View>
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
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: 10,
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
});
