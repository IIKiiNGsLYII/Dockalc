// Exchange rate service with free open API, caching, and fallback

export interface ExchangeRateState {
  base: string;
  rates: Record<string, number>;
  lastUpdatedUtc?: string;
  lastUpdatedUnix?: number;
  source: 'live' | 'cached' | 'fallback';
  isLoading: boolean;
  error?: string | null;
}

const STORAGE_KEY = 'dockcalc_exchange_rates_v2';

// Built-in baseline rates against 1 USD
export const FALLBACK_RATES_USD: Record<string, number> = {
  USD: 1,
  EUR: 0.923,
  GBP: 0.789,
  JPY: 154.6,
  CAD: 1.362,
  AUD: 1.524,
  CNY: 7.241,
  CHF: 0.908,
  INR: 83.54,
  HKD: 7.823,
  NZD: 1.662,
  SGD: 1.351,
  KRW: 1378.5,
  SEK: 10.62,
  NOK: 10.78,
  MXN: 18.25,
  BRL: 5.48,
  ZAR: 18.32,
  AED: 3.673,
  SAR: 3.751,
  TRY: 32.65,
  TWD: 32.35,
  THB: 36.8,
  IDR: 16250,
  MYR: 4.72,
  PHP: 58.2,
};

export function getCachedRates(): ExchangeRateState {
  if (typeof window === 'undefined') {
    return {
      base: 'USD',
      rates: FALLBACK_RATES_USD,
      source: 'fallback',
      isLoading: false,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.rates && typeof parsed.rates === 'object') {
        return {
          base: parsed.base || 'USD',
          rates: { ...FALLBACK_RATES_USD, ...parsed.rates },
          lastUpdatedUtc: parsed.lastUpdatedUtc,
          lastUpdatedUnix: parsed.lastUpdatedUnix,
          source: 'cached',
          isLoading: false,
        };
      }
    }
  } catch (err) {
    console.warn('Failed reading cached exchange rates:', err);
  }

  return {
    base: 'USD',
    rates: FALLBACK_RATES_USD,
    source: 'fallback',
    isLoading: false,
  };
}

export async function fetchLiveExchangeRates(base = 'USD'): Promise<ExchangeRateState> {
  try {
    // Open free API (no key required, supports CORS, daily updates)
    const res = await fetch(`https://open.er-api.com/v6/latest/${base.toUpperCase()}`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    if (data && data.result === 'success' && data.rates) {
      const mergedRates = { ...FALLBACK_RATES_USD, ...data.rates };
      const state: ExchangeRateState = {
        base: data.base_code || base,
        rates: mergedRates,
        lastUpdatedUtc: data.time_last_update_utc,
        lastUpdatedUnix: data.time_last_update_unix,
        source: 'live',
        isLoading: false,
      };

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            base: state.base,
            rates: mergedRates,
            lastUpdatedUtc: state.lastUpdatedUtc,
            lastUpdatedUnix: state.lastUpdatedUnix,
          })
        );
      } catch {
        // Ignore storage quota errors
      }

      return state;
    }
    throw new Error('Invalid rate data format');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    const cached = getCachedRates();
    return {
      ...cached,
      isLoading: false,
      error: message,
    };
  }
}

export function formatLastUpdated(utcString?: string, unixTimestamp?: number): string {
  if (unixTimestamp) {
    const diffSec = Math.floor((Date.now() - unixTimestamp * 1000) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  }
  if (utcString) {
    try {
      const d = new Date(utcString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return utcString.slice(0, 16);
    }
  }
  return 'Built-in cache';
}
