import { saveInvoice, deleteInvoice } from './invoicesThunks';
import * as repo from '../services/invoicesRepo';
import type { InvoiceInput } from '../services/invoicesRepo';
import type { Invoice } from '../types';

jest.mock('../services/invoicesRepo', () => ({
  createInvoice: jest.fn(),
  updateInvoice: jest.fn(),
  deleteInvoice: jest.fn(),
  uploadInvoicePdf: jest.fn(),
}));

const input = { number: 'NP-001-2026-05', clientId: 'c1' } as InvoiceInput;
const pdf = { name: 'f.pdf', uri: 'file://f.pdf' } as never;
const dispatch = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe('saveInvoice', () => {
  it('cria quando não há id e não faz upload sem pdf', async () => {
    (repo.createInvoice as jest.Mock).mockResolvedValue({ id: 'new1' } as Invoice);
    await saveInvoice(input, undefined, null)(dispatch);
    expect(repo.createInvoice).toHaveBeenCalledWith(input);
    expect(repo.updateInvoice).not.toHaveBeenCalled();
    expect(repo.uploadInvoicePdf).not.toHaveBeenCalled();
  });

  it('cria e faz upload do pdf usando o id criado', async () => {
    (repo.createInvoice as jest.Mock).mockResolvedValue({ id: 'new1' } as Invoice);
    await saveInvoice(input, undefined, pdf)(dispatch);
    expect(repo.createInvoice).toHaveBeenCalledWith(input);
    expect(repo.uploadInvoicePdf).toHaveBeenCalledWith('new1', input.number, pdf);
  });

  it('atualiza quando há id, sem criar', async () => {
    await saveInvoice(input, 'id1', null)(dispatch);
    expect(repo.updateInvoice).toHaveBeenCalledWith('id1', input);
    expect(repo.createInvoice).not.toHaveBeenCalled();
    expect(repo.uploadInvoicePdf).not.toHaveBeenCalled();
  });

  it('atualiza e faz upload do pdf no id existente', async () => {
    await saveInvoice(input, 'id1', pdf)(dispatch);
    expect(repo.updateInvoice).toHaveBeenCalledWith('id1', input);
    expect(repo.uploadInvoicePdf).toHaveBeenCalledWith('id1', input.number, pdf);
  });
});

describe('deleteInvoice', () => {
  it('remove a invoice e o arquivo (delega ao repo)', async () => {
    await deleteInvoice('id1', 'path/x.pdf')(dispatch);
    expect(repo.deleteInvoice).toHaveBeenCalledWith('id1', 'path/x.pdf');
  });
});
