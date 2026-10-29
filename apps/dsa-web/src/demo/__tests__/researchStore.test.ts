import { describe, expect, it } from 'vitest';
import { clearSavedResearch, listSavedResearch, removeSavedResearch, saveResearch, savedResearchUrl } from '../researchStore';

function memory() {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
}

describe('browser-local research continuity', () => {
  const entry = { kind: 'question' as const, ticker: 'MSFT', question_id: 'revenue-operating-cash-flow-v1' as const,
    basis: 'annual' as const, period_end: '2026-06-30', fact_hash: 'abc123', retrieved_at: '2026-10-29T00:00:00Z' };
  it('saves, reopens, updates and removes a versioned investigation', () => {
    const storage = memory();
    const first = saveResearch(entry, storage);
    expect(listSavedResearch(storage)).toHaveLength(1);
    expect(savedResearchUrl(first)).toContain('period=2026-06-30');
    saveResearch(entry, storage);
    expect(listSavedResearch(storage)).toHaveLength(1);
    removeSavedResearch(first.id, storage);
    expect(listSavedResearch(storage)).toEqual([]);
  });
  it('drops malformed or unsupported old records safely', () => {
    const storage = memory();
    storage.setItem('equitylens.research.v1', JSON.stringify([{ schema_version: 2, ticker: 'MSFT' }, { schema_version: 1, ticker: 'bad<script>' }]));
    expect(listSavedResearch(storage)).toEqual([]);
    saveResearch(entry, storage);
    clearSavedResearch(storage);
    expect(listSavedResearch(storage)).toEqual([]);
  });
  it('preserves a saved company reporting period and rejects an incomplete question', () => {
    const storage = memory();
    const company = saveResearch({ kind: 'company', ticker: 'AMAT', question_id: null, basis: 'quarterly',
      period_end: '2026-07-26', fact_hash: null, retrieved_at: '2026-10-29T00:00:00Z' }, storage);
    expect(savedResearchUrl(company)).toContain('basis=quarterly&period=2026-07-26');
    storage.setItem('equitylens.research.v1', JSON.stringify([{ ...company, kind: 'question', question_id: null }]));
    expect(listSavedResearch(storage)).toEqual([]);
  });
});
