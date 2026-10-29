"""Offline synthetic SEC fixtures: these values are NOT NVIDIA filings."""

from __future__ import annotations

from copy import deepcopy
from pathlib import Path

import pytest
import requests
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.v1.endpoints.financials import get_sec_client, router
from data_provider.sec_edgar import SecEdgarClient, SecNotConfigured, SecRequestError, SecTickerNotFound
from src.services.sec_financials import normalize_sec_company


CIK = 1045810
FORMS = [
    ("0001045810-24-000010", "10-K", "2024-01-28", "2024-02-21", 2024, "FY"),
    ("0001045810-24-000020", "10-Q", "2024-04-28", "2024-05-22", 2025, "Q1"),
    ("0001045810-24-000030", "10-Q", "2024-07-28", "2024-08-22", 2025, "Q2"),
    ("0001045810-24-000040", "10-Q", "2024-10-27", "2024-11-20", 2025, "Q3"),
    ("0001045810-25-000010", "10-K", "2025-01-26", "2025-02-21", 2025, "FY"),
]
TAGS = {
    "revenue": "RevenueFromContractWithCustomerExcludingAssessedTax",
    "net_income": "NetIncomeLoss", "assets": "Assets", "liabilities": "Liabilities",
    "operating_cash_flow": "NetCashProvidedByUsedInOperatingActivities",
    "capital_expenditure": "PaymentsToAcquirePropertyPlantAndEquipment",
}


def synthetic_bundle():
    recent = {key: [] for key in ("accessionNumber", "form", "reportDate", "filingDate", "acceptanceDateTime", "primaryDocument")}
    for accession, form, end, filed, _, _ in FORMS:
        for key, val in zip(recent, (accession, form, end, filed, f"{filed}T12:00:00Z", "filing.htm")):
            recent[key].append(val)
    facts = {tag: {"units": {"USD": []}} for tag in TAGS.values()}

    def add(metric, index, value, start=None, *, concept=None, unit="USD"):
        accession, form, end, filed, fy, fp = FORMS[index]
        tag = concept or TAGS[metric]
        if tag not in facts:
            facts[tag] = {"units": {"USD": []}}
        facts[tag]["units"].setdefault(unit, []).append({
            "start": start, "end": end, "val": value, "accn": accession,
            "fy": fy, "fp": fp, "form": form, "filed": filed,
        } if start else {"end": end, "val": value, "accn": accession,
                         "fy": fy, "fp": fp, "form": form, "filed": filed})

    # Values are deliberately small and synthetic, never used as a live demo.
    for index, start, revenue, net, ocf, capex, assets, liabilities in [
        (0, "2023-01-30", 1000, 200, 300, 50, 5000, 2000),
        (1, "2024-01-29", 400, 80, 100, 10, 5200, 2100),
        (2, "2024-04-29", 450, 90, 220, 25, 5400, 2150),
        (3, "2024-07-29", 500, 100, 400, 40, 5600, 2200),
        (4, "2024-01-29", 2000, 500, 700, 70, 6000, 2300),
    ]:
        add("revenue", index, revenue, start)
        add("net_income", index, net, start)
        # SEC cash-flow facts in later 10-Qs are fiscal year-to-date.
        cash_start = "2024-01-29" if index in (2, 3) else start
        add("operating_cash_flow", index, ocf, cash_start)
        add("capital_expenditure", index, capex, cash_start)
        add("assets", index, assets)
        add("liabilities", index, liabilities)
    add("revenue", 3, 1350, "2024-01-29")
    add("net_income", 3, 270, "2024-01-29")
    bundle = {
        "ticker": "NVDA", "cik": CIK, "name": "SYNTHETIC NVIDIA FIXTURE",
        "retrieved_at": "2026-10-27T00:00:00+00:00",
        "submissions": {"cik": CIK, "name": "SYNTHETIC NVIDIA FIXTURE", "filings": {"recent": recent}},
        "companyfacts": {"cik": CIK, "facts": {"us-gaap": facts}},
    }
    return bundle, add


def period(result, kind, end):
    return next(item for item in result["periods"] if item["type"] == kind and item["period_end"] == end)


