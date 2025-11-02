import type { Token } from '../types';

const ICON_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';
const iconCache = new Map<string, string>();

export function getTokenIconUrl(token: Token): string {
  const cacheKey = token.symbol.toUpperCase();
  
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!;
  }

  const iconUrl = `${ICON_BASE_URL}/${token.symbol.toUpperCase()}.svg`;
  iconCache.set(cacheKey, iconUrl);
  
  return iconUrl;
}

export async function validateIconExists(iconUrl: string): Promise<boolean> {
  try {
    const response = await fetch(iconUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

export function getFallbackIconUrl(): string {
  return `${ICON_BASE_URL}/SWTH.svg`;
}

