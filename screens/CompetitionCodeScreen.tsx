import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { normalizeCompetitionCode } from '@/models/competitionModel';
import { FBLATheme } from '@/constants/theme';
import { FrostedPanel, LiquidBackground, LiquidGlass } from '@/components/liquid-glass';

const FBLA_BLUE = FBLATheme.blue;
const BG = FBLATheme.white;

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
    <LiquidBackground>
    <SafeAreaView style={styles.container}>
      <LiquidGlass style={styles.hero} contentStyle={styles.heroInner}>
        <Text style={styles.title}>Competition Mode</Text>
        <Text style={styles.subtitle}>Enter your 6-character event code to load schedules and maps.</Text>
      </LiquidGlass>

      <FrostedPanel style={styles.card} contentStyle={styles.cardInner}>
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
      </FrostedPanel>
    </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  hero: {
    borderRadius: FBLATheme.radius.xl,
  },
  heroInner: {
    padding: 18,
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#D6E3FF', fontSize: 13, marginTop: 4 },
  card: {
    marginTop: 14,
    borderRadius: FBLATheme.radius.lg,
  },
  cardInner: {
    padding: 16,
  },
  inputsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  codeInput: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: FBLATheme.line,
    borderRadius: FBLATheme.radius.md,
    backgroundColor: FBLATheme.surfaceSoft,
    fontSize: 22,
    fontWeight: '900',
    color: FBLATheme.ink,
  },
  enterButton: {
    marginTop: 16,
    backgroundColor: FBLATheme.yellow,
    borderRadius: FBLATheme.radius.md,
    alignItems: 'center',
    paddingVertical: 12,
  },
  enterButtonText: { color: FBLATheme.blueDark, fontWeight: '900' },
});
