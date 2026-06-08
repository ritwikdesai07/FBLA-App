import React, { useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { AllReminders, CalendarType, emptyReminders, getCurrentUser, UserRecord } from '@/lib/authStorage';
import { fetchLatestNewsItems, NEWS_ITEMS, NewsItem } from '@/lib/newsData';
import { FBLATheme } from '@/constants/theme';
import { FrostedPanel, LiquidBackground, LiquidGlass, LogoMedallion, ProfileOrb } from '@/components/liquid-glass';

const { blue: FBLA_BLUE, blueDark: FBLA_BLUE_DARK } = FBLATheme;

const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatReminderDate = (dateStr: string) =>
  parseLocalDate(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

const getGreeting = (name = '') => {
  const hour = new Date().getHours();
  const prefix = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  return name.trim() ? `${prefix}, ${name}` : prefix;
};

export default function HomeScreen() {
  const router = useRouter();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const [allReminders, setAllReminders] = useState<AllReminders>(emptyReminders());
  const [user, setUser] = useState<UserRecord | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[]>(NEWS_ITEMS);

  const loadHomeData = React.useCallback(async () => {
    const [current, latestNews] = await Promise.all([getCurrentUser(), fetchLatestNewsItems()]);
    setUser(current);
    setAllReminders(current?.reminders ?? emptyReminders());
    setNewsItems(latestNews);
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  useFocusEffect(
    React.useCallback(() => {
      loadHomeData();
    }, [loadHomeData])
  );

  const upcomingReminders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeekAway = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcoming: {
      date: string;
      title: string;
      notes: string;
      type: CalendarType;
    }[] = [];

    const types: CalendarType[] = ['FBLA National', 'FBLA State', 'FBLA Regional'];
    types.forEach((type) => {
      const reminders = allReminders[type];
      Object.entries(reminders).forEach(([dateStr, reminderList]) => {
        const reminderDate = parseLocalDate(dateStr);
        if (reminderDate >= today && reminderDate <= oneWeekAway) {
          reminderList.forEach((reminder) => {
            upcoming.push({
              date: dateStr,
              title: reminder.title,
              notes: reminder.notes,
              type,
            });
          });
        }
      });
    });

    return upcoming.sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime());
  }, [allReminders]);

  const duesTotal = user?.profile?.duesTotal ?? 0;
  const duesPaid = user?.profile?.duesPaid ?? 0;
  const duesPercent = duesTotal > 0 ? Math.max(0, Math.min(100, Math.round((duesPaid / duesTotal) * 100))) : 0;

  const logoAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(scrollOffset.value, [0, 180], [-62, -8], Extrapolation.CLAMP);
    const tilt = interpolate(scrollOffset.value, [0, 180], [12, 3], Extrapolation.CLAMP);
    const lift = interpolate(scrollOffset.value, [0, 180], [0, -12], Extrapolation.CLAMP);
    const scale = interpolate(scrollOffset.value, [0, 180], [1.16, 0.96], Extrapolation.CLAMP);

    return {
      transform: [
        { perspective: 900 },
        { rotateY: `${rotate}deg` },
        { rotateX: `${tilt}deg` },
        { rotateZ: '-8deg' },
        { translateY: lift },
        { scale },
      ],
    };
  });

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.container}>
        <Animated.ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.topLabel}>FBLA Command Center</Text>
              <Text style={styles.topCaption}>Today’s chapter pulse</Text>
            </View>
            <ProfileOrb
              displayName={user?.displayName}
              imageUri={user?.profile?.profileImageUri}
              onPress={() => router.push('/dashboard')}
            />
          </View>

          <LiquidGlass style={styles.heroGlass} contentStyle={styles.heroInner}>
            <Animated.View style={[styles.logoWrap, logoAnimatedStyle]}>
              <LogoMedallion source={require('@/assets/images/logo.png')} />
            </Animated.View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>{getGreeting(user?.displayName)}</Text>
              <Text style={styles.heroSubtitle}>Your chapter schedule, progress, and updates in one place.</Text>
            </View>
          </LiquidGlass>

          <View style={styles.quickStatsRow}>
            <Animated.View entering={FadeInDown.duration(420).delay(40)} style={styles.statSlot}>
              <FrostedPanel style={styles.statCard} contentStyle={styles.statCardInner}>
                <View style={styles.statIcon}>
                  <MaterialIcons name="notifications-active" size={20} color={FBLA_BLUE} />
                </View>
                <Text style={styles.statValue}>{upcomingReminders.length}</Text>
                <Text style={styles.statLabel}>Upcoming this week</Text>
              </FrostedPanel>
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(420).delay(90)} style={styles.statSlot}>
              <FrostedPanel style={styles.statCard} contentStyle={styles.statCardInner}>
                <View style={[styles.statIcon, styles.statIconGold]}>
                  <MaterialIcons name="paid" size={20} color={FBLA_BLUE_DARK} />
                </View>
                <Text style={styles.statValue}>{duesPercent}%</Text>
                <Text style={styles.statLabel}>Dues progress</Text>
              </FrostedPanel>
            </Animated.View>
          </View>

          <FrostedPanel style={styles.sectionCard} contentStyle={styles.sectionInner}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="notifications-active" size={20} color={FBLA_BLUE} />
              <Text style={styles.sectionTitle}>Upcoming This Week</Text>
            </View>
            {upcomingReminders.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="event-available" size={25} color={FBLA_BLUE} />
                <Text style={styles.emptyText}>No reminders set for the next 7 days</Text>
              </View>
            ) : (
              upcomingReminders.map((reminder, index) => (
                <TouchableOpacity key={`${reminder.date}-${reminder.title}-${index}`} style={styles.glassRow} activeOpacity={0.78}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeText}>{formatReminderDate(reminder.date)}</Text>
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{reminder.title}</Text>
                    {reminder.notes ? <Text style={styles.rowNotes}>{reminder.notes}</Text> : null}
                    <Text style={styles.rowType}>{reminder.type}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </FrostedPanel>

          <FrostedPanel style={styles.sectionCard} contentStyle={styles.sectionInner}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="article" size={20} color={FBLA_BLUE} />
              <Text style={styles.sectionTitle}>FBLA News</Text>
            </View>
            {newsItems.slice(0, 7).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.glassRow}
                activeOpacity={0.78}
                onPress={() =>
                  router.push({
                    pathname: '/news/[id]',
                    params: { id: item.id },
                  })
                }>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeText}>{item.dateLabel}</Text>
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowNotes} numberOfLines={2}>
                    {item.preview}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={FBLATheme.muted} />
              </TouchableOpacity>
            ))}
          </FrostedPanel>
        </Animated.ScrollView>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 112, gap: 14 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  topLabel: { color: FBLATheme.blueDark, fontSize: 15, fontWeight: '900' },
  topCaption: { color: FBLATheme.muted, fontSize: 12, fontWeight: '700', marginTop: 2 },
  heroGlass: {
    borderRadius: 30,
  },
  heroInner: {
    minHeight: 372,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
    justifyContent: 'space-between',
  },
  logoWrap: {
    alignSelf: 'center',
    marginTop: 8,
  },
  heroCopy: {
    marginTop: 16,
  },
  heroTitle: { color: FBLATheme.white, fontSize: 31, lineHeight: 36, fontWeight: '900' },
  heroSubtitle: { color: '#DDE8FF', fontSize: 15, lineHeight: 22, marginTop: 8, maxWidth: 310 },
  quickStatsRow: { flexDirection: 'row', gap: 12 },
  statSlot: { flex: 1 },
  statCard: { borderRadius: 22 },
  statCardInner: { minHeight: 132, justifyContent: 'space-between' },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: 'rgba(234, 241, 255, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconGold: { backgroundColor: 'rgba(255, 244, 184, 0.92)' },
  statValue: { color: FBLA_BLUE, fontSize: 34, fontWeight: '900', marginTop: 10, fontVariant: ['tabular-nums'] },
  statLabel: { color: FBLATheme.mutedStrong, fontSize: 12, fontWeight: '900', lineHeight: 16 },
  sectionCard: { borderRadius: 24 },
  sectionInner: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  sectionTitle: { fontSize: 19, fontWeight: '900', color: FBLA_BLUE },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.54)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  emptyText: { color: FBLATheme.mutedStrong, textAlign: 'center', fontWeight: '800' },
  glassRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 12,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.76)',
  },
  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: FBLATheme.yellowSoft,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 210, 0, 0.42)',
  },
  dateBadgeText: { color: FBLA_BLUE_DARK, fontWeight: '900', fontSize: 12 },
  rowBody: { flex: 1 },
  rowTitle: { color: FBLATheme.ink, fontSize: 15, fontWeight: '900' },
  rowNotes: { color: FBLATheme.mutedStrong, fontSize: 13, marginTop: 3, lineHeight: 18 },
  rowType: { color: FBLA_BLUE, fontSize: 11, marginTop: 5, fontWeight: '900' },
});
