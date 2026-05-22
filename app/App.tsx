import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthState } from '@/features/auth/hooks/useAuthState';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { AppShell } from '@/components/AppShell';

export default function App() {
  const { user, initializing } = useAuthState();

  return (
    <>
      {initializing ? (
        <View style={styles.center}>
          <ActivityIndicator color="#94a3b8" />
        </View>
      ) : user ? (
        <AppShell user={user} />
      ) : (
        <LoginScreen />
      )}
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' },
});
