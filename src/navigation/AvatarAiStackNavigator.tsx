import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ResumeScreen from '../screens/main/AvatarAi/ResumeScreen';
import AIAssistantScreen from '../screens/main/AvatarAi/AIAssistantScreen';
import AiFeaturesScreen from '../screens/main/AvatarAi/AiFeaturesScreen';

export type AvatarAiStackParamList = {
  AiFeaturesScreen: undefined;
  ResumeScreen: undefined;
  AIAssistantScreen: { autoGenerate?: boolean };
};

const Stack = createStackNavigator<AvatarAiStackParamList>();

const AvatarAiStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AiFeaturesScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen name="AiFeaturesScreen" component={AiFeaturesScreen} />
      <Stack.Screen name="ResumeScreen" component={ResumeScreen} />
      <Stack.Screen name="AIAssistantScreen" component={AIAssistantScreen} />
    </Stack.Navigator>
  );
};

export default AvatarAiStackNavigator;
