import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { normalizeCompetitionCode } from '@/models/competitionModel';

const FBLA_BLUE = '#003DA5';
const BG = '#F5F8FF';

export default function CompetitionCodeScreen() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleChange = (index: number, value: string) => {
    const char = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
    const updated = [...digits];
    updated[index] = char;
    setDigits(updated);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const code = normalizeCompetitionCode(digits.join(''));
    if (code.length !== 6) {
      Alert.alert('Invalid code', 'Please enter a valid 6-character event code.');
      return;
    }

    router.push({
      pathname: '/(tabs)/competition-event',
      params: { code },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Competition Mode</Text>
        <Text style={styles.subtitle}>Enter your 6-digit event code</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.inputsRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={styles.codeInput}
              value={digit}
              onChangeText={(value) => handleChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              autoCapitalize="characters"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity style={styles.enterButton} onPress={handleSubmit}>
          <Text style={styles.enterButtonText}>Enter Event</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, padding: 16 },
  hero: {
    backgroundColor: FBLA_BLUE,
    borderRadius: 14,
    padding: 16,
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#D6E3FF', fontSize: 13, marginTop: 4 },
  card: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6EDFF',
    borderRadius: 14,
    padding: 16,
  },
  inputsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  codeInput: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: '#DCE6FF',
    borderRadius: 10,
    backgroundColor: '#F9FBFF',
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  enterButton: {
    marginTop: 16,
    backgroundColor: FBLA_BLUE,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
  },
  enterButtonText: { color: '#fff', fontWeight: '800' },
});
