/** Build-time switch: the public portfolio build has no backend or live SEC calls. */
export const IS_STATIC_DEMO = import.meta.env.MODE === 'demo';
export const DEMO_TICKER = 'NVDA';
export const DEMO_SNAPSHOT_URL = '/demo/nvda-sec-snapshot.json';
export const VERIFIED_DEMO_TICKERS = ['NVDA', 'MSFT', 'AMAT'] as const;
export type VerifiedDemoTicker = typeof VERIFIED_DEMO_TICKERS[number];
export const isVerifiedDemoTicker = (value: string): value is VerifiedDemoTicker =>
  VERIFIED_DEMO_TICKERS.some((ticker) => ticker === value);
export const VERIFIED_DEMO_CIK: Record<VerifiedDemoTicker, number> = { NVDA: 1045810, MSFT: 789019, AMAT: 6951 };
