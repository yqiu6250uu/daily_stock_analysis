"""Export and independently validate the three-issuer SEC portfolio universe.

The source is the local EquityLens API; public files never contain SEC contact
identity or private settings. Use --input-dir for a reproducible offline rebuild.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from api.v1.schemas.research_questions import RevenueCashFlowReport  # noqa: E402
from src.services.revenue_cashflow_research import build_revenue_cashflow_report  # noqa: E402

ISSUERS = {"NVDA": 1045810, "MSFT": 789019, "AMAT": 6951}
OUTPUT = ROOT / "apps/dsa-web/public-demo/demo/v02"
SEC_PREFIX = "https://www.sec.gov/Archives/edgar/data/"
EMAIL = re.compile(rb"[A-Za-z0-9_.+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


def _official_payload(cik: int) -> dict:
    path = ROOT / "data/sec_cache" / f"companyfacts_{cik:010d}.json"
    if not path.is_file():
        raise ValueError(f"Official SEC CompanyFacts cache missing for CIK {cik}")
    return json.loads(path.read_text())["payload"]


def _confirm_ticker_mapping(ticker: str, cik: int) -> None:
    path = ROOT / "data/sec_cache/company_tickers.json"
    if not path.is_file():
        raise ValueError("Official SEC ticker mapping cache missing")
    mapping = json.loads(path.read_text())["payload"]
    matches = [row for row in mapping.values() if isinstance(row, dict) and row.get("ticker") == ticker]
    if len(matches) != 1 or int(matches[0]["cik_str"]) != cik:
        raise ValueError("Official SEC ticker-to-CIK mapping mismatch")


def _confirm_source(source: dict, value: int, official: dict) -> None:
    concept = source["concept"].removeprefix("us-gaap:")
    if not source["concept"].startswith("us-gaap:") or source["unit"] != "USD":
        raise ValueError("Unsupported source taxonomy or unit")
    candidates = official["facts"]["us-gaap"][concept]["units"]["USD"]
    if not any(item.get("accn") == source["accession"] and
               item.get("start") == source["period_start"] and
               item.get("end") == source["period_end"] and
               item.get("form") == source["form"] and item.get("val") == value
               for item in candidates):
        raise ValueError("Reported fact does not match official SEC CompanyFacts")


def validate_issuer(raw: bytes, ticker: str) -> tuple[dict, dict]:
    if EMAIL.search(raw) or b"localhost" in raw or b"127.0.0.1" in raw:
        raise ValueError("Public snapshot contains private contact or local URL")
    data = json.loads(raw)
    cik = ISSUERS[ticker]
    _confirm_ticker_mapping(ticker, cik)
    if data.get("ticker") != ticker or data.get("cik") != cik or data.get("currency") != "USD":
        raise ValueError("Ticker, CIK or currency mismatch")
    datetime.fromisoformat(data["retrieved_at"].replace("Z", "+00:00"))
    official = _official_payload(cik)
    if int(official["cik"]) != cik:
        raise ValueError("Official CompanyFacts CIK mismatch")
    periods = data.get("periods", [])
    checks = {"annual": 0, "quarterly": 0, "facts": 0, "derived": 0}
    for basis in ("annual", "quarterly"):
        selected = [period for period in periods if period.get("type") == basis][:2]
        if len(selected) < 2:
            raise ValueError(f"At least two {basis} periods required")
        for period in selected:
            if not str(period.get("filing_url", "")).startswith(SEC_PREFIX):
                raise ValueError("Period filing URL is not an original SEC URL")
            if not period.get("period_start") or not period.get("period_end") or not period.get("filing_form"):
                raise ValueError("Financial period is missing context")
            for field in ("revenue", "net_income", "operating_cash_flow"):
                item = period.get("values", {}).get(field)
                if not item or item.get("unit") != "USD" or not item.get("sources"):
                    raise ValueError(f"Missing required {field} for {ticker} {basis}")
                sources = item["sources"]
                if item["kind"] == "reported":
                    if len(sources) != 1:
                        raise ValueError("Reported fact must have one source")
                    _confirm_source(sources[0], item["value"], official)
                    checks["facts"] += 1
                elif item["kind"] == "derived":
                    if len(sources) != 2 or not item.get("definition"):
                        raise ValueError("Derived quarter lacks two inputs or definition")
                    original_values = []
                    for source in sources:
                        concept = source["concept"].removeprefix("us-gaap:")
                        entries = official["facts"]["us-gaap"][concept]["units"]["USD"]
                        matches = [fact["val"] for fact in entries if fact.get("accn") == source["accession"]
                                   and fact.get("start") == source["period_start"] and fact.get("end") == source["period_end"]
                                   and fact.get("form") == source["form"]]
                        if len(set(matches)) != 1:
                            raise ValueError("Ambiguous derived-quarter SEC input")
                        original_values.append(matches[0])
                    if original_values[0] - original_values[1] != item["value"]:
                        raise ValueError("Derived-quarter arithmetic mismatch")
                    checks["derived"] += 1
                else:
                    raise ValueError("Unknown reported/derived kind")
                if any(not source["url"].startswith(SEC_PREFIX) for source in sources):
                    raise ValueError("Invalid source filing URL")
            checks[basis] += 1
    if checks["facts"] < 8:
        raise ValueError("Too few independently matched original SEC facts")
    return data, checks


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-dir", type=Path, help="Optional directory containing NVDA.json, MSFT.json and AMAT.json")
    parser.add_argument("--output-dir", type=Path, default=OUTPUT)
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    universe = {"schema_version": 1, "issuers": []}
    for ticker, cik in ISSUERS.items():
        if args.input_dir:
            raw = (args.input_dir / f"{ticker}.json").read_bytes()
        else:
            with urllib.request.urlopen(f"http://127.0.0.1:8000/api/v1/financials/company/{ticker}", timeout=60) as response:
                if response.status != 200:
                    raise ValueError(f"Local API did not return {ticker}")
                raw = response.read()
        data, checks = validate_issuer(raw, ticker)
        snapshot_path = args.output_dir / f"{ticker.lower()}.json"
        snapshot_path.write_bytes(raw)
        reports = []
        for period in data["periods"]:
            if period["type"] not in ("annual", "quarterly"):
                continue
            report = build_revenue_cashflow_report(data, basis=period["type"], period_end=period["period_end"])
            reports.append(RevenueCashFlowReport.model_validate(report).model_dump(mode="json"))
        report_path = args.output_dir / f"{ticker.lower()}-reports.json"
        report_bytes = json.dumps({"schema_version": 1, "ticker": ticker, "reports": reports},
                                  ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        report_path.write_bytes(report_bytes)
        digest = hashlib.sha256(raw).hexdigest()
        universe["issuers"].append({"ticker": ticker, "cik": cik, "company_name": data["company_name"],
                                     "retrieved_at": data["retrieved_at"], "snapshot_sha256": digest,
                                     "snapshot_url": f"/demo/v02/{ticker.lower()}.json",
                                     "reports_url": f"/demo/v02/{ticker.lower()}-reports.json",
                                     "reports_sha256": hashlib.sha256(report_bytes).hexdigest(),
                                     "validation": checks})
        print(json.dumps({"ticker": ticker, "sha256": digest, "checks": checks, "reports": len(reports)}))
    (args.output_dir / "universe.json").write_text(json.dumps(universe, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
