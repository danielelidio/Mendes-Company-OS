import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAppDispatch } from '@/store/hooks';
import { authResolved } from '../store/authSlice';

/** Mantém o slice de auth em sincronia com a sessão do Firebase. Renderiza nada. */
export function AuthListener() {
  const dispatch = useAppDispatch();
  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        dispatch(
          authResolved(user ? { uid: user.uid, email: user.email, displayName: user.displayName } : null),
        );
      }),
    [dispatch],
  );
  return null;
}
