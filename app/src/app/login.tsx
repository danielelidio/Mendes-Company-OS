import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuthState } from '@/features/auth/hooks/useAuthState';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';

export default function LoginRoute() {
  const { user, initializing } = useAuthState();
  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#94a3b8" />
      </View>
    );
  }
  if (user) return <Redirect href="/" />;
  return <LoginScreen />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' },
});
