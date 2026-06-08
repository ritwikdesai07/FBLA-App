import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { usePracticeQuizViewModel } from '@/viewmodels/usePracticeQuizViewModel';
import { FBLATheme } from '@/constants/theme';
import { FrostedPanel, LiquidBackground, LiquidGlass } from '@/components/liquid-glass';

const FBLA_BLUE = FBLATheme.blue;

export default function PracticeQuizEventsScreen() {
  const router = useRouter();
  const { events, loading, searchQuery, setSearchQuery, favorites, lastOpenedEvent, toggleFavorite, setLastOpened } =
    usePracticeQuizViewModel();

  const openEvent = async (eventName: string) => {
    const selected = events.find((event) => event.name === eventName);
    if (!selected?.hasPdf) {
      Alert.alert('Coming soon', 'PDF sample questions for this event have not been added yet.');
      return;
    }

    await setLastOpened(eventName);
    router.push({
      pathname: '/(tabs)/practice-quiz-viewer',
      params: { event: eventName },
    });
  };

  if (loading) {
    return (
      <LiquidBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={FBLA_BLUE} size="large" />
          <Text style={styles.loadingText}>Loading practice quiz events...</Text>
        </View>
      </SafeAreaView>
      </LiquidBackground>
    );
  }

  return (
    <LiquidBackground>
    <SafeAreaView style={styles.container}>
      <LiquidGlass style={styles.hero} contentStyle={styles.heroInner}>
        <Text style={styles.heroTitle}>Practice Quizzes</Text>
        <Text style={styles.heroSubtitle}>Choose an FBLA event to open sample questions.</Text>
      </LiquidGlass>

      <FrostedPanel style={styles.searchWrap} contentStyle={styles.searchInner}>
        <MaterialIcons name="search" size={18} color="#6B7AA2" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search events..."
          placeholderTextColor="#8A94AD"
          style={styles.searchInput}
        />
      </FrostedPanel>

      {lastOpenedEvent ? <Text style={styles.lastOpenedText}>Last opened: {lastOpenedEvent}</Text> : null}

      <FlatList
        data={events}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isFavorite = favorites.includes(item.name);
          return (
            <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => openEvent(item.name)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>
                  {item.hasPdf ? 'Open PDF sample questions' : 'PDF sample questions coming soon'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleFavorite(item.name)}
                hitSlop={8}
                style={styles.favoriteBtn}
                activeOpacity={0.7}>
                <MaterialIcons name={isFavorite ? 'star' : 'star-border'} size={20} color={isFavorite ? '#F6B400' : FBLA_BLUE} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: '#5B6A8F', fontWeight: '700' },
  hero: {
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: FBLATheme.radius.xl,
  },
  heroInner: {
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  heroSubtitle: { color: '#D6E3FF', fontSize: 13, marginTop: 4 },
  searchWrap: {
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: FBLATheme.radius.md,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  searchInput: { flex: 1, color: FBLATheme.ink, paddingVertical: 10 },
  lastOpenedText: { marginHorizontal: 16, marginTop: 8, color: '#5B6A8F', fontWeight: '700', fontSize: 12 },
  listContent: { padding: 14, paddingBottom: 100, gap: 10 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.76)',
    borderRadius: FBLATheme.radius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: { color: FBLATheme.ink, fontSize: 15, fontWeight: '800' },
  cardSubtitle: { color: FBLATheme.muted, fontSize: 12, marginTop: 2 },
  favoriteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: FBLATheme.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
