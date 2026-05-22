import type { FeatureI18n } from '@/i18n/contract';

export const CLIENTES_NS = 'clientes';

const en = {
  list: {
    title: 'Clients',
    newClient: 'New client',
    headerName: 'Name',
    headerDocument: 'Document',
    headerAddress: 'Address',
    headerActions: 'Actions',
    empty: 'No clients yet. Create one or import invoices.',
    confirmDelete: 'Delete client “{{name}}”?',
    editAria: 'Edit {{name}}',
    deleteAria: 'Delete {{name}}',
  },
  form: {
    newTitle: 'New client',
    editTitle: 'Edit client',
    back: 'Clients',
    name: 'Name',
    documentType: 'Document type',
    nifType: 'NIF type',
    document: 'Document',
    none: 'None',
    other: 'Other',
    street: 'Street',
    number: 'Number',
    complement: 'Complement',
    district: 'District',
    city: 'City',
    state: 'State / Province',
    zip: 'ZIP',
    country: 'Country (BR, US…)',
    notFound: 'Client not found.',
  },
  validation: {
    nameRequired: 'Enter the client name.',
    documentRequired: 'Enter the document for the selected type.',
    documentInvalid: 'Invalid document: {{type}} must have {{digits}} digits.',
  },
};

const pt: typeof en = {
  list: {
    title: 'Clientes',
    newClient: 'Novo cliente',
    headerName: 'Nome',
    headerDocument: 'Documento',
    headerAddress: 'Endereço',
    headerActions: 'Ações',
    empty: 'Nenhum cliente ainda. Crie um ou importe Notas Fiscais.',
    confirmDelete: 'Excluir o cliente “{{name}}”?',
    editAria: 'Editar {{name}}',
    deleteAria: 'Excluir {{name}}',
  },
  form: {
    newTitle: 'Novo cliente',
    editTitle: 'Editar cliente',
    back: 'Clientes',
    name: 'Nome',
    documentType: 'Tipo de documento',
    nifType: 'Tipo de NIF',
    document: 'Documento',
    none: 'Nenhum',
    other: 'Outro',
    street: 'Logradouro',
    number: 'Número',
    complement: 'Complemento',
    district: 'Bairro',
    city: 'Cidade',
    state: 'UF / Estado',
    zip: 'CEP / ZIP',
    country: 'País (BR, US…)',
    notFound: 'Cliente não encontrado.',
  },
  validation: {
    nameRequired: 'Informe o nome do cliente.',
    documentRequired: 'Informe o documento para o tipo selecionado.',
    documentInvalid: 'Documento inválido: {{type}} deve ter {{digits}} dígitos.',
  },
};

/** Contrato i18n da feature `clientes` (traduções próprias — pronto para virar pacote). */
export const clientesI18n: FeatureI18n = { namespace: CLIENTES_NS, resources: { en, pt } };
