import { useLocalSearchParams } from 'expo-router';
import { InvoiceFormScreen } from '@/features/contabilidade/invoices/screens/InvoiceFormScreen';

export default function EditarInvoiceRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoiceId = Array.isArray(id) ? id[0] : id;
  return <InvoiceFormScreen invoiceId={invoiceId} />;
}
