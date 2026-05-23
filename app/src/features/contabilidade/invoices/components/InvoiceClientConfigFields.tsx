import type { Dispatch, SetStateAction } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SearchableSelect } from '@/components/SearchableSelect';
import { CurrencyInput } from './CurrencyInput';
import { CLIENT_CODE_LENGTH, SERVICE_UNITS, SUPPORTED_CURRENCIES, type InvoiceCurrency, type ServiceUnit } from '../types';
import type { PredefinedServiceDraft } from '../services/predefinedServiceDraft';

// Helpers de rascunho ficam num módulo puro (testável/reusável); reexportados por conveniência.
export { toServiceDrafts, fromServiceDrafts, type PredefinedServiceDraft } from '../services/predefinedServiceDraft';

/** Campos de configuração de invoice de um cliente (controlado), reusado na tela e no modal. */
export function InvoiceClientConfigFields({
  code,
  onCodeChange,
  onCodeBlur,
  codeError,
  currency,
  onCurrencyChange,
  unit,
  onUnitChange,
  services,
  onServicesChange,
  terms,
  onTermsChange,
  inputBg = '#1e293b',
}: {
  code: string;
  onCodeChange: (value: string) => void;
  onCodeBlur?: () => void;
  codeError?: string | null;
  currency: InvoiceCurrency;
  onCurrencyChange: (value: InvoiceCurrency) => void;
  unit: ServiceUnit;
  onUnitChange: (value: ServiceUnit) => void;
  services: PredefinedServiceDraft[];
  onServicesChange: Dispatch<SetStateAction<PredefinedServiceDraft[]>>;
  terms: string[];
  onTermsChange: Dispatch<SetStateAction<string[]>>;
  inputBg?: string;
}) {
  const { t } = useTranslation('invoices');
  const currencyOptions = SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: c }));
  const unitOptions = SERVICE_UNITS.map((u) => ({ value: u, label: t(`form.units.${u}`) }));
  const inputStyle = [styles.input, { backgroundColor: inputBg }];

  const updateService = (i: number, patch: Partial<PredefinedServiceDraft>) =>
    onServicesChange((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const addService = () =>
    onServicesChange((prev) => [...prev, { description: '', unit, pricePerUnit: 0, currency, autofill: false }]);
  const removeService = (i: number) => onServicesChange((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>{t('config.clientCode')}</Text>
        <TextInput
          style={[inputStyle, styles.codeInput, codeError ? styles.inputError : null]}
          value={code}
          onChangeText={(v) => onCodeChange(v.toUpperCase().slice(0, CLIENT_CODE_LENGTH))}
          onBlur={onCodeBlur}
          placeholder={t('config.clientCodePlaceholder')}
          placeholderTextColor="#64748b"
          autoCapitalize="characters"
          maxLength={CLIENT_CODE_LENGTH}
          accessibilityLabel={t('config.clientCode')}
        />
        {codeError ? <Text style={styles.fieldError}>{codeError}</Text> : null}
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>{t('config.defaultCurrency')}</Text>
          <SearchableSelect value={currency} options={currencyOptions} onChange={(v) => onCurrencyChange(v as InvoiceCurrency)} width={140} />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>{t('config.defaultServiceUnit')}</Text>
          <SearchableSelect value={unit} options={unitOptions} onChange={(v) => onUnitChange(v as ServiceUnit)} width={160} />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('config.predefinedServices')}</Text>
        <Pressable style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]} onPress={addService}>
          <Feather name="plus" size={14} color="#cbd5e1" />
          <Text style={styles.addText}>{t('config.addService')}</Text>
        </Pressable>
      </View>
      {services.length === 0 ? <Text style={styles.muted}>{t('config.servicesEmpty')}</Text> : null}
      {services.map((s, i) => (
        <View key={i} style={styles.serviceCard}>
          <View style={styles.serviceTop}>
            <TextInput
              style={[inputStyle, { flex: 1 }]}
              value={s.description}
              onChangeText={(v) => updateService(i, { description: v })}
              placeholder={t('form.services.description')}
              placeholderTextColor="#64748b"
              multiline
            />
            <Pressable onPress={() => removeService(i)} hitSlop={8} accessibilityLabel={t('form.services.remove')}>
              <Feather name="trash-2" size={16} color="#f87171" />
            </Pressable>
          </View>
          <View style={styles.serviceGrid}>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>{t('form.services.unit')}</Text>
              <SearchableSelect value={s.unit} options={unitOptions} onChange={(v) => updateService(i, { unit: v as ServiceUnit })} width={120} />
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>{t('form.services.pricePerUnit')}</Text>
              <CurrencyInput
                style={[styles.priceInput, { backgroundColor: inputBg }]}
                value={s.pricePerUnit}
                currency={s.currency}
                onChangeValue={(v) => updateService(i, { pricePerUnit: v })}
                accessibilityLabel={t('form.services.pricePerUnit')}
              />
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>{t('form.currency')}</Text>
              <SearchableSelect value={s.currency} options={currencyOptions} onChange={(v) => updateService(i, { currency: v as InvoiceCurrency })} width={110} />
            </View>
          </View>
          <Pressable style={styles.checkRow} onPress={() => updateService(i, { autofill: !s.autofill })} accessibilityLabel={t('config.autofill')}>
            <Feather name={s.autofill ? 'check-square' : 'square'} size={18} color={s.autofill ? '#60a5fa' : '#94a3b8'} />
            <Text style={styles.checkLabel}>{t('config.autofill')}</Text>
          </Pressable>
        </View>
      ))}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('config.defaultTerms')}</Text>
        <Pressable style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]} onPress={() => onTermsChange((prev) => [...prev, ''])}>
          <Feather name="plus" size={14} color="#cbd5e1" />
          <Text style={styles.addText}>{t('config.addTerm')}</Text>
        </Pressable>
      </View>
      {terms.map((item, i) => (
        <View key={i} style={styles.stringRow}>
          <TextInput
            style={[inputStyle, { flex: 1 }]}
            value={item}
            onChangeText={(v) => onTermsChange((prev) => prev.map((x, idx) => (idx === i ? v : x)))}
            placeholder={t('config.termPlaceholder')}
            placeholderTextColor="#64748b"
            multiline
          />
          <Pressable onPress={() => onTermsChange((prev) => prev.filter((_, idx) => idx !== i))} hitSlop={8} accessibilityLabel={t('form.terms.remove')}>
            <Feather name="trash-2" size={16} color="#f87171" />
          </Pressable>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 6 },
  label: { color: '#cbd5e1', fontSize: 12, marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#f8fafc', fontSize: 14 },
  codeInput: { width: 120, letterSpacing: 4, fontWeight: '700' },
  priceInput: { width: 120 },
  inputError: { borderColor: '#ef4444' },
  fieldError: { color: '#fca5a5', fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  col: {},
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 6 },
  sectionTitle: { color: '#f8fafc', fontSize: 15, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  addText: { color: '#cbd5e1', fontSize: 13 },
  muted: { color: '#94a3b8', fontSize: 13 },
  serviceCard: { borderWidth: 1, borderColor: '#1f2937', borderRadius: 10, padding: 12, marginBottom: 10, gap: 10 },
  serviceTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { gap: 4 },
  cellLabel: { color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 2 },
  checkLabel: { color: '#cbd5e1', fontSize: 13 },
  stringRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  pressed: { opacity: 0.85 },
});
