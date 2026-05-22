import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';

/** Barra de notificação (topo-direito) do upload rodando em background. */
export function UploadStatusBar() {
  const { t } = useTranslation('notasFiscais');
  const router = useRouter();
  const { busy, total, results } = useAppSelector((s) => s.upload);
  if (!busy || total === 0) return null;

  const done = results.length;
  const percent = Math.round((done / total) * 100);

  return (
    <Pressable
      style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
      onPress={() => router.push('/contabilidade/notas-fiscais/upload')}
      accessibilityLabel={t('upload.title')}
    >
      <ActivityIndicator size="small" color="#93c5fd" />
      <Text style={styles.text} numberOfLines={1}>
        {t('upload.statusBar', { done, total, percent })}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#0b2447', borderWidth: 1, borderColor: '#1d4ed8',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, maxWidth: 460,
  },
  text: { color: '#bfdbfe', fontSize: 13, fontWeight: '600', flexShrink: 1 },
  pressed: { opacity: 0.85 },
});
