import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AllJobsScreen from '../screens/main/jobs/AllJobsScreen';
import JobDetailScreen from '../screens/main/jobs/JobDetailScreen';

const Stack = createStackNavigator();

const AllJobsStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AllJobsList" component={AllJobsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
    </Stack.Navigator>
  );
};

export default AllJobsStackNavigator;
