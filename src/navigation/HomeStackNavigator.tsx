import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import HomeScreen from '../screens/main/HomeScreen';
import JobDetailScreen from '../screens/main/JobDetailScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import SearchScreen from '../screens/main/SearchScreen';
import JobListingScreen from '../screens/main/JobListingScreen';
import JobCategoriesScreen from '../screens/main/JobCategoriesScreen';
import CategoryJobsScreen from '../screens/main/CategoryJobsScreen';
import SearchResultsScreen from '../screens/main/SearchResultsScreen';
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
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
