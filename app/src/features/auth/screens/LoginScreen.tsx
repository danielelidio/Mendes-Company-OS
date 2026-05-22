import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { auth } from '@/lib/firebase';

/** Maps a Firebase auth error code to a translation key under `login.errors`. */
function errorKeyForCode(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'invalidEmail';
    case 'auth/user-disabled':
      return 'disabled';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'invalidCredential';
    case 'auth/too-many-requests':
      return 'tooManyRequests';
    case 'auth/network-request-failed':
      return 'network';
    default:
      return 'generic';
  }
}

export function LoginScreen() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  const handleSignIn = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Auth state change is handled by App's useAuthState listener.
    } catch (e) {
      const code = (e as { code?: string }).code ?? '';
      setError(t(`login.errors.${errorKeyForCode(code)}`));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>mendescompany-app</Text>
        <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

        <Text style={styles.label}>{t('login.emailLabel')}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="username"
          editable={!submitting}
          onSubmitEditing={handleSignIn}
        />

        <Text style={styles.label}>{t('login.passwordLabel')}</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          textContentType="password"
          editable={!submitting}
          onSubmitEditing={handleSignIn}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            !canSubmit && styles.buttonDisabled,
            pressed && canSubmit && styles.buttonPressed,
          ]}
          onPress={handleSignIn}
          disabled={!canSubmit}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('login.submit')}</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
    gap: 6,
  },
  title: { color: '#f8fafc', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#94a3b8', marginBottom: 14 },
  label: { color: '#cbd5e1', fontSize: 13, marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#f8fafc',
    fontSize: 15,
  },
  error: { color: '#fca5a5', fontSize: 13, marginTop: 12 },
  button: { marginTop: 20, backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 13, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#475569' },
  buttonPressed: { opacity: 0.85 },
  buttonText: { color: '#f8fafc', fontWeight: '700', fontSize: 15 },
});
