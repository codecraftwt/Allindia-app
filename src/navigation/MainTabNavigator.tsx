import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Pressable, View, StyleSheet, Text, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFocusedRouteNameFromRoute, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import ApplicationsStackNavigator from './ApplicationsStackNavigator';
import HomeStackNavigator from './HomeStackNavigator';
import AllJobsStackNavigator from './AllJobsStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import SavedStackNavigator from './SavedStackNavigator';
import JobReelsStackNavigator from './JobReelsStackNavigator';
import AIAssistantScreen from '../screens/main/AvatarAi/AIAssistantScreen';
import { typography } from '../theme/typography';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const CustomTabBarButton = ({ children, onPress, isReels }: any) => {
  const { colors } = useTheme();

  if (isReels) {
    return (
      <Pressable
        style={styles.reelsButtonContainer}
        onPress={onPress}
      >
        <View style={[styles.reelsButton, { backgroundColor: colors.primary }]}>
          {children}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={styles.tabButton}
      onPress={onPress}
      android_ripple={{ color: colors.surfaceHighlight, borderless: true, radius: 35 }}
    >
      {children}
    </Pressable>
  );
};

const TabIcon = ({ name, color, focused, label }: any) => {
  const iconName = focused ? name : `${name}-outline`;
  return (
    <View style={styles.iconWrapper}>
      <Icon name={iconName} size={20} color={color} />
      <Text
        style={[styles.label, { color: color, fontWeight: focused ? '700' : '500' }]}
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        minimumFontScale={0.8}
      >
        {label}
      </Text>
    </View>
  );
};

const AnimatedAIIcon = ({ focused }: { focused: boolean }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const aiColor = '#FF9800';

  return (
    <View style={styles.iconWrapper}>
      <View style={{
        backgroundColor: focused ? '#FF9800' : 'transparent',
        padding: focused ? 6 : 0,
        borderRadius: 14,
        shadowColor: '#FF9800',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: focused ? 0.6 : 0.3,
        shadowRadius: 10,
        elevation: focused ? 12 : 4,
      }}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Icon name="logo-electron" size={focused ? 24 : 22} color={focused ? '#fff' : aiColor} />
        </Animated.View>
      </View>
      <Text
        style={[styles.label, { color: aiColor, fontWeight: focused ? '800' : '600', marginTop: focused ? 2 : 0 }]}
      >
        Ai
      </Text>
    </View>
  );
};

const MainTabNavigator: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const getTabBarStyle = (route: any, isHidden?: boolean) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? '';

    // Check for full screen param in the nested route state or direct params
    const routeState = route.state;
    const currentRoute = routeState?.routes ? routeState.routes[routeState.index ?? 0] : null;
    const isFullScreen = currentRoute?.params?.isFullScreen || (route.params as any)?.isFullScreen;


    // Hide tab bar on specific screens
    const hideOnScreens = [
      'JobDetail',
      'CategoryJobs',
      'IndustryCategory',
      'JobCategories',
      'Notifications',
      'SearchHome',
      'SearchResults',
      'ProfileJobPreferences',
      'ProfilePersonalInfo',
      'ProfileEducation',
      'ProfileExperience',
      'ProfileResume',
      'ProfileAccountSetting',
      'ProfileDetails'
    ];

    if (hideOnScreens.includes(routeName) || isFullScreen) {
      return { display: 'none' };
    }

    return {
      position: 'absolute',
      bottom: Math.max(insets.bottom, 6) + (Platform.OS === 'ios' ? 10 : 2),
      left: 10,
      right: 10,
      height: 64,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderTopWidth: 0,
      elevation: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      paddingHorizontal: 10,
      overflow: 'visible',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    };
  };

  const CustomTabBar = (props: any) => {
    const { state, descriptors, navigation } = props;
    const focusedRoute = state.routes[state.index];
    const focusedDescriptor = descriptors[focusedRoute.key];
    const focusedOptions = focusedDescriptor.options;

    // Check for tabBarHidden in the current route's params
    // We need to look deep if it's a nested navigator
    const currentRoute = focusedRoute.state?.routes ? focusedRoute.state.routes[focusedRoute.state.index ?? 0] : focusedRoute;
    const isTabBarHidden = currentRoute.params?.tabBarHidden;

    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(translateY, {
        toValue: isTabBarHidden ? 150 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, [isTabBarHidden]);

    const style = getTabBarStyle(focusedRoute);
    if (style.display === 'none') return null;

    return (
      <Animated.View style={[style, { transform: [{ translateY }] }]}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Skip rendering if the tab is hidden
          if (options.tabBarButton && typeof options.tabBarButton === 'function') {
            const button = options.tabBarButton({ children: null });
            if (button === null) return null;
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!event.defaultPrevented) {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: route.name }],
                })
              );
            }
          };

          return (
            <React.Fragment key={route.key}>
              {options.tabBarButton({
                children: options.tabBarIcon ? options.tabBarIcon({
                  color: isFocused ? colors.primary : colors.tabInactive,
                  focused: isFocused,
                }) : null,
                onPress,
              })}
            </React.Fragment>
          );
        })}
      </Animated.View>
    );
  };

  return (
    <Tab.Navigator
      backBehavior="history"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
      })}>
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} label="Home" />
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />
        }}
      />





      <Tab.Screen
        name="AllJobs"
        component={AllJobsStackNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="grid" color={color} focused={focused} label="All Jobs" />
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />
        }}
      />

      <Tab.Screen
        name="JobReels"
        component={JobReelsStackNavigator}
        options={{
          tabBarButton: () => null,
          tabBarVisible: false,
        }}
      />


      <Tab.Screen
        name="Applications"
        component={ApplicationsStackNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="briefcase" color={color} focused={focused} label="My Activity" />
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />
        }}
      />

      <Tab.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedAIIcon focused={focused} />
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />
        }}
      />



      {/* //AI button */}

      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} label="Profile" />
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingTop: 8,
  },
  reelsButtonContainer: {
    top: -12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
  },
  reelsButton: {
    width: 52,
    height: 52,
    marginLeft: 15,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  label: {
    fontSize: 11,
    marginTop: 4,
  }
});

export default MainTabNavigator;