import apiClient from './index';
import { IS_STATIC_DEMO, isVerifiedDemoTicker } from '../demo/config';
import { UnsupportedDemoTickerError } from '../demo/secSnapshot';
import type { RevenueCashFlowReport } from '../types/researchQuestions';

export const researchQuestionsApi = {
  async getRevenueCashFlow(ticker: string, basis: 'annual' | 'quarterly', periodEnd?: string): Promise<RevenueCashFlowReport> {
    const normalized = ticker.trim().toUpperCase();
    if (IS_STATIC_DEMO) {
      if (!isVerifiedDemoTicker(normalized)) throw new UnsupportedDemoTickerError();
      const response = await fetch(`/demo/v02/${normalized.toLowerCase()}-reports.json`, { credentials: 'omit' });
      if (!response.ok) throw new Error(`Research snapshot unavailable: HTTP ${response.status}`);
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== 'object' || !('ticker' in payload) || payload.ticker !== normalized ||
          !('reports' in payload) || !Array.isArray(payload.reports)) throw new Error('Invalid research snapshot');
      const reports = payload.reports as RevenueCashFlowReport[];
      const report = reports.find((item) => item.basis === basis && (!periodEnd || item.current_period?.period_end === periodEnd));
      if (!report || report.schema_version !== 1 || report.ticker !== normalized) throw new Error('Research period unavailable');
      return report;
    }
    const { data } = await apiClient.get<RevenueCashFlowReport>(`/api/v1/research/company/${encodeURIComponent(normalized)}/revenue-cash-flow`,
      { params: { basis, ...(periodEnd ? { period_end: periodEnd } : {}) } });
    return data;
  },
  async interpret(ticker: string, basis: 'annual' | 'quarterly', periodEnd: string, locale: 'en' | 'zh'):
    Promise<{ status: string; content?: { interpretations: Array<{ text: string; citation_ids: string[] }>;
      alternative_explanations: Array<{ text: string; citation_ids: string[] }>;
      needs_review: Array<{ text: string; citation_ids: string[] }> } }> {
    if (IS_STATIC_DEMO) throw new Error('Public AI generation is disabled');
    const { data } = await apiClient.post(`/api/v1/research/company/${encodeURIComponent(ticker)}/revenue-cash-flow/interpretation`, null,
      { params: { basis, period_end: periodEnd, locale } });
    return data;
  },
};
