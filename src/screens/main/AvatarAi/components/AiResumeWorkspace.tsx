import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { typography, moderateScale } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';
import { radius } from '../../../../theme/radius';

export interface AiResumeWorkspaceProps {
  colors: any;
  isDark: boolean;
  profile: any;
  generatedResume: {
    summary: string;
    experiences?: { company?: string; designation?: string; bullets: string[] }[];
    experienceBullets?: string[];
    skills?: string[];
    score: number;
  };
  targetJob: string;
  setTargetJob: (job: string) => void;
  selectedTheme: string;
  setSelectedTheme: (theme: any) => void;
  educationText?: string;
  experienceText?: string;
  themeColors: {
    accent: string;
    textAccent: string;
    bg: string;
    accentLine: string;
  };
  editedSummary: string;
  setEditedSummary: (text: string) => void;
  editedBullets: string[];
  setEditedBullets: (bullets: string[]) => void;
  careerObjective: string;
  setCareerObjective: (text: string) => void;
  certifications: string;
  setCertifications: (text: string) => void;
  languages: string;
  setLanguages: (text: string) => void;
  projects: string;
  setProjects: (text: string) => void;
  achievements: string;
  setAchievements: (text: string) => void;
  hobbies: string;
  setHobbies: (text: string) => void;
  resumeEmail: string;
  resumePhone: string;
  resumeLinkedin: string;
  resumeGithub: string;
  handleSaveToProfile: () => void;
  handleExportHtmlResume: () => void;
  handleExportResume: () => void;
  setCurrentScreen: (screen: 'LANDING' | 'SCANNING' | 'ATS_REPORT' | 'CHAT' | 'WIZARD' | 'GENERATING' | 'WORKSPACE' | 'TEMPLATES' | 'UPLOAD') => void;
  slideAnim: Animated.Value;
  ORANGE_COLOR: string;
}

