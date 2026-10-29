import { describe, expect, it, vi } from 'vitest';
import apiClient from '../index';
import { secFinancialsApi } from '../secFinancials';

vi.mock('../index', () => ({ default: { get: vi.fn() } }));

describe('secFinancialsApi', () => {
  it('calls the existing FastAPI v1 prefix instead of the SPA fallback', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { ticker: 'NVDA' } });
    await secFinancialsApi.getCompany('NVDA');
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/financials/company/NVDA');
  });
});
