import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { applyFeatureI18n, type FeatureI18n } from '@/i18n/contract';
import { commonI18n } from '@/i18n/common';
import { authI18n } from '@/features/auth/i18n';
import { homeI18n } from '@/features/home/i18n';
import { clientesI18n } from '@/features/clientes/i18n';
import { notasFiscaisI18n } from '@/features/contabilidade/notas-fiscais/i18n';
import { invoicesI18n } from '@/features/contabilidade/invoices/i18n';
import { irpfI18n } from '@/features/personal-irpf/i18n';

// Registro de features: cada uma implementa o contrato FeatureI18n.
// Para adicionar uma feature (ou um pacote externo), basta incluir seu contrato aqui.
const FEATURE_I18N: FeatureI18n[] = [commonI18n, authI18n, homeI18n, clientesI18n, notasFiscaisI18n, invoicesI18n, irpfI18n];

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    lng: 'pt', // português é o idioma padrão; trocável em runtime pelo seletor.
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common'],
    resources: {},
    interpolation: { escapeValue: false }, // React já escapa.
    returnNull: false,
  });
}

// Aplica cada feature em um único loop (todas seguem o mesmo contrato).
FEATURE_I18N.forEach(applyFeatureI18n);

export default i18n;
