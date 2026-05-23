import { saveInvoiceConfig } from './invoiceConfigThunks';
import * as repo from '../services/invoiceConfigRepo';
import type { InvoiceClientConfigInput } from '../types';

jest.mock('../services/invoiceConfigRepo', () => ({
  saveInvoiceConfig: jest.fn(),
}));

const input: InvoiceClientConfigInput = {
  clientCode: 'NP',
  defaultCurrency: 'USD',
  defaultServiceUnit: 'hours',
  defaultTerms: ['Payment is due within 15 days'],
  predefinedServices: [],
};

beforeEach(() => jest.clearAllMocks());

describe('saveInvoiceConfig (thunk)', () => {
  it('delega a persistência ao repo com clientId e input', async () => {
    await saveInvoiceConfig('c1', input)(jest.fn());
    expect(repo.saveInvoiceConfig).toHaveBeenCalledWith('c1', input);
  });
});
