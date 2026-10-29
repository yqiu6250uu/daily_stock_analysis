import type { SecFinancialResponse } from '../types/secFinancials';
import { isVerifiedDemoTicker, VERIFIED_DEMO_CIK } from './config';

export class UnsupportedDemoTickerError extends Error {
  response = { data: { detail: { error: 'demo_unsupported' } } };

  constructor() {
    super('This portfolio snapshot supports NVDA, MSFT and AMAT only.');
  }
}

export async function getDemoCompany(
  ticker: string,
  fetchSnapshot: typeof fetch = fetch,
): Promise<SecFinancialResponse> {
  const normalized = ticker.trim().toUpperCase();
  if (!isVerifiedDemoTicker(normalized)) {
    throw new UnsupportedDemoTickerError();
  }
  const response = await fetchSnapshot(`/demo/v02/${normalized.toLowerCase()}.json`, { credentials: 'omit' });
  if (!response.ok) {
    throw new Error(`Snapshot unavailable: HTTP ${response.status}`);
  }
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' ||
      !('ticker' in data) || data.ticker !== normalized ||
      !('cik' in data) || data.cik !== VERIFIED_DEMO_CIK[normalized] ||
      !('currency' in data) || data.currency !== 'USD' ||
      !('retrieved_at' in data) || typeof data.retrieved_at !== 'string' ||
      !('periods' in data) || !Array.isArray(data.periods) || data.periods.length === 0) {
    throw new Error('Invalid portfolio snapshot');
  }
  return data as SecFinancialResponse;
}
