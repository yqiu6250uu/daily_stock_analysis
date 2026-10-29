/** Versioned browser-only research continuity. Never stores credentials or account data. */
export type SavedResearch = {
  id: string; schema_version: 1; kind: 'company' | 'question'; ticker: string;
  question_id: 'revenue-operating-cash-flow-v1' | null;
  basis: 'annual' | 'quarterly'; period_end: string; fact_hash: string | null;
  retrieved_at: string; saved_at: string;
};

const KEY = 'equitylens.research.v1';
const TICKER = /^[A-Z][A-Z0-9.-]{0,9}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function valid(item: unknown): item is SavedResearch {
  if (!item || typeof item !== 'object') return false;
  const data = item as Record<string, unknown>;
  return data.schema_version === 1 && (data.kind === 'company' || data.kind === 'question') &&
    typeof data.ticker === 'string' && TICKER.test(data.ticker) &&
    (data.basis === 'annual' || data.basis === 'quarterly') &&
    typeof data.period_end === 'string' && DATE.test(data.period_end) &&
    (data.fact_hash === null || typeof data.fact_hash === 'string') &&
    typeof data.retrieved_at === 'string' && !Number.isNaN(Date.parse(data.retrieved_at)) &&
    typeof data.saved_at === 'string' && !Number.isNaN(Date.parse(data.saved_at)) &&
    (data.kind === 'question' ? data.question_id === 'revenue-operating-cash-flow-v1' && typeof data.fact_hash === 'string'
      : data.question_id === null) &&
    typeof data.id === 'string' && data.id.length < 200;
}

export function listSavedResearch(storage: Pick<Storage, 'getItem'> = localStorage): SavedResearch[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(valid).slice(0, 50) : [];
  } catch { return []; }
}

export function hasInvalidSavedResearch(storage: Pick<Storage, 'getItem'> = localStorage): boolean {
  try {
    const raw = storage.getItem(KEY);
    if (raw === null) return false;
    const parsed: unknown = JSON.parse(raw);
    return !Array.isArray(parsed) || parsed.some((item) => !valid(item));
  } catch { return true; }
}

export function saveResearch(
  entry: Omit<SavedResearch, 'id' | 'schema_version' | 'saved_at'>,
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
): SavedResearch {
  const item: SavedResearch = {
    ...entry, schema_version: 1, saved_at: new Date().toISOString(),
    id: `${entry.kind}:${entry.ticker}:${entry.basis}:${entry.period_end}:${entry.question_id ?? 'company'}`,
  };
  if (!valid(item)) throw new Error('Invalid research item');
  const prior = listSavedResearch(storage).filter((value) => value.id !== item.id);
  storage.setItem(KEY, JSON.stringify([item, ...prior].slice(0, 50)));
  return item;
}

export function removeSavedResearch(id: string, storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage): void {
  storage.setItem(KEY, JSON.stringify(listSavedResearch(storage).filter((item) => item.id !== id)));
}

export function clearSavedResearch(storage: Pick<Storage, 'setItem'> = localStorage): void {
  storage.setItem(KEY, '[]');
}

export function savedResearchUrl(item: SavedResearch): string {
  return item.kind === 'company' ? `/research/${encodeURIComponent(item.ticker)}?basis=${item.basis}&period=${encodeURIComponent(item.period_end)}` :
    `/research/${encodeURIComponent(item.ticker)}/questions/revenue-cash-flow?basis=${item.basis}&period=${encodeURIComponent(item.period_end)}`;
}
