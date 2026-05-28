/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import './src/i18n';

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

