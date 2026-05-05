import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ApplicationsScreen from '../screens/main/applications/ApplicationsScreen';
import JobDetailScreen from '../screens/main/jobs/JobDetailScreen';
import { ApplicationsStackParamList } from './types';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator<ApplicationsStackParamList>();

const ApplicationsStackNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="ApplicationsList" component={ApplicationsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
    </Stack.Navigator>
  );
};

export default ApplicationsStackNavigator;
