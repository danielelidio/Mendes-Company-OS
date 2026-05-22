/** CNPJ/CPF (Brazil); NIF foreign types: SSN, ITIN, EIN (US), or generic NIF. */
export type ClientDocumentType = 'CNPJ' | 'CPF' | 'SSN' | 'ITIN' | 'EIN' | 'NIF' | null;

export interface ClientAddress {
  street: string | null;
  number: string | null;
  complement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  /** 'BR', a country code (e.g. 'US'), 'EX' (exterior), or null when unknown. */
  country: string | null;
}

/** Client data extracted from a NFS-e XML tomador (used to find-or-create a Client). */
export interface ParsedClient {
  name: string | null;
  documentType: ClientDocumentType;
  document: string | null;
  address: ClientAddress | null;
}

/** A client persisted in the `clients` collection. */
export interface Client {
  id: string;
  name: string;
  documentType: ClientDocumentType;
  document: string | null;
  address: ClientAddress | null;
  /** Soft delete — kept in the collection, hidden from the list. */
  deleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const EMPTY_ADDRESS: ClientAddress = {
  street: null,
  number: null,
  complement: null,
  district: null,
  city: null,
  state: null,
  zip: null,
  country: null,
};
