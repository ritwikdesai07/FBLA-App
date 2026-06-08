import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { getCompetitionEventByCode } from '@/models/competitionModel';
import { FBLATheme } from '@/constants/theme';
import { FrostedPanel, LiquidBackground, LiquidGlass } from '@/components/liquid-glass';

const FBLA_BLUE = FBLATheme.blue;
const BG = FBLATheme.white;

export default function EventMapScreen() {
  const params = useLocalSearchParams<{ code?: string }>();
  const rawCode = Array.isArray(params.code) ? params.code[0] : params.code || '';
  const event = getCompetitionEventByCode(rawCode);

  return (
    <LiquidBackground>
    <SafeAreaView style={styles.container}>
      <LiquidGlass style={styles.hero} contentStyle={styles.heroInner}>
        <Text style={styles.heroTitle}>Event Map</Text>
        <Text style={styles.heroSubtitle}>{event?.eventName || 'FBLA Conference Campus'}</Text>
      </LiquidGlass>

      <FrostedPanel style={styles.mapCard} contentStyle={styles.mapInner}>
        <Image source={require('../assets/maps/fbla_conference_map.png')} style={styles.mapImage} resizeMode="contain" />
      </FrostedPanel>
    </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  hero: {
    borderRadius: FBLATheme.radius.xl,
  },
  heroInner: {
    padding: 16,
  },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  heroSubtitle: { color: '#D6E3FF', marginTop: 4 },
  mapCard: {
    flex: 1,
    marginTop: 12,
    borderRadius: FBLATheme.radius.lg,
  },
  mapInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  mapImage: { width: '100%', height: '100%' },
});
