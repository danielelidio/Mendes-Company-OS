import i18n from 'i18next';

/**
 * Contrato de i18n que toda feature implementa: um namespace único + os recursos
 * (bundles) por idioma. O core percorre a lista de features e aplica cada uma.
 */
export interface FeatureI18n {
  /** Namespace único da feature (ex.: 'clientes', 'notasFiscais'). */
  namespace: string;
  /** Bundles por idioma: { en: {...}, pt: {...} }. */
  resources: Record<string, Record<string, unknown>>;
}

/**
 * Registra um contrato de feature na instância padrão do i18next.
 * Funciona standalone (a feature pode virar pacote NPM e ser aplicada por qualquer host).
 */
export function applyFeatureI18n(feature: FeatureI18n): void {
  for (const [lng, bundle] of Object.entries(feature.resources)) {
    i18n.addResourceBundle(lng, feature.namespace, bundle, true, true);
  }
}
