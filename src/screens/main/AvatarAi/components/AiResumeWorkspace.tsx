import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';
import { radius } from '../../../../theme/radius';

export interface AiResumeWorkspaceProps {
  colors: any;
  isDark: boolean;
  profile: any;
  generatedResume: {
    summary: string;
    experienceBullets: string[];
    skills: string[];
    score: number;
  };
  targetJob: string;
  setTargetJob: (job: string) => void;
  selectedTheme: 'OrangeGlow' | 'MidnightSlate' | 'ForestMint' | 'RoyalAmethyst' | 'CrimsonRuby';
  setSelectedTheme: (theme: 'OrangeGlow' | 'MidnightSlate' | 'ForestMint' | 'RoyalAmethyst' | 'CrimsonRuby') => void;
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
  setCurrentScreen: (screen: 'LANDING' | 'SCANNING' | 'ATS_REPORT' | 'CHAT' | 'WIZARD' | 'GENERATING' | 'WORKSPACE') => void;
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
  return (
    <Animated.View style={[styles.screenContainer, { transform: [{ scale: slideAnim }] }]}>
      <View style={[styles.workspaceHeader, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
        <Pressable
          onPress={() => setCurrentScreen('CHAT')}
          style={({ pressed }) => ({
            padding: 4,
            opacity: pressed ? 0.7 : 1
          })}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>AI Resume Workspace</Text>
          <Text style={[typography.small, { color: colors.textSecondary }]}>
            Tap any text card below to instantly edit inline!
          </Text>
        </View>

        <View style={[styles.scoreBadge, { backgroundColor: ORANGE_COLOR + '20' }]}>
          <Text style={[typography.jobTitle, { color: ORANGE_COLOR }]}>{generatedResume.score}%</Text>
          <Text style={[typography.tiny, { color: ORANGE_COLOR }]}>ATS SCORE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.workspaceScroll} showsVerticalScrollIndicator={false}>
        {/* Theme Selector (5 Templates) */}
        <View style={[styles.editorCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: 12 }]}>
          <Text style={[typography.labelMedium, { color: colors.textPrimary, marginBottom: 8, fontWeight: 'bold' }]}>
            Resume Color Theme 🎨
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingVertical: 8, paddingLeft: 12, paddingRight: 4 }}>
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
                    width: 38,
                    height: 38,
                    backgroundColor: theme.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    // Modern leaf / droplet shape
                    borderTopLeftRadius: 18,
                    borderBottomRightRadius: 18,
                    borderTopRightRadius: 6,
                    borderBottomLeftRadius: 6,
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
                {selectedTheme === theme.id && <Icon name="checkmark-done" size={18} color="#fff" style={{ transform: [{ rotate: '10deg' }] }} />}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Dynamic Styled Resume Template Sheet */}
        <View style={[
          styles.resumeSheet,
          {
            backgroundColor: '#ffffff',
            borderColor: '#e2e8f0',
          }
        ]}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 6 }}>
            <Text style={[typography.appTitle, { color: themeColors.accent, fontWeight: '900', fontSize: 22, letterSpacing: -0.5, textAlign: 'center' }]}>
              {profile?.personal?.name || 'Your Name'}
            </Text>

            {targetJob ? (
              <Text style={[typography.labelMedium, { color: '#334155', fontWeight: '700', marginTop: 2, marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' }]}>
                {targetJob}
              </Text>
            ) : null}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}>
              {(resumePhone || profile?.personal?.phone || profile?.personal?.mobile) && (
                <>
                  <Icon name="phone-portrait" size={10} color="#000" style={{ marginRight: 2 }} />
                  <Text style={[typography.tiny, { color: '#000', fontWeight: 'bold' }]}>
                    {resumePhone || profile?.personal?.phone || profile?.personal?.mobile}
                  </Text>
                  <Text style={{ color: '#cbd5e1', marginHorizontal: 6 }}>|</Text>
                </>
              )}
              {(resumeEmail || profile?.personal?.email) && (
                <>
                  <Icon name="mail" size={10} color="#000" style={{ marginRight: 2 }} />
                  <Text style={[typography.tiny, { color: '#000', fontWeight: 'bold' }]}>
                    {resumeEmail || profile?.personal?.email}
                  </Text>
                  <Text style={{ color: '#cbd5e1', marginHorizontal: 6 }}>|</Text>
                </>
              )}
              {profile?.personal?.city && (
                <>
                  <Icon name="location" size={10} color="#000" style={{ marginRight: 2 }} />
                  <Text style={[typography.tiny, { color: '#000', fontWeight: 'bold' }]}>{profile.personal.city}</Text>
                  <Text style={{ color: '#cbd5e1', marginHorizontal: 6 }}>|</Text>
                </>
              )}
              {(resumeLinkedin || profile?.personal?.linkedin) && (
                <>
                  <Icon name="logo-linkedin" size={10} color="#000" style={{ marginRight: 2 }} />
                  <Text style={[typography.tiny, { color: '#000', fontWeight: 'bold' }]}>
                    {(resumeLinkedin || profile?.personal?.linkedin).replace(/^https?:\/\/(www\.)?/, '')}
                  </Text>
                  {(resumeGithub || profile?.personal?.github) && <Text style={{ color: '#cbd5e1', marginHorizontal: 6 }}>|</Text>}
                </>
              )}
              {(resumeGithub || profile?.personal?.github) && (
                <>
                  <Icon name="logo-github" size={10} color="#000" style={{ marginRight: 2 }} />
                  <Text style={[typography.tiny, { color: '#000', fontWeight: 'bold' }]}>
                    {(resumeGithub || profile?.personal?.github).replace(/^https?:\/\/(www\.)?/, '')}
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 8 }]} />

          {/* Summary Section */}
          <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }]}>
            SUMMARY
          </Text>
          <TextInput
            value={editedSummary}
            onChangeText={setEditedSummary}
            multiline
            style={[styles.inlineInput, { color: '#000', marginTop: 4 }]}
          />

          <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 8 }]} />

          {/* Skills Section */}
          <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }]}>
            SKILLS
          </Text>
          <View style={{ marginBottom: 4 }}>
            {generatedResume.skills.length > 0 ? (
              <TextInput
                value={generatedResume.skills.map(s => `- ${s}`).join('\n')}
                multiline
                style={[styles.inlineInput, { color: '#000', fontWeight: '500', lineHeight: 18 }]}
                editable={false}
              />
            ) : (
              <Text style={[typography.tiny, { color: '#000' }]}>No skills identified.</Text>
            )}
          </View>

          <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 8 }]} />

          {/* Experience Section */}
          {profile?.experience && profile.experience.length > 0 && (
            <>
              <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }]}>
                EXPERIENCE
              </Text>
              {profile.experience.map((exp: any, idx: number) => (
                <View key={idx} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={[typography.small, { color: '#000', fontWeight: 'bold', flex: 1 }]}>
                      {exp.designation || 'Specialist'} , {exp.company || 'Company'} <Text style={{ fontWeight: 'normal' }}>| {exp.location || profile?.personal?.city || ''}</Text>
                    </Text>
                    <Text style={[typography.tiny, { color: '#000', fontWeight: 'bold' }]}>
                      {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date || ''}
                    </Text>
                  </View>
                  {idx === 0 && editedBullets.length > 0 ? (
                    editedBullets.map((bullet, bIdx) => (
                      <View key={bIdx} style={[styles.bulletRow, { marginTop: 2 }]}>
                        <Text style={{ color: '#000', marginRight: 6, fontSize: 14 }}>-</Text>
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
                      <Text style={{ color: '#000', marginRight: 6, fontSize: 14 }}>-</Text>
                      <Text style={[typography.tiny, { color: '#000', flex: 1, lineHeight: 18 }]}>
                        {exp.description || 'Contributed to key projects and operational workflows.'}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
              <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 8 }]} />
            </>
          )}

          {/* Projects Section */}
          {projects ? (
            <>
              <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }]}>
                PROJECTS
              </Text>
              <TextInput
                value={projects}
                onChangeText={setProjects}
                multiline
                style={[styles.inlineInput, { color: '#000' }]}
              />
              <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 8 }]} />
            </>
          ) : null}

          {/* Education Section */}
          {profile?.education && profile.education.length > 0 && (
            <>
              <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }]}>
                EDUCATION
              </Text>
              {profile.education.map((edu: any, idx: number) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[typography.small, { color: '#000', fontWeight: '500' }]}>
                      <Text style={{ fontWeight: 'bold' }}>{edu.degree || 'Degree'}</Text> - {edu.school_university || 'University'} {edu.passing_year ? `| ${edu.passing_year}` : ''}
                    </Text>
                    {edu.gpa_percentage ? (
                      <Text style={[typography.tiny, { color: '#000', fontWeight: 'bold' }]}>
                        GPA: {edu.gpa_percentage}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
              <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 8 }]} />
            </>
          )}

          {/* Certifications Section */}
          {certifications ? (
            <>
              <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }]}>
                CERTIFICATIONS
              </Text>
              <TextInput
                value={certifications}
                onChangeText={setCertifications}
                multiline
                style={[styles.inlineInput, { color: '#000' }]}
              />
              <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 8 }]} />
            </>
          ) : null}

          {/* Career Objective Section */}
          {careerObjective ? (
            <>
              <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }]}>
                CAREER OBJECTIVE
              </Text>
              <TextInput
                value={careerObjective}
                onChangeText={setCareerObjective}
                multiline
                style={[styles.inlineInput, { color: '#000' }]}
              />
              <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 8 }]} />
            </>
          ) : null}

          {/* Languages Section */}
          {languages ? (
            <>
              <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }]}>
                LANGUAGES
              </Text>
              <TextInput
                value={languages}
                onChangeText={setLanguages}
                multiline
                style={[styles.inlineInput, { color: '#000' }]}
              />
              <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 8 }]} />
            </>
          ) : null}

          {/* Achievements Section */}
          {achievements ? (
            <>
              <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }]}>
                ACHIEVEMENTS
              </Text>
              <TextInput
                value={achievements}
                onChangeText={setAchievements}
                multiline
                style={[styles.inlineInput, { color: '#000' }]}
              />
              <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 8 }]} />
            </>
          ) : null}

          {/* Hobbies Section */}
          {hobbies ? (
            <>
              <Text style={[typography.labelMedium, { color: themeColors.accent, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }]}>
                HOBBIES & INTERESTS
              </Text>
              <TextInput
                value={hobbies}
                onChangeText={setHobbies}
                multiline
                style={[styles.inlineInput, { color: '#000' }]}
              />
              <View style={[styles.sheetDivider, { backgroundColor: '#cbd5e1', marginVertical: 8 }]} />
            </>
          ) : null}
        </View>

        {/* Action Buttons */}
        <View style={{ gap: spacing.md, marginTop: spacing.md, width: '100%' }}>
          {/* <Pressable
            onPress={handleSaveToProfile}
            style={[styles.workspaceBtn, { backgroundColor: ORANGE_COLOR, width: '100%' }]}
          >
            <Icon name="cloud-upload-outline" size={18} color="#fff" />
            <Text style={[typography.small, { color: '#fff', fontWeight: 'bold' }]}>
              Sync & Save to Candidate Profile
            </Text>
          </Pressable> */}

          {/* <View style={{ flexDirection: 'row', gap: spacing.md }}>
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
          </View> */}
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
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  resumeSheet: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 2,
    padding: 16,
    minHeight: 600,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: spacing.xxl,
  },
  sheetDivider: {
    height: 1, // Crisp line like a real document
    marginVertical: 8,
  },
  inlineInput: {
    paddingVertical: 0,
    fontSize: 11.5, // Smaller size for A4 realism
    lineHeight: 16,
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
});