def test_fiscal_periods_ytd_q4_and_calculated_metrics():
    bundle, _ = synthetic_bundle()
    result = normalize_sec_company(bundle)
    annual = period(result, "annual", "2025-01-26")
    q2 = period(result, "quarterly", "2024-07-28")
    q4 = period(result, "quarterly", "2025-01-26")
    assert (annual["fiscal_year"], annual["period_start"], annual["values"]["revenue"]["value"]) == (2025, "2024-01-29", 2000)
    assert annual["metrics"]["net_profit_margin"]["value"] == 25
    assert annual["metrics"]["operating_cash_flow_margin"]["value"] == 35
    assert annual["metrics"]["revenue_growth"]["value"] == 100
    assert q2["fiscal_quarter"] == 2
    assert q2["values"]["revenue"]["kind"] == "reported"
    assert q2["values"]["operating_cash_flow"]["value"] == 120
    assert q2["values"]["operating_cash_flow"]["kind"] == "derived"
    assert len(q2["values"]["operating_cash_flow"]["sources"]) == 2
    assert q4["values"]["revenue"]["value"] == 650
    assert q4["values"]["net_income"]["value"] == 230
    assert q4["values"]["operating_cash_flow"]["value"] == 300
    assert q4["values"]["revenue"]["kind"] == "derived"
    assert q4["values"]["assets"]["value"] == 6000
    assert q4["filing_url"].endswith("/filing.htm")
    assert annual["values"]["revenue"]["sources"][0]["concept"].startswith("us-gaap:")


def test_missing_unit_and_ambiguous_repeated_facts_are_not_invented():
    bundle, add = synthetic_bundle()
    add("revenue", 4, 1999, "2024-01-29")
    add("capital_expenditure", 0, 999, "2023-01-30", unit="EUR")
    result = normalize_sec_company(bundle)
    annual = period(result, "annual", "2025-01-26")
    assert annual["values"]["revenue"] is None
    assert "ambiguous_revenue" in annual["quality_issues"]
    assert annual["metrics"]["net_profit_margin"] is None
    assert period(result, "annual", "2024-01-28")["values"]["capital_expenditure"]["value"] == 50


def test_later_amendment_wins_for_same_exact_period():
    bundle, _ = synthetic_bundle()
    recent = bundle["submissions"]["filings"]["recent"]
    for key, value in zip(recent, ("0001045810-25-000011", "10-K/A", "2025-01-26", "2025-03-01", "2025-03-01T12:00:00Z", "amendment.htm")):
        recent[key].append(value)
    bundle["companyfacts"]["facts"]["us-gaap"][TAGS["revenue"]]["units"]["USD"].append({
        "start": "2024-01-29", "end": "2025-01-26", "val": 2100,
        "accn": "0001045810-25-000011", "fy": 2025, "fp": "FY", "form": "10-K/A", "filed": "2025-03-01",
    })
    result = normalize_sec_company(bundle)
    revenue = period(result, "annual", "2025-01-26")["values"]["revenue"]
    assert revenue["value"] == 2100
    assert revenue["sources"][0]["form"] == "10-K/A"
    assert revenue["sources"][0]["url"].endswith("/amendment.htm")


def test_inconsistent_cumulative_outflow_and_concept_change_block_derived_values():
    bundle, _ = synthetic_bundle()
    facts = bundle["companyfacts"]["facts"]["us-gaap"]
    capex = facts[TAGS["capital_expenditure"]]["units"]["USD"]
    next(item for item in capex if item["end"] == "2024-07-28")["val"] = 5
    old_revenue = facts[TAGS["revenue"]]["units"]["USD"]
    prior = next(item for item in old_revenue if item["end"] == "2024-01-28")
    old_revenue.remove(prior)
    facts["Revenues"] = {"units": {"USD": [prior]}}
    result = normalize_sec_company(bundle)
    q2 = period(result, "quarterly", "2024-07-28")
    annual = period(result, "annual", "2025-01-26")
    assert q2["values"]["capital_expenditure"] is None
    assert "inconsistent_capital_expenditure" in q2["quality_issues"]
    assert annual["metrics"]["revenue_growth"] is None


def test_productive_assets_fallback_is_reported_with_broader_scope_and_derived_quarter():
    bundle, add = synthetic_bundle()
    facts = bundle["companyfacts"]["facts"]["us-gaap"]
    facts.pop(TAGS["capital_expenditure"])
    for index, start, value in [
        (0, "2023-01-30", 60), (1, "2024-01-29", 12),
        (2, "2024-01-29", 28), (3, "2024-01-29", 45),
        (4, "2024-01-29", 80),
    ]:
        add("capital_expenditure", index, value, start, concept="PaymentsToAcquireProductiveAssets")
    result = normalize_sec_company(bundle)
    annual = period(result, "annual", "2025-01-26")["values"]["capital_expenditure"]
    q2 = period(result, "quarterly", "2024-07-28")["values"]["capital_expenditure"]
    q4 = period(result, "quarterly", "2025-01-26")["values"]["capital_expenditure"]
    assert annual["value"] == 80 and annual["kind"] == "reported"
    assert "software" in annual["definition"]
    assert annual["sources"][0]["concept"] == "us-gaap:PaymentsToAcquireProductiveAssets"
    assert q2["value"] == 16 and q2["kind"] == "derived"
    assert q4["value"] == 35 and q4["kind"] == "derived"


