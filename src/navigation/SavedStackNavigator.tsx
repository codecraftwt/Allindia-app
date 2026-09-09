import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import JobDetailScreen from '../screens/main/jobs/JobDetailScreen';
import SavedJobsScreen from '../screens/main/saved/SavedJobsScreen';
import type { SavedStackParamList } from './types';

const Stack = createNativeStackNavigator<SavedStackParamList>();

const SavedStackNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="SavedJobs" component={SavedJobsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
    </Stack.Navigator>
  );
};

export default SavedStackNavigator;
