import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { subscribeInvoiceConfigs } from '../services/invoiceConfigRepo';
import { invoiceConfigsError, invoiceConfigsReceived } from '../store/invoiceConfigSlice';

/** Mantém o slice de configuração de invoice em sincronia (tempo real). Renderiza nada. */
export function InvoiceConfigSubscriber() {
  const dispatch = useAppDispatch();
  useEffect(
    () =>
      subscribeInvoiceConfigs(
        (items) => dispatch(invoiceConfigsReceived(items)),
        (e) => dispatch(invoiceConfigsError(e.message)),
      ),
    [dispatch],
  );
  return null;
}
