import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser } from '@/lib/authStorage';

const FBLA_BLUE = '#003DA5';
const BG = '#F5F8FF';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }

    const result = await loginUser(email.trim(), password);
    if (!result.ok) {
      Alert.alert('Login failed', result.error);
      return;
    }

    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/auth-choice')}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Sign in to access your app.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
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
          placeholder="Password"
          placeholderTextColor="#8A94AD"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
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
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D5E0FF',
    backgroundColor: '#EEF3FF',
    marginBottom: 8,
  },
  backButtonText: {
    color: FBLA_BLUE,
    fontWeight: '800',
    fontSize: 12,
  },
  title: { fontSize: 28, fontWeight: '800', color: FBLA_BLUE },
  subtitle: { marginTop: 6, marginBottom: 14, color: '#5B6A8F', fontSize: 14 },
  label: { color: '#5B6A8F', fontWeight: '700', marginTop: 8, marginBottom: 5 },
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
  button: {
    marginTop: 16,
    backgroundColor: FBLA_BLUE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