export const AiResumeWorkspace: React.FC<AiResumeWorkspaceProps> = ({
  colors,
  isDark,
  profile,
  generatedResume,
  targetJob,
  setTargetJob,
  selectedTheme,
  setSelectedTheme,
  educationText,
  experienceText,
  themeColors,
  editedSummary,
  setEditedSummary,
  editedBullets,
  setEditedBullets,
  careerObjective,
  setCareerObjective,
  certifications,
  setCertifications,
  languages,
  setLanguages,
  projects,
  setProjects,
  achievements,
  setAchievements,
  hobbies,
  setHobbies,
  resumeEmail,
  resumePhone,
  resumeLinkedin,
  resumeGithub,
  handleSaveToProfile,
  handleExportHtmlResume,
  handleExportResume,
  setCurrentScreen,
  slideAnim,
  ORANGE_COLOR,
}) => {
  const navigation = useNavigation<any>();

  const { width: screenWidth } = useWindowDimensions();
  const sheetWidth = screenWidth - (spacing.md * 2);
  const sheetHeight = sheetWidth * 1.414;

  const totalLength =
    (editedSummary?.length || 0) +
    (editedBullets?.reduce((acc, curr) => acc + curr.length, 0) || 0) +
    (projects?.length || 0) +
    (educationText?.length || 0) +
    (certifications?.length || 0) +
    (careerObjective?.length || 0) +
    (languages?.length || 0) +
    (achievements?.length || 0) +
    (hobbies?.length || 0);

  const isMultiPage = totalLength > 700;

  // Normalize experience into a list
  const getNormalizedExperience = () => {
    if (!profile?.experience) return [];
    if (Array.isArray(profile.experience)) {
      return profile.experience;
    }
    const expObj = profile.experience;
    const type = expObj.experience_type || '';
    const years = expObj.total_experience_years;
    const designation = expObj.designation || targetJob || 'Professional';
    const company = expObj.company || 'Enterprise';

    if (type === 'fresher' || expObj.is_fresher) {
      return [{
        designation: 'Fresher',
        start_date: 'N/A',
        end_date: '',
        is_current: false,
        description: 'Eager to contribute and learn in a professional work environment.',
      }];
    }

    return [{
      designation: designation || 'Specialist',
      company: company || 'Organization',
      start_date: expObj.start_date || 'Joined',
      end_date: expObj.end_date || '',
      is_current: expObj.is_current ?? true,
      description: expObj.description || `${years || 1} Year(s) of Experience`,
    }];
  };

  // Normalize education into a list
  const getNormalizedEducation = () => {
    if (!profile?.education) return [];
    if (Array.isArray(profile.education)) {
      return profile.education;
    }

    const eduObj = profile.education;
    let degree = eduObj.degree || '';
    if (!degree) {
      const qIdObj = eduObj.qualification_id;
      if (qIdObj && typeof qIdObj === 'object') {
        degree = qIdObj.name || '';
      } else {
        degree = 'Highest Qualification';
      }
    }

    const notes = eduObj.education_notes || eduObj.notes || eduObj.school_university || 'Completed Academic Program';

    return [{
      degree: degree,
      school_university: notes,
      passing_year: eduObj.passing_year || '',
      gpa_percentage: eduObj.gpa_percentage || '',
    }];
  };

  const normEducation = getNormalizedEducation();
  const normExperience = getNormalizedExperience();

  let finalEducation = normEducation;
  if (educationText && educationText.trim().length > 0) {
    const parts = educationText.split(/\s+from\s+/i);
    const degree = parts[0]?.trim() || educationText;
    const school = parts[1]?.trim() || '';
    finalEducation = [{
      degree,
      school_university: school,
      passing_year: '',
      gpa_percentage: '',
    }];
  }

  let finalExperience = normExperience;
  if (experienceText && experienceText.trim().length > 0) {
    const isFresherText = experienceText.toLowerCase().includes('fresher');
    if (isFresherText) {
      finalExperience = [{
        designation: 'Fresher',
        start_date: 'N/A',
        end_date: '',
        is_current: false,
        description: 'Eager to contribute and learn in a professional work environment.',
      }];
    } else {
      const parts = experienceText.split(/\s+at\s+/i);
      const designation = parts[0]?.trim() || experienceText;
      const company = parts[1]?.trim() || '';
      finalExperience = [{
        designation,
        company,
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
      }];
    }
  }

  return (
    <Animated.View style={[styles.screenContainer, { transform: [{ scale: slideAnim }] }]}>
      <View style={[styles.workspaceHeader, { flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => ({
            padding: 4,
            opacity: pressed ? 0.7 : 1
          })}
        >
          <Icon name="arrow-back" size={moderateScale(24)} color={colors.textPrimary} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>
            AI Resume Workspace
          </Text>
          <Text style={[typography.small, { color: colors.textSecondary }]}>
            Tailored for {targetJob || 'Target Job'}
          </Text>
        </View>

        <View style={[styles.scoreBadge, { backgroundColor: ORANGE_COLOR + '20' }]}>
          <Text style={[typography.jobTitle, { color: ORANGE_COLOR }]}>{generatedResume.score}%</Text>
          <Text style={[typography.tiny, { color: ORANGE_COLOR }]}>ATS SCORE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.workspaceScroll} showsVerticalScrollIndicator={false}>
        {/* Theme Selector (5 Templates) */}
        <View style={[styles.editorCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: moderateScale(12) }]}>
          <Text style={[typography.labelMedium, { color: colors.textPrimary, marginBottom: moderateScale(8), fontWeight: 'bold' }]}>
            Resume Color Theme 🎨
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: moderateScale(14), paddingVertical: moderateScale(8), paddingLeft: moderateScale(12), paddingRight: moderateScale(4) }}>
            {[
              { id: 'OrangeGlow', color: ORANGE_COLOR },
              { id: 'MidnightSlate', color: '#60a5fa' },
              { id: 'ForestMint', color: '#10b981' },
              { id: 'RoyalAmethyst', color: '#a78bfa' },
              { id: 'CrimsonRuby', color: '#f87171' },
            ].map((theme) => (
              <Pressable
                key={theme.id}
                onPress={() => setSelectedTheme(theme.id as any)}
                style={({ pressed }) => [
                  {
                    width: moderateScale(38),
                    height: moderateScale(38),
                    backgroundColor: theme.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTopLeftRadius: moderateScale(18),
                    borderBottomRightRadius: moderateScale(18),
                    borderTopRightRadius: moderateScale(6),
                    borderBottomLeftRadius: moderateScale(6),
                    shadowColor: theme.color,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.35,
                    shadowRadius: 6,
                    elevation: 5,
                    transform: [
                      { scale: pressed ? 0.9 : selectedTheme === theme.id ? 1.15 : 1 },
                      { rotate: selectedTheme === theme.id ? '-10deg' : '0deg' }
                    ]
                  },
                  selectedTheme === theme.id && {
                    borderWidth: 2,
                    borderColor: '#ffffff',
                  }
                ]}
              >
                {selectedTheme === theme.id && <Icon name="checkmark-done" size={moderateScale(18)} color="#fff" style={{ transform: [{ rotate: '10deg' }] }} />}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Dynamic Styled Resume Template Sheet */}
        {/* Page 1 (Main Profile, Summary, Skills & Work History) */}
        <View style={[
          styles.resumeSheet,
          {
            backgroundColor: '#ffffff',
            borderColor: '#e2e8f0',
            height: sheetHeight,
          }
        ]}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 2 }}>
            <Text style={[typography.appTitle, { color: themeColors.accent, fontWeight: '900', fontSize: moderateScale(14.5), letterSpacing: -0.5, textAlign: 'center' }]}>
              {profile?.personal?.name || 'Your Name'}
            </Text>

            {targetJob ? (
              <Text style={[typography.labelMedium, { color: '#334155', fontWeight: '700', marginTop: 1, marginBottom: 1, fontSize: moderateScale(8.5), letterSpacing: 0.5, textTransform: 'uppercase' }]}>
                {targetJob}
              </Text>
            ) : null}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: 2 }}>
              {(resumePhone || profile?.personal?.phone || profile?.personal?.mobile) && (
                <>
                  <Icon name="phone-portrait" size={moderateScale(8)} color="#000" style={{ marginRight: 2 }} />
                  <Text style={[typography.tiny, { color: '#000', fontWeight: 'bold', fontSize: moderateScale(7.8) }]}>
                    {resumePhone || profile?.personal?.phone || profile?.personal?.mobile}
                  </Text>
                  <Text style={{ color: '#cbd5e1', marginHorizontal: 3, fontSize: moderateScale(8) }}>|</Text>
                </>
              )}
              {(resumeEmail || profile?.personal?.email) && (
                <>
                  <Icon name="mail" size={moderateScale(8)} color="#000" style={{ marginRight: 2 }} />
                  <Text style={[typography.tiny, { color: '#000', fontWeight: 'bold', fontSize: moderateScale(7.8) }]}>
                    {resumeEmail || profile?.personal?.email}
                  </Text>
                  <Text style={{ color: '#cbd5e1', marginHorizontal: 3, fontSize: moderateScale(8) }}>|</Text>
                </>
              )}
              {profile?.personal?.city && (
                <>
                  <Icon name="location" size={moderateScale(8)} color="#000" style={{ marginRight: 2 }} />
                  <Text style={[typography.tiny, { color: '#000', fontWeight: 'bold', fontSize: moderateScale(7.8) }]}>{profile.personal.city}</Text>
                  <Text style={{ color: '#cbd5e1', marginHorizontal: 3, fontSize: moderateScale(8) }}>|</Text>
                </>
              )}
              {(resumeLinkedin || profile?.personal?.linkedin) && (
                <>
                  <Icon name="logo-linkedin" size={moderateScale(8)} color="#000" style={{ marginRight: 2 }} />
                  <Text style={[typography.tiny, { color: '#000', fontWeight: 'bold', fontSize: moderateScale(7.8) }]}>
                    {(resumeLinkedin || profile?.personal?.linkedin).replace(/^https?:\/\/(www\.)?/, '')}
                  </Text>
                  {(resumeGithub || profile?.personal?.github) && <Text style={{ color: '#cbd5e1', marginHorizontal: 3, fontSize: moderateScale(8) }}>|</Text>}
                </>
              )}
              {(resumeGithub || profile?.personal?.github) && (
                <>
                  <Icon name="logo-github" size={moderateScale(8)} color="#000" style={{ marginRight: 2 }} />
                  <Text style={[typography.tiny, { color: '#000', fontWeight: 'bold', fontSize: moderateScale(7.8) }]}>
                    {(resumeGithub || profile?.personal?.github).replace(/^https?:\/\/(www\.)?/, '')}
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 3 }]} />

          {/* Summary Section */}
          <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2) }]}>
            SUMMARY
          </Text>
          <TextInput
            value={editedSummary}
            onChangeText={setEditedSummary}
            multiline
            style={[styles.inlineInput, { color: '#000', marginTop: 1 }]}
          />

          <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 3 }]} />

          {/* Skills Section */}
          {generatedResume.skills && generatedResume.skills.length > 0 && (
            <>
              <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2), marginBottom: 2 }]}>
                CORE SKILLS
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginBottom: 2 }}>
                {generatedResume.skills.map((skill, idx) => (
                  <View key={idx} style={[styles.skillBadge, { backgroundColor: themeColors.bg, paddingHorizontal: moderateScale(6), paddingVertical: moderateScale(2), borderRadius: radius.xs }]}>
                    <Text style={[typography.tiny, { color: themeColors.textAccent, fontWeight: 'bold', fontSize: moderateScale(7.5) }]}>
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 3 }]} />
            </>
          )}

          {/* Experience Section */}
          {finalExperience && finalExperience.length > 0 && (
            <>
              <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2), marginBottom: 2 }]}>
                EXPERIENCE
              </Text>
              {finalExperience.map((exp: any, idx: number) => (
                <View key={idx} style={{ marginBottom: exp.designation === 'Fresher' ? 0 : 3 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={[typography.small, { color: '#000', fontWeight: 'bold', flex: 1, fontSize: moderateScale(9) }]}>
                      {exp.designation || 'Specialist'}
                      {exp.company ? ` , ${exp.company}` : ''}
                      {(exp.location || profile?.personal?.city) ? ` | ${exp.location || profile?.personal?.city}` : ''}
                    </Text>
                    {exp.start_date && exp.start_date !== 'N/A' && exp.start_date !== 'Joined' ? (
                      <Text style={[typography.tiny, { color: '#000', fontWeight: 'bold', fontSize: moderateScale(8) }]}>
                        {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date || ''}
                      </Text>
                    ) : exp.start_date === 'N/A' ? null : (
                      <Text style={[typography.tiny, { color: '#000', fontWeight: 'bold', fontSize: moderateScale(8) }]}>
                        Active
                      </Text>
                    )}
                  </View>
                  {exp.designation !== 'Fresher' && (
                    idx === 0 && editedBullets.length > 0 ? (
                      editedBullets.map((bullet, bIdx) => (
                        <View key={bIdx} style={[styles.bulletRow, { marginTop: 2 }]}>
                          <Text style={{ color: '#000', marginRight: 6, fontSize: moderateScale(8.2) }}>-</Text>
                          <TextInput
                            value={bullet}
                            onChangeText={(text) => {
                              const newBullets = [...editedBullets];
                              newBullets[bIdx] = text;
                              setEditedBullets(newBullets);
                            }}
                            multiline
                            style={[styles.inlineInput, { flex: 1, color: '#000', paddingVertical: 0 }]}
                          />
                        </View>
                      ))
                    ) : (
                      <View style={[styles.bulletRow, { marginTop: 2 }]}>
                        <Text style={{ color: '#000', marginRight: 6, fontSize: moderateScale(8.2) }}>-</Text>
                        <Text style={[typography.tiny, { color: '#000', flex: 1, lineHeight: moderateScale(14), fontSize: moderateScale(8.2) }]}>
                          {exp.description || 'Contributed to key projects and operational workflows.'}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              ))}
            </>
          )}

          {/* If NOT multi-page, render remaining sections on Page 1 */}
          {!isMultiPage && (
            <>
              {projects ? (
                <>
                  <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 3 }]} />
                  <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2), marginBottom: 2 }]}>
                    PROJECTS
                  </Text>
                  <TextInput
                    value={projects}
                    onChangeText={setProjects}
                    multiline
                    style={[styles.inlineInput, { color: '#000' }]}
                  />
                </>
              ) : null}

              {finalEducation && finalEducation.length > 0 && (
                <>
                  <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 3 }]} />
                  <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2), marginBottom: 2 }]}>
                    EDUCATION
                  </Text>
                  {finalEducation.map((edu: any, idx: number) => (
                    <View key={idx} style={{ marginBottom: 4 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[typography.small, { color: '#000', fontWeight: '500', fontSize: moderateScale(8.8) }]}>
                          <Text style={{ fontWeight: 'bold' }}>{edu.degree || 'Degree'}</Text>
                          {edu.school_university ? ` - ${edu.school_university}` : ''}
                          {edu.passing_year ? ` | ${edu.passing_year}` : ''}
                        </Text>
                        {edu.gpa_percentage ? (
                          <Text style={[typography.tiny, { color: '#000', fontWeight: 'bold', fontSize: moderateScale(8) }]}>
                            GPA: {edu.gpa_percentage}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </>
              )}

              {certifications ? (
                <>
                  <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 3 }]} />
                  <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2), marginBottom: 2 }]}>
                    CERTIFICATIONS
                  </Text>
                  <TextInput
                    value={certifications}
                    onChangeText={setCertifications}
                    multiline
                    style={[styles.inlineInput, { color: '#000' }]}
                  />
                </>
              ) : null}

              {careerObjective ? (
                <>
                  <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 3 }]} />
                  <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2), marginBottom: 2 }]}>
                    CAREER OBJECTIVE
                  </Text>
                  <TextInput
                    value={careerObjective}
                    onChangeText={setCareerObjective}
                    multiline
                    style={[styles.inlineInput, { color: '#000' }]}
                  />
                </>
              ) : null}

              {languages ? (
                <>
                  <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 3 }]} />
                  <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2), marginBottom: 2 }]}>
                    LANGUAGES
                  </Text>
                  <TextInput
                    value={languages}
                    onChangeText={setLanguages}
                    multiline
                    style={[styles.inlineInput, { color: '#000' }]}
                  />
                </>
              ) : null}

              {achievements ? (
                <>
                  <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 3 }]} />
                  <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2), marginBottom: 2 }]}>
                    ACHIEVEMENTS
                  </Text>
                  <TextInput
                    value={achievements}
                    onChangeText={setAchievements}
                    multiline
                    style={[styles.inlineInput, { color: '#000' }]}
                  />
                </>
              ) : null}

              {hobbies ? (
                <>
                  <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 3 }]} />
                  <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2), marginBottom: 2 }]}>
                    HOBBIES & INTERESTS
                  </Text>
                  <TextInput
                    value={hobbies}
                    onChangeText={setHobbies}
                    multiline
                    style={[styles.inlineInput, { color: '#000' }]}
                  />
                </>
              ) : null}
            </>
          )}

        </View>

        {/* Page 2 (Projects, Education, Credentials & Extra Fields) */}
        {isMultiPage && (
          <View style={[
            styles.resumeSheet,
            {
              backgroundColor: '#ffffff',
              borderColor: '#e2e8f0',
              marginTop: 12,
              height: sheetHeight,
            }
          ]}>
            {/* Header for Page 2 */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 4, marginBottom: 8 }}>
              <Text style={{ fontSize: moderateScale(9), color: themeColors.accent, fontWeight: 'bold', textTransform: 'uppercase' }}>
                {profile?.personal?.name || 'Resume'}
              </Text>
              <Text style={{ fontSize: moderateScale(9), color: '#94a3b8', fontWeight: 'bold' }}>
                Page 2 of 2
              </Text>
            </View>

            {projects ? (
              <>
                <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2), marginBottom: 2 }]}>
                  PROJECTS
                </Text>
                <TextInput
                  value={projects}
                  onChangeText={setProjects}
                  multiline
                  style={[styles.inlineInput, { color: '#000' }]}
                />
                <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 3 }]} />
              </>
            ) : null}

            {finalEducation && finalEducation.length > 0 && (
              <>
                <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2), marginBottom: 2 }]}>
                  EDUCATION
                </Text>
                {finalEducation.map((edu: any, idx: number) => (
                  <View key={idx} style={{ marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={[typography.small, { color: '#000', fontWeight: '500' }]}>
                        <Text style={{ fontWeight: 'bold' }}>{edu.degree || 'Degree'}</Text>
                        {edu.school_university ? ` - ${edu.school_university}` : ''}
                        {edu.passing_year ? ` | ${edu.passing_year}` : ''}
                      </Text>
                      {edu.gpa_percentage ? (
                        <Text style={[typography.tiny, { color: '#000', fontWeight: 'bold' }]}>
                          GPA: {edu.gpa_percentage}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
                <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 3 }]} />
              </>
            )}

            {certifications ? (
              <>
                <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2), marginBottom: 2 }]}>
                  CERTIFICATIONS
                </Text>
                <TextInput
                  value={certifications}
                  onChangeText={setCertifications}
                  multiline
                  style={[styles.inlineInput, { color: '#000' }]}
                />
                <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 3 }]} />
              </>
            ) : null}

            {careerObjective ? (
              <>
                <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2), marginBottom: 2 }]}>
                  CAREER OBJECTIVE
                </Text>
                <TextInput
                  value={careerObjective}
                  onChangeText={setCareerObjective}
                  multiline
                  style={[styles.inlineInput, { color: '#000' }]}
                />
                <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 3 }]} />
              </>
            ) : null}

            {languages ? (
              <>
                <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2), marginBottom: 2 }]}>
                  LANGUAGES
                </Text>
                <TextInput
                  value={languages}
                  onChangeText={setLanguages}
                  multiline
                  style={[styles.inlineInput, { color: '#000' }]}
                />
                <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 3 }]} />
              </>
            ) : null}

            {achievements ? (
              <>
                <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2), marginBottom: 2 }]}>
                  ACHIEVEMENTS
                </Text>
                <TextInput
                  value={achievements}
                  onChangeText={setAchievements}
                  multiline
                  style={[styles.inlineInput, { color: '#000' }]}
                />
                <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 3 }]} />
              </>
            ) : null}

            {hobbies ? (
              <>
                <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: moderateScale(8.2), marginBottom: 2 }]}>
                  HOBBIES & INTERESTS
                </Text>
                <TextInput
                  value={hobbies}
                  onChangeText={setHobbies}
                  multiline
                  style={[styles.inlineInput, { color: '#000' }]}
                />
              </>
            ) : null}

            <View style={{ position: 'absolute', bottom: 4, right: 12 }}>
              <Text style={{ fontSize: moderateScale(9), color: '#94a3b8', fontWeight: 'bold' }}>Page 2 of 2</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ marginTop: spacing.md, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: moderateScale(12), paddingHorizontal: spacing.sm }}>
          <Pressable
            onPress={handleSaveToProfile}
            style={({ pressed }) => [
              styles.workspaceBtn,
              {
                backgroundColor: '#f1f5f9',
                height: moderateScale(48),
                flex: 1,
                borderRadius: radius.pill,
                opacity: pressed ? 0.85 : 1,
              }
            ]}
          >
            <Icon name="save-outline" size={moderateScale(18)} color="#475569" />
            <Text style={[typography.labelMedium, { color: '#475569' }]}>
              Save Draft
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setCurrentScreen('TEMPLATES')}
            style={({ pressed }) => [
              styles.workspaceBtn,
              {
                backgroundColor: ORANGE_COLOR,
                height: moderateScale(48),
                flex: 1.5,
                borderRadius: radius.pill,
                opacity: pressed ? 0.85 : 1,
                shadowColor: ORANGE_COLOR,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }
            ]}
          >
            <Icon name="document-text" size={moderateScale(18)} color="#fff" />
            <Text style={[typography.labelMedium, { color: '#fff' }]}>
              Select Template
            </Text>
          </Pressable>
        </View>

        {/* Generous bottom spacer for floating bottom tab bar */}
        <View style={{ height: moderateScale(40) }} />
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  workspaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: moderateScale(12),
  },
  scoreBadge: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceScroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: moderateScale(160),
  },
  editorCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(6),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
  },
  resumeSheet: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: radius.xs,
    padding: moderateScale(12),
    minHeight: moderateScale(500),
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: spacing.xl,
  },
  sheetDivider: {
    height: 1,
    marginVertical: moderateScale(3),
  },
  inlineInput: {
    paddingVertical: 0,
    fontSize: moderateScale(8.2),
    lineHeight: moderateScale(11),
    fontFamily: 'Poppins-Regular',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: radius.sm,
  },
  workspaceBtn: {
    flex: 1,
    minHeight: moderateScale(48),
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  textBtn: {
    alignSelf: 'center',
    paddingVertical: moderateScale(8),
  },
});

export default AiResumeWorkspace;
