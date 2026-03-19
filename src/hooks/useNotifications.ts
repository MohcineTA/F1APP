import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Race } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) setExpoPushToken(token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return { expoPushToken };
}

export async function scheduleRaceNotification(race: Race): Promise<string | null> {
  if (Platform.OS === 'web') {
    // expo-notifications scheduling is not supported out-of-the-box on web without service workers.
    // Return a dummy ID so the UI acts like it succeeded.
    return `web-dummy-id-${race.round}`;
  }

  const raceDate = new Date(`${race.date}T${race.time || '13:00:00Z'}`);
  const notifyBefore = new Date(raceDate.getTime() - 30 * 60 * 1000); // 30 min before

  if (notifyBefore <= new Date()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `🏎️ ${race.raceName} — Départ dans 30 min !`,
      body: `${race.Circuit.circuitName} · ${race.Circuit.Location.country}`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notifyBefore,
      channelId: 'f1-races',
    },
  });

  return id;
}

export async function cancelRaceNotification(notificationId: string) {
  if (Platform.OS === 'web') return; // Mock removal
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (!Device.isDevice) return undefined;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('f1-races', {
      name: 'F1 Races',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E8002D',
    });
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch {
    return undefined;
  }
}
