import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { confirmAction } from '@/lib/confirm';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteInvoice } from '../store/invoicesThunks';
import { formatMoney } from '../services/money';
import type { Invoice } from '../types';

/** Formata uma data ISO `YYYY-MM-DD` como `DD/MM/YYYY` (`—` quando vazia). */
function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

/** Tela com a tabela de invoices (em tempo real): cliente, número, datas, total, download do PDF e ações. */
export function InvoicesListScreen() {
  const { t } = useTranslation('invoices');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: invoices, loading, error: loadError } = useAppSelector((s) => s.invoices);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** Confirma e exclui a invoice (e o PDF anexado), com spinner na linha. */
  const handleDelete = async (inv: Invoice) => {
    if (!(await confirmAction(t('list.confirmDelete', { number: inv.number })))) return;
    setDeletingId(inv.id);
    try {
      await dispatch(deleteInvoice(inv.id, inv.storagePath));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeletingId(null);
    }
  };

  /** Texto do período de serviço (`de – até`), ou `—` quando ambos vazios. */
  const period = (inv: Invoice) =>
    !inv.serviceFrom && !inv.serviceTo ? '—' : `${formatDate(inv.serviceFrom)} – ${formatDate(inv.serviceTo)}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('list.title')}</Text>
          <Text style={styles.subtitle}>{t('list.subtitle')}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          onPress={() => router.push('/contabilidade/invoices/novo')}
        >
          <Feather name="plus" size={16} color="#f8fafc" />
          <Text style={styles.primaryText}>{t('list.newInvoice')}</Text>
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
      ) : invoices.length === 0 ? (
        <Text style={styles.empty}>{t('list.empty')}</Text>
      ) : (
        <View style={styles.table}>
          <View style={[styles.tr, styles.thead]}>
            <Text style={[styles.th, styles.cClient]}>{t('list.headers.client')}</Text>
            <Text style={[styles.th, styles.cNumber]}>{t('list.headers.number')}</Text>
            <Text style={[styles.th, styles.cDate]}>{t('list.headers.date')}</Text>
            <Text style={[styles.th, styles.cPeriod]}>{t('list.headers.period')}</Text>
            <Text style={[styles.th, styles.cTotal]}>{t('list.headers.total')}</Text>
            <Text style={[styles.th, styles.cFile]}>{t('list.headers.file')}</Text>
            <Text style={[styles.th, styles.cActions]}>{t('list.headers.actions')}</Text>
          </View>
          {invoices.map((inv) => (
            <View key={inv.id} style={styles.tr}>
              <Text style={[styles.td, styles.cClient]} numberOfLines={1}>{inv.clientName ?? t('list.noClient')}</Text>
              <Text style={[styles.td, styles.cNumber]} numberOfLines={1}>{inv.number}</Text>
              <Text style={[styles.td, styles.cDate]}>{formatDate(inv.date)}</Text>
              <Text style={[styles.td, styles.cPeriod]} numberOfLines={1}>{period(inv)}</Text>
              <Text style={[styles.td, styles.cTotal]} numberOfLines={1}>{formatMoney(inv.total, inv.currency)}</Text>
              <View style={styles.cFile}>
                {inv.downloadURL ? (
                  <Pressable onPress={() => Linking.openURL(inv.downloadURL as string)} hitSlop={6}>
                    <Text style={styles.link}>{t('list.download')}</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.td}>—</Text>
                )}
              </View>
              <View style={[styles.cActions, styles.actionsCell]}>
                <Pressable onPress={() => router.push(`/contabilidade/invoices/${inv.id}`)} hitSlop={6} accessibilityLabel={t('list.editAria', { number: inv.number })}>
                  <Feather name="edit-2" size={16} color="#60a5fa" />
                </Pressable>
                {deletingId === inv.id ? (
                  <ActivityIndicator size="small" color="#f87171" />
                ) : (
                  <Pressable onPress={() => handleDelete(inv)} hitSlop={6} accessibilityLabel={t('list.deleteAria', { number: inv.number })}>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 },
  title: { color: '#f8fafc', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#94a3b8', marginTop: 2 },
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
  cClient: { flex: 1, minWidth: 140 },
  cNumber: { width: 130 },
  cDate: { width: 110 },
  cPeriod: { width: 180 },
  cTotal: { width: 130 },
  cFile: { width: 90 },
  cActions: { width: 70 },
  actionsCell: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  link: { color: '#60a5fa', fontWeight: '600', fontSize: 13 },
});
