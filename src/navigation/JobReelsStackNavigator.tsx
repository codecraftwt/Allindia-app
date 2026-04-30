import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import JobsReelsScreen from '../screens/main/reels/JobsReelsScreen';
import SavedPostScreen from '../screens/main/saved/SavedPostScreen';
import type { JobReelsStackParamList } from './types';

const Stack = createStackNavigator<JobReelsStackParamList>();

const JobReelsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReelsMain" component={JobsReelsScreen} />
      <Stack.Screen name="SavedPost" component={SavedPostScreen} />
    </Stack.Navigator>
  );
};

export default JobReelsStackNavigator;
