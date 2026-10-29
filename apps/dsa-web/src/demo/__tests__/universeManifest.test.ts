import { describe, expect, it, vi } from 'vitest';
import { getDemoUniverse, latestSnapshotDate } from '../universeManifest';

const issuer = (ticker: string, retrieved_at: string) => ({ ticker, cik: 1, company_name: ticker,
  retrieved_at, snapshot_sha256: 'a'.repeat(64), validation: { annual: 2, quarterly: 2, facts: 10, derived: 2 } });

describe('public manifest metadata', () => {
  it('uses the latest actual retrieval date and rejects incomplete universes', async () => {
    const valid = { schema_version: 1, issuers: [issuer('NVDA', '2026-10-27T00:00:00Z'), issuer('MSFT', '2026-10-29T16:00:00Z'), issuer('AMAT', '2026-10-28T00:00:00Z')] };
    const fetchManifest = vi.fn().mockResolvedValue({ ok: true, json: async () => valid }) as unknown as typeof fetch;
    const manifest = await getDemoUniverse(fetchManifest);
    expect(latestSnapshotDate(manifest, 'en')).toBe('Oct 29, 2026');
    expect(fetchManifest).toHaveBeenCalledWith('/demo/v02/universe.json', { credentials: 'omit' });
    const invalid = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ...valid, issuers: valid.issuers.slice(0, 2) }) }) as unknown as typeof fetch;
    await expect(getDemoUniverse(invalid)).rejects.toThrow('Invalid universe manifest');
  });
});
