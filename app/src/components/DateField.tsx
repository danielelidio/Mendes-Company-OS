import { StyleSheet, Text, TextInput, View } from 'react-native';

/** Propriedades do campo de data (compartilhadas entre web e native). */
export type DateFieldProps = {
  /** Rótulo exibido acima do campo. */
  label: string;
  /** Valor no formato ISO `YYYY-MM-DD` (ou string vazia quando não preenchido). */
  value: string;
  /** Disparado com o novo valor ISO `YYYY-MM-DD` (ou vazio ao limpar). */
  onChange: (value: string) => void;
  /** Rótulo de acessibilidade; usa `label` quando ausente. */
  accessibilityLabel?: string;
  /** Mensagem de erro a exibir; também realça a borda. */
  error?: string | null;
  /** Dica de formato exibida quando o campo está vazio. */
  placeholder?: string;
  /** Disparado quando o campo perde o foco. */
  onBlur?: () => void;
};

/** Campo de data para native: entrada de texto no formato ISO (`YYYY-MM-DD`). */
export function DateField({ label, value, onChange, accessibilityLabel, error, placeholder, onBlur }: DateFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        accessibilityLabel={accessibilityLabel ?? label}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 6 },
  label: { color: '#cbd5e1', fontSize: 12, marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#f8fafc', fontSize: 14 },
  inputError: { borderColor: '#ef4444' },
  fieldError: { color: '#fca5a5', fontSize: 12, marginTop: 4 },
});
