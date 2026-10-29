/** Public build metadata is read from the shipped manifest, never from a hardcoded date. */
export type DemoIssuer = {
  ticker: 'NVDA' | 'MSFT' | 'AMAT'; cik: number; company_name: string;
  retrieved_at: string; snapshot_sha256: string;
  validation: { annual: number; quarterly: number; facts: number; derived: number };
};
export type DemoUniverse = { schema_version: 1; issuers: DemoIssuer[] };

let request: Promise<DemoUniverse> | null = null;
export function getDemoUniverse(fetchManifest: typeof fetch = fetch): Promise<DemoUniverse> {
  if (fetchManifest !== fetch) return readManifest(fetchManifest);
  request ??= readManifest(fetchManifest).catch((error: unknown) => { request = null; throw error; });
  return request;
}

async function readManifest(fetchManifest: typeof fetch): Promise<DemoUniverse> {
  const response = await fetchManifest('/demo/v02/universe.json', { credentials: 'omit' });
  if (!response.ok) throw new Error(`Universe unavailable: ${response.status}`);
  const value: unknown = await response.json();
  if (!value || typeof value !== 'object') throw new Error('Invalid universe manifest');
  const manifest = value as DemoUniverse;
  if (manifest.schema_version !== 1 || !Array.isArray(manifest.issuers) || manifest.issuers.length !== 3 ||
      !manifest.issuers.every((issuer) => ['NVDA', 'MSFT', 'AMAT'].includes(issuer.ticker) &&
        !Number.isNaN(Date.parse(issuer.retrieved_at)) && /^[a-f0-9]{64}$/.test(issuer.snapshot_sha256))) {
    throw new Error('Invalid universe manifest');
  }
  return manifest;
}

export function latestSnapshotDate(manifest: DemoUniverse, language: 'en' | 'zh'): string {
  const latest = Math.max(...manifest.issuers.map((issuer) => Date.parse(issuer.retrieved_at)));
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  }).format(latest);
}
