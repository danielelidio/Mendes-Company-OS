import { Pressable, StyleSheet, Text, View } from 'react-native';
import { signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { auth } from '@/lib/firebase';
import { useAuthState } from '@/features/auth/hooks/useAuthState';

export function HomeScreen() {
  const { t } = useTranslation('home');
  const { user } = useAuthState();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('welcome')}</Text>
      <Text style={styles.email}>{user?.email ?? t('signedIn')}</Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => void signOut(auth)}
      >
        <Text style={styles.buttonText}>{t('signOut')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  title: { color: '#f8fafc', fontSize: 22, fontWeight: '700' },
  email: { color: '#94a3b8' },
  button: { marginTop: 12, backgroundColor: '#334155', borderRadius: 8, paddingVertical: 11, paddingHorizontal: 20 },
  buttonPressed: { opacity: 0.85 },
  buttonText: { color: '#f8fafc', fontWeight: '600' },
});
