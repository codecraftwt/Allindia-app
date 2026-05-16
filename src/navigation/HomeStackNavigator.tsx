import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
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
      {/* LocationSelection presented as modal (slides up from bottom)
          so it doesn't conflict with HomeScreen's absolute-positioned header */}
      <Stack.Screen
        name="LocationSelection"
        component={LocationScreen}
        options={{
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
