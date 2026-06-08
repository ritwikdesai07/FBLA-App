import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { loginUser } from '@/lib/authStorage';
import { FBLATheme } from '@/constants/theme';
import { FrostedPanel, LiquidBackground } from '@/components/liquid-glass';

const { blue: FBLA_BLUE, blueDark: FBLA_BLUE_DARK, yellow: FBLA_YELLOW } = FBLATheme;

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleLogin = async () => {
    setFormError('');

    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }

    const result = await loginUser(email.trim(), password);
    if (!result.ok) {
      setFormError('Incorrect credentials');
      return;
    }

    router.replace('/');
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.container}>
      <FrostedPanel style={styles.card} contentStyle={styles.cardInner}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/landing')}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Sign in to access your FBLA dashboard.</Text>
        {formError ? (
          <Text style={styles.errorBanner}>{formError}</Text>
        ) : null}

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            if (formError) setFormError('');
          }}
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
          onChangeText={(value) => {
            setPassword(value);
            if (formError) setFormError('');
          }}
          style={styles.input}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          importantForAutofill="yes"
          returnKeyType="go"
          enablesReturnKeyAutomatically
          onSubmitEditing={handleLogin}
          placeholder="Password"
          placeholderTextColor="#8A94AD"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </FrostedPanel>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  card: {
    borderRadius: FBLATheme.radius.xl,
  },
  cardInner: {
    padding: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: FBLATheme.lineStrong,
    backgroundColor: FBLATheme.surfaceSoft,
    marginBottom: 12,
  },
  backButtonText: {
    color: FBLA_BLUE,
    fontWeight: '900',
    fontSize: 12,
  },
  title: { fontSize: 30, fontWeight: '900', color: FBLATheme.ink, marginTop: 4 },
  subtitle: { marginTop: 6, marginBottom: 16, color: FBLATheme.muted, fontSize: 14 },
  errorBanner: {
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F2B2B2',
    borderRadius: 12,
    backgroundColor: '#FFF1F1',
    color: FBLATheme.danger,
    fontSize: 13,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: { color: FBLATheme.muted, fontWeight: '800', marginTop: 8, marginBottom: 5 },
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
  button: {
    marginTop: 16,
    backgroundColor: FBLA_YELLOW,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: FBLA_BLUE_DARK, fontWeight: '900', fontSize: 15 },
});
