import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
  ActivityIndicator,
  Share,
  Platform,
  NativeModules,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useNavigation } from '@react-navigation/native';

import { typography, moderateScale } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';
import { radius } from '../../../../theme/radius';
import {
  RESUME_TEMPLATES,
  generateResumeHtml,
  ResumeTemplateData,
  TemplateThemeColors,
} from './resumeTemplates';

// Attempt to import generatePDF - may not be compiled
let generatePDF: any;
try {
  generatePDF = require('react-native-html-to-pdf').generatePDF;
} catch (e) {
  generatePDF = null;
}

export interface ResumeTemplateSelectorProps {
  colors: any;
  isDark: boolean;
  profile: any;
  generatedResume: {
    summary: string;
    experiences?: { company?: string; designation?: string; bullets: string[] }[];
    skills: string[];
    score: number;
  };
  targetJob: string;
  educationText?: string;
  experienceText?: string;
  qualifications?: any[];
  editedSummary: string;
  editedBullets: string[];
  careerObjective: string;
  certifications: string;
  languages: string;
  projects: string;
  achievements: string;
  hobbies: string;
  resumeEmail: string;
  resumePhone: string;
  resumeLinkedin: string;
  resumeGithub: string;
  selectedTheme: string;
  setSelectedTheme: (theme: any) => void;
  themeColors: TemplateThemeColors;
  setCurrentScreen: (screen: 'UPLOAD' | 'LANDING' | 'SCANNING' | 'ATS_REPORT' | 'CHAT' | 'WIZARD' | 'GENERATING' | 'WORKSPACE' | 'TEMPLATES') => void;
  slideAnim: Animated.Value;
  ORANGE_COLOR: string;
}

