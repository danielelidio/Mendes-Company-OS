import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { confirmAction } from '@/lib/confirm';
import { showDevTools } from '@/lib/env';
import { SearchableSelect } from '@/components/SearchableSelect';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteAllNotasFiscais, deleteNotaFiscal, subscribeNotasFiscais } from '../services/notasFiscaisRepo';
import { notasError, notasReceived } from '../store/notasFiscaisSlice';
import { formatForeignValue } from '../services/bacenCurrency';
import type { NotaFiscalRecord, NotaFiscalStatus } from '../types';

type SortField = 'numero' | 'competencia' | 'cliente' | 'valor' | 'status';
type SortState = { field: SortField; dir: 'asc' | 'desc' };

export function NotasFiscaisListScreen() {
  const { t } = useTranslation('notasFiscais');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: rows, loading, error: loadError } = useAppSelector((s) => s.notasFiscais);

  const MESES = useMemo(
    () => [
      { value: '', label: t('list.options.mesAll') },
      ...Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1).padStart(2, '0'),
        label: t(`months.${i + 1}`),
      })),
    ],
    [t],
  );
  const STATUS_OPTIONS = useMemo(
    () => [
      { value: '', label: t('list.options.statusAll') },
      { value: 'Emitida/Normal', label: t('status.issued') },
      { value: 'Cancelada', label: t('status.canceled') },
    ],
    [t],
  );
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  // filters + sort
  const [fNumero, setFNumero] = useState('');
  const [fClienteId, setFClienteId] = useState('');
  const [fMes, setFMes] = useState('');
  const [fAno, setFAno] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [fValorMin, setFValorMin] = useState('');
  const [fValorMax, setFValorMax] = useState('');
  const [sort, setSort] = useState<SortState>({ field: 'competencia', dir: 'desc' });

  // Assinatura em tempo real: a lista popula sozinha conforme as notas são gravadas
  // (inclusive durante o upload em background) e some quando são excluídas.
  useEffect(() => {
    const unsubscribe = subscribeNotasFiscais(
      (items) => dispatch(notasReceived(items)),
      (e) => dispatch(notasError(e.message)),
    );
    return unsubscribe;
  }, [dispatch]);

  const handleClearAll = async () => {
    const ok = await confirmAction(t('list.confirmClearAll'), t('list.confirmClearAllLabel'));
    if (!ok) return;
    setClearing(true);
    try {
      await deleteAllNotasFiscais();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setClearing(false);
    }
  };

  const handleDelete = async (record: NotaFiscalRecord) => {
    const ok = await confirmAction(t('list.confirmDelete', { numero: record.numero }));
    if (!ok) return;
    setDeletingId(record.id);
    try {
      await deleteNotaFiscal(record.id, record.storagePath);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeletingId(null);
    }
  };

  const anoOptions = useMemo(() => {
    const years = new Set<string>();
    rows.forEach((r) => {
      const y = r.competencia?.slice(0, 4);
      if (y) years.add(y);
    });
    return [{ value: '', label: t('list.options.anoAll') }, ...[...years].sort((a, b) => b.localeCompare(a)).map((y) => ({ value: y, label: y }))];
  }, [rows, t]);

  const clienteOptions = useMemo(() => {
    const named = new Map<string, string>();
    rows.forEach((r) => {
      if (!r.cliente && !r.clientId) return; // notas sem cliente usam a opção fixa abaixo
      const key = r.clientId ? `id:${r.clientId}` : `name:${r.cliente}`;
      if (!named.has(key)) named.set(key, r.cliente ?? t('list.options.clienteNoName'));
    });
    const opts = [...named.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return [
      { value: '', label: t('list.options.clienteAll') },
      { value: '__none__', label: t('list.options.clienteNone') },
      ...opts,
    ];
  }, [rows, t]);

  const onSort = (field: SortField) =>
    setSort((s) => (s.field === field ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'asc' }));

  const clearFilters = () => {
    setFNumero('');
    setFClienteId('');
    setFMes('');
    setFAno('');
    setFStatus('');
    setFValorMin('');
    setFValorMax('');
  };

  const filtered = useMemo(() => {
    const min = parseFloat(fValorMin.replace(',', '.'));
    const max = parseFloat(fValorMax.replace(',', '.'));
    const list = rows.filter((r) => {
      if (fNumero && !matchesNumero(r.numero, fNumero)) return false;
      if (fClienteId && clienteKey(r) !== fClienteId) return false;
      if (fMes && r.competencia?.slice(5, 7) !== fMes) return false;
      if (fAno && r.competencia?.slice(0, 4) !== fAno) return false;
      if (fStatus && r.status !== fStatus) return false;
      if (!Number.isNaN(min) && (r.valor ?? -Infinity) < min) return false;
      if (!Number.isNaN(max) && (r.valor ?? Infinity) > max) return false;
      return true;
    });
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => factor * compareBy(sort.field, a, b));
  }, [rows, fNumero, fClienteId, fMes, fAno, fStatus, fValorMin, fValorMax, sort]);

  const hasFilters = Boolean(fNumero || fClienteId || fMes || fAno || fStatus || fValorMin || fValorMax);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('list.title')}</Text>
          <Text style={styles.subtitle}>{t('list.subtitle')}</Text>
        </View>
        <View style={styles.actions}>
          {showDevTools ? (
            <Pressable
              style={({ pressed }) => [styles.dangerBtn, pressed && styles.pressed]}
              onPress={handleClearAll}
              disabled={clearing}
            >
              {clearing ? (
                <ActivityIndicator size="small" color="#fecaca" />
              ) : (
                <Feather name="trash-2" size={14} color="#fecaca" />
              )}
              <Text style={styles.dangerText}>{t('list.clearAll')}</Text>
            </Pressable>
          ) : null}
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={() => router.push('/contabilidade/notas-fiscais/upload')}
          >
            <Feather name="upload" size={16} color="#f8fafc" />
            <Text style={styles.primaryText}>{t('list.uploadButton')}</Text>
          </Pressable>
        </View>
      </View>

      {/* Filtros / busca */}
      <View style={styles.filters}>
        <FilterText label={t('list.filters.numero')} value={fNumero} onChange={setFNumero} placeholder={t('list.filters.numeroPlaceholder')} width={150} />
        <SearchableSelect label={t('list.filters.cliente')} value={fClienteId} options={clienteOptions} onChange={setFClienteId} placeholder={t('list.options.clienteAll')} width={200} />
        <FilterSelect label={t('list.filters.mes')} value={fMes} options={MESES} onChange={setFMes} />
        <FilterSelect label={t('list.filters.ano')} value={fAno} options={anoOptions} onChange={setFAno} />
        <FilterText label={t('list.filters.valorMin')} value={fValorMin} onChange={setFValorMin} placeholder={t('list.filters.valorPlaceholder')} width={110} numeric />
        <FilterText label={t('list.filters.valorMax')} value={fValorMax} onChange={setFValorMax} placeholder={t('list.filters.valorPlaceholder')} width={110} numeric />
        <FilterSelect label={t('list.filters.status')} value={fStatus} options={STATUS_OPTIONS} onChange={setFStatus} />
        {hasFilters ? (
          <Pressable style={({ pressed }) => [styles.clearFilters, pressed && styles.pressed]} onPress={clearFilters}>
            <Feather name="x" size={14} color="#cbd5e1" />
            <Text style={styles.secondaryText}>{t('list.filters.clear')}</Text>
          </Pressable>
        ) : null}
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
      ) : rows.length === 0 ? (
        <Text style={styles.empty}>{t('list.empty')}</Text>
      ) : (
        <View style={styles.table}>
          <View style={[styles.tr, styles.thead]}>
            <SortHeader label={t('list.headers.numero')} field="numero" style={styles.cNum} sort={sort} onSort={onSort} />
            <SortHeader label={t('list.headers.competencia')} field="competencia" style={styles.cDate} sort={sort} onSort={onSort} />
            <SortHeader label={t('list.headers.cliente')} field="cliente" style={styles.cClient} sort={sort} onSort={onSort} />
            <SortHeader label={t('list.headers.valor')} field="valor" style={styles.cValue} sort={sort} onSort={onSort} />
            <SortHeader label={t('list.headers.status')} field="status" style={styles.cStatus} sort={sort} onSort={onSort} />
            <Text style={[styles.th, styles.cFile]}>{t('list.headers.file')}</Text>
            <Text style={[styles.th, styles.cActions]}>{t('list.headers.actions')}</Text>
          </View>
          {filtered.length === 0 ? (
            <Text style={styles.noMatch}>{t('list.noMatch')}</Text>
          ) : (
            filtered.map((r) => (
              <View key={r.id} style={styles.tr}>
                <Text style={[styles.td, styles.cNum]} numberOfLines={1}>{r.numero}</Text>
                <Text style={[styles.td, styles.cDate]}>{formatDate(r.competencia)}</Text>
                <Text style={[styles.td, styles.cClient]} numberOfLines={1}>{r.cliente ?? '—'}</Text>
                <Text style={[styles.td, styles.cValue]} numberOfLines={1}>{valorLabel(r)}</Text>
                <View style={styles.cStatus}>
                  <StatusBadge status={r.status} />
                </View>
                <View style={styles.cFile}>
                  <Pressable onPress={() => Linking.openURL(r.downloadURL)} hitSlop={6}>
                    <Text style={styles.link}>{t('list.download')}</Text>
                  </Pressable>
                </View>
                <View style={styles.cActions}>
                  {deletingId === r.id ? (
                    <ActivityIndicator size="small" color="#f87171" />
                  ) : (
                    <Pressable onPress={() => handleDelete(r)} hitSlop={6}>
                      <Feather name="trash-2" size={16} color="#f87171" />
                    </Pressable>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

/** Stable key for a nota's client: id, else name, else "no client". */
function clienteKey(r: NotaFiscalRecord): string {
  if (!r.cliente && !r.clientId) return '__none__';
  return r.clientId ? `id:${r.clientId}` : `name:${r.cliente}`;
}

/** Matches a número by plain substring, or by "ano/sequência" (ex.: "2023/8" → 202300000000008). */
function matchesNumero(numero: string, query: string): boolean {
  const q = query.trim();
  if (!q) return true;
  if (numero.includes(q)) return true;
  const parts = q.split(/[/-]/);
  if (parts.length >= 2) {
    const yearPart = parts[0].trim();
    const seqPart = parts[1].trim();
    if (yearPart && numero.startsWith(yearPart)) {
      if (!seqPart) return true;
      const seq = parseInt(seqPart, 10);
      const tail = parseInt(numero.slice(yearPart.length), 10);
      if (!Number.isNaN(seq) && seq === tail) return true;
    }
  }
  return false;
}

function compareBy(field: SortField, a: NotaFiscalRecord, b: NotaFiscalRecord): number {
  switch (field) {
    case 'numero': {
      const na = Number(a.numero);
      const nb = Number(b.numero);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      return a.numero.localeCompare(b.numero);
    }
    case 'competencia':
      return (a.competencia ?? '').localeCompare(b.competencia ?? '');
    case 'cliente':
      return (a.cliente ?? '').localeCompare(b.cliente ?? '');
    case 'valor':
      return (a.valor ?? 0) - (b.valor ?? 0);
    case 'status':
      return a.status.localeCompare(b.status);
    default:
      return 0;
  }
}

function SortHeader({
  label,
  field,
  style,
  sort,
  onSort,
}: {
  label: string;
  field: SortField;
  style: object;
  sort: SortState;
  onSort: (f: SortField) => void;
}) {
  const active = sort.field === field;
  return (
    <Pressable style={[styles.thCell, style]} onPress={() => onSort(field)}>
      <Text style={styles.th}>{label}</Text>
      {active ? <Feather name={sort.dir === 'asc' ? 'chevron-up' : 'chevron-down'} size={12} color="#cbd5e1" /> : null}
    </Pressable>
  );
}

function FilterText({
  label,
  value,
  onChange,
  placeholder,
  width,
  numeric,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  width: number;
  numeric?: boolean;
}) {
  return (
    <View style={{ width }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.filterInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        keyboardType={numeric ? 'numeric' : 'default'}
        autoCapitalize="none"
      />
    </View>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <View style={{ width: 160 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable style={styles.selectBox} onPress={() => setOpen(true)}>
        <Text style={styles.selectText} numberOfLines={1}>{current?.label ?? 'Todos'}</Text>
        <Feather name="chevron-down" size={16} color="#94a3b8" />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.selectOverlay} onPress={() => setOpen(false)}>
          <View style={styles.selectMenu}>
            <ScrollView>
              {options.map((o) => (
                <Pressable
                  key={o.value || 'all'}
                  style={({ pressed }) => [styles.selectOption, pressed && styles.pressed]}
                  onPress={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.selectOptionText, o.value === value && styles.selectOptionActive]}>{o.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function StatusBadge({ status }: { status: NotaFiscalStatus }) {
  const { t } = useTranslation('notasFiscais');
  const cancelada = status === 'Cancelada';
  return (
    <Text style={[styles.badge, cancelada ? styles.badgeDanger : styles.badgeOk]}>
      {cancelada ? t('status.canceled') : t('status.issued')}
    </Text>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

function formatCurrency(value: number | null): string {
  if (value == null) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** "R$ 47.732,14" or, with foreign currency, "R$ 47.732,14 (US$ 8.950,00)". */
function valorLabel(r: NotaFiscalRecord): string {
  const brl = formatCurrency(r.valor);
  const foreign = formatForeignValue(r.valorMoeda, r.moeda);
  return foreign ? `${brl} (${foreign})` : brl;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 },
  title: { color: '#f8fafc', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#94a3b8', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8,
  },
  primaryText: { color: '#f8fafc', fontWeight: '600', fontSize: 13 },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8,
  },
  secondaryText: { color: '#cbd5e1', fontSize: 13 },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#3f1d1d', borderWidth: 1, borderColor: '#7f1d1d',
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8,
  },
  dangerText: { color: '#fecaca', fontSize: 13, fontWeight: '600' },
  pressed: { opacity: 0.85 },
  filters: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end',
    marginTop: 20, padding: 14, backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#1f2937', borderRadius: 10,
  },
  fieldLabel: { color: '#94a3b8', fontSize: 11, marginBottom: 4, textTransform: 'uppercase' },
  filterInput: {
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 9, color: '#f8fafc', fontSize: 14,
  },
  selectBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6,
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 9,
  },
  selectText: { color: '#f8fafc', fontSize: 14, flex: 1 },
  selectOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  selectMenu: { width: '100%', maxWidth: 320, maxHeight: 360, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, paddingVertical: 6 },
  selectOption: { paddingHorizontal: 14, paddingVertical: 11 },
  selectOptionText: { color: '#cbd5e1', fontSize: 14 },
  selectOptionActive: { color: '#60a5fa', fontWeight: '700' },
  clearFilters: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8, borderWidth: 1, borderColor: '#334155',
  },
  errorBox: { backgroundColor: '#7f1d1d', padding: 12, borderRadius: 6, marginTop: 16 },
  errorText: { color: '#fecaca' },
  center: { paddingVertical: 40, alignItems: 'center' },
  empty: { color: '#94a3b8', marginTop: 24 },
  noMatch: { color: '#94a3b8', padding: 16 },
  table: { marginTop: 16, borderWidth: 1, borderColor: '#1f2937', borderRadius: 10, overflow: 'hidden', backgroundColor: '#0b1220' },
  tr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f2937', gap: 8 },
  thead: { backgroundColor: '#111827' },
  thCell: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  th: { color: '#94a3b8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  td: { color: '#e2e8f0', fontSize: 14 },
  cNum: { width: 160 },
  cDate: { width: 150 },
  cClient: { flex: 1, minWidth: 140 },
  cValue: { width: 220 },
  cStatus: { width: 130 },
  cFile: { width: 90 },
  cActions: { width: 70, alignItems: 'center', textAlign: 'center' },
  link: { color: '#60a5fa', fontWeight: '600', fontSize: 13 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, fontSize: 11, fontWeight: '700', overflow: 'hidden', alignSelf: 'flex-start' },
  badgeOk: { backgroundColor: '#064e3b', color: '#a7f3d0' },
  badgeDanger: { backgroundColor: '#7f1d1d', color: '#fecaca' },
});
