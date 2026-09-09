import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ApplicationsScreen from '../screens/main/applications/ApplicationsScreen';
import JobDetailScreen from '../screens/main/jobs/JobDetailScreen';
import { ApplicationsStackParamList } from './types';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator<ApplicationsStackParamList>();

const ApplicationsStackNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="ApplicationsList" component={ApplicationsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
    </Stack.Navigator>
  );
};

export default ApplicationsStackNavigator;
