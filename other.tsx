import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

const FBLA_BLUE = '#003DA5';
const BG = '#F5F8FF';

const featureCards = [
  {
    title: 'Practice Quizzes',
    subtitle: 'Compete and train by event area',
    icon: 'quiz' as const,
    route: '/(tabs)/practice-quiz-events' as const,
  },
  { title: 'Nationwide Directory', subtitle: 'Find chapters and members', icon: 'public' as const },
  { title: 'Goal Setting', subtitle: 'Track progress and milestones', icon: 'flag' as const },
  { title: 'Badges / Streaks', subtitle: 'Earn consistency rewards', icon: 'emoji-events' as const },
  { title: 'Career / Internship Portal', subtitle: 'Explore opportunities', icon: 'work' as const },
  {
    title: 'Competition Mode',
    subtitle: 'Schedules, sessions, and event maps',
    icon: 'event' as const,
    route: '/(tabs)/competition-code' as const,
  },
];

export default function OtherScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>EXPLORE</Text>
        <Text style={styles.title}>Other</Text>
      </View>

      <View style={styles.halfPanel}>
        <ScrollView
          contentContainerStyle={styles.panelContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.panelHeading}>More Tools</Text>
          {featureCards.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={[styles.card, item.route ? styles.practiceCard : null]}
              activeOpacity={0.85}
              onPress={() => {
                if (item.route) {
                  router.push(item.route);
                }
              }}>
              <View style={styles.iconWrap}>
                <MaterialIcons name={item.icon} size={20} color={FBLA_BLUE} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
              {item.route ? <MaterialIcons name="chevron-right" size={22} color={FBLA_BLUE} /> : null}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.card, styles.messagingCard]}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/messaging')}>
            <View style={styles.iconWrap}>
              <MaterialIcons name="chat" size={20} color={FBLA_BLUE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Messaging</Text>
              <Text style={styles.cardSubtitle}>Start and continue member conversations</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={FBLA_BLUE} />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  hero: {
    backgroundColor: FBLA_BLUE,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 64,
  },
  eyebrow: { color: '#D6E3FF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 4 },
  halfPanel: {
    flex: 1,
    marginTop: -32,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#E6EDFF',
    shadowColor: '#0A1A3A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 10,
  },
  panelContent: { padding: 14, paddingBottom: 28, gap: 10 },
  panelHeading: { color: FBLA_BLUE, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E6EDFF',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F9FBFF',
  },
  messagingCard: {
    borderColor: '#CFE0FF',
    backgroundColor: '#EDF3FF',
  },
  practiceCard: {
    borderColor: '#CFE0FF',
    backgroundColor: '#EDF3FF',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E9EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { color: '#0F172A', fontSize: 15, fontWeight: '800' },
  cardSubtitle: { color: '#5B6A8F', fontSize: 12, marginTop: 2 },
});
