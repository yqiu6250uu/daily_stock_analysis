"""Offline release-integrity checks for real SEC snapshots, not live SEC tests."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from urllib.parse import urlparse

import pytest

from api.v1.schemas.research_questions import RevenueCashFlowReport
from src.services.revenue_cashflow_research import build_revenue_cashflow_report


ROOT = Path(__file__).resolve().parents[1] / "apps/dsa-web/public-demo/demo/v02"
GOLDEN = {
    "NVDA": (1045810, "2026-01-25", 215_938_000_000, 102_718_000_000),
    "MSFT": (789019, "2026-06-30", 331_839_000_000, 182_935_000_000),
    "AMAT": (6951, "2025-10-26", 28_368_000_000, 7_958_000_000),
}


@pytest.mark.parametrize("ticker", GOLDEN)
def test_snapshot_manifest_golden_facts_and_report_contract(ticker):
    manifest = json.loads((ROOT / "universe.json").read_text())
    entry = next(item for item in manifest["issuers"] if item["ticker"] == ticker)
    raw = (ROOT / f"{ticker.lower()}.json").read_bytes()
    financials = json.loads(raw)
    cik, end, revenue, cash = GOLDEN[ticker]
    assert hashlib.sha256(raw).hexdigest() == entry["snapshot_sha256"]
    assert financials["cik"] == cik and financials["ticker"] == ticker
    annual = next(item for item in financials["periods"] if item["type"] == "annual")
    assert annual["period_end"] == end
    assert annual["values"]["revenue"]["value"] == revenue
    assert annual["values"]["operating_cash_flow"]["value"] == cash
    source_count = 0
    for period in financials["periods"]:
        assert urlparse(period["filing_url"]).netloc == "www.sec.gov"
        for value in (*period["values"].values(), *period["metrics"].values()):
            if not value:
                continue
            for source in value["sources"]:
                parsed = urlparse(source["url"])
                assert parsed.scheme == "https" and parsed.netloc == "www.sec.gov"
                assert parsed.path.startswith("/Archives/edgar/data/")
                assert source["accession"].replace("-", "") in parsed.path
                source_count += 1
    assert source_count >= 300
    report_raw = (ROOT / f"{ticker.lower()}-reports.json").read_bytes()
    assert hashlib.sha256(report_raw).hexdigest() == entry["reports_sha256"]
    reports = json.loads(report_raw)["reports"]
    assert len(reports) == len(financials["periods"])
    for report in reports:
        RevenueCashFlowReport.model_validate(report)
        rebuilt = build_revenue_cashflow_report(
            financials, basis=report["basis"], period_end=report["current_period"]["period_end"]
        )
        assert report["fact_hash"] == rebuilt["fact_hash"]
        assert report["calculations"] == rebuilt["calculations"]
        assert report["observations"] == rebuilt["observations"]
        for fact in report["facts"]:
            if fact["value"]:
                assert fact["value"]["sources"]
                assert all(source["url"].startswith("https://www.sec.gov/Archives/edgar/data/")
                           for source in fact["value"]["sources"])
