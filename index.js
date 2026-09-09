/**
 * @format
 */

import { AppRegistry, Text, TextInput } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { enableScreens } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';
import './src/i18n';

enableScreens(true);

// Ensure consistent text sizing on devices with varied OS font size accessibility settings
if (Text.defaultProps == null) {
  Text.defaultProps = {};
}
Text.defaultProps.maxFontSizeMultiplier = 1.15;

if (TextInput.defaultProps == null) {
  TextInput.defaultProps = {};
}
TextInput.defaultProps.maxFontSizeMultiplier = 1.15;

if (__DEV__) {
  global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
}

// Register background handler for Firebase Cloud Messaging
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('FCM Message received/handled in the background:', remoteMessage);
});

// Register background handler for Notifee
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('User pressed a notification in the background', detail.notification);
  }
});

AppRegistry.registerComponent(appName, () => App);

