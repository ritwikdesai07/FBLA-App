import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

const FBLA_BLUE = '#003DA5';
const BG = '#F5F8FF';

export default function AuthChoiceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Do you want to login or sign up?</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/login')}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/signup')}>
          <Text style={styles.secondaryButtonText}>Sign Up</Text>
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
    padding: 20,
  },
  title: { fontSize: 28, fontWeight: '800', color: FBLA_BLUE },
  subtitle: { marginTop: 6, marginBottom: 20, color: '#5B6A8F', fontSize: 14 },
  primaryButton: {
    backgroundColor: FBLA_BLUE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5E0FF',
    backgroundColor: '#EEF3FF',
  },
  secondaryButtonText: { color: FBLA_BLUE, fontWeight: '800', fontSize: 15 },
});
