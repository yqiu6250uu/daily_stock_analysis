import { describe, expect, it, vi } from 'vitest';
import { getDemoCompany, UnsupportedDemoTickerError } from '../secSnapshot';

describe('static SEC portfolio adapter', () => {
  it('reads a verified issuer snapshot and keeps its retrieval context', async () => {
    const snapshot = { ticker: 'NVDA', cik: 1045810, currency: 'USD', retrieved_at: '2026-10-29T08:56:49+00:00', periods: [{ type: 'annual' }] };
    const fetchSnapshot = vi.fn().mockResolvedValue({ ok: true, json: async () => snapshot }) as unknown as typeof fetch;
    await expect(getDemoCompany('nvda', fetchSnapshot)).resolves.toBe(snapshot);
    expect(fetchSnapshot).toHaveBeenCalledWith('/demo/v02/nvda.json', { credentials: 'omit' });
    expect(fetchSnapshot).toHaveBeenCalledTimes(1);
  });

  it('accepts the other two verified issuers and rejects unsupported tickers before any request', async () => {
    const fetchSnapshot = vi.fn() as unknown as typeof fetch;
    await expect(getDemoCompany('AAPL', fetchSnapshot)).rejects.toBeInstanceOf(UnsupportedDemoTickerError);
    expect(fetchSnapshot).not.toHaveBeenCalled();
    const supported = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ticker: 'MSFT', cik: 789019, currency: 'USD', retrieved_at: '2026-10-29', periods: [{}] }) }) as unknown as typeof fetch;
    await getDemoCompany('msft', supported);
    expect(supported).toHaveBeenCalledWith('/demo/v02/msft.json', { credentials: 'omit' });
  });

  it('rejects an empty or invalid downloaded snapshot', async () => {
    const fetchSnapshot = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ticker: 'NVDA', retrieved_at: '2026-10-29', periods: [] }) }) as unknown as typeof fetch;
    await expect(getDemoCompany('NVDA', fetchSnapshot)).rejects.toThrow('Invalid portfolio snapshot');
  });
});
