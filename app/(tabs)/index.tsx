import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Constants ---
const STORAGE_KEY = '@fbla_reminders_v2';
const FBLA_BLUE = '#003DA5';
const FBLA_YELLOW = '#F0E15B';
const { width } = Dimensions.get('window');

// --- Helper Functions ---
const getGreeting = (name: string = 'User') => {
  const hour = new Date().getHours();
  if (hour < 12) return `Good Morning, ${name}`;
  if (hour < 18) return `Good Afternoon, ${name}`;
  return `Good Evening, ${name}`;
};

type Reminder = { id: string; title: string; notes: string };
type ReminderMap = Record<string, Reminder[]>;
type CalendarType = 'FBLA National' | 'FBLA State' | 'FBLA Regional';

const HomeScreen = () => {
  const [allReminders, setAllReminders] = useState<Record<CalendarType, ReminderMap>>({
    'FBLA National': {},
    'FBLA State': {},
    'FBLA Regional': {},
  });

  // Load reminders from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setAllReminders(JSON.parse(stored));
      } catch (e) {
        console.error("Load Error", e);
      }
    };
    loadData();

    // Set up listener for storage changes
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Get reminders within 7 days
  const upcomingReminders = useMemo(() => {
    const today = new Date();
    const oneWeekAway = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcoming: Array<{
      date: string;
      title: string;
      notes: string;
      type: CalendarType;
    }> = [];

    const types: CalendarType[] = ['FBLA National', 'FBLA State', 'FBLA Regional'];

    types.forEach((type) => {
      const reminders = allReminders[type];
      Object.entries(reminders).forEach(([dateStr, reminderList]) => {
        const reminderDate = new Date(dateStr);
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

    // Sort by date
    return upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allReminders]);

  const styles = createStyles();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner with Logo */}
        <View style={styles.bannerContainer}>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{getGreeting()}</Text>
          </View>
          <View style={styles.logoCircleContainer}>
            <View style={styles.logoCircle}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Upcoming Reminders Box */}
        <View style={styles.contentContainer}>
          <View style={styles.reminderBox}>
            <Text style={styles.reminderTitle}>Upcoming This Week</Text>

            {upcomingReminders.length === 0 ? (
              <Text style={styles.emptyText}>No reminders set for the next 7 days</Text>
            ) : (
              <View>
                {upcomingReminders.map((reminder, index) => (
                  <View key={index} style={styles.reminderItem}>
                    <View style={styles.reminderContent}>
                      <Text style={styles.reminderDate}>
                        {new Date(reminder.date + 'T00:00:00Z').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reminderItemTitle}>{reminder.title}</Text>
                        {reminder.notes && (
                          <Text style={styles.reminderItemNotes}>{reminder.notes}</Text>
                        )}
                        <Text style={styles.reminderType}>{reminder.type}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    bannerContainer: {
      position: 'relative',
    },
    banner: {
      backgroundColor: FBLA_BLUE,
      paddingVertical: 40,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bannerText: {
      color: '#fff',
      fontSize: 24,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    logoCircleContainer: {
      alignItems: 'center',
      marginTop: -32,
      marginBottom: 20,
    },
    logoCircle: {
      width: 85,
      height: 85,
      borderRadius: 42.5,
      backgroundColor: '#fff',
      borderWidth: 5,
      borderColor: FBLA_YELLOW,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    logo: {
      width: 64,
      height: 64,
    },
    contentContainer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    reminderBox: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: '#e0e0e0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    reminderTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: FBLA_BLUE,
      marginBottom: 16,
    },
    emptyText: {
      textAlign: 'center',
      color: '#888',
      fontSize: 14,
      paddingVertical: 20,
    },
    reminderItem: {
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    reminderContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    reminderDate: {
      fontSize: 13,
      fontWeight: '600',
      color: FBLA_BLUE,
      marginRight: 12,
      minWidth: 45,
    },
    reminderItemTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: '#000',
      marginBottom: 4,
    },
    reminderItemNotes: {
      fontSize: 13,
      color: '#666',
      marginBottom: 4,
    },
    reminderType: {
      fontSize: 11,
      color: '#999',
      fontStyle: 'italic',
    },
  });

export default HomeScreen;