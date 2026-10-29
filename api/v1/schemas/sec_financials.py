"""Public, traceable SEC financial research response schema."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class FactSource(BaseModel):
    concept: str
    unit: str
    period_start: str | None
    period_end: str
    form: str
    filed: str
    accepted: str | None
    accession: str
    url: str
    retrieved_at: str


class FinancialValue(BaseModel):
    value: int | float
    unit: Literal["USD", "percent"]
    kind: Literal["reported", "derived"]
    definition: str | None
    sources: list[FactSource]


class FinancialPeriod(BaseModel):
    type: Literal["annual", "quarterly"]
    period_start: str | None
    period_end: str
    fiscal_year: int | None
    fiscal_quarter: int | None
    filing_form: str
    filing_date: str
    acceptance_date: str | None
    accession: str
    filing_url: str
    values: dict[str, FinancialValue | None]
    metrics: dict[str, FinancialValue | None]
    quality_issues: list[str]


class SecFinancialResponse(BaseModel):
    ticker: str
    cik: int
    company_name: str
    currency: Literal["USD"]
    retrieved_at: str
    periods: list[FinancialPeriod]
    data_quality: dict[str, str | int]
