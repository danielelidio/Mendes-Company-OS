import { Alert, Platform } from 'react-native';

/** Cross-platform confirmation dialog (window.confirm on web, Alert on native). */
export function confirmAction(message: string, confirmLabel = 'Excluir'): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(typeof window !== 'undefined' ? window.confirm(message) : true);
  }
  return new Promise((resolve) => {
    Alert.alert('Confirmar', message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
