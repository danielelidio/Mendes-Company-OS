import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

export type ComboOption = { value: string; label: string };

/**
 * Combobox editável: campo de texto com um dropdown pesquisável de opções.
 * Permite escolher uma opção predefinida (dispara `onSelect`) ou digitar um
 * texto livre (dispara `onChangeText`).
 */
export function ComboBox({
  value,
  options,
  onChangeText,
  onSelect,
  placeholder,
  style,
  accessibilityLabel,
}: {
  /** Texto atual do campo. */
  value: string;
  /** Opções disponíveis no dropdown. */
  options: ComboOption[];
  /** Disparado a cada digitação (texto livre). */
  onChangeText: (text: string) => void;
  /** Disparado ao escolher uma opção do dropdown. */
  onSelect: (option: ComboOption) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const q = value.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  const showList = open && filtered.length > 0;

  return (
    <View style={[styles.wrap, showList && styles.wrapOpen, style]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        accessibilityLabel={accessibilityLabel ?? placeholder}
      />
      {showList ? (
        <View style={styles.dropdown}>
          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {filtered.map((o) => (
              <Pressable
                key={o.value}
                style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                onPress={() => {
                  onSelect(o);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText} numberOfLines={2}>{o.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  wrapOpen: { zIndex: 1000 },
  input: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#f8fafc', fontSize: 14 },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 1000,
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 8, overflow: 'hidden',
  },
  list: { maxHeight: 200 },
  option: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#0f172a' },
  optionText: { color: '#cbd5e1', fontSize: 13 },
  pressed: { backgroundColor: '#0f172a' },
});
