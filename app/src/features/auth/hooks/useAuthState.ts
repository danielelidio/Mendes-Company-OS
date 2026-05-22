import { useAppSelector } from '@/store/hooks';

/**
 * Estado de auth vindo do Redux (alimentado pelo AuthListener).
 * `initializing` é true até a primeira checagem de sessão resolver.
 */
export function useAuthState() {
  return useAppSelector((s) => s.auth);
}
