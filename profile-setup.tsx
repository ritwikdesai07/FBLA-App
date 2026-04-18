import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';
import { getCurrentUser, setCurrentUserDisplayName, setCurrentUserProfile } from '@/lib/authStorage';
import { useRouter } from 'expo-router';

const FBLA_BLUE = '#003DA5';
const BG = '#F5F8FF';

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
        router.replace('/auth-choice');
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>WELCOME</Text>
          <Text style={styles.title}>Set up your profile</Text>
          <Text style={styles.subtitle}>Complete this once to unlock the full app.</Text>
        </View>

        <View style={styles.card}>
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
        </View>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 16, gap: 12 },
  hero: {
    backgroundColor: FBLA_BLUE,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  heroEyebrow: { color: '#D6E3FF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 25, fontWeight: '800', color: '#fff', marginTop: 4 },
  subtitle: { fontSize: 13, color: '#D6E3FF', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6EDFF',
    borderRadius: 14,
    padding: 14,
  },
  label: { fontSize: 12, color: '#5B6A8F', marginTop: 10, marginBottom: 6, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#DCE6FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#F9FBFF',
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#DCE6FF',
    borderRadius: 10,
    overflow: 'visible',
    backgroundColor: '#F9FBFF',
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
    borderColor: '#DCE6FF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FBFF',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#0F172A',
  },
  saveButton: { marginTop: 18, backgroundColor: FBLA_BLUE, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 16,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 14,
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
