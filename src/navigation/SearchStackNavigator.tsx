import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import JobDetailScreen from '../screens/main/JobDetailScreen';
import JobListingScreen from '../screens/main/JobListingScreen';
import SearchScreen from '../screens/main/SearchScreen';
import SearchResultsScreen from '../screens/main/SearchResultsScreen';
import CategoryJobsScreen from '../screens/main/CategoryJobsScreen';
import type { SearchStackParamList } from './types';

const Stack = createStackNavigator<SearchStackParamList>();

const SearchStackNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="SearchHome" component={SearchScreen} />
      <Stack.Screen name="JobListing" component={JobListingScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="CategoryJobs" component={CategoryJobsScreen} />
    </Stack.Navigator>
  );
};

export default SearchStackNavigator;
