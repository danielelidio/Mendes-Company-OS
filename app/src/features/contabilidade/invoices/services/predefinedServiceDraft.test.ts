import { fromServiceDrafts, toServiceDrafts, type PredefinedServiceDraft } from './predefinedServiceDraft';
import type { PredefinedService } from '../types';

const service: PredefinedService = {
  description: 'Consultoria',
  unit: 'hours',
  pricePerUnit: 50,
  currency: 'USD',
  autofill: true,
};

describe('toServiceDrafts', () => {
  it('mapeia serviços para rascunhos preservando os campos', () => {
    expect(toServiceDrafts([service])).toEqual([
      { description: 'Consultoria', unit: 'hours', pricePerUnit: 50, currency: 'USD', autofill: true },
    ]);
  });

  it('normaliza autofill ausente para false', () => {
    const legacy = { description: 'X', unit: 'unit', pricePerUnit: 10, currency: 'BRL' } as PredefinedService;
    expect(toServiceDrafts([legacy])[0].autofill).toBe(false);
  });
});

describe('fromServiceDrafts', () => {
  it('aplica trim na descrição e mantém os valores', () => {
    const draft: PredefinedServiceDraft = { description: '  Suporte  ', unit: 'days', pricePerUnit: 1.72, currency: 'USD', autofill: false };
    expect(fromServiceDrafts([draft])).toEqual([
      { description: 'Suporte', unit: 'days', pricePerUnit: 1.72, currency: 'USD', autofill: false },
    ]);
  });

  it('descarta rascunhos sem descrição (após trim)', () => {
    const drafts: PredefinedServiceDraft[] = [
      { description: '   ', unit: 'unit', pricePerUnit: 0, currency: 'USD', autofill: false },
      { description: 'Válido', unit: 'unit', pricePerUnit: 5, currency: 'USD', autofill: true },
    ];
    const result = fromServiceDrafts(drafts);
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('Válido');
  });
});
