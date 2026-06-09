import React, { useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { signUpUser } from '@/lib/authStorage';
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

const IOS_PASSWORD_RULES = 'minlength: 8; required: upper; required: lower; required: digit;';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [stateName, setStateName] = useState('');
  const [school, setSchool] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [gradDate, setGradDate] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [stateMenuVisible, setStateMenuVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const markedDates = useMemo(() => {
    if (!gradDate) return {};
    return { [gradDate]: { selected: true, selectedColor: FBLA_BLUE } };
  }, [gradDate]);

  const handleSignup = async () => {
    if (submitting) return;

    if (!email.trim() || !password.trim() || !displayName.trim() || !stateName || !school.trim() || !chapterName.trim() || !gradDate) {
      Alert.alert('Missing fields', 'Please complete all fields.');
      return;
    }

    setSubmitting(true);

    try {
      const signUpResult = await signUpUser(email.trim(), password, displayName.trim(), {
        state: stateName,
        school: school.trim(),
        chapterName: chapterName.trim(),
        gradDate,
        duesTotal: 0,
        duesPaid: 0,
        profileComplete: true,
      });
      if (!signUpResult.ok) {
        Alert.alert('Sign up failed', signUpResult.error);
        return;
      }

      router.replace('/');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LiquidBackground>
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
        <LiquidGlass style={styles.hero} contentStyle={styles.heroInner}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/landing')}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Enter email, password, and profile details.</Text>
        </LiquidGlass>

        <FrostedPanel style={styles.card} contentStyle={styles.cardInner}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="username"
            textContentType="username"
            importantForAutofill="yes"
            returnKeyType="next"
            placeholder="you@example.com"
            placeholderTextColor="#8A94AD"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            importantForAutofill="yes"
            passwordRules={IOS_PASSWORD_RULES}
            returnKeyType="next"
            enablesReturnKeyAutomatically
            placeholder="Create password"
            placeholderTextColor="#8A94AD"
          />

          <Text style={styles.label}>Display name</Text>
          <TextInput value={displayName} onChangeText={setDisplayName} style={styles.input} />

          <Text style={styles.label}>State</Text>
          <TouchableOpacity style={styles.stateButton} activeOpacity={0.85} onPress={() => setStateMenuVisible(true)}>
            <Text style={[styles.stateButtonText, !stateName && styles.statePlaceholder]}>
              {stateName || 'Select your state'}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={22} color="#5B6A8F" />
          </TouchableOpacity>

          <Text style={styles.label}>School</Text>
          <TextInput value={school} onChangeText={setSchool} style={styles.input} />

          <Text style={styles.label}>Chapter name</Text>
          <TextInput value={chapterName} onChangeText={setChapterName} style={styles.input} />

          <Text style={styles.label}>Graduation date</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setCalendarOpen(true)}>
            <Text style={styles.dateButtonText}>{gradDate || 'Select graduation date'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSignup}>
            <Text style={styles.saveText}>{submitting ? 'Creating Account...' : 'Create Account'}</Text>
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

      <Modal visible={stateMenuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.stateMenuOverlay} activeOpacity={1} onPress={() => setStateMenuVisible(false)}>
          <View style={styles.stateMenuCard}>
            <ScrollView showsVerticalScrollIndicator style={{ maxHeight: 360 }}>
              {US_STATES.map((state) => {
                const active = stateName === state;
                return (
                  <TouchableOpacity
                    key={state}
                    style={[styles.stateMenuItem, active && styles.stateMenuItemActive]}
                    onPress={() => {
                      setStateName(state);
                      setStateMenuVisible(false);
                    }}>
                    <Text style={[styles.stateMenuText, active && styles.stateMenuTextActive]}>{state}</Text>
                    {active ? <MaterialIcons name="check" size={18} color={FBLA_BLUE} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 48 },
  hero: {
    borderRadius: 18,
  },
  heroInner: {
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#6E8BD4',
    backgroundColor: '#1A4BAE',
    marginBottom: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
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
  stateButton: {
    borderWidth: 1,
    borderColor: FBLATheme.line,
    borderRadius: 12,
    backgroundColor: FBLATheme.surfaceSoft,
    minHeight: 50,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stateButtonText: { color: FBLATheme.ink, fontSize: 16 },
  statePlaceholder: { color: '#8A94AD' },
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
  stateMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  stateMenuCard: {
    backgroundColor: FBLATheme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FBLATheme.line,
    overflow: 'hidden',
  },
  stateMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stateMenuItemActive: { backgroundColor: FBLATheme.yellowSoft },
  stateMenuText: { color: FBLATheme.ink, fontSize: 15 },
  stateMenuTextActive: { color: FBLA_BLUE, fontWeight: '700' },
});
