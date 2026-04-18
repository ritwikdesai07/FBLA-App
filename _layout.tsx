import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { View } from 'react-native';

import { getCurrentUser } from '@/lib/authStorage';

type AuthFlowState = 'loading' | 'unauthenticated' | 'needs-setup' | 'ready';

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [authFlowState, setAuthFlowState] = useState<AuthFlowState>('loading');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const user = await getCurrentUser();
        if (!mounted) return;

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
        if (mounted) setAuthFlowState('unauthenticated');
      }
    };

    load();
    const interval = setInterval(load, 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (authFlowState === 'loading') return;

    if (
      authFlowState === 'unauthenticated' &&
      pathname !== '/landing' &&
      pathname !== '/auth-choice' &&
      pathname !== '/login' &&
      pathname !== '/signup'
    ) {
      router.replace('/landing');
      return;
    }

    if (authFlowState === 'needs-setup' && pathname !== '/profile-setup') {
      router.replace('/profile-setup');
      return;
    }

    if (authFlowState === 'ready' && pathname === '/profile-setup') {
      router.replace('/');
    }
  }, [authFlowState, pathname, router]);

  if (authFlowState === 'loading') return null;

  if (authFlowState === 'unauthenticated') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#003DA5',
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}>
        <Tabs.Screen name="landing" options={{ href: null }} />
        <Tabs.Screen name="auth-choice" options={{ href: null }} />
        <Tabs.Screen name="login" options={{ href: null }} />
        <Tabs.Screen name="signup" options={{ href: null }} />
      </Tabs>
    );
  }

  if (authFlowState === 'needs-setup') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#003DA5',
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
        tabBarActiveTintColor: '#003DA5',
        tabBarInactiveTintColor: '#7C89A9',
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
          bottom: 12,
          height: 72,
          paddingTop: 8,
          paddingBottom: 6,
          borderWidth: 1,
          borderColor: '#E3EAFF',
          borderRadius: 18,
          backgroundColor: '#FFFFFF',
          shadowColor: '#001A4F',
          shadowOpacity: 0.14,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        },
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
                  height: 3,
                  borderRadius: 999,
                  backgroundColor: focused ? color : 'transparent',
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
                  height: 3,
                  borderRadius: 999,
                  backgroundColor: focused ? color : 'transparent',
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', gap: 3 }}>
              <MaterialIcons name="person" size={25} color={color} />
              <View
                style={{
                  width: 18,
                  height: 3,
                  borderRadius: 999,
                  backgroundColor: focused ? color : 'transparent',
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="other"
        options={{
          title: 'Other',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', gap: 3 }}>
              <MaterialIcons name="widgets" size={23} color={color} />
              <View
                style={{
                  width: 18,
                  height: 3,
                  borderRadius: 999,
                  backgroundColor: focused ? color : 'transparent',
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen name="messaging" options={{ href: null }} />
      <Tabs.Screen name="messages/[username]" options={{ href: null }} />
      <Tabs.Screen name="profile-setup" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="auth-choice" options={{ href: null }} />
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
