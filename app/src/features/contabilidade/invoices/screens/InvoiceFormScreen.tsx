import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { SearchableSelect } from '@/components/SearchableSelect';
import { ComboBox } from '@/components/ComboBox';
import { DateField } from '@/components/DateField';
import { CurrencyInput } from '../components/CurrencyInput';
import { InvoiceClientConfigModal } from '../components/InvoiceClientConfigModal';
import { saveInvoice } from '../store/invoicesThunks';
import type { InvoiceInput } from '../services/invoicesRepo';
import { formatMoney, parseAmount } from '../services/money';
import { buildInvoiceNumber, nextSequence } from '../services/invoiceNumber';
import {
  resolveClientCode,
  resolveDefaultCurrency,
  resolveDefaultServiceUnit,
  resolveDefaultTerms,
  resolvePredefinedServices,
} from '../services/invoiceConfigRepo';
import { SERVICE_UNITS, SUPPORTED_CURRENCIES, type InvoiceCurrency, type InvoiceService, type ServiceUnit } from '../types';

/** Linha de serviço em edição no formulário (quantidade como texto; preço numérico). */
type FormService = { description: string; quantity: string; unit: ServiceUnit; pricePerUnit: number };

/**
 * Tela de criar/editar invoice. O número é auto-gerado a partir do código do cliente + data;
 * todos os campos são obrigatórios exceto observações; a descrição do serviço é um combobox
 * dos serviços predefinidos do cliente; serviços marcados como autofill entram pré-preenchidos.
 *
 * @param invoiceId Id da invoice a editar; ausente para criar uma nova.
 */
