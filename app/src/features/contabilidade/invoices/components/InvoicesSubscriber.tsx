import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { subscribeInvoices } from '../services/invoicesRepo';
import { invoicesError, invoicesReceived } from '../store/invoicesSlice';

/** Mantém o slice de invoices em sincronia (tempo real) enquanto autenticado. Renderiza nada. */
export function InvoicesSubscriber() {
  const dispatch = useAppDispatch();
  useEffect(
    () =>
      subscribeInvoices(
        (items) => dispatch(invoicesReceived(items)),
        (e) => dispatch(invoicesError(e.message)),
      ),
    [dispatch],
  );
  return null;
}
