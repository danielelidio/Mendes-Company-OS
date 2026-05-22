import { Platform } from 'react-native';
import type * as DocumentPicker from 'expo-document-picker';
import i18n from 'i18next';
import type { AppDispatch } from '@/store';
import {
  createClientFromParsed,
  findExactClient,
  findSimilarClients,
  listClients,
} from '@/features/clientes/services/clientsRepo';
import { rankBySimilarity } from '@/features/clientes/services/clientMatching';
import { parseNotaFiscalXml } from '../services/notaFiscalParser';
import { notaFiscalExists, saveNotaFiscal } from '../services/notasFiscaisRepo';
import {
  promptCleared,
  promptShown,
  resultAdded,
  uploadFailed,
  uploadFinished,
  uploadStarted,
} from './uploadSlice';

type MatchChoice = string | 'CREATE' | 'SKIP';

// Resolver da seleção de cliente — função (não serializável), vive fora do store.
let matchResolver: ((choice: MatchChoice) => void) | null = null;

/** Chamado pela UI (MatchModal) quando o usuário escolhe um cliente / cria / pula. */
export function resolveMatch(choice: MatchChoice) {
  const resolve = matchResolver;
  matchResolver = null;
  resolve?.(choice);
}

async function readXmlText(asset: DocumentPicker.DocumentPickerAsset): Promise<string> {
  const webFile = (asset as unknown as { file?: File }).file;
  if (Platform.OS === 'web' && webFile) return webFile.text();
  const FileSystem = await import('expo-file-system/legacy');
  return FileSystem.readAsStringAsync(asset.uri);
}

/**
 * Processa os XMLs selecionados. Roda como thunk: independe da tela montada,
 * então o upload continua em background ao navegar. O progresso vai para o store.
 */
export function processUpload(assets: DocumentPicker.DocumentPickerAsset[]) {
  return async (dispatch: AppDispatch) => {
    const xmlAssets = assets.filter((a) => /\.xml$/i.test(a.name ?? ''));
    const skipped = assets.length - xmlAssets.length;
    dispatch(uploadStarted(xmlAssets.length));

    try {
      const clients = await listClients();

      for (const asset of xmlAssets) {
        const name = asset.name ?? 'nota.xml';
        try {
          const xml = await readXmlText(asset);
          const parsed = parseNotaFiscalXml(xml);

          if (await notaFiscalExists(parsed)) {
            dispatch(resultAdded({
              fileName: name,
              status: 'duplicate',
              message: i18n.t('notasFiscais:upload.result.duplicate', { numero: parsed.numero || '—' }),
            }));
            continue;
          }

          let clientId: string | null = null;
          // Sem nome e sem documento → não cadastra cliente.
          const hasClient = Boolean(parsed.cliente.name?.trim() || parsed.cliente.document?.trim());
          const exact = findExactClient(parsed.cliente, clients);
          if (exact) {
            clientId = exact.id;
          } else if (findSimilarClients(parsed.cliente.name, clients).length > 0) {
            const choice = await new Promise<MatchChoice>((resolve) => {
              matchResolver = resolve;
              dispatch(promptShown({
                fileName: name,
                clientName: parsed.cliente.name ?? i18n.t('notasFiscais:list.options.clienteNoName'),
                ranked: rankBySimilarity(parsed.cliente.name, clients),
              }));
            });
            dispatch(promptCleared());
            if (choice === 'SKIP') {
              dispatch(resultAdded({ fileName: name, status: 'error', message: i18n.t('notasFiscais:upload.result.skipped') }));
              continue;
            }
            if (choice === 'CREATE') {
              const created = await createClientFromParsed(parsed.cliente);
              clients.push(created);
              clientId = created.id;
            } else {
              clientId = choice;
            }
          } else if (hasClient) {
            const created = await createClientFromParsed(parsed.cliente);
            clients.push(created);
            clientId = created.id;
          }

          const record = await saveNotaFiscal(name, xml, parsed, clientId);
          dispatch(resultAdded({
            fileName: name,
            status: 'ok',
            message: i18n.t('notasFiscais:upload.result.ok', {
              numero: record.numero,
              cliente: record.cliente ?? '—',
              status: record.status,
            }),
          }));
        } catch (e) {
          dispatch(resultAdded({ fileName: name, status: 'error', message: e instanceof Error ? e.message : String(e) }));
        }
      }

      if (skipped > 0) {
        dispatch(resultAdded({
          fileName: i18n.t('notasFiscais:upload.result.ignored', { count: skipped }),
          status: 'error',
          message: i18n.t('notasFiscais:upload.result.onlyXml'),
        }));
      }
      dispatch(uploadFinished());
    } catch (e) {
      dispatch(uploadFailed(e instanceof Error ? e.message : String(e)));
    }
  };
}
