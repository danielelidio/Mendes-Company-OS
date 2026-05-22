import type { ParsedClient } from '@/features/clientes/types';

export type NotaFiscalSource = 'prefeitura-bh' | 'sistema-nacional';

export type NotaFiscalStatus = 'Emitida/Normal' | 'Cancelada';

/** Data extracted from a NFS-e XML (Prefeitura BH or Sistema Nacional). */
export interface ParsedNotaFiscal {
  numero: string;
  /** Service period (Data de Competência), ISO YYYY-MM-DD. */
  competencia: string | null;
  /** Service value in BRL. */
  valor: number | null;
  /** Service value in foreign currency (comExt/vServMoeda) — Sistema Nacional only. */
  valorMoeda: number | null;
  /** Foreign currency code (comExt/tpMoeda, BACEN) — e.g. "220" = USD. */
  moeda: string | null;
  status: NotaFiscalStatus;
  source: NotaFiscalSource;
  /** Full client (tomador) extracted from the XML, for find-or-create. */
  cliente: ParsedClient;
}

/** A Nota Fiscal record persisted in Firestore (`notasFiscais` collection). */
export interface NotaFiscalRecord {
  /** Firestore document id. */
  id: string;
  numero: string;
  competencia: string | null;
  valor: number | null;
  valorMoeda: number | null;
  moeda: string | null;
  status: NotaFiscalStatus;
  source: NotaFiscalSource;
  /** Denormalized client name (for the table). */
  cliente: string | null;
  /** Link to the `clients` collection. */
  clientId: string | null;
  fileName: string;
  /** Cloud Storage path: contabilidade/notas-fiscais/{numero}/{fileName}. */
  storagePath: string;
  downloadURL: string;
  uploadedAt: string;
}
