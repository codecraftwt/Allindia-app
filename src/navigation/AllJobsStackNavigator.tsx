import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import AllJobsScreen from '../screens/main/jobs/AllJobsScreen';
import JobDetailScreen from '../screens/main/jobs/JobDetailScreen';
import JobCategoriesScreen from '../screens/main/jobs/JobCategoriesScreen';
import IndustryCategoryScreen from '../screens/main/jobs/IndustryCategoryScreen';

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
      <Stack.Screen name="JobCategories" component={JobCategoriesScreen} />
      <Stack.Screen name="IndustryCategory" component={IndustryCategoryScreen} />
    </Stack.Navigator>
  );
};

export default AllJobsStackNavigator;
