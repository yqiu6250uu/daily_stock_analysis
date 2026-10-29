import { describe, expect, it, vi } from 'vitest';
import apiClient from '../index';
import { researchQuestionsApi } from '../researchQuestions';

vi.mock('../index', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

describe('research question API', () => {
  it('passes a validated period choice to the local FastAPI endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { ticker: 'MSFT', schema_version: 1 } });
    await researchQuestionsApi.getRevenueCashFlow('msft', 'annual', '2026-06-30');
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/research/company/MSFT/revenue-cash-flow',
      { params: { basis: 'annual', period_end: '2026-06-30' } });
  });
});
