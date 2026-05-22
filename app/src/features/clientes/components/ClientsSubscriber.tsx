import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { subscribeClients } from '../services/clientsRepo';
import { clientsError, clientsReceived } from '../store/clientsSlice';

/** Mantém o slice de clientes em sincronia (tempo real) enquanto autenticado. Renderiza nada. */
export function ClientsSubscriber() {
  const dispatch = useAppDispatch();
  useEffect(
    () =>
      subscribeClients(
        (items) => dispatch(clientsReceived(items)),
        (e) => dispatch(clientsError(e.message)),
      ),
    [dispatch],
  );
  return null;
}
