import apiClient from './index';
import type { SecFinancialResponse } from '../types/secFinancials';

export const secFinancialsApi = {
  async getCompany(ticker: string): Promise<SecFinancialResponse> {
    const { data } = await apiClient.get<SecFinancialResponse>(`/api/v1/financials/company/${encodeURIComponent(ticker)}`);
    return data;
  },
};
