import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Pressable, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../context/ThemeContext';
import ApplicationsScreen from '../screens/main/ApplicationsScreen';
import HomeStackNavigator from './HomeStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import SavedStackNavigator from './SavedStackNavigator';
import JobReelsStackNavigator from './JobReelsStackNavigator';
import { typography } from '../theme/typography';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabItem = ({ name, color, focused, colors }: any) => {
  return (
    <View style={styles.itemContainer}>
      <Icon name={name} size={focused ? 24 : 22} color={color} />
      {focused && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
    </View>
  );
};

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
          elevation: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: typography.small.fontFamily,
          marginTop: -4,
          marginBottom: 8,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginTop: -10,
        },
        tabBarButton: (props) => (
          <Pressable
            {...props}
            android_ripple={{
              color: colors.surfaceHighlight,
              borderless: true,
              radius: 40,
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
          tabBarIcon: ({ color, focused }) => <TabItem name="home" color={color} focused={focused} colors={colors} />,
        }}
      />
      
      <Tab.Screen
        name="Applications"
        component={ApplicationsScreen}
        options={{
          tabBarLabel: 'My Jobs',
          tabBarIcon: ({ color, focused }) => <TabItem name="briefcase" color={color} focused={focused} colors={colors} />,
        }}
      />

      <Tab.Screen
        name="Saved"
        component={SavedStackNavigator}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, focused }) => <TabItem name="heart" color={color} focused={focused} colors={colors} />,
        }}
      />

      <Tab.Screen
        name="JobReels"
        component={JobReelsStackNavigator}
        options={{
          tabBarLabel: 'Reels',
          tabBarIcon: ({ color, focused }) => <TabItem name="play-circle" color={color} focused={focused} colors={colors} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => <TabItem name="user" color={color} focused={focused} colors={colors} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: -6,
  },
});

export default MainTabNavigator;
