import { Pressable, StyleSheet, Text, View } from 'react-native';
import { signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function HomeScreen({ user }: { user: User }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.email}>{user.email ?? 'Signed in'}</Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => void signOut(auth)}
      >
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  title: { color: '#f8fafc', fontSize: 22, fontWeight: '700' },
  email: { color: '#94a3b8' },
  button: {
    marginTop: 12,
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 20,
  },
  buttonPressed: { opacity: 0.85 },
  buttonText: { color: '#f8fafc', fontWeight: '600' },
});
