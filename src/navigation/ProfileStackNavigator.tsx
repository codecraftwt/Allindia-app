import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import ProfileOverviewScreen from '../screens/main/profile/ProfileOverviewScreen';
import ProfilePersonalInfoScreen from '../screens/main/profile/ProfilePersonalInfoScreen';
import ProfileEducationEditScreen from '../screens/main/profile/ProfileEducationEditScreen';
import ProfileExperienceEditScreen from '../screens/main/profile/ProfileExperienceEditScreen';
import ProfileJobPreferencesEditScreen from '../screens/main/profile/ProfileJobPreferencesEditScreen';
import ProfileResumeEditScreen from '../screens/main/profile/ProfileResumeEditScreen';
import ProfileAccountSetting from '../screens/main/profile/ProfileAccountSetting';
import ProfileDetailsScreen from '../screens/main/profile/ProfileDetailsScreen';
import HelpAndSupportScreen from '../screens/main/profile/HelpAndSupportScreen';
import PrivacyPolicyScreen from '../screens/main/profile/PrivacyPolicyScreen';
import TermsAndConditionsScreen from '../screens/main/profile/TermsAndConditionsScreen';
import SavedJobsScreen from '../screens/main/saved/SavedJobsScreen';
import JobDetailScreen from '../screens/main/jobs/JobDetailScreen';

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="ProfileOverview"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen name="ProfileOverview" component={ProfileOverviewScreen} />
      <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
      <Stack.Screen name="ProfilePersonalInfo" component={ProfilePersonalInfoScreen} />
      <Stack.Screen name="ProfileEducation" component={ProfileEducationEditScreen} />
      <Stack.Screen name="ProfileExperience" component={ProfileExperienceEditScreen} />
      <Stack.Screen name="ProfileJobPreferences" component={ProfileJobPreferencesEditScreen} />
      <Stack.Screen name="ProfileResume" component={ProfileResumeEditScreen} />
      <Stack.Screen name="ProfileAccountSetting" component={ProfileAccountSetting} />
      <Stack.Screen name="HelpAndSupport" component={HelpAndSupportScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
      <Stack.Screen name="Saved" component={SavedJobsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
