import type { CSSProperties } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
  /** Dica de formato (usada apenas no fallback native). */
  placeholder?: string;
  /** Disparado quando o campo perde o foco. */
  onBlur?: () => void;
};

const inputStyle: CSSProperties = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 8,
  padding: '10px 12px',
  color: '#f8fafc',
  fontSize: 14,
  fontFamily: 'inherit',
  colorScheme: 'dark',
  width: '100%',
  boxSizing: 'border-box',
};

/** Campo de data para web: usa o seletor de data nativo do navegador (`<input type="date">`). */
export function DateField({ label, value, onChange, accessibilityLabel, error, onBlur }: DateFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-label={accessibilityLabel ?? label}
        style={error ? { ...inputStyle, borderColor: '#ef4444' } : inputStyle}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 6 },
  label: { color: '#cbd5e1', fontSize: 12, marginBottom: 4, marginTop: 8 },
  fieldError: { color: '#fca5a5', fontSize: 12, marginTop: 4 },
});
