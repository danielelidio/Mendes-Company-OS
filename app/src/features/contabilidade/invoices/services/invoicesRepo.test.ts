jest.mock('@/lib/firebase', () => ({ db: {}, storage: {} }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({})),
  doc: jest.fn(() => ({ id: 'genId' })),
  onSnapshot: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
}));
jest.mock('firebase/storage', () => ({
  ref: jest.fn((_storage, path) => ({ path })),
  uploadBytes: jest.fn(() => Promise.resolve()),
  getDownloadURL: jest.fn(() => Promise.resolve('https://dl/x.pdf')),
  deleteObject: jest.fn(() => Promise.resolve()),
}));

import { onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  subscribeInvoices,
  uploadInvoicePdf,
  type InvoiceInput,
} from './invoicesRepo';
import type { Invoice } from '../types';

const input = {
  clientId: 'c1',
  clientName: 'Cliente',
  number: 'NP-001-2026-05',
  sequence: 1,
  date: '2026-05-22',
  serviceFrom: '2026-05-01',
  serviceTo: '2026-05-31',
  currency: 'USD',
  services: [],
  total: 0,
  observations: [],
  termsAndConditions: [],
} as InvoiceInput;

beforeEach(() => jest.clearAllMocks());

describe('createInvoice', () => {
  it('grava com id gerado, campos de arquivo nulos e timestamps', async () => {
    const created = await createInvoice(input);
    expect(created.id).toBe('genId');
    expect(created.number).toBe('NP-001-2026-05');
    expect(created.fileName).toBeNull();
    expect(created.storagePath).toBeNull();
    expect(created.downloadURL).toBeNull();
    expect(typeof created.createdAt).toBe('string');
    expect(typeof created.updatedAt).toBe('string');
    expect(setDoc).toHaveBeenCalledTimes(1);
    expect((setDoc as jest.Mock).mock.calls[0][1]).toMatchObject({ id: 'genId', clientId: 'c1' });
  });
});

describe('updateInvoice', () => {
  it('atualiza os campos editáveis e o updatedAt', async () => {
    await updateInvoice('id1', input);
    expect(updateDoc).toHaveBeenCalledTimes(1);
    const payload = (updateDoc as jest.Mock).mock.calls[0][1];
    expect(payload).toMatchObject({ number: 'NP-001-2026-05' });
    expect(typeof payload.updatedAt).toBe('string');
  });
});

describe('deleteInvoice', () => {
  it('sem storagePath: só apaga o documento', async () => {
    await deleteInvoice('id1', null);
    expect(deleteDoc).toHaveBeenCalledTimes(1);
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it('com storagePath: apaga o documento e o arquivo', async () => {
    await deleteInvoice('id1', 'contabilidade/invoices/NP-001/x.pdf');
    expect(deleteDoc).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith({}, 'contabilidade/invoices/NP-001/x.pdf');
    expect(deleteObject).toHaveBeenCalledTimes(1);
  });
});

describe('subscribeInvoices', () => {
  it('ordena por data desc e depois por número desc', () => {
    const onChange = jest.fn();
    subscribeInvoices(onChange, jest.fn());
    const onNext = (onSnapshot as jest.Mock).mock.calls[0][1];
    onNext({
      docs: [
        { data: () => ({ number: 'A', date: '2026-01-01' }) },
        { data: () => ({ number: 'B', date: '2026-05-01' }) },
        { data: () => ({ number: 'C', date: '2026-05-01' }) },
      ],
    });
    const rows = onChange.mock.calls[0][0] as Invoice[];
    expect(rows.map((r) => r.number)).toEqual(['C', 'B', 'A']);
  });
});

describe('uploadInvoicePdf', () => {
  it('faz upload no caminho saneado e grava os campos do arquivo', async () => {
    const realFetch = global.fetch;
    global.fetch = jest.fn(() => Promise.resolve({ blob: () => Promise.resolve('B') })) as never;

    await uploadInvoicePdf('id1', 'NP-001-2026-05', { name: 'My Invoice.pdf', uri: 'file://x' } as never);

    expect(ref).toHaveBeenCalledWith({}, 'contabilidade/invoices/NP-001-2026-05/My_Invoice.pdf');
    expect(uploadBytes).toHaveBeenCalledTimes(1);
    expect(getDownloadURL).toHaveBeenCalledTimes(1);
    const payload = (updateDoc as jest.Mock).mock.calls[0][1];
    expect(payload).toMatchObject({ fileName: 'My Invoice.pdf', downloadURL: 'https://dl/x.pdf' });
    expect(payload.storagePath).toBe('contabilidade/invoices/NP-001-2026-05/My_Invoice.pdf');

    global.fetch = realFetch;
  });
});
