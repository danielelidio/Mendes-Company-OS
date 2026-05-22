import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { saveClient } from '../store/clientsThunks';
import type { ClientInput } from '../services/clientsRepo';
import { documentPlaceholder, formatDocument, isNifType, NIF_SUBTYPES, validateDocument } from '../services/documentFormat';
import type { ClientAddress, ClientDocumentType } from '../types';

export function ClientFormScreen({ clientId }: { clientId?: string }) {
  const { t } = useTranslation('clientes');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isEdit = Boolean(clientId);
  // Cliente (para edição) e estado de carregamento vêm do store de clientes.
  const client = useAppSelector((s) => (clientId ? s.clients.items.find((c) => c.id === clientId) : undefined));
  const clientsLoading = useAppSelector((s) => s.clients.loading);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [docType, setDocType] = useState<ClientDocumentType>(null);
  const [document, setDocument] = useState('');
  const [addr, setAddr] = useState<Record<keyof ClientAddress, string>>({
    street: '', number: '', complement: '', district: '', city: '', state: '', zip: '', country: '',
  });
  const [touched, setTouched] = useState<{ name?: boolean; document?: boolean }>({});

  // Preenche o form uma vez por cliente (sem sobrescrever edições quando o snapshot atualiza).
  const prefilledId = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!client || prefilledId.current === client.id) return;
    prefilledId.current = client.id;
    setName(client.name);
    setDocType(client.documentType);
    setDocument(formatDocument(client.document ?? '', client.documentType));
    const a = client.address;
    setAddr({
      street: a?.street ?? '', number: a?.number ?? '', complement: a?.complement ?? '',
      district: a?.district ?? '', city: a?.city ?? '', state: a?.state ?? '',
      zip: a?.zip ?? '', country: a?.country ?? '',
    });
  }, [client]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/clientes'));
  const setField = (key: keyof ClientAddress, value: string) => setAddr((prev) => ({ ...prev, [key]: value }));

  const selectType = (t: ClientDocumentType) => {
    setDocType(t);
    setDocument('');
    setTouched((prev) => ({ ...prev, document: false }));
  };
  const selectNif = () => {
    if (!isNifType(docType)) selectType('NIF');
  };

  // Validações reativas (rodam a cada render; os erros aparecem após o blur do campo).
  const nameError = name.trim() === '' ? t('validation.nameRequired') : null;
  const documentError = validateDocument(document, docType);
  const isValid = !nameError && !documentError;

  const handleSave = async () => {
    if (!isValid) {
      setTouched({ name: true, document: true });
      return;
    }
    setSaving(true);
    setError(null);
    const norm = (v: string): string | null => (v.trim() === '' ? null : v.trim());
    const addressFields: ClientAddress = {
      street: norm(addr.street), number: norm(addr.number), complement: norm(addr.complement),
      district: norm(addr.district), city: norm(addr.city), state: norm(addr.state),
      zip: norm(addr.zip), country: norm(addr.country),
    };
    const hasAddress = Object.values(addressFields).some((v) => v != null);
    const input: ClientInput = {
      name: name.trim(),
      documentType: docType,
      document: norm(document),
      address: hasAddress ? addressFields : null,
    };
    try {
      await dispatch(saveClient(input, clientId));
      goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && clientsLoading && !client) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#94a3b8" />
      </View>
    );
  }
  if (isEdit && !client) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>{t('form.notFound')}</Text>
        <Pressable style={styles.back} onPress={goBack} hitSlop={8}>
          <Feather name="arrow-left" size={18} color="#cbd5e1" />
          <Text style={styles.backText}>{t('form.back')}</Text>
        </Pressable>
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

      <Field
        label={t('form.name')}
        value={name}
        onChange={setName}
        required
        onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
        error={touched.name ? nameError : null}
      />

      <Text style={styles.label}>{t('form.documentType')}</Text>
      <View style={styles.segments}>
        <Segment label="CNPJ" active={docType === 'CNPJ'} onPress={() => selectType('CNPJ')} />
        <Segment label="CPF" active={docType === 'CPF'} onPress={() => selectType('CPF')} />
        <Segment label="NIF" active={isNifType(docType)} onPress={selectNif} />
        <Segment label={t('form.none')} active={docType === null} onPress={() => selectType(null)} />
      </View>
      {isNifType(docType) ? (
        <>
          <Text style={styles.label}>{t('form.nifType')}</Text>
          <View style={styles.segments}>
            {NIF_SUBTYPES.map((s) => (
              <Segment
                key={s.value ?? 'nif'}
                label={s.value === 'NIF' ? t('form.other') : s.label}
                active={docType === s.value}
                onPress={() => selectType(s.value)}
              />
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.field}>
        <Text style={styles.label}>
          {t('form.document')}
          {docType ? <Text style={styles.required}> *</Text> : null}
        </Text>
        <TextInput
          style={[styles.input, touched.document && documentError ? styles.inputError : null]}
          value={document}
          onChangeText={(v) => setDocument(formatDocument(v, docType))}
          onBlur={() => setTouched((prev) => ({ ...prev, document: true }))}
          placeholder={documentPlaceholder(docType)}
          placeholderTextColor="#64748b"
          keyboardType={docType === 'CPF' || docType === 'CNPJ' ? 'numeric' : 'default'}
          autoCapitalize={docType === 'NIF' ? 'characters' : 'none'}
          accessibilityLabel={t('form.document')}
        />
        {touched.document && documentError ? <Text style={styles.fieldError}>{documentError}</Text> : null}
      </View>
      <Field label={t('form.street')} value={addr.street} onChange={(v) => setField('street', v)} />
      <View style={styles.row}>
        <View style={styles.col}><Field label={t('form.number')} value={addr.number} onChange={(v) => setField('number', v)} /></View>
        <View style={styles.col}><Field label={t('form.complement')} value={addr.complement} onChange={(v) => setField('complement', v)} /></View>
      </View>
      <Field label={t('form.district')} value={addr.district} onChange={(v) => setField('district', v)} />
      <View style={styles.row}>
        <View style={styles.col}><Field label={t('form.city')} value={addr.city} onChange={(v) => setField('city', v)} /></View>
        <View style={styles.col}><Field label={t('form.state')} value={addr.state} onChange={(v) => setField('state', v)} /></View>
      </View>
      <View style={styles.row}>
        <View style={styles.col}><Field label={t('form.zip')} value={addr.zip} onChange={(v) => setField('zip', v)} /></View>
        <View style={styles.col}><Field label={t('form.country')} value={addr.country} onChange={(v) => setField('country', v)} /></View>
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
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  onBlur,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  onBlur?: () => void;
  error?: string | null;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        accessibilityLabel={label}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

function Segment({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.segment, active && styles.segmentActive]} onPress={onPress}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 24, maxWidth: 560 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#0f172a' },
  notFound: { color: '#fca5a5', fontSize: 15 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14, alignSelf: 'flex-start' },
  backText: { color: '#cbd5e1', fontSize: 14 },
  title: { color: '#f8fafc', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  field: { marginBottom: 6 },
  label: { color: '#cbd5e1', fontSize: 12, marginBottom: 4, marginTop: 8 },
  required: { color: '#f87171' },
  input: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#f8fafc', fontSize: 14 },
  inputError: { borderColor: '#ef4444' },
  fieldError: { color: '#fca5a5', fontSize: 12, marginTop: 4 },
  segments: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  segment: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#334155', backgroundColor: '#1e293b' },
  segmentActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  segmentText: { color: '#94a3b8', fontSize: 13 },
  segmentTextActive: { color: '#f8fafc', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  error: { color: '#fca5a5', fontSize: 13, marginTop: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  ghost: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  ghostText: { color: '#cbd5e1', fontWeight: '600', fontSize: 14 },
  pressed: { opacity: 0.85 },
  primary: { backgroundColor: '#2563eb', paddingHorizontal: 22, paddingVertical: 11, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  primaryDisabled: { backgroundColor: '#475569' },
  primaryText: { color: '#f8fafc', fontWeight: '700', fontSize: 14 },
});
