import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../context/ThemeContext';
import ApplicationsScreen from '../screens/main/ApplicationsScreen';
import HomeStackNavigator from './HomeStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import SavedStackNavigator from './SavedStackNavigator';
import SearchStackNavigator from './SearchStackNavigator';
import { typography } from '../theme/typography';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 16,
          paddingBottom: Platform.OS === 'ios' ? 40 : 24,
          height: Platform.OS === 'ios' ? 110 : 104, 
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: typography.small.fontFamily,
          marginTop: -4,
          marginBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: -10, // Pushing the icon significantly upwards
        },
        tabBarButton: (props) => (
          <Pressable
            {...props}
            android_ripple={{
              color: colors.surfaceHighlight,
              borderless: true,
              radius: 35,
            }}
            style={({ pressed }) => [
              props.style,
              Platform.OS === 'ios' && pressed && { opacity: 0.6 }
            ]}
          />
        ),
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => <Icon name="search" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Applications"
        component={ApplicationsScreen}
        options={{
          tabBarLabel: 'Applications',
          tabBarIcon: ({ color, size }) => <Icon name="file-text-o" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedStackNavigator}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, size }) => <Icon name="heart" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Icon name="user" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
