import type { FeatureI18n } from '@/i18n/contract';

export const HOME_NS = 'home';

const en = { welcome: 'Welcome', signedIn: 'Signed in', signOut: 'Sign out' };
const pt: typeof en = { welcome: 'Bem-vindo(a)', signedIn: 'Conectado', signOut: 'Sair' };

/** Contrato i18n da feature `home`. */
export const homeI18n: FeatureI18n = { namespace: HOME_NS, resources: { en, pt } };
