import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import JobsReelsScreen from '../screens/main/reels/JobsReelsScreen';
import SavedPostScreen from '../screens/main/saved/SavedPostScreen';
import type { JobReelsStackParamList } from './types';

const Stack = createNativeStackNavigator<JobReelsStackParamList>();

const JobReelsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ReelsMain" component={JobsReelsScreen} />
      <Stack.Screen name="SavedPost" component={SavedPostScreen} />
    </Stack.Navigator>
  );
};

export default JobReelsStackNavigator;
