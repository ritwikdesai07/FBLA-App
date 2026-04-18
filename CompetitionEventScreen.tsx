import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCompetitionViewModel } from '@/viewmodels/useCompetitionViewModel';
import { PresentationSlot } from '@/models/competitionModel';

const FBLA_BLUE = '#003DA5';
const BG = '#F5F8FF';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>COMPETITION MODE</Text>
        <Text style={styles.heroTitle}>{event?.eventName || 'Unknown Event Code'}</Text>
        <Text style={styles.heroSubtitle}>Code: {code || '--'}</Text>
      </View>

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
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No event found for this code.</Text>
          <Text style={styles.emptySub}>Try a code like MAD123 or CYB456.</Text>
        </View>
      ) : (
        <FlatList
          data={groupedSchedule}
          keyExtractor={(item, index) => `${item.time}-${index}`}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const isUpcoming = nextUpcomingIndex >= 0 && item.firstIndex === nextUpcomingIndex;
            return (
              <View style={[styles.slotCard, isUpcoming && styles.slotCardUpcoming]}>
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
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  hero: {
    margin: 14,
    backgroundColor: FBLA_BLUE,
    borderRadius: 14,
    padding: 16,
  },
  eyebrow: { color: '#D6E3FF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
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
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mapButtonText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  listContent: { paddingHorizontal: 14, paddingBottom: 100, gap: 10 },
  slotCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EDFF',
    padding: 12,
    gap: 10,
  },
  slotCardUpcoming: {
    borderColor: '#9AB8FF',
    backgroundColor: '#EDF3FF',
  },
  timePill: {
    borderRadius: 999,
    backgroundColor: '#EAF0FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  timePillText: { color: FBLA_BLUE, fontWeight: '800', fontSize: 12 },
  rowsWrap: { gap: 8 },
  personRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FBFF',
    borderWidth: 1,
    borderColor: '#E6EDFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  competitorName: { color: '#0F172A', fontWeight: '800', fontSize: 14 },
  roomText: { color: '#5B6A8F', fontSize: 12, fontWeight: '700' },
  upcomingTag: {
    backgroundColor: FBLA_BLUE,
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: '900',
  },
  emptyWrap: {
    margin: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EDFF',
    padding: 16,
  },
  emptyTitle: { color: '#0F172A', fontWeight: '800', fontSize: 16 },
  emptySub: { color: '#5B6A8F', marginTop: 6, fontSize: 13 },
});
