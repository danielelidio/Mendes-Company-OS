import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { resolveMatch } from '../store/uploadThunks';

/** Modal global de seleção de cliente durante o upload (funciona em qualquer tela). */
export function MatchModal() {
  const { t } = useTranslation('notasFiscais');
  const prompt = useAppSelector((s) => s.upload.prompt);

  return (
    <Modal visible={prompt != null} transparent animationType="fade" onRequestClose={() => resolveMatch('SKIP')}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{t('match.title')}</Text>
          <Text style={styles.subtitle}>
            {t('match.subtitle', { file: prompt?.fileName ?? '', client: prompt?.clientName ?? '' })}
          </Text>

          <ScrollView style={styles.candidates}>
            {prompt?.ranked.map((m) => (
              <Pressable
                key={m.client.id}
                style={({ pressed }) => [styles.candidate, pressed && styles.pressed]}
                onPress={() => resolveMatch(m.client.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.candidateName} numberOfLines={1}>{m.client.name}</Text>
                  <Text style={styles.candidateMeta} numberOfLines={1}>
                    {m.client.document ? `${m.client.documentType ?? 'Doc'}: ${m.client.document}` : t('match.noDocument')}
                  </Text>
                </View>
                <Text style={styles.score}>{Math.round(m.score * 100)}%</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable style={({ pressed }) => [styles.ghost, pressed && styles.pressed]} onPress={() => resolveMatch('SKIP')}>
              <Text style={styles.ghostText}>{t('match.skip')}</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.primary, pressed && styles.pressed]} onPress={() => resolveMatch('CREATE')}>
              <Feather name="plus" size={15} color="#f8fafc" />
              <Text style={styles.primaryText}>{t('match.createNew')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { width: '100%', maxWidth: 460, backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155', padding: 20 },
  title: { color: '#f8fafc', fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#94a3b8', fontSize: 13, marginTop: 8, lineHeight: 19 },
  bold: { color: '#e2e8f0', fontWeight: '700' },
  candidates: { maxHeight: 260, marginTop: 16 },
  candidate: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 12, marginBottom: 8,
  },
  candidateName: { color: '#f8fafc', fontSize: 14, fontWeight: '600' },
  candidateMeta: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  score: { color: '#60a5fa', fontWeight: '700', fontSize: 13 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  ghost: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  ghostText: { color: '#cbd5e1', fontWeight: '600', fontSize: 13 },
  primary: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  primaryText: { color: '#f8fafc', fontWeight: '700', fontSize: 13 },
  pressed: { opacity: 0.85 },
});
