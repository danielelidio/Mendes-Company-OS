import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { confirmAction } from '@/lib/confirm';
import { DateField } from '@/components/DateField';
import { SearchableSelect } from '@/components/SearchableSelect';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteIrpfEntry, saveIrpfEntry } from '../store/irpfThunks';
import { convertToBrl, rateFor } from '../services/rates';
import {
  IRPF_CATEGORIES,
  IRPF_TYPES,
  type IrpfCategory,
  type IrpfEntry,
  type IrpfType,
} from '../types';

const fmtUsd = (v: number) => v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const fmtBrl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtRate = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

/** Formata uma data ISO `YYYY-MM-DD` como `DD/MM/YYYY`. */
function formatDateBr(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

/** Lista de lançamentos pessoais de IRPF (rendimentos/pagamentos no exterior). */
export function IrpfScreen() {
  const { t } = useTranslation('irpf');
  const dispatch = useAppDispatch();
  const { items, loading, error: loadError } = useAppSelector((s) => s.irpf);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (entry: IrpfEntry) => {
    if (!(await confirmAction(t('confirmDelete')))) return;
    try {
      await dispatch(deleteIrpfEntry(entry.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('title')}</Text>
          <Text style={styles.subtitle}>{t('subtitle')}</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={() => setAdding(true)}>
          <Feather name="plus" size={16} color="#f8fafc" />
          <Text style={styles.primaryText}>{t('add')}</Text>
        </Pressable>
      </View>

      {(error ?? loadError) ? <View style={styles.errorBox}><Text style={styles.errorText}>{error ?? loadError}</Text></View> : null}

      {loading ? (
        <View style={styles.center}><ActivityIndicator color="#94a3b8" /></View>
      ) : items.length === 0 ? (
        <Text style={styles.empty}>{t('empty')}</Text>
      ) : (
        <View style={styles.table}>
          <View style={[styles.tr, styles.thead]}>
            <Text style={[styles.th, styles.cDate]}>{t('headers.date')}</Text>
            <Text style={[styles.th, styles.cType]}>{t('headers.type')}</Text>
            <Text style={[styles.th, styles.cCategory]}>{t('headers.category')}</Text>
            <Text style={[styles.th, styles.cDesc]}>{t('headers.description')}</Text>
            <Text style={[styles.th, styles.cUsd]}>{t('headers.amountUsd')}</Text>
            <Text style={[styles.th, styles.cBrl]}>{t('headers.amountBrl')}</Text>
            <Text style={[styles.th, styles.cRate]}>{t('headers.rate')}</Text>
            <View style={styles.cActions} />
          </View>
          {items.map((entry) => (
            <View key={entry.id} style={styles.tr}>
              <Text style={[styles.td, styles.cDate]}>{formatDateBr(entry.date)}</Text>
              <Text style={[styles.td, styles.cType, entry.type === 'expense' ? styles.expense : styles.income]}>{t(`types.${entry.type}`)}</Text>
              <Text style={[styles.td, styles.cCategory]} numberOfLines={1}>{t(`categories.${entry.category}`)}</Text>
              <Text style={[styles.td, styles.cDesc]} numberOfLines={1}>{entry.description}</Text>
              <Text style={[styles.td, styles.cUsd]}>{fmtUsd(entry.amountUsd)}</Text>
              <Text style={[styles.td, styles.cBrl]}>{fmtBrl(entry.amountBrl)}</Text>
              <Text style={[styles.td, styles.cRate]}>{fmtRate(entry.rateUsdBrl)}</Text>
              <View style={[styles.cActions, styles.actionsCell]}>
                <Pressable onPress={() => handleDelete(entry)} hitSlop={6} accessibilityLabel={t('deleteAria')}>
                  <Feather name="trash-2" size={16} color="#f87171" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {adding ? <AddEntryModal onClose={() => setAdding(false)} /> : null}
    </ScrollView>
  );
}

/** Modal de criação de um lançamento. Converte USD→BRL em tempo real pela taxa oficial do mês. */
function AddEntryModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('irpf');
  const dispatch = useAppDispatch();

  const [date, setDate] = useState('');
  const [type, setType] = useState<IrpfType>('income');
  const [category, setCategory] = useState<IrpfCategory>('general');
  const [amountCents, setAmountCents] = useState(0);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountUsd = amountCents / 100;
  const conversion = useMemo(() => (date && amountUsd > 0 ? convertToBrl(amountUsd, date, type) : null), [date, type, amountUsd]);
  const monthRateAvailable = date ? rateFor(date, type) != null : false;

  const dateError = !date ? t('validation.dateRequired') : null;
  const amountError = amountUsd <= 0 ? t('validation.amountRequired') : null;
  const descriptionError = description.trim() === '' ? t('validation.descriptionRequired') : null;
  const noRate = !!date && !monthRateAvailable;
  const isValid = !dateError && !amountError && !descriptionError && !noRate;

  const categoryOptions = IRPF_CATEGORIES.map((c) => ({ value: c, label: t(`categories.${c}`) }));

  const handleSave = async () => {
    if (!isValid || !conversion) {
      setSubmitted(true);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await dispatch(
        saveIrpfEntry({
          date,
          amountUsd,
          amountBrl: conversion.brl,
          rateUsdBrl: conversion.rate,
          description: description.trim(),
          type,
          category,
        }),
      );
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={() => {}} testID="irpf-add-modal">
          <Text style={styles.modalTitle}>{t('modal.title')}</Text>

          <View style={styles.modalRow}>
            <View style={styles.col}>
              <DateField label={t('modal.date')} value={date} onChange={setDate} error={submitted ? dateError : null} />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>{t('modal.type')}</Text>
              <View style={styles.segments}>
                {IRPF_TYPES.map((tp) => (
                  <Pressable
                    key={tp}
                    style={[styles.segment, type === tp && (tp === 'income' ? styles.segIncome : styles.segExpense)]}
                    onPress={() => setType(tp)}
                  >
                    <Text style={[styles.segmentText, type === tp && styles.segmentTextActive]}>{t(`types.${tp}`)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('modal.category')}</Text>
            <SearchableSelect value={category} options={categoryOptions} onChange={(v) => setCategory(v as IrpfCategory)} placeholder={t('modal.categoryPlaceholder')} width={260} />
          </View>

          <View style={styles.modalRow}>
            <View style={styles.col}>
              <Text style={styles.label}>{t('modal.amountUsd')}</Text>
              <TextInput
                style={styles.input}
                value={fmtUsd(amountCents / 100)}
                onChangeText={(v) => setAmountCents(digitsOnly(v))}
                placeholder={fmtUsd(0)}
                placeholderTextColor="#64748b"
                accessibilityLabel={t('modal.amountUsd')}
                keyboardType="number-pad"
                inputMode="numeric"
              />
              {submitted && amountError ? <Text style={styles.fieldError}>{amountError}</Text> : null}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('modal.description')}</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder={t('modal.descriptionPlaceholder')}
              placeholderTextColor="#64748b"
              accessibilityLabel={t('modal.description')}
              multiline
            />
            {submitted && descriptionError ? <Text style={styles.fieldError}>{descriptionError}</Text> : null}
          </View>

          {conversion ? (
            <View style={styles.previewBox}>
              <Text style={styles.previewLine}>
                {t('modal.rateLine', { rate: fmtRate(conversion.rate), kind: type === 'income' ? t('modal.rateKindCompra') : t('modal.rateKindVenda') })}
              </Text>
              <Text style={styles.previewAmount}>{t('modal.convertedTo')}: {fmtBrl(conversion.brl)}</Text>
            </View>
          ) : null}
          {noRate ? <Text style={styles.warn}>{t('modal.noRate')}</Text> : null}
          {error ? <Text style={styles.fieldError}>{error}</Text> : null}

          <View style={styles.modalActions}>
            <Pressable style={({ pressed }) => [styles.ghost, pressed && styles.pressed]} onPress={onClose} disabled={saving}>
              <Text style={styles.ghostText}>{t('modal.cancel')}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.primary, (!isValid || saving) && styles.disabled, pressed && styles.pressed]}
              onPress={handleSave}
              disabled={!isValid || saving}
            >
              {saving ? <ActivityIndicator color="#f8fafc" /> : <Text style={styles.primaryText}>{t('modal.save')}</Text>}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Acumulador de centavos: cada dígito digitado vira mais um centavo no valor. */
function digitsOnly(v: string): number {
  const d = (v ?? '').replace(/\D/g, '');
  const n = Number(d);
  return Number.isFinite(n) ? n : 0;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 },
  title: { color: '#f8fafc', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#94a3b8', marginTop: 2, maxWidth: 640 },
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
  cDate: { width: 100 },
  cType: { width: 90 },
  cCategory: { width: 110 },
  cDesc: { flex: 1, minWidth: 140 },
  cUsd: { width: 110, textAlign: 'right' },
  cBrl: { width: 130, textAlign: 'right', fontWeight: '700' },
  cRate: { width: 80, textAlign: 'right', color: '#94a3b8' },
  cActions: { width: 40, alignItems: 'flex-end' },
  actionsCell: { flexDirection: 'row', justifyContent: 'flex-end' },
  income: { color: '#34d399' },
  expense: { color: '#f87171' },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { width: '100%', maxWidth: 520, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 12, padding: 18, gap: 4 },
  modalTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  modalRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  col: { flex: 1, minWidth: 200 },
  field: { marginTop: 4 },
  label: { color: '#cbd5e1', fontSize: 12, marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#f8fafc', fontSize: 14 },
  segments: { flexDirection: 'row', gap: 8 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155', backgroundColor: '#0f172a' },
  segIncome: { backgroundColor: '#065f46', borderColor: '#059669' },
  segExpense: { backgroundColor: '#7f1d1d', borderColor: '#b91c1c' },
  segmentText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  segmentTextActive: { color: '#f8fafc' },
  fieldError: { color: '#fca5a5', fontSize: 12, marginTop: 4 },
  warn: { color: '#fbbf24', fontSize: 12, marginTop: 6 },
  previewBox: { marginTop: 10, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#1e3a8a', backgroundColor: '#0b2447', gap: 2 },
  previewLine: { color: '#93c5fd', fontSize: 12 },
  previewAmount: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
  ghost: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  ghostText: { color: '#cbd5e1', fontWeight: '600', fontSize: 13 },
  primary: { backgroundColor: '#2563eb', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 8 },
  disabled: { opacity: 0.6 },
});
