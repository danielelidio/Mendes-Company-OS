/** Unidade de cobrança de um serviço da invoice. */
export type ServiceUnit = 'unit' | 'hours' | 'days';

/** Moedas suportadas (selecionável por invoice). */
export type InvoiceCurrency = 'USD' | 'BRL' | 'EUR' | 'GBP';

export const SUPPORTED_CURRENCIES: InvoiceCurrency[] = ['USD', 'BRL', 'EUR', 'GBP'];
export const SERVICE_UNITS: ServiceUnit[] = ['unit', 'hours', 'days'];

/** Quantidade de caracteres do código de cliente usado no número da invoice. */
export const CLIENT_CODE_LENGTH = 2;

/** Serviço predefinido no catálogo de um cliente. */
export interface PredefinedService {
  /** Descrição do serviço. */
  description: string;
  /** Unidade de cobrança. */
  unit: ServiceUnit;
  /** Preço por unidade. */
  pricePerUnit: number;
  /** Moeda do preço por unidade. */
  currency: InvoiceCurrency;
  /** Quando true, entra pré-preenchido em novas invoices; senão, fica só disponível para busca. */
  autofill: boolean;
}

/** Configuração de invoice por cliente (código, moeda/unidade padrão, serviços e termos). */
export interface InvoiceClientConfig {
  /** Id do cliente (também é o id do documento no Firestore). */
  clientId: string;
  /** Código de 2 caracteres do cliente, usado no prefixo do número da invoice. */
  clientCode: string;
  /** Moeda padrão das invoices deste cliente. */
  defaultCurrency: InvoiceCurrency;
  /** Unidade de serviço padrão ao adicionar um serviço em branco. */
  defaultServiceUnit: ServiceUnit;
  /** Termos e condições padrão aplicados a novas invoices deste cliente. */
  defaultTerms: string[];
  /** Catálogo de serviços predefinidos do cliente. */
  predefinedServices: PredefinedService[];
  /** Última atualização (ISO). */
  updatedAt: string;
}

/** Dados editáveis da configuração de invoice de um cliente (sem id/timestamp). */
export type InvoiceClientConfigInput = Omit<InvoiceClientConfig, 'clientId' | 'updatedAt'>;

/** Um item de serviço da invoice. */
export interface InvoiceService {
  /** Descrição do serviço prestado. */
  description: string;
  /** Quantidade cobrada. */
  quantity: number;
  /** Tipo de unidade da quantidade. */
  unit: ServiceUnit;
  /** Preço por unidade. */
  pricePerUnit: number;
  /** Subtotal do item = quantity × pricePerUnit. */
  subTotal: number;
}

/** Invoice (fatura comercial) emitida para um cliente. */
export interface Invoice {
  /** Id do documento no Firestore (`{number}` saneado, ou gerado). */
  id: string;
  /** Cliente para quem a invoice é emitida (id no Firestore). */
  clientId: string | null;
  /** Nome do cliente, desnormalizado para a tabela. */
  clientName: string | null;
  /** Número da invoice (formato `{código}-{seq3}-{ano}-{mês}`). */
  number: string;
  /** Sequência incremental por cliente usada para compor o número. */
  sequence: number;
  /** Data da invoice (ISO YYYY-MM-DD). */
  date: string | null;
  /** Início do período de serviço prestado (ISO YYYY-MM-DD). */
  serviceFrom: string | null;
  /** Fim do período de serviço prestado (ISO YYYY-MM-DD). */
  serviceTo: string | null;
  /** Moeda dos valores. */
  currency: InvoiceCurrency;
  /** Itens de serviço. */
  services: InvoiceService[];
  /** Total = soma dos subtotais. */
  total: number;
  /** Lista de observações. */
  observations: string[];
  /** Lista de termos e condições. */
  termsAndConditions: string[];
  /** Nome do arquivo PDF anexado, se houver. */
  fileName: string | null;
  /** Caminho do PDF no Storage, se houver. */
  storagePath: string | null;
  /** URL de download do PDF, se houver. */
  downloadURL: string | null;
  /** Criação (ISO). */
  createdAt: string;
  /** Última atualização (ISO). */
  updatedAt: string;
}