class FakeResponse:
    def __init__(self, status, payload=None, headers=None):
        self.status_code = status
        self._payload = payload or {}
        self.headers = headers or {}

    def json(self):
        return self._payload


class FakeSession:
    def __init__(self, responses):
        self.responses = iter(responses)
        self.calls = []

    def get(self, url, **kwargs):
        self.calls.append((url, kwargs))
        response = next(self.responses)
        if isinstance(response, Exception):
            raise response
        return response


def test_ticker_resolution_and_contact_gate(tmp_path):
    mapping = {"0": {"cik_str": CIK, "ticker": "NVDA", "title": "NVIDIA CORP"},
               "1": {"cik_str": 1, "ticker": "NVDAA", "title": "OTHER"}}
    session = FakeSession([FakeResponse(200, mapping)])
    client = SecEdgarClient(None, cache_dir=tmp_path, session=session)
    with pytest.raises(SecNotConfigured):
        client.resolve_ticker("NVDA")
    assert session.calls == []
    client.contact_email = "research@equitylens.test"
    assert client.resolve_ticker("nvda") == (CIK, "NVIDIA CORP")
    assert client.resolve_ticker("NVDA") == (CIK, "NVIDIA CORP")  # cache
    assert len(session.calls) == 1
    assert "research@equitylens.test" in session.calls[0][1]["headers"]["User-Agent"]
    with pytest.raises(SecTickerNotFound):
        client.resolve_ticker("NVDA/../../")
    assert "research@equitylens.test" not in (tmp_path / "company_tickers.json").read_text()


def test_bounded_retries_rate_limit_and_failure(tmp_path):
    mapping = {"0": {"cik_str": CIK, "ticker": "NVDA", "title": "NVIDIA CORP"}}
    pauses = []
    session = FakeSession([FakeResponse(429, headers={"Retry-After": "2"}), FakeResponse(200, mapping)])
    client = SecEdgarClient("research@equitylens.test", cache_dir=tmp_path, session=session, sleep=pauses.append)
    assert client.resolve_ticker("NVDA")[0] == CIK
    assert 2.0 in pauses
    assert all(call[1]["timeout"] == (5, 15) for call in session.calls)
    failing = FakeSession([requests.Timeout(), requests.Timeout(), requests.Timeout()])
    client = SecEdgarClient("research@equitylens.test", cache_dir=tmp_path / "other", session=failing, sleep=lambda _: None)
    with pytest.raises(SecRequestError):
        client.resolve_ticker("NVDA")
    assert len(failing.calls) == 3


def test_company_bundle_cache_keeps_original_retrieval_time_and_rejects_cik_mismatch(tmp_path):
    mapping = {"0": {"cik_str": CIK, "ticker": "NVDA", "title": "NVIDIA CORP"}}
    session = FakeSession([
        FakeResponse(200, mapping),
        FakeResponse(200, {"cik": f"{CIK:010d}", "name": "NVIDIA CORP", "filings": {"recent": {}}}),
        FakeResponse(200, {"cik": CIK, "facts": {"us-gaap": {}}}),
    ])
    client = SecEdgarClient("research@equitylens.test", cache_dir=tmp_path, session=session)
    first = client.company_data("NVDA")
    second = client.company_data("NVDA")
    assert len(session.calls) == 3
    assert first["retrieved_at"] == second["retrieved_at"]
    assert first["cik"] == CIK

    mismatch = FakeSession([
        FakeResponse(200, mapping), FakeResponse(200, {"cik": 999}),
    ])
    client = SecEdgarClient("research@equitylens.test", cache_dir=tmp_path / "mismatch", session=mismatch)
    with pytest.raises(SecRequestError, match="CIK does not match"):
        client.company_data("NVDA")


def test_api_schema_and_explicit_unconfigured_status():
    app = FastAPI()
    app.include_router(router, prefix="/api/v1/financials")
    bundle, _ = synthetic_bundle()

    class FixtureClient:
        def company_data(self, ticker):
            assert ticker == "NVDA"
            return deepcopy(bundle)

    app.dependency_overrides[get_sec_client] = lambda: FixtureClient()
    response = TestClient(app).get("/api/v1/financials/company/NVDA")
    assert response.status_code == 200
    body = response.json()
    assert body["periods"][0]["values"]["revenue"]["sources"][0]["url"].startswith("https://www.sec.gov/Archives/")
    app.dependency_overrides[get_sec_client] = lambda: SecEdgarClient(None)
    response = TestClient(app).get("/api/v1/financials/company/NVDA")
    assert response.status_code == 503
    assert response.json()["detail"]["error"] == "sec_not_configured"
