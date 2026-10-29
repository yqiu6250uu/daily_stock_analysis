import type { FinancialPeriod, FinancialValue } from './secFinancials';

export type ResearchFact = {
  id: string; field: string; role: 'current' | 'prior'; period_end: string | null;
  status: 'source_confirmed' | 'calculation_verified' | 'insufficient_evidence';
  value: FinancialValue | null;
};
export type ResearchCalculation = {
  id: string; formula_id: 'difference' | 'growth' | 'margin'; input_fact_ids: string[];
  definition: string; value: string | null; unit: 'USD' | 'percent';
  status: 'calculation_verified' | 'insufficient_evidence'; reason: string | null;
};
export type ResearchObservation = {
  id: string; template_id: string; status: 'calculation_verified' | 'insufficient_evidence';
  calculation_ids: string[];
};
export type RevenueCashFlowReport = {
  schema_version: 1; question_id: 'revenue-operating-cash-flow-v1'; method_version: string;
  ticker: string; cik: number; company_name: string; basis: 'annual' | 'quarterly';
  current_period: FinancialPeriod | null; prior_period: FinancialPeriod | null;
  facts: ResearchFact[]; calculations: ResearchCalculation[]; observations: ResearchObservation[];
  alternative_explanations: string[]; needs_review: string[]; quality_issues: string[];
  retrieved_at: string; calculated_at: string; fact_hash: string;
  interpretation: { status: 'not_requested' | 'not_configured' | 'generated' | 'rejected' | 'failed' };
};
