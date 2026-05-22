import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export type SelectOption = { value: string; label: string };

/** A select whose dropdown has a search field to filter the options. */
export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  width = 200,
}: {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number;
}) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const current = options.find((o) => o.value === value);
  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <View style={{ width }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={styles.box} onPress={() => setOpen(true)}>
        <Text style={styles.boxText} numberOfLines={1}>{current?.label ?? placeholder ?? t('search.select')}</Text>
        <Feather name="chevron-down" size={16} color="#94a3b8" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.overlay} onPress={close}>
          <Pressable style={styles.menu} onPress={() => {}}>
            <View style={styles.searchRow}>
              <Feather name="search" size={15} color="#64748b" />
              <TextInput
                style={styles.search}
                value={query}
                onChangeText={setQuery}
                placeholder={t('search.placeholder')}
                placeholderTextColor="#64748b"
                autoFocus
                autoCapitalize="none"
              />
            </View>
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {filtered.length === 0 ? (
                <Text style={styles.noResult}>{t('search.noResults')}</Text>
              ) : (
                filtered.map((o) => (
                  <Pressable
                    key={o.value || 'all'}
                    style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                    onPress={() => {
                      onChange(o.value);
                      close();
                    }}
                  >
                    <Text style={[styles.optionText, o.value === value && styles.optionActive]} numberOfLines={1}>
                      {o.label}
                    </Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: '#94a3b8', fontSize: 11, marginBottom: 4, textTransform: 'uppercase' },
  box: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6,
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 9,
  },
  boxText: { color: '#f8fafc', fontSize: 14, flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  menu: { width: '100%', maxWidth: 360, maxHeight: 420, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 8 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 10,
  },
  search: { flex: 1, color: '#f8fafc', fontSize: 14, paddingVertical: 9 },
  list: { marginTop: 6 },
  option: { paddingHorizontal: 10, paddingVertical: 11, borderRadius: 6 },
  optionText: { color: '#cbd5e1', fontSize: 14 },
  optionActive: { color: '#60a5fa', fontWeight: '700' },
  pressed: { opacity: 0.7 },
  noResult: { color: '#64748b', padding: 12 },
});
