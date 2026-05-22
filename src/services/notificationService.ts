import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';
import api from '../api/axiosInstance';

/**
 * Display a local notification when the app is in the foreground.
 */
export async function displayNotification(title?: string, body?: string, data?: any) {
  try {
    // Create a notification channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    // Display the notification
    await notifee.displayNotification({
      title: title || 'Job India',
      body: body || '',
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
      data: data || {},
    });
  } catch (error) {
    console.error('Error displaying local notification:', error);
  }
}

/**
 * Sends the FCM token to the backend API.
 * We include 'token', 'device_token', and 'fcm_token' in the body.
 * We try both 'api/candidate/device-token' and 'api/device-token' routes in case of a 404.
 */


export async function saveDeviceToken(fcmToken: string, userToken: string) {
  const possibleUrls = ['api/candidate/device-token', 'api/device-token'];
  
  for (const url of possibleUrls) {
    try {
      const response = await api.post(
        url,
        {
          token: fcmToken,
          device_token: fcmToken,
          fcm_token: fcmToken,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      console.log(`FCM Token registered successfully via ${url}:`, response.data);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.log(`Route ${url} returned 404, attempting next fallback...`);
        continue;
      }
      console.error(`Failed to register FCM Token via ${url}:`, error?.response?.data || error.message);
      break;
    }
  }
}

/**
 * Request notification permission, retrieve the FCM token,
 * register it with the backend, and subscribe to push notification listeners.
 */
export async function initNotifications(userToken: string) {
  try {
    let enabled = false;

    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    } else {
      // On Android, request notification permissions using Notifee
      const settings = await notifee.requestPermission();
      enabled = settings.authorizationStatus >= 1;
    }

    if (!enabled) {
      console.log('Notification permission denied by user');
      return null;
    }

    // Get current FCM token and send to backend
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('Retrieved FCM token:', fcmToken);
      await saveDeviceToken(fcmToken, userToken);
    }

    // Subscribe to token refresh events
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      console.log('FCM token refreshed:', newToken);
      await saveDeviceToken(newToken, userToken);
    });

    // Subscribe to foreground message events
    const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground FCM message received:', remoteMessage);
      const { title, body } = remoteMessage.notification || {};
      await displayNotification(title, body, remoteMessage.data);
    });

    // Return the cleanup function
    return () => {
      unsubscribeTokenRefresh();
      unsubscribeOnMessage();
    };
  } catch (error) {
    console.error('Error during notification initialization:', error);
    return null;
  }
}
