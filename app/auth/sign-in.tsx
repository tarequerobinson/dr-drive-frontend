import { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'test123',
};

export default function SignInScreen() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const { signIn } = useAuth();

  const handleSignIn = () => {
    signIn(credentials.email, credentials.password);
  };

  const handleUseTestCredentials = () => {
    setCredentials(TEST_CREDENTIALS);
  };

  return (
    <ThemedView style={styles.container}>
      <IconSymbol
        size={100}
        color="#808080"
        name="person.circle.fill"
        style={styles.icon}
      />

      <ThemedView style={styles.testCredentials}>
        <ThemedText style={styles.testTitle}>Test Credentials</ThemedText>
        <TouchableOpacity onPress={handleUseTestCredentials}>
          <ThemedText>Email: {TEST_CREDENTIALS.email}</ThemedText>
          <ThemedText>Password: {TEST_CREDENTIALS.password}</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.form}>
        <TextInput
          style={styles.input}
          value={credentials.email}
          onChangeText={(text) => setCredentials({ ...credentials, email: text })}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={credentials.password}
          onChangeText={(text) => setCredentials({ ...credentials, password: text })}
          placeholder="Password"
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <ThemedText style={styles.buttonText}>Sign In</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/auth/sign-up')}>
          <ThemedText>Don't have an account? Sign Up</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  testCredentials: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: Fonts.rounded,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    height: 50,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    height: 50,
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    padding: 10,
    alignItems: 'center',
  },
});