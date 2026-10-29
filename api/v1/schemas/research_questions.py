"""Versioned response contract for the deterministic flagship investigation."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

from api.v1.schemas.sec_financials import FinancialPeriod, FinancialValue


class ResearchFact(BaseModel):
    id: str
    field: str
    role: Literal["current", "prior"]
    period_end: str | None
    status: Literal["source_confirmed", "calculation_verified", "insufficient_evidence"]
    value: FinancialValue | None


class ResearchCalculation(BaseModel):
    id: str
    formula_id: Literal["difference", "growth", "margin"]
    input_fact_ids: list[str]
    definition: str
    value: str | None
    unit: Literal["USD", "percent"]
    status: Literal["calculation_verified", "insufficient_evidence"]
    reason: str | None


class ResearchObservation(BaseModel):
    id: str
    template_id: str
    status: Literal["calculation_verified", "insufficient_evidence"]
    calculation_ids: list[str]


class InterpretationState(BaseModel):
    status: Literal["not_requested", "not_configured", "generated", "rejected", "failed"]


class RevenueCashFlowReport(BaseModel):
    schema_version: Literal[1]
    question_id: Literal["revenue-operating-cash-flow-v1"]
    method_version: str
    ticker: str
    cik: int
    company_name: str
    basis: Literal["annual", "quarterly"]
    current_period: FinancialPeriod | None
    prior_period: FinancialPeriod | None
    facts: list[ResearchFact]
    calculations: list[ResearchCalculation]
    observations: list[ResearchObservation]
    alternative_explanations: list[str]
    needs_review: list[str]
    quality_issues: list[str]
    retrieved_at: str
    calculated_at: str
    fact_hash: str
    interpretation: InterpretationState
