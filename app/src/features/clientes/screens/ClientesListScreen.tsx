import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { confirmAction } from '@/lib/confirm';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatAddress } from '../services/addressFormat';
import { formatDocument } from '../services/documentFormat';
import { deleteClient } from '../store/clientsThunks';
import type { Client } from '../types';

export function ClientesListScreen() {
  const { t } = useTranslation('clientes');
  const router = useRouter();
  const dispatch = useAppDispatch();
  // Lista vem do store (alimentado em tempo real pelo ClientsSubscriber no layout).
  const { items: clients, loading, error: loadError } = useAppSelector((s) => s.clients);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (client: Client) => {
    if (!(await confirmAction(t('list.confirmDelete', { name: client.name })))) return;
    setDeletingId(client.id);
    try {
      await dispatch(deleteClient(client.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('list.title')}</Text>
        <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={() => router.push('/clientes/novo')}>
          <Feather name="plus" size={16} color="#f8fafc" />
          <Text style={styles.primaryText}>{t('list.newClient')}</Text>
        </Pressable>
      </View>

      {(error ?? loadError) ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error ?? loadError}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#94a3b8" />
        </View>
      ) : clients.length === 0 ? (
        <Text style={styles.empty}>{t('list.empty')}</Text>
      ) : (
        <View style={styles.table}>
          <View style={[styles.tr, styles.thead]}>
            <Text style={[styles.th, styles.cName]}>{t('list.headerName')}</Text>
            <Text style={[styles.th, styles.cDoc]}>{t('list.headerDocument')}</Text>
            <Text style={[styles.th, styles.cAddr]}>{t('list.headerAddress')}</Text>
            <Text style={[styles.th, styles.cActions]}>{t('list.headerActions')}</Text>
          </View>
          {clients.map((c) => (
            <View key={c.id} style={styles.tr}>
              <Text style={[styles.td, styles.cName]} numberOfLines={1}>{c.name}</Text>
              <Text style={[styles.td, styles.cDoc]} numberOfLines={1}>
                {c.document ? `${c.documentType ?? ''} ${formatDocument(c.document, c.documentType)}`.trim() : '—'}
              </Text>
              <Text style={[styles.td, styles.cAddr]} numberOfLines={2}>{formatAddress(c.address)}</Text>
              <View style={[styles.cActions, styles.actionsCell]}>
                <Pressable onPress={() => router.push(`/clientes/${c.id}`)} hitSlop={6} accessibilityLabel={t('list.editAria', { name: c.name })}>
                  <Feather name="edit-2" size={16} color="#60a5fa" />
                </Pressable>
                {deletingId === c.id ? (
                  <ActivityIndicator size="small" color="#f87171" />
                ) : (
                  <Pressable onPress={() => handleDelete(c)} hitSlop={6} accessibilityLabel={t('list.deleteAria', { name: c.name })}>
                    <Feather name="trash-2" size={16} color="#f87171" />
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  title: { color: '#f8fafc', fontSize: 24, fontWeight: '700' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  primaryText: { color: '#f8fafc', fontWeight: '600', fontSize: 13 },
  pressed: { opacity: 0.85 },
  errorBox: { backgroundColor: '#7f1d1d', padding: 12, borderRadius: 6, marginTop: 16 },
  errorText: { color: '#fecaca' },
  center: { paddingVertical: 40, alignItems: 'center' },
  empty: { color: '#94a3b8', marginTop: 24 },
  table: { marginTop: 20, borderWidth: 1, borderColor: '#1f2937', borderRadius: 10, overflow: 'hidden', backgroundColor: '#0b1220' },
  tr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f2937', gap: 8 },
  thead: { backgroundColor: '#111827' },
  th: { color: '#94a3b8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  td: { color: '#e2e8f0', fontSize: 14 },
  cName: { width: 220 },
  cDoc: { width: 180 },
  cAddr: { flex: 1, minWidth: 200 },
  cActions: { width: 80 },
  actionsCell: { flexDirection: 'row', alignItems: 'center', gap: 16 },
});
