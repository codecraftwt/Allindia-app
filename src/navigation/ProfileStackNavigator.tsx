import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import ProfileOverviewScreen from '../screens/main/profile/ProfileOverviewScreen';
import ProfilePersonalInfoScreen from '../screens/main/profile/ProfilePersonalInfoScreen';
import ProfileEducationEditScreen from '../screens/main/profile/ProfileEducationEditScreen';
import ProfileExperienceEditScreen from '../screens/main/profile/ProfileExperienceEditScreen';
import ProfileJobPreferencesEditScreen from '../screens/main/profile/ProfileJobPreferencesEditScreen';
import ProfileResumeEditScreen from '../screens/main/profile/ProfileResumeEditScreen';
import type { ProfileStackParamList } from './types';

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
      <Stack.Screen name="ProfilePersonalInfo" component={ProfilePersonalInfoScreen} />
      <Stack.Screen name="ProfileEducation" component={ProfileEducationEditScreen} />
      <Stack.Screen name="ProfileExperience" component={ProfileExperienceEditScreen} />
      <Stack.Screen name="ProfileJobPreferences" component={ProfileJobPreferencesEditScreen} />
      <Stack.Screen name="ProfileResume" component={ProfileResumeEditScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
