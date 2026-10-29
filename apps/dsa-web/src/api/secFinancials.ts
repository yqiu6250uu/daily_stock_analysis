import apiClient from './index';
import { IS_STATIC_DEMO } from '../demo/config';
import { getDemoCompany } from '../demo/secSnapshot';
import type { SecFinancialResponse } from '../types/secFinancials';

export const secFinancialsApi = {
  async getCompany(ticker: string): Promise<SecFinancialResponse> {
    if (IS_STATIC_DEMO) return getDemoCompany(ticker);
    const { data } = await apiClient.get<SecFinancialResponse>(`/api/v1/financials/company/${encodeURIComponent(ticker)}`);
    return data;
  },
};
