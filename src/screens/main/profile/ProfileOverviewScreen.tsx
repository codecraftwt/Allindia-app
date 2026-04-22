import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { logoutCandidate } from '../../../redux/slice/authSlice';
import { fetchProfile } from '../../../redux/slice/profileSlice';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { PrimaryButton } from '../../../components/auth';
import { useProfileSetup } from '../../../context/ProfileSetupContext';
import type { ProfileStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { components } from '../../../theme/components';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import type { ThemeColors } from '../../../theme/colors';
import { JOB_CATEGORIES, SALARY_OPTIONS } from '../../ProfileSetup/profileSetupConstants';
import { logoutToLogin } from './logoutToLogin';

type Nav = StackNavigationProp<ProfileStackParamList, 'ProfileOverview'>;

function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function SectionRow({
  title,
  subtitle,
  colors,
  onPress,
}: {
  title: string;
  subtitle?: string;
  colors: ThemeColors;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.sectionRow,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}>
      <View style={styles.sectionRowText}>
        <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Icon name="chevron-right" size={14} color={colors.textPlaceholder} />
    </Pressable>
  );
}

const ProfileOverviewScreen: React.FC = () => {
  const { colors, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch<AppDispatch>();
  const { draft } = useProfileSetup();
  const { user, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { data: profileData, loading: profileLoading } = useSelector((state: RootState) => state.profile);
  const [notificationsOn, setNotificationsOn] = useState(true);

  React.useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const profile = profileData?.profile;

  const handleLogout = async () => {
    try {
      await dispatch(logoutCandidate()).unwrap();
      logoutToLogin(navigation);
    } catch (error) {
      // Even if API fails, we redirect because state is cleared locally
      logoutToLogin(navigation);
    }
  };

  const displayName = profile?.personal?.name || user?.name || draft.fullName || 'Your profile';
  const displayEmail = profile?.personal?.email || user?.email || draft.email || '';
  const displayPhone = profile?.personal?.phone || user?.phone || draft.phone || '';

  const salaryLabel = useMemo(() => {
    const pref = profile?.preferences;
    if (pref?.expected_salary_min || pref?.expected_salary_max) {
      if (pref.expected_salary_min === 0 && pref.expected_salary_max === 0) {
        return 'Not set';
      }
      const min = pref.expected_salary_min ? `₹${pref.expected_salary_min.toLocaleString()}` : '0';
      const max = pref.expected_salary_max ? `₹${pref.expected_salary_max.toLocaleString()}` : 'Max';
      return `${min} - ${max}`;
    }
    return SALARY_OPTIONS.find(o => o.id === draft.expectedSalary)?.label ?? 'Not set';
  }, [profile?.preferences, draft.expectedSalary]);

  const job_category = useMemo(() => {
    const pref = profile?.preferences;
    if (pref?.job_category) {
      const cat = pref.job_category;
      return typeof cat === 'object' ? cat.name : cat;
    }
    const labels = draft.jobCategoryIds
      .map(id => JOB_CATEGORIES.find(c => c.id === id)?.label)
      .filter(Boolean) as string[];
    if (labels.length === 0) {
      return 'Not set';
    }
    return labels.slice(0, 3).join(' · ');
  }, [profile?.preferences, draft.jobCategoryIds]);

  const locationLine = useMemo(() => {
    if (profile?.preferences?.current_city) {
      return profile.preferences.current_city;
    }
    return draft.city || draft.area
      ? [draft.city, draft.area].filter(Boolean).join(' · ')
      : 'Add your location';
  }, [profile?.preferences, draft.city, draft.area]);

  const qualificationText = profile?.education?.qualification || draft.qualification || 'Qualification not set';

  const experienceText = useMemo(() => {
    if (profile?.experience?.experience_type) {
      const type = profile.experience.experience_type;
      const years = profile.experience.total_experience_years;
      return type === 'fresher' ? 'Fresher' : `${years} years experience`;
    }
    return draft.isFresher
      ? 'Fresher'
      : draft.experienceYears
        ? `${draft.experienceYears} years`
        : 'Not set';
  }, [profile?.experience, draft.isFresher, draft.experienceYears]);

  const resumeText = useMemo(() => {
    if (profile?.resume?.has_resume) {
      return profile.resume.resume_original_name || 'Resume uploaded';
    }
    return draft.resumeName
      ? draft.resumeName
      : draft.resumeSkipped
        ? 'Skipped — add a file anytime'
        : 'No resume uploaded';
  }, [profile?.resume, draft.resumeName, draft.resumeSkipped]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: spacing.xxl + Math.max(insets.bottom, spacing.md) },
        ]}>
        <View style={styles.hero}>
          <View style={[styles.avatar, { backgroundColor: colors.surfaceHighlight }]}>
            {user?.profile_picture_url ? (
              <Image
                source={{ uri: `https://floralwhite-louse-700260.hostingersite.com${user.profile_picture_url}` }}
                style={styles.avatarImage}
              />
            ) : displayName.trim() ? (
              <Text style={[typography.appTitle, { color: colors.primary, fontSize: 28 }]}>
                {profileInitials(displayName)}
              </Text>
            ) : (
              <Icon name="user" size={40} color={colors.primary} />
            )}
          </View>
          <Text style={[typography.appTitle, { color: colors.textPrimary, textAlign: 'center' }]}>
            {displayName}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
            {displayEmail}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
            {locationLine}
          </Text>
          {qualificationText !== 'Qualification not set' ? (
            <Text
              style={[typography.small, { color: colors.textPlaceholder, textAlign: 'center', marginTop: 4 }]}>
              {qualificationText}
            </Text>
          ) : null}
          <PrimaryButton
            title="Edit profile"
            onPress={() => navigation.navigate('ProfilePersonalInfo')}
            colors={colors}
            variant="secondary"
            style={styles.editBtn}
          />
        </View>

        <Text style={[typography.sectionTitle, styles.sectionTitle, { color: colors.textPrimary }]}>
          Profile
        </Text>
        <View style={styles.sectionBlock}>
          <SectionRow
            title="Personal info"
            subtitle={`${displayName} · ${displayPhone}`}
            colors={colors}
            onPress={() => navigation.navigate('ProfilePersonalInfo')}
          />
          <SectionRow
            title="Education"
            subtitle={qualificationText}
            colors={colors}
            onPress={() => navigation.navigate('ProfileEducation')}
          />
          <SectionRow
            title="Experience"
            subtitle={experienceText}
            colors={colors}
            onPress={() => navigation.navigate('ProfileExperience')}
          />
          <SectionRow
            title="Job preferences"
            subtitle={`${job_category} · ${salaryLabel}`}
            colors={colors}
            onPress={() => navigation.navigate('ProfileJobPreferences')}
          />
          <SectionRow
            title="Resume"
            subtitle={resumeText}
            colors={colors}
            onPress={() => navigation.navigate('ProfileResume')}
          />
        </View>

        <Text style={[typography.sectionTitle, styles.sectionTitle, { color: colors.textPrimary }]}>
          Settings
        </Text>
        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}>
          <View style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingsRowText}>
              <Icon name="bell-o" size={18} color={colors.primary} style={styles.settingsIcon} />
              <View>
                <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Notifications</Text>
                <Text style={[typography.small, { color: colors.textSecondary }]}>
                  Job alerts and application updates
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsOn}
              onValueChange={setNotificationsOn}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationsOn ? colors.onPrimary : colors.surfaceSecondary}
            />
          </View>
          <View style={[styles.settingsRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingsRowText}>
              <Icon
                name={mode === 'dark' ? 'moon-o' : 'sun-o'}
                size={18}
                color={colors.primary}
                style={styles.settingsIcon}
              />
              <View>
                <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>Dark mode</Text>
                <Text style={[typography.small, { color: colors.textSecondary }]}>
                  Use dark theme across the app
                </Text>
              </View>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={v => setMode(v ? 'dark' : 'light')}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={mode === 'dark' ? colors.onPrimary : colors.surfaceSecondary}
            />
          </View>
          <Pressable
            onPress={handleLogout}
            disabled={authLoading}
            style={[styles.logoutPress, authLoading && { opacity: 0.5 }]}
            accessibilityRole="button"
            accessibilityLabel="Log out">
            <Icon name="sign-out" size={18} color={colors.error} style={styles.settingsIcon} />
            <Text style={[typography.labelMedium, { color: colors.error }]}>Log out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editBtn: {
    marginTop: spacing.md,
    width: '100%',
    maxWidth: 280,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionBlock: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionRow: {
    ...components.jobCard,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sectionRowText: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.sm,
  },
  settingsCard: {
    ...components.jobCard,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  settingsRowText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  settingsIcon: {
    marginTop: 2,
  },
  logoutPress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
});

export default ProfileOverviewScreen;
