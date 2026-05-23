import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { SearchableSelect } from '@/components/SearchableSelect';
import {
  InvoiceClientConfigFields,
  fromServiceDrafts,
  toServiceDrafts,
  type PredefinedServiceDraft,
} from '../components/InvoiceClientConfigFields';
import { saveInvoiceConfig } from '../store/invoiceConfigThunks';
import {
  resolveDefaultCurrency,
  resolveDefaultServiceUnit,
  resolveDefaultTerms,
  resolvePredefinedServices,
} from '../services/invoiceConfigRepo';
import type { InvoiceCurrency, ServiceUnit } from '../types';

const CODE_PATTERN = /^[A-Za-z0-9]{2}$/;

/** Tela de configuração de invoice por cliente: código, moeda, unidade, serviços e termos padrão. */
export function InvoiceConfigScreen() {
  const { t } = useTranslation('invoices');
  const dispatch = useAppDispatch();
  const clients = useAppSelector((s) => s.clients.items);
  const configByClientId = useAppSelector((s) => s.invoiceConfig.byClientId);

  const [clientId, setClientId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [currency, setCurrency] = useState<InvoiceCurrency>('USD');
  const [unit, setUnit] = useState<ServiceUnit>('unit');
  const [services, setServices] = useState<PredefinedServiceDraft[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega a configuração do cliente selecionado (uma vez por troca de cliente).
  const loadedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!clientId || loadedFor.current === clientId) return;
    loadedFor.current = clientId;
    const cfg = configByClientId[clientId];
    const name = clients.find((c) => c.id === clientId)?.name ?? null;
    setCode(cfg?.clientCode ?? '');
    setCurrency(resolveDefaultCurrency(name, cfg));
    setUnit(resolveDefaultServiceUnit(name, cfg));
    setServices(toServiceDrafts(resolvePredefinedServices(name, cfg)));
    setTerms(resolveDefaultTerms(name, cfg));
    setTouched(false);
    setSaved(false);
    setError(null);
  }, [clientId, configByClientId, clients]);

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));
  const codeError = code.trim() !== '' && !CODE_PATTERN.test(code.trim()) ? t('config.codeInvalid') : null;
  const canSave = Boolean(clientId) && !codeError && !saving;

  const handleSave = async () => {
    if (!clientId || codeError) {
      setTouched(true);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await dispatch(
        saveInvoiceConfig(clientId, {
          clientCode: code,
          defaultCurrency: currency,
          defaultServiceUnit: unit,
          defaultTerms: terms,
          predefinedServices: fromServiceDrafts(services),
        }),
      );
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('config.title')}</Text>
      <Text style={styles.subtitle}>{t('config.subtitle')}</Text>

      {clients.length === 0 ? (
        <Text style={styles.empty}>{t('config.noClients')}</Text>
      ) : (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>{t('config.selectClient')}</Text>
            <SearchableSelect
              value={clientId ?? ''}
              options={clientOptions}
              onChange={(v) => setClientId(v || null)}
              placeholder={t('config.selectClientPlaceholder')}
              width={320}
            />
          </View>

          {clientId ? (
            <>
              <InvoiceClientConfigFields
                code={code}
                onCodeChange={setCode}
                onCodeBlur={() => setTouched(true)}
                codeError={touched ? codeError : null}
                currency={currency}
                onCurrencyChange={setCurrency}
                unit={unit}
                onUnitChange={setUnit}
                services={services}
                onServicesChange={setServices}
                terms={terms}
                onTermsChange={setTerms}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}
              {saved ? <Text style={styles.saved}>{t('config.saved')}</Text> : null}

              <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [styles.primary, !canSave && styles.primaryDisabled, pressed && styles.pressed]}
                  onPress={handleSave}
                  disabled={!canSave}
                >
                  {saving ? <ActivityIndicator color="#f8fafc" /> : <Text style={styles.primaryText}>{t('config.save')}</Text>}
                </Pressable>
              </View>
            </>
          ) : (
            <Text style={styles.empty}>{t('config.pickClientFirst')}</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 24, maxWidth: 720 },
  title: { color: '#f8fafc', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#94a3b8', marginTop: 2, marginBottom: 16 },
  empty: { color: '#94a3b8', marginTop: 16 },
  field: { marginBottom: 6 },
  label: { color: '#cbd5e1', fontSize: 12, marginBottom: 4, marginTop: 8 },
  error: { color: '#fca5a5', fontSize: 13, marginTop: 12 },
  saved: { color: '#34d399', fontSize: 13, marginTop: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  pressed: { opacity: 0.85 },
  primary: { backgroundColor: '#2563eb', paddingHorizontal: 22, paddingVertical: 11, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  primaryDisabled: { backgroundColor: '#475569' },
  primaryText: { color: '#f8fafc', fontWeight: '700', fontSize: 14 },
});
