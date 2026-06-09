import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { FBLATheme, fblaShadow } from '@/constants/theme';
import { LiquidBackground, LiquidGlass } from '@/components/liquid-glass';

const { blue: FBLA_BLUE } = FBLATheme;

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
    <LiquidBackground>
    <SafeAreaView style={styles.container}>
      <LiquidGlass style={styles.hero} contentStyle={styles.heroInner}>
        <Text style={styles.title}>Tools</Text>
        <Text style={styles.subtitle}>Practice, compete, connect, and plan from one chapter workspace.</Text>
      </LiquidGlass>

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
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  hero: {
    borderRadius: FBLATheme.radius.hero,
  },
  heroInner: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 42,
  },
  title: { color: FBLATheme.white, fontSize: 30, fontWeight: '900', marginTop: 4 },
  subtitle: { color: '#DDE8FF', fontSize: 14, lineHeight: 20, marginTop: 8, maxWidth: 310 },
  halfPanel: {
    flex: 1,
    marginTop: 2,
    borderRadius: FBLATheme.radius.hero,
    backgroundColor: 'rgba(234, 241, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(191, 208, 255, 0.86)',
    ...fblaShadow({ opacity: 0.14, radius: 16, offsetY: 8, elevation: 8 }),
    overflow: 'hidden',
  },
  panelContent: { padding: 16, paddingBottom: 112, gap: 10 },
  panelHeading: { color: FBLATheme.blueDark, fontSize: 18, fontWeight: '900', marginBottom: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: FBLATheme.lineStrong,
    borderRadius: FBLATheme.radius.lg,
    padding: 14,
    backgroundColor: FBLATheme.surface,
    ...fblaShadow({ opacity: 0.08, radius: 10, offsetY: 5, elevation: 3 }),
  },
  messagingCard: {
    borderColor: 'rgba(255, 210, 0, 0.76)',
    backgroundColor: '#FFF9D8',
  },
  practiceCard: {
    borderColor: 'rgba(255, 210, 0, 0.76)',
    backgroundColor: '#FFF9D8',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: FBLATheme.blueSoft,
    borderWidth: 1,
    borderColor: FBLATheme.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { color: FBLATheme.ink, fontSize: 15, fontWeight: '900' },
  cardSubtitle: { color: FBLATheme.mutedStrong, fontSize: 12, marginTop: 2, fontWeight: '600' },
});
