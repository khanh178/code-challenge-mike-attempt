export interface Token {
  symbol: string;
  name?: string;
  iconUrl?: string;
}

export interface PriceData {
  [tokenSymbol: string]: number;
}

export interface SwapFormState {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
  isSubmitting: boolean;
  error: string | null;
}

export interface ExchangeRate {
  rate: number;
  formattedRate: string;
}

