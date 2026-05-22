import { XMLParser } from 'fast-xml-parser';
import type { ClientAddress, ParsedClient } from '@/features/clientes/types';
import type { ParsedNotaFiscal } from '../types';

const parser = new XMLParser({
  ignoreAttributes: true,
  removeNSPrefix: true,
  parseTagValue: false,
  trimValues: true,
});

/**
 * Parses a NFS-e XML (Prefeitura de BH / ABRASF, or Sistema Nacional / SPED) and
 * extracts the table fields plus the full client (tomador). Throws on unknown format.
 */
export function parseNotaFiscalXml(xml: string): ParsedNotaFiscal {
  const root = parser.parse(xml) as Record<string, any>;
  if (root.CompNfse) return parsePrefeituraBH(root.CompNfse);
  if (root.NFSe) return parseSistemaNacional(root.NFSe);
  throw new Error('XML não reconhecido (esperado NFS-e da Prefeitura de BH ou do Sistema Nacional).');
}

// ---- Prefeitura de BH (ABRASF) ----
function parsePrefeituraBH(comp: Record<string, any>): ParsedNotaFiscal {
  const inf = comp?.Nfse?.InfNfse;
  if (!inf) throw new Error('NFS-e da Prefeitura de BH sem InfNfse.');

  return {
    numero: toText(inf.Numero) ?? '',
    competencia: toIsoDate(inf.Competencia),
    valor: toNumber(inf.Servico?.Valores?.ValorServicos),
    valorMoeda: null, // BH não traz valor em moeda estrangeira
    moeda: null,
    status: comp.NfseCancelamento ? 'Cancelada' : 'Emitida/Normal',
    source: 'prefeitura-bh',
    cliente: clientFromBH(inf.TomadorServico),
  };
}

function clientFromBH(tomador: Record<string, any> | undefined): ParsedClient {
  if (!tomador) return emptyClient();
  const cpfCnpj = tomador.IdentificacaoTomador?.CpfCnpj;
  let documentType: ParsedClient['documentType'] = null;
  let document: string | null = null;
  if (cpfCnpj?.Cnpj) {
    documentType = 'CNPJ';
    document = toText(cpfCnpj.Cnpj);
  } else if (cpfCnpj?.Cpf) {
    documentType = 'CPF';
    document = toText(cpfCnpj.Cpf);
  }

  const end = tomador.Endereco;
  const uf = toText(end?.Uf);
  const address: ClientAddress | null = end
    ? {
        street: toText(end.Endereco),
        number: toText(end.Numero),
        complement: toText(end.Complemento),
        district: toText(end.Bairro),
        city: null, // BH only carries the município code, not its name
        state: uf,
        zip: toText(end.Cep),
        country: uf === 'EX' ? 'EX' : 'BR',
      }
    : null;

  return { name: toText(tomador.RazaoSocial), documentType, document, address };
}

// ---- Sistema Nacional (SPED) ----
function parseSistemaNacional(nfse: Record<string, any>): ParsedNotaFiscal {
  const inf = nfse?.infNFSe;
  if (!inf) throw new Error('NFS-e do Sistema Nacional sem infNFSe.');
  const infDPS = inf.DPS?.infDPS;
  // Comércio exterior: valor e moeda estrangeira (quando o serviço é prestado ao exterior).
  const comExt = infDPS?.serv?.comExt;

  return {
    numero: toText(inf.nNFSe) ?? '',
    competencia: toIsoDate(infDPS?.dCompet),
    valor: toNumber(infDPS?.valores?.vServPrest?.vServ),
    valorMoeda: toNumber(comExt?.vServMoeda),
    moeda: toText(comExt?.tpMoeda),
    // cStat 100 = "Autorizado o uso". Cancellation is a separate event document.
    status: 'Emitida/Normal',
    source: 'sistema-nacional',
    cliente: clientFromNacional(infDPS?.toma),
  };
}

function clientFromNacional(toma: Record<string, any> | undefined): ParsedClient {
  if (!toma) return emptyClient();
  let documentType: ParsedClient['documentType'] = null;
  let document: string | null = null;
  if (toma.CNPJ) {
    documentType = 'CNPJ';
    document = toText(toma.CNPJ);
  } else if (toma.CPF) {
    documentType = 'CPF';
    document = toText(toma.CPF);
  } else if (toma.NIF) {
    documentType = 'NIF';
    document = toText(toma.NIF);
  }

  const end = toma.end;
  let address: ClientAddress | null = null;
  if (end) {
    const ext = end.endExt;
    const nac = end.endNac;
    address = {
      street: toText(end.xLgr),
      number: toText(end.nro),
      complement: toText(end.xCpl),
      district: toText(end.xBairro),
      city: toText(ext?.xCidade),
      state: toText(ext?.xEstProvReg),
      zip: toText(ext?.cEndPost ?? nac?.CEP),
      country: ext ? (toText(ext.cPais) ?? 'EX') : nac ? 'BR' : null,
    };
  }

  return { name: toText(toma.xNome), documentType, document, address };
}

// ---- helpers ----
function emptyClient(): ParsedClient {
  return { name: null, documentType: null, document: null, address: null };
}

function toText(v: unknown): string | null {
  if (v === null || v === undefined || typeof v === 'object') return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

function toIsoDate(v: unknown): string | null {
  const s = toText(v);
  if (!s) return null;
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function toNumber(v: unknown): number | null {
  const s = toText(v);
  if (!s) return null;
  const n = Number(s.replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}
