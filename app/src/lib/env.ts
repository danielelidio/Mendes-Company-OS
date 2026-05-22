// Ambiente do app. `__DEV__` é true apenas no Metro local; em qualquer build
// exportado (dev OU prod no Hosting) é false — por isso usamos uma flag explícita.
export const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV ?? (__DEV__ ? 'local' : 'production');

/** Ferramentas de dev (ex.: botão "Limpar tudo") aparecem em local e no ambiente de desenvolvimento. */
export const showDevTools = __DEV__ || APP_ENV === 'development';
