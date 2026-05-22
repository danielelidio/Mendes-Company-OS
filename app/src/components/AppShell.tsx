import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { User } from 'firebase/auth';
import { Sidebar, type ScreenKey } from '@/components/Sidebar';
import { HomeScreen } from '@/features/home/screens/HomeScreen';

export function AppShell({ user }: { user: User }) {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState<ScreenKey>('home');

  return (
    <View style={styles.root}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        active={active}
        onNavigate={setActive}
      />
      <View style={styles.content}>{active === 'home' && <HomeScreen user={user} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: '#0f172a' },
  content: { flex: 1 },
});
