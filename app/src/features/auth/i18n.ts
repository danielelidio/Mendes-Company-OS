import type { FeatureI18n } from '@/i18n/contract';

export const AUTH_NS = 'auth';

const en = {
  login: {
    subtitle: 'Sign in to continue',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    submit: 'Sign in',
    errors: {
      invalidEmail: 'Enter a valid email address.',
      disabled: 'This account has been disabled.',
      invalidCredential: 'Invalid email or password.',
      tooManyRequests: 'Too many attempts. Please try again later.',
      network: 'Network error. Check your connection and try again.',
      generic: 'Could not sign in. Please try again.',
    },
  },
  userMenu: { aria: 'User menu', account: 'Account', logout: 'Log out' },
};

const pt: typeof en = {
  login: {
    subtitle: 'Entre para continuar',
    emailLabel: 'Email',
    passwordLabel: 'Senha',
    submit: 'Entrar',
    errors: {
      invalidEmail: 'Informe um email válido.',
      disabled: 'Esta conta foi desativada.',
      invalidCredential: 'Email ou senha inválidos.',
      tooManyRequests: 'Muitas tentativas. Tente novamente mais tarde.',
      network: 'Erro de rede. Verifique sua conexão e tente novamente.',
      generic: 'Não foi possível entrar. Tente novamente.',
    },
  },
  userMenu: { aria: 'Menu do usuário', account: 'Conta', logout: 'Sair' },
};

/** Contrato i18n da feature `auth` (traduções próprias — pronto para virar pacote). */
export const authI18n: FeatureI18n = { namespace: AUTH_NS, resources: { en, pt } };