export function InvoiceFormScreen({ invoiceId }: { invoiceId?: string }) {
  const { t } = useTranslation('invoices');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isEdit = Boolean(invoiceId);
  const invoice = useAppSelector((s) => (invoiceId ? s.invoices.items.find((i) => i.id === invoiceId) : undefined));
  const invoicesLoading = useAppSelector((s) => s.invoices.loading);
  const invoices = useAppSelector((s) => s.invoices.items);
  const clients = useAppSelector((s) => s.clients.items);
  const configByClientId = useAppSelector((s) => s.invoiceConfig.byClientId);

  const [clientId, setClientId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [currency, setCurrency] = useState<InvoiceCurrency>('USD');
  const [services, setServices] = useState<FormService[]>([]);
  const [observations, setObservations] = useState<string[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [termsTouched, setTermsTouched] = useState(false);
  const [currencyTouched, setCurrencyTouched] = useState(false);
  const [servicesTouched, setServicesTouched] = useState(false);
  const [pickedPdf, setPickedPdf] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [configModalOpen, setConfigModalOpen] = useState(false);

  // Preenche o form uma vez por invoice (edição) sem sobrescrever edições do usuário.
  const prefilledId = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!invoice || prefilledId.current === invoice.id) return;
    prefilledId.current = invoice.id;
    setClientId(invoice.clientId);
    setDate(invoice.date ?? '');
    setFrom(invoice.serviceFrom ?? '');
    setTo(invoice.serviceTo ?? '');
    setCurrency(invoice.currency);
    setServices(
      invoice.services.map((s) => ({
        description: s.description,
        quantity: String(s.quantity),
        unit: s.unit,
        pricePerUnit: s.pricePerUnit,
      })),
    );
    setObservations(invoice.observations);
    setTerms(invoice.termsAndConditions);
    setTermsTouched(true);
    setCurrencyTouched(true);
    setServicesTouched(true);
    setExistingFileName(invoice.fileName);
  }, [invoice]);

  const selectedClient = clients.find((c) => c.id === clientId) ?? null;
  const clientConfig = clientId ? configByClientId[clientId] : undefined;
  const clientCode = resolveClientCode(clientConfig);
  const defaultUnit = resolveDefaultServiceUnit(selectedClient?.name ?? null, clientConfig);
  const predefinedServices = resolvePredefinedServices(selectedClient?.name ?? null, clientConfig);
  const predefinedOptions = predefinedServices.map((s, i) => ({ value: String(i), label: s.description }));

  // Em invoices novas, pré-preenche moeda, termos e serviços "autofill" do cliente (até o usuário editá-los).
  useEffect(() => {
    if (isEdit) return;
    const name = selectedClient?.name ?? null;
    if (!termsTouched) setTerms(resolveDefaultTerms(name, clientConfig));
    if (!currencyTouched) setCurrency(resolveDefaultCurrency(name, clientConfig));
    if (!servicesTouched) {
      setServices(
        resolvePredefinedServices(name, clientConfig)
          .filter((s) => s.autofill)
          .map((s) => ({ description: s.description, quantity: '1', unit: s.unit, pricePerUnit: s.pricePerUnit })),
      );
    }
  }, [clientId, clientConfig, selectedClient, isEdit, termsTouched, currencyTouched, servicesTouched]);

  const total = services.reduce((sum, s) => sum + parseAmount(s.quantity) * s.pricePerUnit, 0);
  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));
  const currencyOptions = SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: c }));
  const unitOptions = SERVICE_UNITS.map((u) => ({ value: u, label: t(`form.units.${u}`) }));

  // Sequência: mantém a da invoice quando edita o mesmo cliente; senão, próxima do cliente.
  const sequence =
    isEdit && invoice && clientId === invoice.clientId ? invoice.sequence : nextSequence(invoices, clientId ?? '');
  const generatedNumber = clientCode && date ? buildInvoiceNumber(clientCode, sequence, date) : '';

  // Validações (todos os campos obrigatórios, exceto observações).
  const clientError = !clientId ? t('form.validation.clientRequired') : null;
  const clientCodeError = clientId && !clientCode ? t('form.validation.clientCodeMissing') : null;
  const dateError = !date ? t('form.validation.dateRequired') : null;
  const fromError = !from ? t('form.validation.serviceFromRequired') : null;
  const toError = !to
    ? t('form.validation.serviceToRequired')
    : from && to < from
      ? t('form.validation.serviceToBeforeFrom')
      : null;
  const servicesError =
    services.length === 0
      ? t('form.validation.servicesRequired')
      : services.some((s) => s.description.trim() === '' || parseAmount(s.quantity) <= 0 || s.pricePerUnit <= 0)
        ? t('form.validation.serviceFieldsRequired')
        : null;
  const termsError = terms.filter((x) => x.trim() !== '').length === 0 ? t('form.validation.termsRequired') : null;
  const pdfError = !pickedPdf && !existingFileName ? t('form.validation.pdfRequired') : null;
  const isValid =
    !clientError && !clientCodeError && !dateError && !fromError && !toError && !servicesError && !termsError && !pdfError;

  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));
  const show = (field: string) => submitted || Boolean(touched[field]);
  // Erros de seção (serviços/termos/PDF) não têm blur próprio: aparecem assim que o
  // usuário interage com o formulário (ex.: ao escolher um cliente).
  const engaged = submitted || Object.keys(touched).length > 0;

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/contabilidade/invoices'));

  // Edições do usuário interrompem o pré-preenchimento automático dos serviços.
  const updateService = (i: number, patch: Partial<FormService>) => {
    setServicesTouched(true);
    setServices((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };
  const addService = () => {
    setServicesTouched(true);
    setServices((prev) => [...prev, { description: '', quantity: '1', unit: defaultUnit, pricePerUnit: 0 }]);
  };
  const removeService = (i: number) => {
    setServicesTouched(true);
    setServices((prev) => prev.filter((_, idx) => idx !== i));
  };
  // Escolher um serviço predefinido no combobox preenche descrição, unidade e preço da linha.
  const selectPredefined = (i: number, optionValue: string) => {
    const ps = predefinedServices[Number(optionValue)];
    if (ps) updateService(i, { description: ps.description, unit: ps.unit, pricePerUnit: ps.pricePerUnit });
  };

  // setTerms que marca os termos como editados pelo usuário (interrompe o pré-preenchimento).
  const setTermsEdited: Dispatch<SetStateAction<string[]>> = (value) => {
    setTermsTouched(true);
    setTerms(value);
  };

  const fileLabel = pickedPdf?.name ?? existingFileName;

  const handlePickPdf = async () => {
    const picked = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', multiple: false, copyToCacheDirectory: true });
    if (!picked.canceled && picked.assets?.[0]) setPickedPdf(picked.assets[0]);
  };

  const handleSave = async () => {
    if (!isValid) {
      setSubmitted(true);
      return;
    }
    setSaving(true);
    setError(null);
    const builtServices: InvoiceService[] = services.map((s) => {
      const quantity = parseAmount(s.quantity);
      const pricePerUnit = s.pricePerUnit;
      return { description: s.description.trim(), quantity, unit: s.unit, pricePerUnit, subTotal: quantity * pricePerUnit };
    });
    const input: InvoiceInput = {
      clientId,
      clientName: selectedClient?.name ?? null,
      number: generatedNumber,
      sequence,
      date: date.trim() || null,
      serviceFrom: from.trim() || null,
      serviceTo: to.trim() || null,
      currency,
      services: builtServices,
      total: builtServices.reduce((sum, s) => sum + s.subTotal, 0),
      observations: observations.map((o) => o.trim()).filter(Boolean),
      termsAndConditions: terms.map((x) => x.trim()).filter(Boolean),
    };
    try {
      await dispatch(saveInvoice(input, invoiceId, pickedPdf));
      goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && invoicesLoading && !invoice) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#94a3b8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.back} onPress={goBack} hitSlop={8}>
        <Feather name="arrow-left" size={18} color="#cbd5e1" />
        <Text style={styles.backText}>{t('form.back')}</Text>
      </Pressable>
      <Text style={styles.title}>{isEdit ? t('form.editTitle') : t('form.newTitle')}</Text>

      <View style={styles.field}>
        <Text style={styles.label}>
          {t('form.client')}
          <Text style={styles.required}> *</Text>
        </Text>
        <SearchableSelect
          value={clientId ?? ''}
          options={clientOptions}
          onChange={(v) => {
            const id = v || null;
            setClientId(id);
            markTouched('client');
            // Cliente sem código configurado: abre o modal de configuração na própria página.
            if (!isEdit && id && !configByClientId[id]?.clientCode) setConfigModalOpen(true);
          }}
          placeholder={t('form.clientPlaceholder')}
          width={320}
        />
        {show('client') && clientError ? <Text style={styles.fieldError}>{clientError}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('form.number')}</Text>
        <View style={styles.readonlyBox}>
          <Text
            style={[styles.readonlyText, !generatedNumber && styles.readonlyMuted]}
            accessibilityLabel={t('form.number')}
          >
            {generatedNumber || t('form.numberPending')}
          </Text>
        </View>
        <Text style={styles.hint}>{t('form.numberAuto')}</Text>
        {clientId && clientCodeError ? (
          <Pressable onPress={() => setConfigModalOpen(true)} hitSlop={6}>
            <Text style={[styles.fieldError, styles.fieldErrorLink]}>{clientCodeError}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <DateField
            label={`${t('form.date')} *`}
            value={date}
            onChange={setDate}
            placeholder={t('form.datePlaceholder')}
            onBlur={() => markTouched('date')}
            error={show('date') ? dateError : null}
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>{t('form.currency')}</Text>
          <SearchableSelect
            value={currency}
            options={currencyOptions}
            onChange={(v) => {
              setCurrencyTouched(true);
              setCurrency(v as InvoiceCurrency);
            }}
            width={140}
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.col}>
          <DateField
            label={`${t('form.serviceFrom')} *`}
            value={from}
            onChange={setFrom}
            placeholder={t('form.datePlaceholder')}
            onBlur={() => markTouched('from')}
            error={show('from') ? fromError : null}
          />
        </View>
        <View style={styles.col}>
          <DateField
            label={`${t('form.serviceTo')} *`}
            value={to}
            onChange={setTo}
            placeholder={t('form.datePlaceholder')}
            onBlur={() => markTouched('to')}
            error={show('to') ? toError : null}
          />
        </View>
      </View>

      {/* Serviços */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {t('form.services.title')}
          <Text style={styles.required}> *</Text>
        </Text>
        <Pressable style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]} onPress={addService}>
          <Feather name="plus" size={14} color="#cbd5e1" />
          <Text style={styles.addText}>{t('form.services.add')}</Text>
        </Pressable>
      </View>
      {services.length === 0 ? <Text style={styles.muted}>{t('form.services.empty')}</Text> : null}
      {services.map((s, i) => {
        const subTotal = parseAmount(s.quantity) * s.pricePerUnit;
        // zIndex decrescente: linhas anteriores (e seu dropdown) ficam acima das seguintes.
        return (
          <View key={i} style={[styles.serviceCard, { zIndex: services.length - i }]}>
            <View style={styles.serviceTop}>
              <ComboBox
                style={styles.flex1}
                value={s.description}
                options={predefinedOptions}
                onChangeText={(v) => updateService(i, { description: v })}
                onSelect={(opt) => selectPredefined(i, opt.value)}
                placeholder={t('form.services.description')}
                accessibilityLabel={t('form.services.description')}
              />
              <Pressable onPress={() => removeService(i)} hitSlop={8} accessibilityLabel={t('form.services.remove')}>
                <Feather name="trash-2" size={16} color="#f87171" />
              </Pressable>
            </View>
            <View style={styles.serviceGrid}>
              <View style={styles.cell}>
                <Text style={styles.cellLabel}>{t('form.services.quantity')}</Text>
                <TextInput style={styles.input} value={s.quantity} onChangeText={(v) => updateService(i, { quantity: v })} keyboardType="numeric" placeholderTextColor="#64748b" accessibilityLabel={t('form.services.quantity')} />
              </View>
              <View style={styles.cell}>
                <Text style={styles.cellLabel}>{t('form.services.unit')}</Text>
                <SearchableSelect value={s.unit} options={unitOptions} onChange={(v) => updateService(i, { unit: v as ServiceUnit })} width={120} />
              </View>
              <View style={styles.cell}>
                <Text style={styles.cellLabel}>{t('form.services.pricePerUnit')}</Text>
                <CurrencyInput
                  style={styles.priceInput}
                  value={s.pricePerUnit}
                  currency={currency}
                  onChangeValue={(v) => updateService(i, { pricePerUnit: v })}
                  accessibilityLabel={t('form.services.pricePerUnit')}
                />
              </View>
              <View style={styles.cell}>
                <Text style={styles.cellLabel}>{t('form.services.subTotal')}</Text>
                <Text style={styles.subTotal}>{formatMoney(subTotal, currency)}</Text>
              </View>
            </View>
          </View>
        );
      })}
      {engaged && servicesError ? <Text style={styles.fieldError}>{servicesError}</Text> : null}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{t('form.total')}</Text>
        <Text style={styles.totalValue}>{formatMoney(total, currency)}</Text>
      </View>

      {/* Termos e Condições */}
      <StringList
        title={t('form.terms.title')}
        addLabel={t('form.terms.add')}
        placeholder={t('form.terms.placeholder')}
        items={terms}
        setItems={setTermsEdited}
        required
      />
      {engaged && termsError ? <Text style={styles.fieldError}>{termsError}</Text> : null}

      {/* Observações (opcional) */}
      <StringList
        title={t('form.observations.title')}
        addLabel={t('form.observations.add')}
        placeholder={t('form.observations.placeholder')}
        items={observations}
        setItems={setObservations}
      />

      {/* PDF */}
      <View style={styles.field}>
        <Text style={styles.label}>
          {t('form.pdf.label')}
          <Text style={styles.required}> *</Text>
        </Text>
        <View style={styles.pdfRow}>
          <Pressable style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]} onPress={handlePickPdf}>
            <Feather name="paperclip" size={14} color="#cbd5e1" />
            <Text style={styles.secondaryText}>{fileLabel ? t('form.pdf.change') : t('form.pdf.select')}</Text>
          </Pressable>
          <Text style={styles.muted} numberOfLines={1}>{fileLabel ?? t('form.pdf.noFile')}</Text>
          {pickedPdf ? (
            <Pressable onPress={() => setPickedPdf(null)} hitSlop={8} accessibilityLabel={t('form.pdf.remove')}>
              <Feather name="x" size={16} color="#f87171" />
            </Pressable>
          ) : null}
        </View>
        {engaged && pdfError ? <Text style={styles.fieldError}>{pdfError}</Text> : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Pressable style={({ pressed }) => [styles.ghost, pressed && styles.pressed]} onPress={goBack} disabled={saving}>
          <Text style={styles.ghostText}>{t('common:actions.cancel')}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.primary, (!isValid || saving) && styles.primaryDisabled, pressed && styles.pressed]}
          onPress={handleSave}
          disabled={!isValid || saving}
        >
          {saving ? <ActivityIndicator color="#f8fafc" /> : <Text style={styles.primaryText}>{t('common:actions.save')}</Text>}
        </Pressable>
      </View>

      <InvoiceClientConfigModal
        visible={configModalOpen}
        clientId={clientId}
        clientName={selectedClient?.name ?? null}
        onClose={() => setConfigModalOpen(false)}
      />
    </ScrollView>
  );
}

