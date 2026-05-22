import i18n from 'i18next';
import type { ClientDocumentType } from '../types';

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function formatCPF(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length > 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length > 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0, 3)}.${d.slice(3)}`;
  return d;
}

function formatCNPJ(value: string): string {
  const d = onlyDigits(value).slice(0, 14);
  if (d.length > 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  if (d.length > 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  if (d.length > 5) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length > 2) return `${d.slice(0, 2)}.${d.slice(2)}`;
  return d;
}

// SSN and ITIN share the 000-00-0000 (3-2-4) shape.
function formatSSN(value: string): string {
  const d = onlyDigits(value).slice(0, 9);
  if (d.length > 5) return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
  if (d.length > 3) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return d;
}

// EIN is 00-0000000 (2-7).
function formatEIN(value: string): string {
  const d = onlyDigits(value).slice(0, 9);
  if (d.length > 2) return `${d.slice(0, 2)}-${d.slice(2)}`;
  return d;
}

/** Masks a document according to its type. Generic NIF / none pass through. */
export function formatDocument(value: string, type: ClientDocumentType): string {
  if (type === 'CPF') return formatCPF(value);
  if (type === 'CNPJ') return formatCNPJ(value);
  if (type === 'SSN' || type === 'ITIN') return formatSSN(value);
  if (type === 'EIN') return formatEIN(value);
  return value;
}

export function documentPlaceholder(type: ClientDocumentType): string {
  switch (type) {
    case 'CPF':
      return '000.000.000-00';
    case 'CNPJ':
      return '00.000.000/0000-00';
    case 'SSN':
      return '000-00-0000';
    case 'ITIN':
      return '900-00-0000';
    case 'EIN':
      return '00-0000000';
    case 'NIF':
      return 'NIF do exterior';
    default:
      return '';
  }
}

/** The NIF sub-types shown when "NIF" is selected (last one is the generic catch-all). */
export const NIF_SUBTYPES: { value: ClientDocumentType; label: string }[] = [
  { value: 'SSN', label: 'SSN' },
  { value: 'ITIN', label: 'ITIN' },
  { value: 'EIN', label: 'EIN' },
  { value: 'NIF', label: 'Outro' },
];

export function isNifType(type: ClientDocumentType): boolean {
  return type === 'SSN' || type === 'ITIN' || type === 'EIN' || type === 'NIF';
}

/** Quantidade de dígitos esperada para o tipo, ou null quando não há tamanho fixo (NIF/Nenhum). */
export function expectedDocumentDigits(type: ClientDocumentType): number | null {
  switch (type) {
    case 'CPF':
      return 11;
    case 'CNPJ':
      return 14;
    case 'SSN':
    case 'ITIN':
    case 'EIN':
      return 9;
    default:
      return null;
  }
}

/**
 * Valida o documento. Retorna a mensagem de erro ou null se válido.
 * - Tipo selecionado + documento vazio → obrigatório.
 * - Documento preenchido → confere o tamanho esperado do tipo (quando há um).
 */
export function validateDocument(document: string, type: ClientDocumentType): string | null {
  const value = document.trim();
  if (value === '') return type ? i18n.t('clientes:validation.documentRequired') : null;
  const expected = expectedDocumentDigits(type);
  if (expected != null && value.replace(/\D/g, '').length !== expected) {
    return i18n.t('clientes:validation.documentInvalid', { type, digits: expected });
  }
  return null;
}

/** Comparable form (alphanumerics only, lowercased) — masks don't affect matching. */
export function normalizeDocument(value: string | null | undefined): string {
  return (value ?? '').replace(/[^a-z0-9]/gi, '').toLowerCase();
}
