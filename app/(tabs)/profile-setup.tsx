import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';
import { getCurrentUser, setCurrentUserDisplayName, setCurrentUserProfile } from '@/lib/authStorage';
import { useRouter } from 'expo-router';
import { FBLATheme } from '@/constants/theme';
import { FrostedPanel, LiquidBackground, LiquidGlass } from '@/components/liquid-glass';

const { blue: FBLA_BLUE, blueDark: FBLA_BLUE_DARK, yellow: FBLA_YELLOW } = FBLATheme;

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming',
];

export default function ProfileSetupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [stateName, setStateName] = useState('');
  const [school, setSchool] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [gradDate, setGradDate] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.replace('/landing');
        return;
      }

      if (user.profile?.profileComplete) {
        router.replace('/');
        return;
      }

      setDisplayName(user.displayName ?? '');
      setStateName(user.profile?.state ?? '');
      setSchool(user.profile?.school ?? '');
      setChapterName(user.profile?.chapterName ?? '');
      setGradDate(user.profile?.gradDate ?? '');
    };

    load();
  }, [router]);

  const markedDates = useMemo(() => {
    if (!gradDate) return {};
    return { [gradDate]: { selected: true, selectedColor: FBLA_BLUE } };
  }, [gradDate]);

  const handleSave = async () => {
    if (!displayName.trim() || !stateName || !school.trim() || !chapterName.trim() || !gradDate) {
      Alert.alert('Missing Fields', 'Please complete all profile fields.');
      return;
    }

    try {
      await setCurrentUserDisplayName(displayName);
      await setCurrentUserProfile({
        state: stateName,
        school: school.trim(),
        chapterName: chapterName.trim(),
        gradDate,
        profileComplete: true,
      });

      Alert.alert('Saved', 'Profile saved.');
      router.replace('/');
    } catch (e) {
      console.error('Failed to save profile', e);
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  return (
    <LiquidBackground>
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <LiquidGlass style={styles.hero} contentStyle={styles.heroInner}>
          <Text style={styles.title}>Set up your profile</Text>
          <Text style={styles.subtitle}>Complete this once to unlock the full app.</Text>
        </LiquidGlass>

        <FrostedPanel style={styles.card} contentStyle={styles.cardInner}>
          <Text style={styles.label}>Display name</Text>
          <TextInput value={displayName} onChangeText={setDisplayName} style={styles.input} />

          <Text style={styles.label}>State</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={stateName}
              onValueChange={(value) => setStateName(value)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Select your state" value="" color="#000000" />
              {US_STATES.map((state) => (
                <Picker.Item key={state} label={state} value={state} color="#000000" />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>School</Text>
          <TextInput value={school} onChangeText={setSchool} style={styles.input} />

          <Text style={styles.label}>Chapter name</Text>
          <TextInput value={chapterName} onChangeText={setChapterName} style={styles.input} />

          <Text style={styles.label}>Graduation date</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setCalendarOpen(true)}>
            <Text style={styles.dateButtonText}>{gradDate || 'Select graduation date'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save Profile</Text>
          </TouchableOpacity>
        </FrostedPanel>
      </ScrollView>

      <Modal visible={calendarOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Pick graduation date</Text>
            <Calendar
              current={gradDate || undefined}
              markedDates={markedDates}
              onDayPress={(day) => {
                setGradDate(day.dateString);
                setCalendarOpen(false);
              }}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setCalendarOpen(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
  hero: {
    borderRadius: 18,
  },
  heroInner: {
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  title: { fontSize: 27, fontWeight: '900', color: FBLATheme.white, marginTop: 4 },
  subtitle: { fontSize: 13, color: '#DDE8FF', marginTop: 4, lineHeight: 19 },
  card: {
    borderRadius: 16,
  },
  cardInner: {
    padding: 14,
  },
  label: { fontSize: 12, color: FBLATheme.muted, marginTop: 10, marginBottom: 6, fontWeight: '800' },
  input: {
    borderWidth: 1,
    borderColor: FBLATheme.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: FBLATheme.ink,
    backgroundColor: FBLATheme.surfaceSoft,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: FBLATheme.line,
    borderRadius: 12,
    overflow: 'visible',
    backgroundColor: FBLATheme.surfaceSoft,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#000000',
  },
  pickerItem: {
    color: '#000000',
    fontSize: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: FBLATheme.line,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: FBLATheme.surfaceSoft,
  },
  dateButtonText: {
    fontSize: 16,
    color: FBLATheme.ink,
  },
  saveButton: { marginTop: 18, backgroundColor: FBLA_YELLOW, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveText: { color: FBLA_BLUE_DARK, fontWeight: '900' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 16,
  },
  modalCard: {
    width: '100%',
    backgroundColor: FBLATheme.surface,
    borderRadius: 16,
    padding: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: FBLA_BLUE,
  },
  closeButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
