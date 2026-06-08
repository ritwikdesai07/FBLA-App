import { Tabs, usePathname, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { View } from 'react-native';
import { BlurView } from 'expo-blur';

import { getCurrentUser } from '@/lib/authStorage';
import { FBLATheme } from '@/constants/theme';

type AuthFlowState = 'loading' | 'unauthenticated' | 'needs-setup' | 'ready';
const AUTH_PATHS = ['/landing', '/login', '/signup'];

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [authFlowState, setAuthFlowState] = useState<AuthFlowState>('loading');
  const isAuthPath = AUTH_PATHS.includes(pathname);

  const loadAuthState = useCallback(async () => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        setAuthFlowState('unauthenticated');
        return;
      }

      if (!user.profile?.profileComplete) {
        setAuthFlowState('needs-setup');
        return;
      }

      setAuthFlowState('ready');
    } catch (e) {
      console.error('Failed to load user in TabLayout', e);
      setAuthFlowState('unauthenticated');
    }
  }, []);

  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  useFocusEffect(
    useCallback(() => {
      loadAuthState();
    }, [loadAuthState])
  );

  useEffect(() => {
    if (authFlowState === 'loading') return;

    let cancelled = false;

    const routeForAuthState = async () => {
      if (authFlowState === 'unauthenticated' && !isAuthPath) {
        const user = await getCurrentUser();
        if (cancelled) return;

        if (!user) {
          router.replace('/landing');
          return;
        }

        setAuthFlowState(user.profile?.profileComplete ? 'ready' : 'needs-setup');
        return;
      }

      if (authFlowState === 'needs-setup' && pathname !== '/profile-setup') {
        router.replace('/profile-setup');
        return;
      }

      if (authFlowState === 'ready' && isAuthPath) {
        const user = await getCurrentUser();
        if (cancelled) return;

        if (!user) {
          setAuthFlowState('unauthenticated');
          return;
        }

        router.replace('/');
        return;
      }

      if (authFlowState === 'ready' && pathname === '/profile-setup') {
        router.replace('/');
      }
    };

    routeForAuthState();

    return () => {
      cancelled = true;
    };
  }, [authFlowState, isAuthPath, pathname, router]);

  if (authFlowState === 'loading') return null;

  if (authFlowState === 'unauthenticated') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: FBLATheme.blue,
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}>
        <Tabs.Screen name="landing" options={{ href: null }} />
        <Tabs.Screen name="login" options={{ href: null }} />
        <Tabs.Screen name="signup" options={{ href: null }} />
      </Tabs>
    );
  }

  if (authFlowState === 'needs-setup') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: FBLATheme.blue,
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}>
        <Tabs.Screen
          name="profile-setup"
          options={{
            title: 'Profile Setup',
          }}
        />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: FBLATheme.blue,
        tabBarInactiveTintColor: '#7886A7',
        headerShown: false,
        tabBarHideOnKeyboard: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: 2,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          paddingTop: 2,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 6,
          height: 72,
          paddingTop: 8,
          paddingBottom: 6,
          borderWidth: 1,
          borderColor: 'rgba(191, 208, 255, 0.72)',
          borderRadius: FBLATheme.radius.xl,
          backgroundColor: 'rgba(251, 252, 255, 0.72)',
          overflow: 'hidden',
          shadowColor: FBLATheme.shadow,
          shadowOpacity: 0.14,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        },
        tabBarBackground: () => (
          <BlurView
            tint="light"
            intensity={78}
            style={{
              flex: 1,
              backgroundColor: 'rgba(234, 241, 255, 0.52)',
            }}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', gap: 3 }}>
              <MaterialIcons name="home" size={25} color={color} />
              <View
                style={{
                  width: 18,
                  height: 4,
                  borderRadius: 8,
                  backgroundColor: focused ? FBLATheme.yellow : 'transparent',
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reminders/index"
        options={{
          title: 'Reminders',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', gap: 3 }}>
              <MaterialIcons name="calendar-today" size={23} color={color} />
              <View
                style={{
                  width: 18,
                  height: 4,
                  borderRadius: 8,
                  backgroundColor: focused ? FBLATheme.yellow : 'transparent',
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="other"
        options={{
          title: 'Tools',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', gap: 3 }}>
              <MaterialIcons name="widgets" size={23} color={color} />
              <View
                style={{
                  width: 18,
                  height: 4,
                  borderRadius: 8,
                  backgroundColor: focused ? FBLATheme.yellow : 'transparent',
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="messaging" options={{ href: null }} />
      <Tabs.Screen name="messages/[username]" options={{ href: null }} />
      <Tabs.Screen name="profile-setup" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="signup" options={{ href: null }} />
      <Tabs.Screen name="landing" options={{ href: null }} />
      <Tabs.Screen name="news/[id]" options={{ href: null }} />
      <Tabs.Screen name="practice-quiz-events" options={{ href: null }} />
      <Tabs.Screen name="practice-quiz-viewer" options={{ href: null }} />
      <Tabs.Screen name="competition-code" options={{ href: null }} />
      <Tabs.Screen name="competition-event" options={{ href: null }} />
      <Tabs.Screen name="event-map" options={{ href: null }} />
    </Tabs>
  );
}
