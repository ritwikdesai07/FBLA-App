import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { FBLATheme } from '@/constants/theme';
import { FblaSplashScreen } from '@/components/fbla-splash-screen';

const { blue: FBLA_BLUE, blueDark: FBLA_BLUE_DARK, yellow: FBLA_YELLOW } = FBLATheme;

export default function LandingScreen() {
  const router = useRouter();
  const blueDrift = useRef(new Animated.Value(0)).current;
  const goldDrift = useRef(new Animated.Value(0)).current;
  const navyDrift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(blueDrift, {
            toValue: 1,
            duration: 11000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(blueDrift, {
            toValue: 0,
            duration: 11000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(goldDrift, {
            toValue: 1,
            duration: 13500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(goldDrift, {
            toValue: 0,
            duration: 13500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(navyDrift, {
            toValue: 1,
            duration: 16000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(navyDrift, {
            toValue: 0,
            duration: 16000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ),
    ];

    loops.forEach((loop) => loop.start());

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [blueDrift, goldDrift, navyDrift]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.colorBubble,
          styles.blueBubble,
          {
            transform: [
              {
                translateX: blueDrift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-28, 30],
                }),
              },
              {
                translateY: blueDrift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-18, 24],
                }),
              },
              {
                scale: blueDrift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.08],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.colorBubble,
          styles.goldBubble,
          {
            transform: [
              {
                translateX: goldDrift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [34, -26],
                }),
              },
              {
                translateY: goldDrift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, -30],
                }),
              },
              {
                scale: goldDrift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1.04, 0.96],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.colorBubble,
          styles.navyBubble,
          {
            transform: [
              {
                translateX: navyDrift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-22, 22],
                }),
              },
              {
                translateY: navyDrift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [26, -18],
                }),
              },
            ],
          },
        ]}
      />
      <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.glassTint} />
      <View style={styles.content}>
        <FblaSplashScreen />
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/login')}>
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/signup')}>
            <Text style={styles.secondaryButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: FBLATheme.white,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 18,
  },
  content: {
    alignItems: 'center',
    gap: 18,
    width: '100%',
    zIndex: 1,
  },
  colorBubble: {
    borderRadius: 999,
    position: 'absolute',
  },
  blueBubble: {
    backgroundColor: 'rgba(29, 82, 188, 0.22)',
    height: 320,
    right: -92,
    top: 88,
    width: 320,
  },
  goldBubble: {
    backgroundColor: 'rgba(244, 171, 25, 0.2)',
    bottom: 96,
    height: 280,
    left: -96,
    width: 280,
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(251, 252, 255, 0.28)',
  },
  navyBubble: {
    backgroundColor: 'rgba(10, 46, 127, 0.13)',
    height: 250,
    right: 44,
    top: -98,
    width: 250,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: FBLA_YELLOW,
    borderRadius: 12,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: FBLA_BLUE_DARK,
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#F7FAFF',
    borderColor: FBLATheme.lineStrong,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: FBLA_BLUE,
    fontSize: 15,
    fontWeight: '900',
  },
});
