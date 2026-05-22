import type { FeatureI18n } from '@/i18n/contract';

export const NOTAS_FISCAIS_NS = 'notasFiscais';

const en = {
  list: {
    title: 'Service Tax Statements',
    subtitle: 'Accounting',
    clearAll: 'Clear all',
    uploadButton: 'Upload issued statements',
    filters: {
      numero: 'Statement no.',
      numeroPlaceholder: 'No. or 2023/8',
      cliente: 'Client',
      mes: 'Month',
      ano: 'Year',
      valorMin: 'Min. amount',
      valorMax: 'Max. amount',
      valorPlaceholder: '0.00',
      status: 'Status',
      clear: 'Clear filters',
    },
    headers: {
      numero: 'Statement No.',
      competencia: 'Service date',
      cliente: 'Client',
      valor: 'Amount',
      status: 'Status',
      file: 'File',
      actions: 'Actions',
    },
    download: 'Download',
    empty: 'No service tax statements yet. Use “Upload issued statements” to send the XMLs.',
    noMatch: 'No statement matches the filters.',
    confirmClearAll: 'Delete ALL service tax statements and their XMLs? This cannot be undone.',
    confirmClearAllLabel: 'Delete all',
    confirmDelete: 'Delete statement {{numero}}? The XML file will also be removed.',
    options: {
      mesAll: 'Month: all',
      anoAll: 'Year: all',
      statusAll: 'Status: all',
      clienteAll: 'Client: all',
      clienteNone: 'No client',
      clienteNoName: '(no name)',
    },
  },
  status: { issued: 'Issued/Normal', canceled: 'Canceled' },
  months: {
    '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June',
    '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December',
  },
  upload: {
    back: 'Service Tax Statements',
    title: 'Upload issued statements',
    subtitle:
      'Send one or more XMLs (Prefeitura de BH or Sistema Nacional). You can leave this screen — processing continues in the background; follow it in the top bar.',
    selectButton: 'Select XMLs',
    processing: 'Processing…',
    progress: 'Processing… {{done}}/{{total}} ({{percent}}%)',
    summary_one: '{{count}} statement imported of {{total}}',
    summary_other: '{{count}} statements imported of {{total}}',
    duplicateSuffix: ' · {{count}} already existing',
    result: {
      duplicate: 'Already imported (No. {{numero}}).',
      skipped: 'Skipped (no client selected).',
      ok: 'No. {{numero}} · {{cliente}} · {{status}}',
      onlyXml: 'Only .xml files are accepted.',
      ignored: '{{count}} file(s) ignored',
    },
    statusBar: 'Uploading service tax statements ({{done}} of {{total}} imported. {{percent}}% complete)',
  },
  match: {
    title: 'Select the client',
    subtitle:
      'Statement {{file}} has client “{{client}}”, which was not matched exactly. Pick the right client or create a new one.',
    noDocument: 'No document',
    skip: 'Skip file',
    createNew: 'Create new client',
  },
};

const pt: typeof en = {
  list: {
    title: 'Notas Fiscais',
    subtitle: 'Contabilidade',
    clearAll: 'Limpar tudo',
    uploadButton: 'Upload de Notas Fiscais já Emitidas',
    filters: {
      numero: 'Nº da nota',
      numeroPlaceholder: 'Nº ou 2023/8',
      cliente: 'Cliente',
      mes: 'Mês',
      ano: 'Ano',
      valorMin: 'Valor mín.',
      valorMax: 'Valor máx.',
      valorPlaceholder: '0,00',
      status: 'Status',
      clear: 'Limpar filtros',
    },
    headers: {
      numero: 'Nr. Nota Fiscal',
      competencia: 'Data de Competência',
      cliente: 'Cliente',
      valor: 'Valor',
      status: 'Status',
      file: 'Arquivo',
      actions: 'Ações',
    },
    download: 'Download',
    empty: 'Nenhuma nota fiscal ainda. Use “Upload de Notas Fiscais já Emitidas” para enviar os XMLs.',
    noMatch: 'Nenhuma nota corresponde aos filtros.',
    confirmClearAll: 'Excluir TODAS as notas fiscais e seus XMLs? Esta ação não pode ser desfeita.',
    confirmClearAllLabel: 'Excluir tudo',
    confirmDelete: 'Excluir a nota {{numero}}? O arquivo XML também será removido.',
    options: {
      mesAll: 'Mês: todos',
      anoAll: 'Ano: todos',
      statusAll: 'Status: todos',
      clienteAll: 'Cliente: todos',
      clienteNone: 'Sem cliente informado',
      clienteNoName: '(sem nome)',
    },
  },
  status: { issued: 'Emitida/Normal', canceled: 'Cancelada' },
  months: {
    '1': 'Janeiro', '2': 'Fevereiro', '3': 'Março', '4': 'Abril', '5': 'Maio', '6': 'Junho',
    '7': 'Julho', '8': 'Agosto', '9': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro',
  },
  upload: {
    back: 'Notas Fiscais',
    title: 'Upload de Notas Fiscais já Emitidas',
    subtitle:
      'Envie um ou mais XMLs (Prefeitura de BH ou Sistema Nacional). Você pode sair desta tela que o processamento continua em segundo plano — acompanhe pela barra no topo.',
    selectButton: 'Selecionar XMLs',
    processing: 'Processando…',
    progress: 'Processando… {{done}}/{{total}} ({{percent}}%)',
    summary_one: '{{count}} nota importada de {{total}}',
    summary_other: '{{count}} notas importadas de {{total}}',
    duplicateSuffix: ' · {{count}} já existente(s)',
    result: {
      duplicate: 'Já importada anteriormente (Nº {{numero}}).',
      skipped: 'Pulado (cliente não selecionado).',
      ok: 'Nº {{numero}} · {{cliente}} · {{status}}',
      onlyXml: 'Apenas arquivos .xml são aceitos.',
      ignored: '{{count}} arquivo(s) ignorado(s)',
    },
    statusBar: 'Fazendo Upload de Notas Fiscais ({{done}} de {{total}} notas importadas. {{percent}}% completo)',
  },
  match: {
    title: 'Selecione o cliente',
    subtitle:
      'A nota {{file}} tem o cliente “{{client}}”, que não foi encontrado exatamente. Escolha o cliente correto ou crie um novo.',
    noDocument: 'Sem documento',
    skip: 'Pular arquivo',
    createNew: 'Criar novo cliente',
  },
};

/** Contrato i18n da feature `notasFiscais` (traduções próprias — pronto para virar pacote). */
export const notasFiscaisI18n: FeatureI18n = { namespace: NOTAS_FISCAIS_NS, resources: { en, pt } };
