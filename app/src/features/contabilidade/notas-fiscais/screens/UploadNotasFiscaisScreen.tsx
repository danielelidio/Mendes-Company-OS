import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { processUpload } from '../store/uploadThunks';
import type { UploadResult } from '../store/uploadSlice';

function resultIcon(status: UploadResult['status']): keyof typeof Feather.glyphMap {
  if (status === 'ok') return 'check-circle';
  if (status === 'duplicate') return 'alert-circle';
  return 'x-circle';
}
function resultColor(status: UploadResult['status']): string {
  if (status === 'ok') return '#4ade80';
  if (status === 'duplicate') return '#fbbf24';
  return '#f87171';
}

export function UploadNotasFiscaisScreen() {
  const { t } = useTranslation('notasFiscais');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { busy, total, results, error } = useAppSelector((s) => s.upload);

  const okCount = results.filter((r) => r.status === 'ok').length;
  const dupCount = results.filter((r) => r.status === 'duplicate').length;

  const handlePick = async () => {
    const picked = await DocumentPicker.getDocumentAsync({
      type: ['application/xml', 'text/xml'],
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (picked.canceled || !picked.assets?.length) return;
    // Dispara o processamento no store: continua em background mesmo se sair da tela.
    dispatch(processUpload(picked.assets));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.back} onPress={() => router.push('/contabilidade/notas-fiscais')} hitSlop={8}>
        <Feather name="arrow-left" size={18} color="#cbd5e1" />
        <Text style={styles.backText}>{t('upload.back')}</Text>
      </Pressable>

      <Text style={styles.title}>{t('upload.title')}</Text>
      <Text style={styles.subtitle}>{t('upload.subtitle')}</Text>

      <Pressable
        style={({ pressed }) => [styles.uploadBtn, busy && styles.disabled, pressed && !busy && styles.pressed]}
        onPress={handlePick}
        disabled={busy}
      >
        {busy ? (
          <>
            <ActivityIndicator color="#f8fafc" />
            <Text style={styles.uploadText}>{t('upload.processing')}</Text>
          </>
        ) : (
          <>
            <Feather name="upload-cloud" size={22} color="#f8fafc" />
            <Text style={styles.uploadText}>{t('upload.selectButton')}</Text>
          </>
        )}
      </Pressable>

      {busy && total > 0 ? (
        <View style={styles.progress}>
          <Text style={styles.progressText}>
            {t('upload.progress', {
              done: results.length,
              total,
              percent: Math.round((results.length / total) * 100),
            })}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round((results.length / total) * 100)}%` }]} />
          </View>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {results.length > 0 ? (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>
            {t('upload.summary', { count: okCount, total })}
            {dupCount > 0 ? t('upload.duplicateSuffix', { count: dupCount }) : ''}
          </Text>
          {results.map((r, i) => (
            <View key={i} style={styles.resultRow}>
              <Feather name={resultIcon(r.status)} size={16} color={resultColor(r.status)} />
              <View style={{ flex: 1 }}>
                <Text style={styles.resultFile} numberOfLines={1}>{r.fileName}</Text>
                <Text
                  style={[
                    styles.resultMsg,
                    r.status === 'error' && styles.resultErr,
                    r.status === 'duplicate' && styles.resultWarn,
                  ]}
                  numberOfLines={2}
                >
                  {r.message}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 24, maxWidth: 720 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, alignSelf: 'flex-start' },
  backText: { color: '#cbd5e1', fontSize: 14 },
  title: { color: '#f8fafc', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#94a3b8', marginTop: 6, marginBottom: 20, lineHeight: 20 },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'flex-start',
    backgroundColor: '#2563eb', paddingHorizontal: 22, paddingVertical: 15, borderRadius: 10,
  },
  disabled: { backgroundColor: '#475569' },
  pressed: { opacity: 0.85 },
  uploadText: { color: '#f8fafc', fontWeight: '700', fontSize: 15 },
  progress: { marginTop: 16, gap: 8, maxWidth: 420 },
  progressText: { color: '#cbd5e1', fontSize: 14, fontWeight: '600' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#1e293b', overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#2563eb', borderRadius: 4 },
  errorBox: { backgroundColor: '#7f1d1d', padding: 12, borderRadius: 6, marginTop: 16 },
  errorText: { color: '#fecaca' },
  results: { marginTop: 24, gap: 10 },
  resultsTitle: { color: '#cbd5e1', fontWeight: '600' },
  resultRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 12,
  },
  resultFile: { color: '#f8fafc', fontSize: 13, fontWeight: '600' },
  resultMsg: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  resultErr: { color: '#fca5a5' },
  resultWarn: { color: '#fcd34d' },
});
