import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { subscribeIrpfEntries } from '../services/irpfRepo';
import { irpfError, irpfReceived } from '../store/irpfSlice';

/** Mantém o slice de lançamentos pessoais de IRPF em sincronia (tempo real). Renderiza nada. */
export function IrpfSubscriber() {
  const dispatch = useAppDispatch();
  useEffect(
    () =>
      subscribeIrpfEntries(
        (items) => dispatch(irpfReceived(items)),
        (e) => dispatch(irpfError(e.message)),
      ),
    [dispatch],
  );
  return null;
}
