import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { saveInvoiceConfig } from '../store/invoiceConfigThunks';
import {
  resolveDefaultCurrency,
  resolveDefaultServiceUnit,
  resolveDefaultTerms,
  resolvePredefinedServices,
} from '../services/invoiceConfigRepo';
import { InvoiceClientConfigFields, fromServiceDrafts, toServiceDrafts, type PredefinedServiceDraft } from './InvoiceClientConfigFields';
import type { InvoiceCurrency, ServiceUnit } from '../types';

const CODE_PATTERN = /^[A-Za-z0-9]{2}$/;

/**
 * Modal de configuração de invoice de um cliente, usado dentro da criação de invoice
 * para configurar o cliente sem sair da página.
 */
export function InvoiceClientConfigModal({
  visible,
  clientId,
  clientName,
  onClose,
}: {
  visible: boolean;
  clientId: string | null;
  clientName: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation('invoices');
  const dispatch = useAppDispatch();
  const config = useAppSelector((s) => (clientId ? s.invoiceConfig.byClientId[clientId] : undefined));

  const [code, setCode] = useState('');
  const [currency, setCurrency] = useState<InvoiceCurrency>('USD');
  const [unit, setUnit] = useState<ServiceUnit>('unit');
  const [services, setServices] = useState<PredefinedServiceDraft[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega os valores ao abrir (não depende de `config` para não sobrescrever edições).
  useEffect(() => {
    if (!visible || !clientId) return;
    setCode(config?.clientCode ?? '');
    setCurrency(resolveDefaultCurrency(clientName, config));
    setUnit(resolveDefaultServiceUnit(clientName, config));
    setServices(toServiceDrafts(resolvePredefinedServices(clientName, config)));
    setTerms(resolveDefaultTerms(clientName, config));
    setTouched(false);
    setError(null);
    setSaving(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, clientId]);

  const codeError = !CODE_PATTERN.test(code.trim()) ? t('config.codeInvalid') : null;
  const canSave = !codeError && !saving;

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
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  // Renderiza o Modal apenas quando aberto: o Modal do RN Web mantém os filhos no DOM
  // quando `visible=false`, o que gera colisões de seletor (strict mode) nos testes.
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.menu} onPress={() => {}} testID="invoice-config-modal">
          <View style={styles.headerRow}>
            <Feather name="alert-triangle" size={18} color="#fbbf24" />
            <Text style={styles.title}>{t('configModal.title')}</Text>
          </View>
          <Text style={styles.message}>{t('configModal.message', { client: clientName ?? '' })}</Text>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
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
              inputBg="#0f172a"
            />
          </ScrollView>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={({ pressed }) => [styles.ghost, pressed && styles.pressed]} onPress={onClose} disabled={saving}>
              <Text style={styles.ghostText}>{t('configModal.later')}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.primary, !canSave && styles.primaryDisabled, pressed && styles.pressed]}
              onPress={handleSave}
              disabled={!canSave}
            >
              {saving ? <ActivityIndicator color="#f8fafc" /> : <Text style={styles.primaryText}>{t('config.save')}</Text>}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  menu: { width: '100%', maxWidth: 520, maxHeight: '88%', backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 12, padding: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: '#f8fafc', fontSize: 18, fontWeight: '700' },
  message: { color: '#cbd5e1', fontSize: 13, marginTop: 8, lineHeight: 19 },
  scroll: { marginTop: 4 },
  scrollContent: { paddingBottom: 4 },
  error: { color: '#fca5a5', fontSize: 13, marginTop: 10 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  pressed: { opacity: 0.85 },
  ghost: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  ghostText: { color: '#cbd5e1', fontWeight: '600', fontSize: 14 },
  primary: { backgroundColor: '#2563eb', paddingHorizontal: 22, paddingVertical: 11, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  primaryDisabled: { backgroundColor: '#475569' },
  primaryText: { color: '#f8fafc', fontWeight: '700', fontSize: 14 },
});
