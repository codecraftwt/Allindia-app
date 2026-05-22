import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
  Image,
  Dimensions,
  Linking,
  Alert,
  Pressable,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { fetchProfile } from '../../../redux/slice/profileSlice';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';

const { width } = Dimensions.get('window');
const ORANGE_COLOR = '#FF9800';
const CARD_WIDTH = width - 36; // Dynamic width with padding
const CARD_HEIGHT = CARD_WIDTH * 1.4; // Proper A4 ratio aspect height

const ResumeScreen: React.FC = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile?.data);
  const profileLoading = useSelector((state: RootState) => state.profile?.loading);
  const user = useSelector((state: RootState) => state.auth?.user);

  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [cardPdfLoading, setCardPdfLoading] = useState(true);

  // Fetch profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchProfile());
    }, [dispatch])
  );

  const decodeFileName = (name: string) => {
    try {
      return decodeURIComponent(name).replace(/\+/g, ' ');
    } catch {
      return name;
    }
  };

  // Animations
  const orbOuterBlink = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    const outerBlinkLoop = Animated.loop(
      Animated.timing(orbOuterBlink, {
        toValue: 1.08,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );

    const scannerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: CARD_HEIGHT - 10,
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

  // ---- PROFILE API DATA with fallbacks ----
  const userName = profile?.personal?.name || user?.name || 'Your Name';
  const targetJob = profile?.personal?.designation || profile?.experience?.designation || '';
  const phone = profile?.personal?.phone || profile?.personal?.mobile || user?.phone || '';
  const email = profile?.personal?.email || user?.email || '';
  const linkedin = profile?.personal?.linkedin || '';
  const github = profile?.personal?.github || '';
  const summary = profile?.personal?.bio || '';

  // Normalize experience
  const getNormalizedExperience = () => {
    if (!profile?.experience) return [];
    if (Array.isArray(profile.experience)) {
      return profile.experience;
    }
    const expObj = profile.experience;
    const type = expObj.experience_type || '';
    const years = expObj.total_experience_years;
    const designation = expObj.designation || targetJob || 'Professional';
    const company = expObj.company || '';

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
      company: company || '',
      start_date: expObj.start_date || '',
      end_date: expObj.end_date || '',
      is_current: expObj.is_current ?? true,
      description: expObj.description || `${years || 1} Year(s) of Experience`,
    }];
  };

  // Normalize education
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

    const notes = eduObj.education_notes || eduObj.notes || eduObj.school_university || '';

    return [{
      degree: degree,
      school_university: notes,
      passing_year: eduObj.passing_year || '',
      gpa_percentage: eduObj.gpa_percentage || '',
    }];
  };

  const experience = getNormalizedExperience();
  const education = getNormalizedEducation();

  // Skills from profile
  const skills = profile?.skills;
  const skillsText = Array.isArray(skills)
    ? skills.map((s: any) => (typeof s === 'string' ? s : s?.name || s?.skill)).filter(Boolean).join(', ')
    : typeof skills === 'string' ? skills : '';

  // ATS score placeholder
  const atsScore = 72;

  // Retrieve resume from profile data
  const resume = profile?.resume || (profile as any)?.profile?.resume || (profile as any)?.resume;

  const googleDocUrl = resume?.resume_url
    ? (Platform.OS === 'ios'
      ? resume.resume_url
      : `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(resume.resume_url)}`)
    : '';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={profileLoading || false}
            onRefresh={() => dispatch(fetchProfile())}
            colors={[ORANGE_COLOR]}
            tintColor={ORANGE_COLOR}
          />
        }
      >

        {/* Title Header */}
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


          {/* Resume Card with Scanner */}
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 35, width: '100%', position: 'relative' }}>


            {/* HUD Callout: Keywords */}
            <View style={[styles.hudCallout, { left: -4, top: 40, borderColor: ORANGE_COLOR + '45', backgroundColor: colors.surface }]}>
              <Icon name="checkmark-circle" size={11} color={ORANGE_COLOR} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 8, fontWeight: '800', color: colors.textPrimary }}>Keywords</Text>
            </View>

            {/* HUD Callout: PDF Approved */}
            <View style={[styles.hudCallout, { right: -4, top: 180, borderColor: '#10b981' + '45', backgroundColor: colors.surface }]}>
              <Icon name="shield-checkmark" size={11} color="#10b981" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 8, fontWeight: '800', color: colors.textPrimary }}>PDF Approved</Text>
            </View>

            {/* HUD Callout: ATS Boosted */}
            <View style={[styles.hudCallout, { left: -4, top: 300, borderColor: ORANGE_COLOR + '45', backgroundColor: colors.surface }]}>
              <Icon name="trending-up" size={11} color={ORANGE_COLOR} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 8, fontWeight: '800', color: colors.textPrimary }}>ATS Boosted</Text>
            </View>

            {/* Paper Resume Card */}
            <Pressable
              onPress={() => {
                if (resume?.resume_url) {
                  setPdfLoading(true);
                  setShowPdfPreview(true);
                }
              }}
            >
              <View style={styles.resumeCard}>
                {resume?.has_resume && googleDocUrl ? (
                  <View style={{ flex: 1, position: 'relative', paddingTop: 10 }} pointerEvents="none">
                    <WebView
                      source={{ uri: googleDocUrl }}
                      style={{ flex: 1, transform: [{ scale: 1.25 }, { translateY: 45 }] }}
                      scalesPageToFit={true}
                      scrollEnabled={false}
                      startInLoadingState={true}
                      onLoadStart={() => setCardPdfLoading(true)}
                      onLoadEnd={() => setCardPdfLoading(false)}
                      onError={() => setCardPdfLoading(false)}
                      userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.0.0 Safari/537.36"
                    />
                    {cardPdfLoading && (
                      <View style={{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: '#ffffff',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <ActivityIndicator size="small" color={ORANGE_COLOR} />
                        <Text style={{ color: '#64748b', marginTop: 8, fontSize: 10, fontWeight: '600' }}>
                          Loading PDF Preview...
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <ScrollView
                    contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    {/* Header */}
                    <View style={{ alignItems: 'center', marginBottom: 2 }}>
                      <Text style={{ color: ORANGE_COLOR, fontWeight: '900', fontSize: 13.5, letterSpacing: -0.5, textAlign: 'center' }}>
                        {userName}
                      </Text>
                      {targetJob ? (
                        <Text style={{ color: '#334155', fontWeight: '700', marginTop: 1, marginBottom: 1, fontSize: 8.5, letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'center' }}>
                          {targetJob}
                        </Text>
                      ) : null}

                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: 2 }}>
                        {phone ? (
                          <>
                            <Icon name="phone-portrait" size={8} color="#000" style={{ marginRight: 2 }} />
                            <Text style={styles.contactText}>{phone}</Text>
                            <Text style={styles.contactSep}>|</Text>
                          </>
                        ) : null}
                        {email ? (
                          <>
                            <Icon name="mail" size={8} color="#000" style={{ marginRight: 2 }} />
                            <Text style={styles.contactText}>{email}</Text>
                            {(linkedin || github) ? <Text style={styles.contactSep}>|</Text> : null}
                          </>
                        ) : null}
                        {linkedin ? (
                          <>
                            <Icon name="logo-linkedin" size={8} color="#000" style={{ marginRight: 2 }} />
                            <Text style={styles.contactText}>{linkedin.replace(/^https?:\/\/(www\.)?/, '')}</Text>
                            {github ? <Text style={styles.contactSep}>|</Text> : null}
                          </>
                        ) : null}
                        {github ? (
                          <>
                            <Icon name="logo-github" size={8} color="#000" style={{ marginRight: 2 }} />
                            <Text style={styles.contactText}>{github.replace(/^https?:\/\/(www\.)?/, '')}</Text>
                          </>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Summary */}
                    {summary ? (
                      <>
                        <Text style={styles.sectionTitle}>SUMMARY</Text>
                        <Text style={styles.bodyText}>{summary}</Text>
                        <View style={styles.divider} />
                      </>
                    ) : null}

                    {/* Experience */}
                    {experience.length > 0 && (
                      <>
                        <Text style={[styles.sectionTitle, { marginBottom: 2 }]}>EXPERIENCE</Text>
                        {experience.map((exp: any, idx: number) => (
                          <View key={idx} style={{ marginBottom: 3 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                              <Text style={{ color: '#000', fontWeight: 'bold', flex: 1, fontSize: 8.5 }}>
                                {exp.designation || 'Specialist'}
                                {exp.company ? ` , ${exp.company}` : ''}
                              </Text>
                              {exp.start_date && exp.start_date !== 'N/A' ? (
                                <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 7.8 }}>
                                  {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date || ''}
                                </Text>
                              ) : null}
                            </View>
                            {exp.description ? (
                              <View style={{ flexDirection: 'row', marginTop: 1, alignItems: 'flex-start' }}>
                                <Text style={{ color: '#000', marginRight: 4, fontSize: 8.2 }}>-</Text>
                                <Text style={{ color: '#000', flex: 1, fontSize: 7.8, lineHeight: 12 }}>
                                  {exp.description}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        ))}
                        <View style={styles.divider} />
                      </>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                      <>
                        <Text style={[styles.sectionTitle, { marginBottom: 2 }]}>EDUCATION</Text>
                        {education.map((edu: any, idx: number) => (
                          <View key={idx} style={{ marginBottom: 2 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                              <Text style={{ color: '#000', fontSize: 8.2, fontWeight: '500' }}>
                                <Text style={{ fontWeight: 'bold' }}>{edu.degree || 'Degree'}</Text>
                                {edu.school_university ? ` - ${edu.school_university}` : ''}
                                {edu.passing_year ? ` | Class of ${edu.passing_year}` : ''}
                              </Text>
                              {edu.gpa_percentage ? (
                                <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 7.8 }}>
                                  GPA: {edu.gpa_percentage}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                        ))}
                        <View style={styles.divider} />
                      </>
                    )}

                    {/* Skills */}
                    {skillsText ? (
                      <>
                        <Text style={[styles.sectionTitle, { marginBottom: 2 }]}>SKILLS</Text>
                        <Text style={styles.bodyText}>{skillsText}</Text>
                        <View style={styles.divider} />
                      </>
                    ) : null}

                  </ScrollView>
                )}

                {/* AI Fit Badge */}
                <View style={[styles.aiBadge, { backgroundColor: atsScore >= 40 ? '#10b981' : ORANGE_COLOR, shadowColor: atsScore >= 40 ? '#10b981' : ORANGE_COLOR }]}>
                  <Icon name="sparkles" size={12} color="#fff" style={{ marginRight: 4 }} />
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>
                    {atsScore}% AI
                  </Text>
                </View>

                {/* Laser Scanner Beam */}
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
            </Pressable>

          </View>
        </View>

      </ScrollView>

      {/* PDF Preview Modal */}
      <Modal
        visible={showPdfPreview}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowPdfPreview(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom', 'left', 'right']}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border || '#e2e8f0',
            backgroundColor: colors.surface,
          }}>
            <TouchableOpacity
              onPress={() => setShowPdfPreview(false)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Icon name="arrow-back" size={24} color={colors.textPrimary} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, width: width * 0.5 }} numberOfLines={1}>
                {resume ? decodeFileName(resume.resume_original_name || 'Resume') : 'Resume'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (resume?.resume_url) {
                  Linking.openURL(resume.resume_url).catch(() => {
                    Alert.alert('Error', 'Could not open resume externally');
                  });
                }
              }}
              style={{
                backgroundColor: ORANGE_COLOR + '20',
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: ORANGE_COLOR, fontSize: 12, fontWeight: '700' }}>Open External</Text>
            </TouchableOpacity>
          </View>

          {/* WebView Container */}
          <View style={{ flex: 1, position: 'relative' }}>
            {googleDocUrl ? (
              <WebView
                source={{ uri: googleDocUrl }}
                style={{ flex: 1 }}
                onLoadStart={() => setPdfLoading(true)}
                onLoadEnd={() => setPdfLoading(false)}
                onError={() => {
                  setPdfLoading(false);
                  Alert.alert('Error', 'Failed to load PDF preview in-app');
                }}
                userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.0.0 Safari/537.36"
              />
            ) : null}

            {/* Spinner Overlay */}
            {pdfLoading && (
              <View style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: colors.background,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <ActivityIndicator size="large" color={ORANGE_COLOR} />
                <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 13, fontWeight: '600' }}>
                  Loading PDF Preview...
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  hudCallout: {
    position: 'absolute',
    borderWidth: 1,
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
  },
  resumeCard: {
    width: 310,
    height: 420,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  contactText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 7.8,
  },
  contactSep: {
    color: '#cbd5e1',
    marginHorizontal: 3,
    fontSize: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#cbd5e1',
    marginVertical: 3,
  },
  sectionTitle: {
    color: '#FF9800',
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontSize: 8.2,
  },
  bodyText: {
    color: '#000',
    marginTop: 1,
    fontSize: 7.8,
    lineHeight: 12,
  },
  aiBadge: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ResumeScreen;
