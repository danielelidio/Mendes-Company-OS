import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { auth } from '@/lib/firebase';
import { useAuthState } from '../hooks/useAuthState';

export function UserMenu() {
  const { t } = useTranslation('auth');
  const { user } = useAuthState();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const label = user.displayName || user.email || t('userMenu.account');

  return (
    <View>
      <Pressable style={styles.button} onPress={() => setOpen(true)} accessibilityLabel={t('userMenu.aria')}>
        <Feather name="user" size={16} color="#cbd5e1" />
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
        <Feather name="chevron-down" size={16} color="#94a3b8" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            <View style={styles.header}>
              <Text style={styles.headerName} numberOfLines={1}>{label}</Text>
              {user.email ? <Text style={styles.headerEmail} numberOfLines={1}>{user.email}</Text> : null}
            </View>
            <Pressable
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              onPress={() => {
                setOpen(false);
                void signOut(auth);
              }}
              accessibilityLabel={t('userMenu.logout')}
            >
              <Feather name="log-out" size={16} color="#fca5a5" />
              <Text style={styles.itemText}>{t('userMenu.logout')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: 220,
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
  },
  label: { color: '#e2e8f0', fontSize: 13, fontWeight: '600', flexShrink: 1 },
  overlay: { flex: 1, alignItems: 'flex-end', justifyContent: 'flex-start', paddingTop: 56, paddingRight: 16 },
  menu: { width: 240, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, overflow: 'hidden' },
  header: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
  headerName: { color: '#f8fafc', fontSize: 14, fontWeight: '700' },
  headerEmail: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  itemText: { color: '#fca5a5', fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.8 },
});
