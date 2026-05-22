import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

/** Idiomas disponíveis (autônimos: cada um no próprio idioma). */
const LANGUAGES = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
];

/** Seletor de idioma (topo-direito): troca o idioma do app em tempo real. */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const current = (i18n.resolvedLanguage ?? i18n.language ?? 'pt').slice(0, 2);
  const currentLabel = LANGUAGES.find((l) => l.code === current)?.label ?? 'Português';

  return (
    <View>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={() => setOpen(true)}
        accessibilityLabel={t('language.switch')}
      >
        <Feather name="globe" size={16} color="#cbd5e1" />
        <Text style={styles.text}>{currentLabel}</Text>
        <Feather name="chevron-down" size={16} color="#94a3b8" />
      </Pressable>

      {open ? (
        <Modal visible transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
            <View style={styles.menu}>
              {LANGUAGES.map((l) => (
                <Pressable
                  key={l.code}
                  style={({ pressed }) => [styles.item, pressed && styles.pressed]}
                  onPress={() => {
                    setOpen(false);
                    void i18n.changeLanguage(l.code);
                  }}
                >
                  <Text style={[styles.itemText, l.code === current && styles.itemActive]}>{l.label}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
  },
  text: { color: '#e2e8f0', fontSize: 13, fontWeight: '600' },
  pressed: { opacity: 0.85 },
  overlay: { flex: 1, alignItems: 'flex-end', justifyContent: 'flex-start', paddingTop: 56, paddingRight: 16 },
  menu: { width: 180, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, overflow: 'hidden' },
  item: { paddingHorizontal: 14, paddingVertical: 12 },
  itemText: { color: '#cbd5e1', fontSize: 14 },
  itemActive: { color: '#60a5fa', fontWeight: '700' },
});
