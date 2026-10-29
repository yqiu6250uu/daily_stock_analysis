"""Deterministic investigation tests; synthetic figures are not issuer disclosures."""

from __future__ import annotations

from copy import deepcopy

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.v1.endpoints.research_questions import get_sec_client, router
from api.v1.schemas.research_questions import RevenueCashFlowReport
from src.services.revenue_cashflow_research import build_revenue_cashflow_report
from src.services.research_interpretation import validated_interpretation
from src.services.sec_financials import normalize_sec_company
from tests.test_sec_financials import synthetic_bundle


def sample():
    bundle, _ = synthetic_bundle()
    return normalize_sec_company(bundle)


def by_id(report, identifier):
    return next(item for item in report["calculations"] if item["id"] == identifier)


def test_annual_decimal_calculations_source_ids_and_schema():
    report = build_revenue_cashflow_report(sample(), basis="annual")
    validated = RevenueCashFlowReport.model_validate(report)
    assert validated.current_period.period_end == "2025-01-26"
    assert validated.prior_period.period_end == "2024-01-28"
    assert by_id(report, "revenue.change")["value"] == "1000"
    assert by_id(report, "revenue.growth")["value"] == "100"
    assert by_id(report, "operating_cash_flow.growth")["value"] == "133.3333"
    assert by_id(report, "current.operating_cash_flow_margin")["value"] == "35"
    assert report["observations"][0]["template_id"] == "both_increased"
    assert report["facts"][0]["value"]["sources"][0]["url"].startswith("https://www.sec.gov/Archives/")
    assert report["interpretation"] == {"status": "not_requested"}


def test_quarterly_requires_same_fiscal_quarter_and_duration():
    data = sample()
    report = build_revenue_cashflow_report(data, basis="quarterly", period_end="2024-07-28")
    assert report["prior_period"] is None
    assert by_id(report, "revenue.growth")["reason"] == "missing_input"
    current = report["current_period"]
    assert current["values"]["operating_cash_flow"]["kind"] == "derived"
    assert len(current["values"]["operating_cash_flow"]["sources"]) == 2
    previous = deepcopy(current)
    previous.update(fiscal_year=2024, period_start="2023-04-29", period_end="2023-07-28")
    data["periods"].append(previous)
    assert build_revenue_cashflow_report(data, basis="quarterly", period_end="2024-07-28")["prior_period"] is not None
    previous["period_start"] = "2023-01-01"
    assert build_revenue_cashflow_report(data, basis="quarterly", period_end="2024-07-28")["prior_period"] is None


@pytest.mark.parametrize("base,expected", [(0, "nonpositive_base"), (-100, "nonpositive_base"), (100, None)])
def test_zero_negative_and_positive_cash_base(base, expected):
    data = sample()
    prior = next(item for item in data["periods"] if item["type"] == "annual" and item["fiscal_year"] == 2024)
    prior["values"]["operating_cash_flow"]["value"] = base
    report = build_revenue_cashflow_report(data)
    assert by_id(report, "operating_cash_flow.growth")["reason"] == expected
    assert by_id(report, "operating_cash_flow.change")["value"] == str(700 - base)


def test_missing_unit_concept_and_restated_source_are_not_hidden():
    data = sample()
    current = next(item for item in data["periods"] if item["type"] == "annual" and item["fiscal_year"] == 2025)
    current["values"]["revenue"]["sources"][0]["form"] = "10-K/A"
    current["values"]["revenue"]["sources"][0]["accession"] = "0001045810-25-000011"
    report = build_revenue_cashflow_report(data)
    assert report["facts"][0]["value"]["sources"][0]["form"] == "10-K/A"
    current["values"]["revenue"]["sources"][0]["concept"] = "us-gaap:Revenues"
    report = build_revenue_cashflow_report(data)
    assert by_id(report, "revenue.growth")["value"] is None
    assert by_id(report, "revenue.growth")["reason"] == "incompatible_concept_or_unit"
    current["values"]["revenue"] = None
    assert by_id(build_revenue_cashflow_report(data), "revenue.growth")["reason"] == "missing_input"


def test_invalid_basis_or_period_is_rejected():
    with pytest.raises(ValueError):
        build_revenue_cashflow_report(sample(), basis="monthly")
    with pytest.raises(ValueError):
        build_revenue_cashflow_report(sample(), period_end="2030-01-01")


def test_api_response_and_no_model_key_required(monkeypatch):
    bundle, _ = synthetic_bundle()
    class FakeClient:
        def company_data(self, ticker):
            assert ticker == "NVDA"
            return bundle
    app = FastAPI()
    app.include_router(router, prefix="/api/v1/research")
    app.dependency_overrides[get_sec_client] = lambda: FakeClient()
    response = TestClient(app).get("/api/v1/research/company/NVDA/revenue-cash-flow?basis=annual")
    assert response.status_code == 200
    assert response.json()["schema_version"] == 1
    assert response.json()["calculations"][0]["input_fact_ids"]
    assert TestClient(app).get("/api/v1/research/company/NVDA/revenue-cash-flow?basis=monthly").status_code == 422
    monkeypatch.setenv("EQUITYLENS_AI_INTERPRETATION_ENABLED", "false")
    assert TestClient(app).post("/api/v1/research/company/NVDA/revenue-cash-flow/interpretation").json() == {"status": "not_configured"}


def test_ai_output_schema_citations_numbers_and_causality():
    report = build_revenue_cashflow_report(sample())
    good = '{"interpretations":[{"text":"Both observed movements warrant review of the cash flow statement.","citation_ids":["revenue.growth","operating_cash_flow.growth"]}],"alternative_explanations":[],"needs_review":[]}'
    result = validated_interpretation(report, locale="en", model_id="test-only", completion=lambda _: good)
    assert result["status"] == "generated"
    assert validated_interpretation(report, locale="en", model_id="test-only", completion=lambda _: "bad")["cached"]
    for bad in (good.replace("revenue.growth", "invented.fact"), good.replace("Both observed", "2025 observed"), good.replace("warrant review", "caused growth")):
        with pytest.raises(ValueError):
            validated_interpretation(report, locale="zh", model_id="test-only", completion=lambda _, text=bad: text)
