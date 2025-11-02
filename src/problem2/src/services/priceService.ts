import type { PriceData, Token } from '../types';

const PRICES_API_URL = 'https://interview.switcheo.com/prices.json';

let cachedPrices: PriceData | null = null;
let pricesPromise: Promise<PriceData> | null = null;

interface PriceResponseItem {
  currency: string;
  date: string;
  price: number;
}

export async function fetchPrices(): Promise<PriceData> {
  if (cachedPrices) {
    return cachedPrices;
  }

  if (pricesPromise) {
    return pricesPromise;
  }

  pricesPromise = fetch(PRICES_API_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch prices: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data: PriceResponseItem[]) => {
      const priceMap: PriceData = {};
      const currencyDates: Record<string, string> = {};
      
      data.forEach((item) => {
        const currency = item.currency;
        if (item.price > 0) {
          const existingDate = currencyDates[currency];
          if (!existingDate || new Date(item.date) > new Date(existingDate)) {
            priceMap[currency] = item.price;
            currencyDates[currency] = item.date;
          }
        }
      });
      
      cachedPrices = priceMap;
      return priceMap;
    })
    .catch((error) => {
      pricesPromise = null;
      throw error;
    });

  return pricesPromise;
}

export function getTokensWithPrices(prices: PriceData): Token[] {
  return Object.keys(prices)
    .filter((symbol) => {
      const price = prices[symbol];
      return price && typeof price === 'number' && price > 0;
    })
    .map((symbol) => ({
      symbol: symbol.toUpperCase(),
      name: symbol,
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}

export function calculateExchangeRate(
  fromToken: Token,
  toToken: Token,
  prices: PriceData
): number {
  const findPrice = (symbol: string): number | undefined => {
    const upperSymbol = symbol.toUpperCase();
    const lowerSymbol = symbol.toLowerCase();
    
    return prices[symbol] || prices[upperSymbol] || prices[lowerSymbol] || 
           Object.entries(prices).find(([key]) => 
             key.toUpperCase() === upperSymbol
           )?.[1];
  };

  const fromPrice = findPrice(fromToken.symbol);
  const toPrice = findPrice(toToken.symbol);

  if (!fromPrice || !toPrice || toPrice === 0) {
    return 0;
  }

  return fromPrice / toPrice;
}

export function formatExchangeRate(rate: number): string {
  if (rate === 0) return '0';
  if (rate < 0.0001) return rate.toExponential(2);
  if (rate < 1) return rate.toFixed(6);
  if (rate < 1000) return rate.toFixed(4);
  return rate.toFixed(2);
}

