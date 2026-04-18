import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

const FBLA_BLUE = '#003DA5';
const BG = '#F5F8FF';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>FBLA APP</Text>
        <Text style={styles.title}>Build. Lead. Compete.</Text>
        <Text style={styles.subtitle}>Track reminders, dues, and chapter progress in one place.</Text>

        <TouchableOpacity style={styles.button} onPress={() => router.replace('/auth-choice')}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, justifyContent: 'center', padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6EDFF',
    borderRadius: 16,
    padding: 22,
  },
  eyebrow: { color: '#6A7AA6', fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  title: { marginTop: 6, fontSize: 30, fontWeight: '900', color: FBLA_BLUE },
  subtitle: { marginTop: 8, color: '#5B6A8F', fontSize: 14, lineHeight: 20 },
  button: {
    marginTop: 20,
    backgroundColor: FBLA_BLUE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
