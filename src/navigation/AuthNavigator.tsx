import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileSetupProvider } from '../context/ProfileSetupContext';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import SplashScreen from '../screens/Auth/SplashScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignInScreen from '../screens/Auth/SignInScreen';
import EmailLoginScreen from '../screens/Auth/EmailLoginScreen';
import OtpVerificationScreen from '../screens/Auth/OtpVerificationScreen';
import MainTabNavigator from './MainTabNavigator';
import ProfileBasicInfoScreen from '../screens/ProfileSetup/ProfileBasicInfoScreen';
import ProfileLocationScreen from '../screens/ProfileSetup/ProfileLocationScreen';
import ProfileEducationScreen from '../screens/ProfileSetup/ProfileEducationScreen';
import ProfileExperienceScreen from '../screens/ProfileSetup/ProfileExperienceScreen';
import ProfileJobPreferencesScreen from '../screens/ProfileSetup/ProfileJobPreferencesScreen';
import ProfileResumeScreen from '../screens/ProfileSetup/ProfileResumeScreen';
import type { AuthStackParamList } from './types';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  return (
    <ProfileSetupProvider>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' }, // Solid color is faster on Android
          animationEnabled: true,
        }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        <Stack.Screen name="ProfileBasicInfo" component={ProfileBasicInfoScreen} />
        <Stack.Screen name="ProfileLocation" component={ProfileLocationScreen} />
        <Stack.Screen name="ProfileEducation" component={ProfileEducationScreen} />
        <Stack.Screen name="ProfileExperience" component={ProfileExperienceScreen} />
        <Stack.Screen name="ProfileJobPreferences" component={ProfileJobPreferencesScreen} />
        <Stack.Screen name="ProfileResume" component={ProfileResumeScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </ProfileSetupProvider>
  );
};

export default AuthNavigator;
