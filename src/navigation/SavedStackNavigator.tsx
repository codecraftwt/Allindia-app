import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import JobDetailScreen from '../screens/main/jobs/JobDetailScreen';
import SavedJobsScreen from '../screens/main/saved/SavedJobsScreen';
import type { SavedStackParamList } from './types';

const Stack = createStackNavigator<SavedStackParamList>();

const SavedStackNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="SavedJobs" component={SavedJobsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
    </Stack.Navigator>
  );
};

export default SavedStackNavigator;
