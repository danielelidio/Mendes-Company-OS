/** Tipo da movimentação no IRPF (receita/despesa). */
export type IrpfType = 'income' | 'expense';

/** Categoria da movimentação. */
export type IrpfCategory = 'payment' | 'donation' | 'general';

export const IRPF_TYPES: IrpfType[] = ['income', 'expense'];
export const IRPF_CATEGORIES: IrpfCategory[] = ['payment', 'donation', 'general'];

/** Lançamento de IRPF (rendimento/pagamento em moeda estrangeira) — armazenado no Firestore. */
export interface IrpfEntry {
  /** Id do documento. */
  id: string;
  /** Data ISO (`YYYY-MM-DD`). */
  date: string;
  /** Valor em USD (com decimais). */
  amountUsd: number;
  /** Valor em BRL calculado pela taxa oficial do mês. */
  amountBrl: number;
  /** Taxa USD→BRL aplicada (compra para receita, venda para despesa). */
  rateUsdBrl: number;
  /** Descrição livre. */
  description: string;
  /** Receita ou despesa. */
  type: IrpfType;
  /** Categoria. */
  category: IrpfCategory;
  /** Criação (ISO). */
  createdAt: string;
  /** Última atualização (ISO). */
  updatedAt: string;
}

/** Dados editáveis de um lançamento (sem id/timestamps). */
export type IrpfEntryInput = Omit<IrpfEntry, 'id' | 'createdAt' | 'updatedAt'>;
