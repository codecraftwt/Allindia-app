import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import AllJobsScreen from '../screens/main/jobs/AllJobsScreen';
import JobDetailScreen from '../screens/main/jobs/JobDetailScreen';
import JobCategoriesScreen from '../screens/main/jobs/JobCategoriesScreen';
import IndustryCategoryScreen from '../screens/main/jobs/IndustryCategoryScreen';

const Stack = createNativeStackNavigator();

const AllJobsStackNavigator = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="AllJobsList" component={AllJobsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="JobCategories" component={JobCategoriesScreen} />
      <Stack.Screen name="IndustryCategory" component={IndustryCategoryScreen} />
    </Stack.Navigator>
  );
};

export default AllJobsStackNavigator;
