import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import '@/lib/i18n'; // inicializa o i18next (idioma + namespaces das features)
import { store } from '@/store';
import { AuthListener } from '@/features/auth/components/AuthListener';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthListener />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0f172a' } }} />
      <StatusBar style="light" />
    </Provider>
  );
}
