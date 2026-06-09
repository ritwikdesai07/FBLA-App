import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { addNotificationResponseRouter, configureNotifications, startForegroundMessageNotifications } from '@/lib/notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    void configureNotifications();
    const stopMessageNotifications = startForegroundMessageNotifications();
    const notificationResponseSubscription = addNotificationResponseRouter((data) => {
      if (data.type === 'message' && typeof data.username === 'string' && data.username) {
        router.push({
          pathname: '/(tabs)/messages/[username]',
          params: { username: data.username },
        });
      }

      if (data.type === 'reminder') {
        router.push('/(tabs)/reminders');
      }
    });

    return () => {
      stopMessageNotifications();
      notificationResponseSubscription.remove();
    };
  }, [router]);

  return (
    <ThemeProvider>
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}
