import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import AllJobsScreen from '../screens/main/jobs/AllJobsScreen';
import JobDetailScreen from '../screens/main/jobs/JobDetailScreen';

const Stack = createStackNavigator();

const AllJobsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
        cardStyle: { backgroundColor: '#fff' },
      }}>
      <Stack.Screen name="AllJobsList" component={AllJobsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
    </Stack.Navigator>
  );
};

export default AllJobsStackNavigator;
