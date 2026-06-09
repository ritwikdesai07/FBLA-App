import { useAudioPlayer } from 'expo-audio';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

const COLORS = {
  navy: '#0a2e7f',
};

const CLICK_SOUND = require('@/assets/sounds/logo-lock-click.wav');
const NAVY_PIECE = require('@/assets/images/fbla-delta-navy.png');
const BLUE_PIECE = require('@/assets/images/fbla-delta-blue.png');
const GOLD_PIECE = require('@/assets/images/fbla-delta-gold.png');
const FULL_DELTA = require('@/assets/images/fbla-delta-full.png');

const CONNECT_DURATION = 1000;
const CONNECT_DELAY = 300;
const CLICK_AT_MS = CONNECT_DELAY + CONNECT_DURATION;

export function FblaSplashScreen() {
  const { width } = useWindowDimensions();
  const snap = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const lockPulse = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);
  const player = useAudioPlayer(CLICK_SOUND);

  const markWidth = Math.min(width * 0.62, 230);
  const markHeight = markWidth * (528 / 597);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    player.volume = 1;

    if (reduceMotion) {
      snap.setValue(1);
      title.setValue(1);
      return;
    }

    const clickTimer = setTimeout(async () => {
      player.seekTo(0);
      player.play();
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, CLICK_AT_MS);

    Animated.sequence([
      Animated.parallel([
        Animated.sequence([
          Animated.delay(CONNECT_DELAY),
          Animated.timing(snap, {
            toValue: 1,
            duration: CONNECT_DURATION,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(CLICK_AT_MS - 20),
          Animated.timing(lockPulse, {
            toValue: 1,
            duration: 140,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.delay(420),
      Animated.timing(title, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(1000),
    ]).start();

    return () => clearTimeout(clickTimer);
  }, [lockPulse, player, reduceMotion, snap, title]);

  const lockScale = lockPulse.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [1, 0.985, 1],
  });
  const assembledOpacity = lockPulse.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0, 1],
  });
  const piecesOpacity = lockPulse.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <View style={styles.container}>
      <BlurView pointerEvents="none" intensity={28} tint="light" style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.mark, { height: markHeight, width: markWidth, transform: [{ scale: lockScale }] }]}>
        <Animated.Image source={FULL_DELTA} resizeMode="contain" style={[styles.pieceLayer, { opacity: assembledOpacity }]} />
        <Animated.View
          style={[
            styles.pieceLayer,
            {
              opacity: piecesOpacity,
              transform: [
                {
                  translateY: snap.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-58, 0],
                  }),
                },
                {
                  translateX: snap.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-16, 0],
                  }),
                },
              ],
            },
          ]}>
          <Image source={NAVY_PIECE} resizeMode="contain" style={styles.pieceImage} />
        </Animated.View>
        <Animated.View
          style={[
            styles.pieceLayer,
            {
              opacity: piecesOpacity,
              transform: [
                {
                  translateX: snap.interpolate({
                    inputRange: [0, 1],
                    outputRange: [76, 0],
                  }),
                },
                {
                  translateY: snap.interpolate({
                    inputRange: [0, 1],
                    outputRange: [54, 0],
                  }),
                },
              ],
            },
          ]}>
          <Image source={BLUE_PIECE} resizeMode="contain" style={styles.pieceImage} />
        </Animated.View>
        <Animated.View
          style={[
            styles.pieceLayer,
            {
              opacity: piecesOpacity,
              transform: [
                {
                  translateX: snap.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-76, 0],
                  }),
                },
                {
                  translateY: snap.interpolate({
                    inputRange: [0, 1],
                    outputRange: [58, 0],
                  }),
                },
              ],
            },
          ]}>
          <Image source={GOLD_PIECE} resizeMode="contain" style={styles.pieceImage} />
        </Animated.View>
      </Animated.View>

      <Animated.Text
        style={[
          styles.title,
          {
            opacity: title,
            transform: [
              {
                translateY: title.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          },
        ]}>
        FBLA Connect
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(251, 252, 255, 0.34)',
    borderRadius: 24,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 30,
    width: '100%',
  },
  mark: {
    marginBottom: 22,
  },
  pieceImage: {
    height: '100%',
    width: '100%',
  },
  pieceLayer: {
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  title: {
    color: COLORS.navy,
    fontFamily: Platform.select({
      web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      default: undefined,
    }),
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
});