/** Editor de uma lista de strings (observações/termos): adicionar, editar e remover itens. */
function StringList({
  title,
  addLabel,
  placeholder,
  items,
  setItems,
  required,
}: {
  /** Título da seção. */
  title: string;
  /** Rótulo do botão de adicionar. */
  addLabel: string;
  /** Placeholder de cada item. */
  placeholder: string;
  /** Itens atuais. */
  items: string[];
  /** Atualizador dos itens. */
  setItems: Dispatch<SetStateAction<string[]>>;
  /** Marca a seção como obrigatória (mostra `*`). */
  required?: boolean;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {title}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
        <Pressable style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]} onPress={() => setItems((prev) => [...prev, ''])}>
          <Feather name="plus" size={14} color="#cbd5e1" />
          <Text style={styles.addText}>{addLabel}</Text>
        </Pressable>
      </View>
      {items.map((item, i) => (
        <View key={i} style={styles.stringRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={item}
            onChangeText={(v) => setItems((prev) => prev.map((x, idx) => (idx === i ? v : x)))}
            placeholder={placeholder}
            placeholderTextColor="#64748b"
            multiline
          />
          <Pressable onPress={() => setItems((prev) => prev.filter((_, idx) => idx !== i))} hitSlop={8}>
            <Feather name="trash-2" size={16} color="#f87171" />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 24, maxWidth: 760 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14, alignSelf: 'flex-start' },
  backText: { color: '#cbd5e1', fontSize: 14 },
  title: { color: '#f8fafc', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  field: { marginBottom: 6 },
  label: { color: '#cbd5e1', fontSize: 12, marginBottom: 4, marginTop: 8 },
  required: { color: '#f87171' },
  input: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#f8fafc', fontSize: 14 },
  flex1: { flex: 1 },
  readonlyBox: { backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  readonlyText: { color: '#f8fafc', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  readonlyMuted: { color: '#64748b', fontWeight: '400', letterSpacing: 0 },
  hint: { color: '#64748b', fontSize: 11, marginTop: 4 },
  fieldError: { color: '#fca5a5', fontSize: 12, marginTop: 4 },
  fieldErrorLink: { textDecorationLine: 'underline' },
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  section: { marginTop: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 6 },
  sectionTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  addText: { color: '#cbd5e1', fontSize: 13 },
  muted: { color: '#94a3b8', fontSize: 13 },
  serviceCard: { backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#1f2937', borderRadius: 10, padding: 12, marginBottom: 10, gap: 10 },
  serviceTop: { flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 1 },
  priceInput: { width: 120 },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { gap: 4 },
  cellLabel: { color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' },
  subTotal: { color: '#e2e8f0', fontSize: 14, fontWeight: '600', paddingVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 6 },
  totalLabel: { color: '#94a3b8', fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  totalValue: { color: '#f8fafc', fontSize: 18, fontWeight: '700' },
  stringRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  pdfRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8 },
  secondaryText: { color: '#cbd5e1', fontSize: 13 },
  error: { color: '#fca5a5', fontSize: 13, marginTop: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 24 },
  ghost: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  ghostText: { color: '#cbd5e1', fontWeight: '600', fontSize: 14 },
  pressed: { opacity: 0.85 },
  primary: { backgroundColor: '#2563eb', paddingHorizontal: 22, paddingVertical: 11, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  primaryDisabled: { backgroundColor: '#475569' },
  primaryText: { color: '#f8fafc', fontWeight: '700', fontSize: 14 },
});
