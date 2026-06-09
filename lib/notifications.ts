import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where, type Unsubscribe } from 'firebase/firestore';

import type { AllReminders } from '@/lib/authStorage';
import { firebaseAuth, firestoreDb } from '@/lib/firebase';

const REMINDER_NOTIFICATION_KEY_PREFIX = '@fbla_reminder_notification_ids_v1_';
const NOTIFICATION_CHANNEL_ID = 'fbla-updates';
const MAX_SCHEDULED_REMINDERS = 60;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const reminderStorageKey = (username: string) => `${REMINDER_NOTIFICATION_KEY_PREFIX}${username}`;

export const configureNotifications = async () => {
  if (Platform.OS === 'web') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: 'FBLA updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#003DA5',
    });
  }

  const currentPermissions = await Notifications.getPermissionsAsync();
  if (currentPermissions.granted) return true;

  const requestedPermissions = await Notifications.requestPermissionsAsync();
  return requestedPermissions.granted;
};

export const cancelScheduledRemindersForUser = async (username: string) => {
  const rawIds = await AsyncStorage.getItem(reminderStorageKey(username));
  if (!rawIds) return;

  try {
    const ids = JSON.parse(rawIds) as string[];
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
  } finally {
    await AsyncStorage.removeItem(reminderStorageKey(username));
  }
};

const reminderDateAtNine = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day, 9, 0, 0, 0);
  return date.getTime() > Date.now() ? date : null;
};

export const scheduleReminderNotificationsForUser = async (username: string, reminders: AllReminders) => {
  if (Platform.OS === 'web') return;

  const granted = await configureNotifications();
  if (!granted) return;

  await cancelScheduledRemindersForUser(username);

  const upcoming = Object.entries(reminders)
    .flatMap(([scope, reminderMap]) =>
      Object.entries(reminderMap).flatMap(([dateString, dayReminders]) => {
        const scheduledDate = reminderDateAtNine(dateString);
        if (!scheduledDate) return [];

        return dayReminders.map((reminder) => ({
          scope,
          dateString,
          scheduledDate,
          title: reminder.title,
          notes: reminder.notes,
        }));
      }),
    )
    .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
    .slice(0, MAX_SCHEDULED_REMINDERS);

  const ids = await Promise.all(
    upcoming.map((reminder) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.notes || `${reminder.scope} reminder for ${reminder.dateString}`,
          data: { type: 'reminder', dateString: reminder.dateString },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminder.scheduledDate,
          channelId: NOTIFICATION_CHANNEL_ID,
        },
      }),
    ),
  );

  await AsyncStorage.setItem(reminderStorageKey(username), JSON.stringify(ids));
};

export const showIncomingMessageNotification = async ({
  senderName,
  message,
  username,
}: {
  senderName: string;
  message: string;
  username: string;
}) => {
  if (Platform.OS === 'web') return;

  const granted = await configureNotifications();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: senderName,
      body: message || 'New message',
      data: { type: 'message', username },
    },
    trigger: null,
  });
};

export const startForegroundMessageNotifications = () => {
  if (Platform.OS === 'web') return () => undefined;

  let conversationUnsubscribe: Unsubscribe | null = null;
  let initialized = false;

  const authUnsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
    conversationUnsubscribe?.();
    conversationUnsubscribe = null;
    initialized = false;

    if (!user?.uid) return;

    const conversationQuery = query(collection(firestoreDb, 'conversations'), where('participants', 'array-contains', user.uid));
    conversationUnsubscribe = onSnapshot(conversationQuery, (snapshot) => {
      if (!initialized) {
        initialized = true;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type !== 'added' && change.type !== 'modified') return;

        const data = change.doc.data();
        const lastSenderId = typeof data.lastSenderId === 'string' ? data.lastSenderId : '';
        const lastMessageText = typeof data.lastMessageText === 'string' ? data.lastMessageText : '';
        if (!lastMessageText || lastSenderId === user.uid) return;

        const participantEmails = Array.isArray(data.participantEmails) ? data.participantEmails : [];
        const otherUsername = participantEmails.find((email) => email !== user.email) || '';
        void showIncomingMessageNotification({
          senderName: otherUsername || 'New message',
          message: lastMessageText,
          username: otherUsername,
        });
      });
    });
  });

  return () => {
    conversationUnsubscribe?.();
    authUnsubscribe();
  };
};

export const addNotificationResponseRouter = (navigate: (data: Record<string, unknown>) => void) =>
  Notifications.addNotificationResponseReceivedListener((response) => {
    navigate(response.notification.request.content.data);
  });
