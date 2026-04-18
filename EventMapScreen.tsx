import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { getCompetitionEventByCode } from '@/models/competitionModel';

const FBLA_BLUE = '#003DA5';
const BG = '#F5F8FF';

export default function EventMapScreen() {
  const params = useLocalSearchParams<{ code?: string }>();
  const rawCode = Array.isArray(params.code) ? params.code[0] : params.code || '';
  const event = getCompetitionEventByCode(rawCode);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Event Map</Text>
        <Text style={styles.heroSubtitle}>{event?.eventName || 'FBLA Conference Campus'}</Text>
      </View>

      <View style={styles.mapCard}>
        <Image source={require('../assets/maps/fbla_conference_map.png')} style={styles.mapImage} resizeMode="contain" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, padding: 14 },
  hero: {
    backgroundColor: FBLA_BLUE,
    borderRadius: 14,
    padding: 16,
  },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  heroSubtitle: { color: '#D6E3FF', marginTop: 4 },
  mapCard: {
    flex: 1,
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EDFF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  mapImage: { width: '100%', height: '100%' },
});
