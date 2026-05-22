import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect, Slot } from 'expo-router';
import { useAuthState } from '@/features/auth/hooks/useAuthState';
import { Sidebar } from '@/components/Sidebar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { UserMenu } from '@/features/auth/components/UserMenu';
import { ClientsSubscriber } from '@/features/clientes/components/ClientsSubscriber';
import { UploadStatusBar } from '@/features/contabilidade/notas-fiscais/components/UploadStatusBar';
import { MatchModal } from '@/features/contabilidade/notas-fiscais/components/MatchModal';

export default function AppLayout() {
  const { user, initializing } = useAuthState();
  const [collapsed, setCollapsed] = useState(false);

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#94a3b8" />
      </View>
    );
  }
  if (!user) return <Redirect href="/login" />;

  return (
    <View style={styles.root}>
      <ClientsSubscriber />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <View style={styles.content}>
        <View style={styles.topBar}>
          <UploadStatusBar />
          <LanguageSwitcher />
          <UserMenu />
        </View>
        <View style={styles.body}>
          <Slot />
        </View>
      </View>
      {/* Modal global de seleção de cliente do upload (funciona em qualquer tela). */}
      <MatchModal />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: '#0f172a' },
  content: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12,
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1f2937',
  },
  body: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' },
});
