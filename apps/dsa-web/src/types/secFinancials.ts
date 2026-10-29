export type FactSource = {
  concept: string;
  unit: string;
  period_start: string | null;
  period_end: string;
  form: string;
  filed: string;
  accepted: string | null;
  accession: string;
  url: string;
  retrieved_at: string;
};

export type FinancialValue = {
  value: number;
  unit: 'USD' | 'percent';
  kind: 'reported' | 'derived';
  definition: string | null;
  sources: FactSource[];
};

export type FinancialPeriod = {
  type: 'annual' | 'quarterly';
  period_start: string | null;
  period_end: string;
  fiscal_year: number | null;
  fiscal_quarter: number | null;
  filing_form: string;
  filing_date: string;
  acceptance_date: string | null;
  accession: string;
  filing_url: string;
  values: Record<string, FinancialValue | null>;
  metrics: Record<string, FinancialValue | null>;
  quality_issues: string[];
};

export type SecFinancialResponse = {
  ticker: string;
  cik: number;
  company_name: string;
  currency: 'USD';
  retrieved_at: string;
  periods: FinancialPeriod[];
  data_quality: { source: string; note: string; issues_count: number };
};
