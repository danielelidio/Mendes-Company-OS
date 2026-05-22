import { useLocalSearchParams } from 'expo-router';
import { ClientFormScreen } from '@/features/clientes/screens/ClientFormScreen';

export default function EditarClienteRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const clientId = Array.isArray(id) ? id[0] : id;
  return <ClientFormScreen clientId={clientId} />;
}
