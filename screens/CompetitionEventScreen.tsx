import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCompetitionViewModel } from '@/viewmodels/useCompetitionViewModel';
import { PresentationSlot } from '@/models/competitionModel';
import { FBLATheme } from '@/constants/theme';
import { FrostedPanel, LiquidBackground, LiquidGlass } from '@/components/liquid-glass';

const FBLA_BLUE = FBLATheme.blue;
const BG = FBLATheme.white;

export default function CompetitionEventScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const rawCode = Array.isArray(params.code) ? params.code[0] : params.code || '';
  const { code, event, currentTimeLabel, nextUpcomingIndex } = useCompetitionViewModel(rawCode);
  const groupedSchedule = React.useMemo(() => {
    if (!event) return [] as { time: string; slots: PresentationSlot[]; firstIndex: number }[];

    const grouped: { time: string; slots: PresentationSlot[]; firstIndex: number }[] = [];
    const timeToGroupIndex = new Map<string, number>();

    event.schedule.forEach((slot, index) => {
      const existingGroupIndex = timeToGroupIndex.get(slot.time);
      if (existingGroupIndex === undefined) {
        timeToGroupIndex.set(slot.time, grouped.length);
        grouped.push({ time: slot.time, slots: [slot], firstIndex: index });
        return;
      }

      grouped[existingGroupIndex].slots.push(slot);
    });

    return grouped;
  }, [event]);

  return (
    <LiquidBackground>
    <SafeAreaView style={styles.container}>
      <LiquidGlass style={styles.hero} contentStyle={styles.heroInner}>
        <Text style={styles.eyebrow}>COMPETITION MODE</Text>
        <Text style={styles.heroTitle}>{event?.eventName || 'Unknown Event Code'}</Text>
        <Text style={styles.heroSubtitle}>Code: {code || '--'}</Text>
      </LiquidGlass>

      <View style={styles.headerRow}>
        <Text style={styles.currentTime}>Current Time: {currentTimeLabel}</Text>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/event-map',
              params: { code },
            })
          }>
          <MaterialIcons name="map" size={16} color="#fff" />
          <Text style={styles.mapButtonText}>View Event Map</Text>
        </TouchableOpacity>
      </View>

      {!event ? (
        <FrostedPanel style={styles.emptyWrap} contentStyle={styles.emptyInner}>
          <Text style={styles.emptyTitle}>No event found for this code.</Text>
          <Text style={styles.emptySub}>Try a code like MAD123 or CYB456.</Text>
        </FrostedPanel>
      ) : (
        <FlatList
          data={groupedSchedule}
          keyExtractor={(item, index) => `${item.time}-${index}`}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const isUpcoming = nextUpcomingIndex >= 0 && item.firstIndex === nextUpcomingIndex;
            return (
              <FrostedPanel style={[styles.slotCard, isUpcoming && styles.slotCardUpcoming]} contentStyle={styles.slotInner}>
                <View style={styles.timePill}>
                  <Text style={styles.timePillText}>{item.time}</Text>
                </View>
                <View style={styles.rowsWrap}>
                  {item.slots.map((slot, rowIndex) => (
                    <View key={`${slot.competitorName}-${slot.roomNumber}-${rowIndex}`} style={styles.personRow}>
                      <Text style={styles.competitorName}>{slot.competitorName}</Text>
                      <Text style={styles.roomText}>{slot.roomNumber}</Text>
                    </View>
                  ))}
                </View>
                {isUpcoming ? <Text style={styles.upcomingTag}>NEXT</Text> : null}
              </FrostedPanel>
            );
          }}
        />
      )}
    </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    margin: 14,
    borderRadius: FBLATheme.radius.xl,
  },
  heroInner: {
    padding: 16,
  },
  eyebrow: { color: FBLATheme.yellow, fontSize: 11, fontWeight: '900' },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 2 },
  heroSubtitle: { color: '#D6E3FF', marginTop: 4, fontWeight: '700' },
  headerRow: {
    marginHorizontal: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  currentTime: { color: '#5B6A8F', fontWeight: '700' },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: FBLA_BLUE,
    borderRadius: FBLATheme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mapButtonText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  listContent: { paddingHorizontal: 14, paddingBottom: 100, gap: 10 },
  slotCard: {
    borderRadius: FBLATheme.radius.lg,
  },
  slotInner: {
    padding: 14,
    gap: 10,
  },
  slotCardUpcoming: {
    borderColor: FBLATheme.lineStrong,
  },
  timePill: {
    borderRadius: 999,
    backgroundColor: FBLATheme.surfaceSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  timePillText: { color: FBLA_BLUE, fontWeight: '800', fontSize: 12 },
  rowsWrap: { gap: 8 },
  personRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: FBLATheme.surfaceSoft,
    borderWidth: 1,
    borderColor: FBLATheme.lineSoft,
    borderRadius: FBLATheme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  competitorName: { color: FBLATheme.ink, fontWeight: '800', fontSize: 14 },
  roomText: { color: FBLATheme.muted, fontSize: 12, fontWeight: '700' },
  upcomingTag: {
    backgroundColor: FBLATheme.yellow,
    color: FBLATheme.blueDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: '900',
  },
  emptyWrap: {
    margin: 14,
    borderRadius: FBLATheme.radius.lg,
  },
  emptyInner: {
    padding: 16,
  },
  emptyTitle: { color: FBLATheme.ink, fontWeight: '800', fontSize: 16 },
  emptySub: { color: FBLATheme.muted, marginTop: 6, fontSize: 13 },
});