export const ResumeTemplateSelector: React.FC<ResumeTemplateSelectorProps> = ({
  colors,
  isDark,
  profile,
  generatedResume,
  targetJob,
  educationText,
  experienceText,
  editedSummary,
  editedBullets,
  careerObjective,
  certifications,
  languages,
  projects,
  achievements,
  hobbies,
  resumeEmail,
  resumePhone,
  resumeLinkedin,
  resumeGithub,
  selectedTheme,
  setSelectedTheme,
  themeColors,
  setCurrentScreen,
  slideAnim,
  ORANGE_COLOR,
  qualifications = [],
}) => {
  const navigation = useNavigation<any>();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('modern_minimal');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Custom Status / Alert Modal State
  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    actionText?: string;
    onAction?: () => void;
  }>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const modalScaleAnim = useRef(new Animated.Value(0)).current;

  const showStatus = (
    type: 'success' | 'error' | 'info',
    title: string,
    message: string,
    actionText?: string,
    onAction?: () => void,
  ) => {
    setStatusModal({
      visible: true,
      type,
      title,
      message,
      actionText,
      onAction,
    });
    modalScaleAnim.setValue(0);
    Animated.spring(modalScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();
  };

  // Build template data from all the props
  const buildTemplateData = (): ResumeTemplateData => {
    // Normalize education
    const educationList: ResumeTemplateData['educationList'] = [];
    if ((generatedResume as any)?.education && (generatedResume as any).education.length > 0) {
      educationList.push(...(generatedResume as any).education);
    } else if (educationText && educationText.trim()) {
      const parts = educationText.split(/\s+from\s+/i);
      educationList.push({
        degree: parts[0]?.trim() || educationText,
        school: parts[1]?.trim() || '',
      });
    } else if (profile?.education) {
      const eduArr = Array.isArray(profile.education) ? profile.education : [profile.education];
      eduArr.forEach((edu: any) => {
        let degree = edu.degree || '';
        if (!degree) {
          const qIdObj = edu.qualification_id;
          if (qIdObj) {
            if (typeof qIdObj === 'object') {
              degree = qIdObj.name || '';
            } else if ((typeof qIdObj === 'number' || typeof qIdObj === 'string') && qualifications) {
              const matched = qualifications.find((q: any) => q.id === Number(qIdObj));
              if (matched) degree = matched.name;
            }
          }
          if (!degree) {
            degree = 'Highest Qualification';
          }
        }
        educationList.push({
          degree,
          school: edu.education_notes || edu.notes || edu.school_university || '',
          year: edu.passing_year ? String(edu.passing_year) : undefined,
          gpa: edu.gpa_percentage || undefined,
        });
      });
    }

    // Normalize experience
    const experienceList: ResumeTemplateData['experienceList'] = [];
    if (generatedResume?.experiences && generatedResume.experiences.length > 0) {
      experienceList.push(...generatedResume.experiences.map((exp: any) => ({
        designation: exp.designation || targetJob || 'Professional',
        company: exp.company || '',
        location: exp.location || profile?.personal?.city || '',
        startDate: exp.startDate || exp.start_date || '',
        endDate: exp.endDate || exp.end_date || '',
        isCurrent: exp.isCurrent ?? exp.is_current ?? true,
        description: exp.description,
        bullets: exp.bullets,
      })));
    } else if (experienceText && experienceText.trim()) {
      const isFresherText = experienceText.toLowerCase().includes('fresher');
      if (isFresherText) {
        experienceList.push({
          designation: 'Fresher',
          isFresher: true,
          description: 'Eager to contribute and learn in a professional work environment.',
        });
      } else {
        const parts = experienceText.split(/\s+at\s+/i);
        experienceList.push({
          designation: parts[0]?.trim() || experienceText,
          company: parts[1]?.trim() || '',
          bullets: editedBullets.length > 0 ? editedBullets : undefined,
        });
      }
    } else if (profile?.experience) {
      const expArr = Array.isArray(profile.experience) ? profile.experience : [profile.experience];
      expArr.forEach((exp: any, idx: number) => {
        const type = exp.experience_type || '';
        if (type === 'fresher' || exp.is_fresher) {
          experienceList.push({
            designation: 'Fresher',
            isFresher: true,
            description: 'Eager to contribute and learn in a professional work environment.',
          });
        } else {
          experienceList.push({
            designation: exp.designation || targetJob || 'Professional',
            company: exp.company || '',
            location: exp.location || profile?.personal?.city || '',
            startDate: exp.start_date || '',
            endDate: exp.end_date || '',
            isCurrent: exp.is_current ?? true,
            description: exp.description,
            bullets: idx === 0 && editedBullets.length > 0 ? editedBullets : undefined,
          });
        }
      });
    }

    return {
      name: profile?.personal?.name || 'Your Name',
      email: resumeEmail || profile?.personal?.email || '',
      phone: resumePhone || profile?.personal?.phone || profile?.personal?.mobile || '',
      city: profile?.personal?.city || '',
      linkedin: resumeLinkedin || profile?.personal?.linkedin || '',
      github: resumeGithub || profile?.personal?.github || '',
      targetJob: targetJob,
      summary: editedSummary || profile?.personal?.bio || '',
      careerObjective: careerObjective || undefined,
      certifications: certifications || undefined,
      languages: languages || undefined,
      achievements: achievements || undefined,
      hobbies: hobbies || undefined,
      projects: projects || undefined,
      educationList,
      experienceList,
      skills: generatedResume?.skills || [],
    };
  };

  const templateData = buildTemplateData();

  const getHtmlForTemplate = (templateId: string) => {
    return generateResumeHtml(templateId, templateData, themeColors);
  };

  // Animate template selection
  const animateSelect = (id: string) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
    setSelectedTemplateId(id);
  };

  // PDF Export
  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const htmlContent = getHtmlForTemplate(selectedTemplateId);
      const templateInfo = RESUME_TEMPLATES.find(t => t.id === selectedTemplateId);

      const options = {
        html: htmlContent,
        fileName: `Resume_${profile?.personal?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Candidate'}_${templateInfo?.name?.replace(/\s+/g, '_') || 'Resume'}`,
      };

      // Try multiple PDF generation methods
      const convertFn = generatePDF
        || (NativeModules.HtmlToPdf && NativeModules.HtmlToPdf.convert)
        || (NativeModules.RNHTMLtoPDF && NativeModules.RNHTMLtoPDF.convert);

      if (typeof convertFn !== 'function') {
        setIsExportingPdf(false);
        showStatus(
          'error',
          'PDF Module Notice',
          "Native PDF generation is initializing. Please ensure app is fully built with native modules enabled.",
          'Got It',
          () => setStatusModal(prev => ({ ...prev, visible: false }))
        );
        return;
      }

      const file = await convertFn(options);
      setIsExportingPdf(false);

      if (file.filePath) {
        if (Platform.OS === 'android') {
          try {
            await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
              {
                name: options.fileName,
                parentFolder: '', // Empty uses default 'Download' folder
                mimeType: 'application/pdf',
              },
              'Download',
              file.filePath
            );
            showStatus(
              'success',
              'Download Complete',
              'Your resume has been successfully downloaded directly to your Downloads folder!',
              'OK',
              () => setStatusModal(prev => ({ ...prev, visible: false }))
            );
          } catch (copyErr) {
            console.error('Failed to copy to MediaStore:', copyErr);
            showStatus(
              'error',
              'Download Notice',
              'Could not save directly to Downloads folder. You can share or export your PDF.',
              'Share PDF',
              () => {
                setStatusModal(prev => ({ ...prev, visible: false }));
                Share.share({ url: file.filePath, title: 'Download Resume PDF' });
              }
            );
          }
        } else {
          await Share.share({
            url: file.filePath,
            title: 'Download Resume PDF',
          });
          showStatus(
            'success',
            'Download Complete',
            'Your resume PDF is ready and saved successfully!',
            'OK',
            () => setStatusModal(prev => ({ ...prev, visible: false }))
          );
        }
      } else {
        showStatus('error', 'Error', 'Failed to generate PDF file.', 'OK', () => setStatusModal(prev => ({ ...prev, visible: false })));
      }
    } catch (e: any) {
      setIsExportingPdf(false);
      showStatus('error', 'Export Failed', e?.message || 'Unknown error occurred.', 'OK', () => setStatusModal(prev => ({ ...prev, visible: false })));
    }
  };

  // ─── STYLISH STATUS MODAL ───
  const renderStatusModal = () => (
    <Modal
      visible={statusModal.visible}
      transparent={true}
      animationType="none"
      onRequestClose={() => setStatusModal(prev => ({ ...prev, visible: false }))}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              transform: [{ scale: modalScaleAnim }],
              opacity: modalScaleAnim,
            },
          ]}
        >
          {/* Top glowing icon circle */}
          <View
            style={[
              styles.modalIconWrapper,
              {
                backgroundColor:
                  statusModal.type === 'success'
                    ? '#10b98118'
                    : statusModal.type === 'error'
                    ? '#ef444418'
                    : ORANGE_COLOR + '18',
              },
            ]}
          >
            <View
              style={[
                styles.modalIconInner,
                {
                  backgroundColor:
                    statusModal.type === 'success'
                      ? '#10b98125'
                      : statusModal.type === 'error'
                      ? '#ef444425'
                      : ORANGE_COLOR + '25',
                },
              ]}
            >
              <Icon
                name={
                  statusModal.type === 'success'
                    ? 'checkmark-circle'
                    : statusModal.type === 'error'
                    ? 'alert-circle'
                    : 'information-circle'
                }
                size={42}
                color={
                  statusModal.type === 'success'
                    ? '#10b981'
                    : statusModal.type === 'error'
                    ? '#ef4444'
                    : ORANGE_COLOR
                }
              />
            </View>
          </View>

          <Text style={[typography.h3, { color: colors.textPrimary, textAlign: 'center', marginTop: 14, fontWeight: '800' }]}>
            {statusModal.title}
          </Text>

          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 21, paddingHorizontal: 4 }]}>
            {statusModal.message}
          </Text>

          {/* Folder pill indicator on download success */}
          {statusModal.type === 'success' && (
            <View style={[styles.folderBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', borderColor: colors.border }]}>
              <Icon name="folder-open-outline" size={16} color={ORANGE_COLOR} style={{ marginRight: 6 }} />
              <Text style={[typography.small, { color: colors.textPrimary, fontWeight: '700' }]} numberOfLines={1}>
                Saved in: Downloads Folder
              </Text>
            </View>
          )}

          <View style={styles.modalButtonContainer}>
            {statusModal.actionText && statusModal.onAction ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  statusModal.onAction?.();
                }}
                style={[styles.modalActionBtn, { backgroundColor: ORANGE_COLOR }]}
              >
                <Text style={[typography.labelMedium, { color: '#ffffff', fontWeight: '800', fontSize: 15 }]}>
                  {statusModal.actionText}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setStatusModal(prev => ({ ...prev, visible: false }))}
                style={[styles.modalActionBtn, { backgroundColor: ORANGE_COLOR }]}
              >
                <Text style={[typography.labelMedium, { color: '#ffffff', fontWeight: '800', fontSize: 15 }]}>
                  OK
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  // ─── FULL PREVIEW MODE ───
  if (isPreviewMode) {
    const html = getHtmlForTemplate(selectedTemplateId);
    const templateInfo = RESUME_TEMPLATES.find(t => t.id === selectedTemplateId);

    return (
      <Animated.View style={[styles.container, { transform: [{ scale: slideAnim }] }]}>
        {/* Preview Header */}
        <View style={[styles.previewHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Pressable
            onPress={() => setIsPreviewMode(false)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
              padding: 4,
            })}
          >
            <Icon name="arrow-back" size={22} color={colors.textPrimary} />
            <Text style={[typography.labelMedium, { color: colors.textPrimary, marginLeft: 8 }]}>
              {templateInfo?.name || 'Preview'}
            </Text>
          </Pressable>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={handleDownloadPdf}
              style={({ pressed }) => [
                styles.headerBtn,
                { backgroundColor: ORANGE_COLOR, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Icon name="download-outline" size={16} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 4 }}>PDF</Text>
            </Pressable>
          </View>
        </View>

        {/* WebView Preview */}
        <WebView
          source={{ html }}
          style={{ flex: 1 }}
          scalesPageToFit={true}
          scrollEnabled={true}
          originWhitelist={['*']}
        />

        {/* Bottom Download Bar */}
        <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Pressable
            onPress={handleDownloadPdf}
            style={({ pressed }) => [
              styles.downloadBtn,
              { backgroundColor: ORANGE_COLOR, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <Icon name="download" size={20} color="#fff" />
            <Text style={styles.downloadBtnText}>Download as PDF</Text>
          </Pressable>
        </View>

        {renderStatusModal()}
      </Animated.View>
    );
  }

  // ─── TEMPLATE SELECTOR GRID ───
  return (
    <Animated.View style={[styles.container, { transform: [{ scale: slideAnim }] }]}>
      {/* Header */}
      <View style={[styles.selectorHeader, { backgroundColor: colors.surface }]}>
        <Pressable
          onPress={() => navigation.goBack()}
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

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 18 }]}>
            Choose Resume Format
          </Text>
          <Text style={[typography.tiny, { color: colors.textSecondary, marginTop: 2 }]}>
            Select a template, then download your resume
          </Text>
        </View>

        <View style={[styles.scoreBadge, { backgroundColor: ORANGE_COLOR + '20' }]}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: ORANGE_COLOR }}>{generatedResume.score}%</Text>
          <Text style={{ fontSize: 8, fontWeight: '700', color: ORANGE_COLOR }}>ATS</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Color Theme Selector */}
        <View style={[styles.themeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: '700', marginBottom: 8 }]}>
            Color Theme 🎨
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 14, paddingVertical: 6, paddingHorizontal: 4 }}
          >
            {[
              { id: 'OrangeGlow', color: ORANGE_COLOR },
              { id: 'MidnightSlate', color: '#60a5fa' },
              { id: 'ForestMint', color: '#10b981' },
              { id: 'RoyalAmethyst', color: '#a78bfa' },
              { id: 'CrimsonRuby', color: '#f87171' },
            ].map((theme) => (
              <Pressable
                key={theme.id}
                onPress={() => setSelectedTheme(theme.id)}
                style={({ pressed }) => [
                  styles.themeDot,
                  {
                    backgroundColor: theme.color,
                    transform: [
                      { scale: pressed ? 0.9 : selectedTheme === theme.id ? 1.15 : 1 },
                    ],
                  },
                  selectedTheme === theme.id && {
                    borderWidth: 2.5,
                    borderColor: '#ffffff',
                    shadowColor: theme.color,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 6,
                    elevation: 5,
                  },
                ]}
              >
                {selectedTheme === theme.id && (
                  <Icon name="checkmark" size={16} color="#fff" />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Template Grid */}
        <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: '700', marginBottom: 12, marginTop: 4 }]}>
          Resume Templates
        </Text>

        <View style={styles.templateGrid}>
          {RESUME_TEMPLATES.map((template) => {
            const isSelected = selectedTemplateId === template.id;

            return (
              <Pressable
                key={template.id}
                onPress={() => animateSelect(template.id)}
                style={({ pressed }) => [
                  styles.templateCard,
                  {
                    backgroundColor: '#ffffff',
                    borderColor: isSelected ? ORANGE_COLOR : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                  isSelected && {
                    shadowColor: ORANGE_COLOR,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 6,
                  },
                ]}
              >
                {/* Mini Visual Preview (lightweight native view) */}
                <View style={styles.miniPreview}>
                  {template.id === 'classic' && (
                    <View style={{ padding: 8, alignItems: 'center' }}>
                      <View style={{ width: '60%', height: 6, backgroundColor: themeColors.accent, borderRadius: 2, marginBottom: 3 }} />
                      <View style={{ width: '40%', height: 3, backgroundColor: '#94a3b8', borderRadius: 1, marginBottom: 2 }} />
                      <View style={{ width: '80%', height: 2, backgroundColor: '#cbd5e1', borderRadius: 1, marginBottom: 6 }} />
                      <View style={{ width: '100%', height: 1, backgroundColor: '#e2e8f0', marginBottom: 4 }} />
                      <View style={{ width: '30%', height: 3, backgroundColor: themeColors.accent, borderRadius: 1, marginBottom: 3, alignSelf: 'flex-start' }} />
                      {[1,2,3].map(i => <View key={i} style={{ width: '90%', height: 2, backgroundColor: '#e2e8f0', borderRadius: 1, marginBottom: 2, alignSelf: 'flex-start' }} />)}
                      <View style={{ width: '100%', height: 1, backgroundColor: '#e2e8f0', marginVertical: 4 }} />
                      <View style={{ width: '30%', height: 3, backgroundColor: themeColors.accent, borderRadius: 1, marginBottom: 3, alignSelf: 'flex-start' }} />
                      {[1,2].map(i => <View key={i} style={{ width: '85%', height: 2, backgroundColor: '#e2e8f0', borderRadius: 1, marginBottom: 2, alignSelf: 'flex-start' }} />)}
                      <View style={{ width: '100%', height: 1, backgroundColor: '#e2e8f0', marginVertical: 4 }} />
                      <View style={{ width: '25%', height: 3, backgroundColor: themeColors.accent, borderRadius: 1, marginBottom: 3, alignSelf: 'flex-start' }} />
                      {[1,2].map(i => <View key={i} style={{ width: '80%', height: 2, backgroundColor: '#e2e8f0', borderRadius: 1, marginBottom: 2, alignSelf: 'flex-start' }} />)}
                    </View>
                  )}
                  {template.id === 'modern' && (
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                      <View style={{ width: '35%', backgroundColor: themeColors.accent, padding: 6 }}>
                        <View style={{ width: '80%', height: 5, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 1, marginBottom: 3 }} />
                        <View style={{ width: '60%', height: 2, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1, marginBottom: 8 }} />
                        <View style={{ width: '50%', height: 2, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1, marginBottom: 4 }} />
                        {[1,2,3].map(i => <View key={i} style={{ width: '90%', height: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 1, marginBottom: 2 }} />)}
                        <View style={{ marginTop: 6, width: '50%', height: 2, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1, marginBottom: 4 }} />
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
                          {[1,2,3,4].map(i => <View key={i} style={{ width: '40%', height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4 }} />)}
                        </View>
                      </View>
                      <View style={{ flex: 1, padding: 6 }}>
                        <View style={{ width: '40%', height: 3, backgroundColor: themeColors.accent, borderRadius: 1, marginBottom: 3 }} />
                        {[1,2,3].map(i => <View key={i} style={{ width: '95%', height: 2, backgroundColor: '#e2e8f0', borderRadius: 1, marginBottom: 2 }} />)}
                        <View style={{ width: '100%', height: 1, backgroundColor: '#e2e8f0', marginVertical: 4 }} />
                        <View style={{ width: '35%', height: 3, backgroundColor: themeColors.accent, borderRadius: 1, marginBottom: 3 }} />
                        {[1,2].map(i => <View key={i} style={{ width: '90%', height: 2, backgroundColor: '#e2e8f0', borderRadius: 1, marginBottom: 2 }} />)}
                        <View style={{ width: '100%', height: 1, backgroundColor: '#e2e8f0', marginVertical: 4 }} />
                        <View style={{ width: '30%', height: 3, backgroundColor: themeColors.accent, borderRadius: 1, marginBottom: 3 }} />
                        {[1,2].map(i => <View key={i} style={{ width: '85%', height: 2, backgroundColor: '#e2e8f0', borderRadius: 1, marginBottom: 2 }} />)}
                      </View>
                    </View>
                  )}
                  {template.id === 'creative' && (
                    <View style={{ flex: 1 }}>
                      <View style={{ backgroundColor: themeColors.accent, padding: 8, paddingBottom: 10 }}>
                        <View style={{ width: '60%', height: 6, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 1, marginBottom: 3 }} />
                        <View style={{ width: '35%', height: 2, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1, marginBottom: 3 }} />
                        <View style={{ width: '80%', height: 2, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
                      </View>
                      <View style={{ padding: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: themeColors.accent + '30', marginRight: 4 }} />
                          <View style={{ width: '30%', height: 3, backgroundColor: themeColors.accent, borderRadius: 1 }} />
                        </View>
                        {[1,2].map(i => <View key={i} style={{ width: '90%', height: 2, backgroundColor: '#e2e8f0', borderRadius: 1, marginBottom: 2, marginLeft: 12 }} />)}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3, marginTop: 4 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: themeColors.accent + '30', marginRight: 4 }} />
                          <View style={{ width: '35%', height: 3, backgroundColor: themeColors.accent, borderRadius: 1 }} />
                        </View>
                        {[1,2].map(i => <View key={i} style={{ width: '85%', height: 2, backgroundColor: '#e2e8f0', borderRadius: 1, marginBottom: 2, marginLeft: 12 }} />)}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 6 }}>
                          {[1,2,3,4,5].map(i => <View key={i} style={{ paddingHorizontal: 6, paddingVertical: 3, backgroundColor: themeColors.accent + '12', borderRadius: 8, borderWidth: 0.5, borderColor: themeColors.accent + '30' }}><View style={{ width: 16, height: 2 }} /></View>)}
                        </View>
                      </View>
                    </View>
                  )}
                  {template.id === 'executive' && (
                    <View style={{ padding: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <View style={{ width: '45%', height: 6, backgroundColor: '#0f172a', borderRadius: 1, marginRight: 4 }} />
                        <View style={{ width: 1, height: 6, backgroundColor: themeColors.accent, marginRight: 4 }} />
                        <View style={{ width: '25%', height: 3, backgroundColor: themeColors.accent, borderRadius: 1 }} />
                      </View>
                      <View style={{ width: '70%', height: 2, backgroundColor: '#cbd5e1', borderRadius: 1, marginBottom: 2 }} />
                      <View style={{ width: '100%', height: 2, backgroundColor: themeColors.accent, marginVertical: 3 }} />
                      <View style={{ width: '20%', height: 2, backgroundColor: themeColors.accent, borderRadius: 1, marginBottom: 2 }} />
                      {[1,2].map(i => <View key={i} style={{ width: '95%', height: 1.5, backgroundColor: '#e2e8f0', borderRadius: 1, marginBottom: 1.5 }} />)}
                      <View style={{ width: '100%', height: 0.5, backgroundColor: '#e2e8f0', marginVertical: 3 }} />
                      <View style={{ width: '22%', height: 2, backgroundColor: themeColors.accent, borderRadius: 1, marginBottom: 2 }} />
                      {[1,2].map(i => <View key={i} style={{ width: '90%', height: 1.5, backgroundColor: '#e2e8f0', borderRadius: 1, marginBottom: 1.5 }} />)}
                      <View style={{ width: '100%', height: 0.5, backgroundColor: '#e2e8f0', marginVertical: 3 }} />
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                        <View style={{ flex: 1 }}>
                          <View style={{ width: '50%', height: 2, backgroundColor: themeColors.accent, borderRadius: 1, marginBottom: 2 }} />
                          {[1,2].map(i => <View key={i} style={{ width: '90%', height: 1.5, backgroundColor: '#e2e8f0', borderRadius: 1, marginBottom: 1 }} />)}
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ width: '50%', height: 2, backgroundColor: themeColors.accent, borderRadius: 1, marginBottom: 2 }} />
                          {[1,2].map(i => <View key={i} style={{ width: '90%', height: 1.5, backgroundColor: '#e2e8f0', borderRadius: 1, marginBottom: 1 }} />)}
                        </View>
                      </View>
                    </View>
                  )}
                </View>

                {/* Template Label */}
                <View style={[
                  styles.templateLabel,
                  {
                    backgroundColor: isSelected ? ORANGE_COLOR : (isDark ? colors.surface : '#f8fafc'),
                    borderTopColor: isSelected ? ORANGE_COLOR : colors.border,
                  },
                ]}>
                  <Icon
                    name={template.icon as any}
                    size={14}
                    color={isSelected ? '#fff' : colors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: isSelected ? '#fff' : colors.textPrimary,
                    flex: 1,
                  }}
                    numberOfLines={1}
                  >
                    {template.name}
                  </Text>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Icon name="checkmark-circle" size={14} color="#fff" />
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Selected Template Description */}
        {(() => {
          const sel = RESUME_TEMPLATES.find(t => t.id === selectedTemplateId);
          if (!sel) return null;
          return (
            <View style={[styles.descCard, { backgroundColor: ORANGE_COLOR + '08', borderColor: ORANGE_COLOR + '25' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Icon name={sel.icon as any} size={18} color={ORANGE_COLOR} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textPrimary }}>
                  {sel.name}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>
                {sel.description}
              </Text>
            </View>
          );
        })()}

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => setIsPreviewMode(true)}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: isDark ? colors.surface : '#f1f5f9',
                borderColor: colors.border,
                borderWidth: 1,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Icon name="eye-outline" size={18} color={colors.textPrimary} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginLeft: 6 }}>
              Preview Full
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDownloadPdf}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: ORANGE_COLOR,
                flex: 1.5,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <Icon name="download" size={18} color="#fff" />
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff', marginLeft: 6 }}>
              Download PDF
            </Text>
          </Pressable>
        </View>

        <View style={{ marginBottom: 80 }} />
      </ScrollView>

      {renderStatusModal()}

      {/* PDF Exporting Overlay */}
      {isExportingPdf && (
        <View style={styles.exportOverlay}>
          <View style={[styles.exportCard, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="large" color={ORANGE_COLOR} />
            <Text style={[typography.labelMedium, { color: colors.textPrimary, fontWeight: 'bold', textAlign: 'center', marginTop: 16 }]}>
              Generating PDF... 📄
            </Text>
            <Text style={[typography.tiny, { color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 18 }]}>
              Creating your professional resume with the selected template
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  scoreBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: moderateScale(12),
    paddingBottom: moderateScale(160),
  },
  themeCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  themeDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  templateCard: {
    width: '47.5%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  miniPreview: {
    height: 180,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  templateLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  selectedBadge: {
    marginLeft: 4,
  },
  descCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    height: moderateScale(48),
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Preview mode styles
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(8),
    borderRadius: radius.sm,
  },
  bottomBar: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  downloadBtn: {
    height: moderateScale(50),
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  exportOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  exportCard: {
    padding: moderateScale(28),
    borderRadius: radius.lg,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
    zIndex: 99999,
  },
  modalCard: {
    width: '100%',
    maxWidth: moderateScale(380),
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(28),
    paddingBottom: moderateScale(24),
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
  },
  modalIconWrapper: {
    width: moderateScale(76),
    height: moderateScale(76),
    borderRadius: moderateScale(38),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconInner: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(8),
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: moderateScale(14),
    marginBottom: moderateScale(6),
  },
  modalButtonContainer: {
    width: '100%',
    marginTop: moderateScale(20),
  },
  modalActionBtn: {
    width: '100%',
    height: moderateScale(50),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});
