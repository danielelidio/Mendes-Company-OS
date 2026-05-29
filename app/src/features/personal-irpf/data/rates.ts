// GERADO por scripts/gen-rf-rates.mjs (fonte: gov.br/receitafederal). Não editar à mão.

/** Taxa mensal oficial USD→BRL: compra (rendimentos) e venda (pagamentos). */
export interface MonthlyRate { compra: number; venda: number; }

/** Anos → meses → taxas oficiais publicadas pela Receita Federal. */
export const RATES: Record<number, Record<number, MonthlyRate>> = {
  "2025": {
    "1": {
      "compra": 6.0394,
      "venda": 6.04
    },
    "2": {
      "compra": 6.0371,
      "venda": 6.0377
    },
    "3": {
      "compra": 5.7277,
      "venda": 5.7283
    },
    "4": {
      "compra": 5.7413,
      "venda": 5.7419
    },
    "5": {
      "compra": 5.8701,
      "venda": 5.8707
    },
    "6": {
      "compra": 5.6322,
      "venda": 5.6328
    },
    "7": {
      "compra": 5.5646,
      "venda": 5.5652
    },
    "8": {
      "compra": 5.5569,
      "venda": 5.5576
    },
    "9": {
      "compra": 5.3922,
      "venda": 5.3928
    },
    "10": {
      "compra": 5.3202,
      "venda": 5.3208
    },
    "11": {
      "compra": 5.4458,
      "venda": 5.4464
    },
    "12": {
      "compra": 5.2946,
      "venda": 5.2952
    }
  },
  "2026": {
    "1": {
      "compra": 5.3923,
      "venda": 5.3929
    },
    "2": {
      "compra": 5.384,
      "venda": 5.3846
    },
    "3": {
      "compra": 5.2282,
      "venda": 5.2288
    },
    "4": {
      "compra": 5.2535,
      "venda": 5.2541
    },
    "5": {
      "compra": 4.9922,
      "venda": 4.9928
    },
    "6": {
      "compra": 5.0648,
      "venda": 5.0654
    }
  }
};
