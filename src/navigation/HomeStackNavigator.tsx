import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import HomeScreen from '../screens/main/home/HomeScreen';
import JobDetailScreen from '../screens/main/jobs/JobDetailScreen';
import NotificationsScreen from '../screens/main/notifications/NotificationsScreen';
import SearchScreen from '../screens/main/search/SearchScreen';
import JobListingScreen from '../screens/main/jobs/JobListingScreen';
import JobCategoriesScreen from '../screens/main/jobs/JobCategoriesScreen';
import CategoryJobsScreen from '../screens/main/jobs/CategoryJobsScreen';
import SearchResultsScreen from '../screens/main/search/SearchResultsScreen';
import IndustryCategoryScreen from '../screens/main/jobs/IndustryCategoryScreen';
import SavedJobsScreen from '../screens/main/saved/SavedJobsScreen';
import LocationScreen from '../screens/main/home/LocationScreen';
import type { HomeStackParamList } from './types';

const Stack = createStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen name="HomeFeed" component={HomeScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="SearchHome" component={SearchScreen} />
      <Stack.Screen name="JobListing" component={JobListingScreen} />
      <Stack.Screen name="JobCategories" component={JobCategoriesScreen} />
      <Stack.Screen name="CategoryJobs" component={CategoryJobsScreen} />
      <Stack.Screen name="IndustryCategory" component={IndustryCategoryScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="Saved" component={SavedJobsScreen} />
      <Stack.Screen name="LocationSelection" component={LocationScreen} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
