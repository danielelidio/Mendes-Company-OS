import { StyleSheet, TextInput, type StyleProp, type TextStyle } from 'react-native';
import { formatMoney } from '../services/money';
import type { InvoiceCurrency } from '../types';

/**
 * Campo de preço que formata o valor na moeda selecionada conforme se digita.
 * Os dígitos digitados são interpretados como unidades menores (centavos):
 * digitar "5000" com USD vira "$50.00"; "172" vira "$1.72".
 */
export function CurrencyInput({
  value,
  currency,
  onChangeValue,
  accessibilityLabel,
  style,
}: {
  /** Valor numérico atual. */
  value: number;
  /** Moeda usada na formatação. */
  currency: InvoiceCurrency;
  /** Disparado com o novo valor numérico. */
  onChangeValue: (value: number) => void;
  accessibilityLabel?: string;
  style?: StyleProp<TextStyle>;
}) {
  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    const cents = digits ? parseInt(digits, 10) : 0;
    onChangeValue(cents / 100);
  };

  return (
    <TextInput
      style={[styles.input, style]}
      value={formatMoney(value, currency)}
      onChangeText={handleChange}
      keyboardType="numeric"
      inputMode="numeric"
      placeholderTextColor="#64748b"
      accessibilityLabel={accessibilityLabel}
    />
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#f8fafc', fontSize: 14 },
});
