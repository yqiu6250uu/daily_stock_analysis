"""Deterministic normalization of SEC CompanyFacts for an evidence-led view.

CompanyFacts contains many contexts and comparative facts. Selection is by
exact end date, required duration/unit, preferred concept, then latest filing.
Conflicting values in the winning filing/context are omitted as ambiguous.
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any


CONCEPTS: dict[str, tuple[str, ...]] = {
    "revenue": (
        "RevenueFromContractWithCustomerExcludingAssessedTax",
        "Revenues",
        "SalesRevenueNet",
    ),
    "net_income": ("NetIncomeLoss",),
    "assets": ("Assets",),
    "liabilities": ("Liabilities",),
    "operating_cash_flow": ("NetCashProvidedByUsedInOperatingActivities",),
    "capital_expenditure": (
        "PaymentsToAcquirePropertyPlantAndEquipment",
        "PaymentsToAcquireProductiveAssets",
    ),
}
INSTANT = frozenset({"assets", "liabilities"})
FLOW = tuple(name for name in CONCEPTS if name not in INSTANT)
ALLOWED_FORMS = frozenset({"10-K", "10-K/A", "10-Q", "10-Q/A"})


def _iso_date(value: object) -> date | None:
    try:
        return date.fromisoformat(str(value))
    except (TypeError, ValueError):
        return None


def _source_url(cik: int, accession: str, primary_document: str | None) -> str:
    base = f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession.replace('-', '')}/"
    if primary_document and primary_document.replace("-", "").replace("_", "").replace(".", "").isalnum() and ".." not in primary_document:
        return base + primary_document
    return base


def _filing_index(submissions: dict[str, Any]) -> dict[str, dict[str, Any]]:
    recent = submissions.get("filings", {}).get("recent", {})
    if not isinstance(recent, dict):
        return {}
    accessions = recent.get("accessionNumber", [])
    result: dict[str, dict[str, Any]] = {}
    for index, accession in enumerate(accessions):
        if not isinstance(accession, str) or not (len(accession) == 20 and accession[:10].isdigit()
                                                 and accession[10] == "-" and accession[11:13].isdigit()
                                                 and accession[13] == "-" and accession[14:].isdigit()):
            continue
        def column(name: str) -> Any:
            values = recent.get(name, [])
            return values[index] if isinstance(values, list) and index < len(values) else None
        result[accession] = {
            "form": column("form"),
            "filed": column("filingDate"),
            "accepted": column("acceptanceDateTime"),
            "report_date": column("reportDate"),
            "primary_document": column("primaryDocument"),
        }
    return result


def _facts(companyfacts: dict[str, Any]) -> dict[str, Any]:
    return companyfacts.get("facts", {}).get("us-gaap", {})


def _anchor_labels(facts: dict[str, Any], accession: str, end: str, form: str) -> tuple[int | None, str | None]:
    # These metadata fields are trusted only for a fact from the same filing
    # whose period end equals that filing's report date; comparative fy is not.
    for concept in (*CONCEPTS["revenue"], *CONCEPTS["assets"]):
        units = facts.get(concept, {}).get("units", {}).get("USD", [])
        for fact in units:
            if fact.get("accn") == accession and fact.get("end") == end and fact.get("form") == form:
                fy, fp = fact.get("fy"), fact.get("fp")
                if isinstance(fy, int) and isinstance(fp, str):
                    return fy, fp
    return None, None


def _anchors(submissions: dict[str, Any], facts: dict[str, Any]) -> list[dict[str, Any]]:
    filings = _filing_index(submissions)
    grouped: dict[tuple[str, str], dict[str, Any]] = {}
    for accession, meta in filings.items():
        form, end = meta["form"], meta["report_date"]
        if form not in ALLOWED_FORMS or _iso_date(end) is None:
            continue
        kind = "annual" if form.startswith("10-K") else "quarterly"
        fy, fp = _anchor_labels(facts, accession, end, form)
        key = (kind, end)
        current = grouped.get(key)
        item = {**meta, "accession": accession, "end": end, "kind": kind, "fy": fy, "fp": fp}
        if current is None or (str(item["filed"]), str(item["accepted"]), accession) > (
            str(current["filed"]), str(current["accepted"]), current["accession"]
        ):
            grouped[key] = item
    return sorted(grouped.values(), key=lambda item: item["end"])


def _candidate(
    facts: dict[str, Any], metric: str, end: str, mode: str,
    filing_index: dict[str, dict[str, Any]], cik: int, retrieved_at: str,
    exact_start: str | None = None,
) -> tuple[dict[str, Any] | None, str | None]:
    for concept in CONCEPTS[metric]:
        units = facts.get(concept, {}).get("units", {})
        candidates: list[dict[str, Any]] = []
        for fact in units.get("USD", []):
            if fact.get("end") != end or fact.get("form") not in ALLOWED_FORMS:
                continue
            start = _iso_date(fact.get("start"))
            end_date = _iso_date(end)
            days = (end_date - start).days + 1 if start and end_date else None
            if mode == "instant" and start is not None:
                continue
            if mode == "annual" and (days is None or not 320 <= days <= 400):
                continue
            if mode == "quarter" and (days is None or not 55 <= days <= 120):
                continue
            if mode == "ytd" and (days is None or not 110 <= days <= 330 or fact.get("start") != exact_start):
                continue
            if mode == "full_ytd" and (days is None or not 200 <= days <= 330 or fact.get("start") != exact_start):
                continue
            value = fact.get("val")
            if isinstance(value, bool) or not isinstance(value, int):
                continue
            accession = fact.get("accn")
            if not isinstance(accession, str) or not accession.replace("-", "").isdigit():
                continue
            meta = filing_index.get(accession, {})
            filed = str(meta.get("filed") or fact.get("filed") or "")
            if not _iso_date(filed):
                continue
            source = {
                "concept": f"us-gaap:{concept}", "unit": "USD", "period_start": fact.get("start"),
                "period_end": end, "form": fact["form"], "filed": filed,
                "accepted": meta.get("accepted"), "accession": accession,
                "url": _source_url(cik, accession, meta.get("primary_document")),
                "retrieved_at": retrieved_at,
            }
            candidates.append({"value": value, "source": source, "rank": (filed, str(meta.get("accepted") or ""), accession)})
        if not candidates:
            continue
        winning_rank = max(item["rank"] for item in candidates)
        winners = [item for item in candidates if item["rank"] == winning_rank]
        if len({item["value"] for item in winners}) != 1:
            return None, "ambiguous"
        selected = winners[0]
        definition = (
            "SEC productive-assets cash outflow includes property, plant and equipment, software, and other intangible assets."
            if metric == "capital_expenditure" and concept == "PaymentsToAcquireProductiveAssets" else None
        )
        return {"value": selected["value"], "unit": "USD", "kind": "reported", "definition": definition,
                "sources": [selected["source"]]}, None
    return None, "missing"


def _difference(current: dict[str, Any], previous: dict[str, Any], definition: str) -> dict[str, Any] | None:
    first, second = current["sources"][0], previous["sources"][0]
    if first["concept"] != second["concept"] or first["unit"] != second["unit"]:
        return None
    if first["period_start"] != second["period_start"]:
        return None
    if first["concept"].endswith(("PaymentsToAcquirePropertyPlantAndEquipment", "PaymentsToAcquireProductiveAssets")) and current["value"] < previous["value"]:
        return None
    return {"value": current["value"] - previous["value"], "unit": "USD", "kind": "derived",
            "definition": definition, "sources": current["sources"] + previous["sources"]}


def _ratio(numerator: dict[str, Any] | None, denominator: dict[str, Any] | None,
           definition: str) -> dict[str, Any] | None:
    if not numerator or not denominator or denominator["value"] <= 0:
        return None
    return {"value": round(100 * numerator["value"] / denominator["value"], 4),
            "unit": "percent", "kind": "derived", "definition": definition,
            "sources": numerator["sources"] + denominator["sources"]}


def normalize_sec_company(data: dict[str, Any]) -> dict[str, Any]:
    """Build recent annual/quarterly financial periods from a validated SEC bundle."""
    cik = data["cik"]
    facts = _facts(data["companyfacts"])
    filings = _filing_index(data["submissions"])
    anchors = _anchors(data["submissions"], facts)
    annual_anchors = [item for item in anchors if item["kind"] == "annual"][-6:]
    quarter_anchors = [item for item in anchors if item["kind"] == "quarterly"][-12:]
    periods: list[dict[str, Any]] = []

    def make_period(anchor: dict[str, Any], kind: str, start: str | None, quarter: int | None) -> dict[str, Any]:
        values: dict[str, Any] = {}
        issues: list[str] = []
        for metric in CONCEPTS:
            mode = "instant" if metric in INSTANT else ("annual" if kind == "annual" else "quarter")
            value, reason = _candidate(facts, metric, anchor["end"], mode, filings, cik, data["retrieved_at"])
            values[metric] = value
            if reason:
                issues.append(f"{reason}_{metric}")
        return {
            "type": kind, "period_start": start, "period_end": anchor["end"],
            "fiscal_year": anchor.get("fy"), "fiscal_quarter": quarter,
            "filing_form": anchor["form"], "filing_date": anchor["filed"],
            "acceptance_date": anchor["accepted"], "accession": anchor["accession"],
            "filing_url": _source_url(cik, anchor["accession"], anchor.get("primary_document")),
            "values": values, "metrics": {}, "quality_issues": issues,
        }

    for anchor in annual_anchors:
        # The exact duration comes from selected reported facts, never a calendar-year guess.
        period = make_period(anchor, "annual", None, None)
        source = (period["values"].get("revenue") or period["values"].get("operating_cash_flow"))
        period["period_start"] = source["sources"][0]["period_start"] if source else None
        periods.append(period)

    for anchor in quarter_anchors:
        fp = anchor.get("fp")
        if fp not in ("Q1", "Q2", "Q3"):
            continue
        quarter = int(fp[1])
        prior = max((item for item in anchors if item["end"] < anchor["end"] and
                     (item["kind"] == "quarterly" or item["kind"] == "annual")),
                    key=lambda item: item["end"], default=None)
        start = (_iso_date(prior["end"]) + timedelta(days=1)).isoformat() if prior else None
        period = make_period(anchor, "quarterly", start, quarter)
        if quarter > 1:
            annual_prior = max((item for item in annual_anchors if item["end"] < anchor["end"]),
                               key=lambda item: item["end"], default=None)
            previous_quarter = max((item for item in quarter_anchors if item["end"] < anchor["end"]),
                                   key=lambda item: item["end"], default=None)
            if annual_prior and previous_quarter:
                fy_start = (_iso_date(annual_prior["end"]) + timedelta(days=1)).isoformat()
                for metric in ("operating_cash_flow", "capital_expenditure"):
                    if period["values"][metric] is not None or f"missing_{metric}" not in period["quality_issues"]:
                        continue
                    current, _ = _candidate(facts, metric, anchor["end"], "ytd", filings, cik,
                                            data["retrieved_at"], fy_start)
                    previous, _ = _candidate(facts, metric, previous_quarter["end"],
                                             "quarter" if quarter == 2 else "ytd", filings, cik,
                                             data["retrieved_at"], fy_start if quarter > 2 else None)
                    if current and previous:
                        derived = _difference(current, previous, "Current fiscal YTD minus prior fiscal YTD")
                        if derived:
                            period["values"][metric] = derived
                            period["quality_issues"].remove(f"missing_{metric}")
                        else:
                            period["quality_issues"].remove(f"missing_{metric}")
                            period["quality_issues"].append(f"inconsistent_{metric}")
        periods.append(period)

    # Q4 is not a separate 10-Q. Subtract nine-month YTD from the annual
    # 10-K only when concept, unit and fiscal start agree; never label it reported.
    for annual in [item for item in periods if item["type"] == "annual"]:
        q3 = max((item for item in quarter_anchors if item.get("fp") == "Q3" and item["end"] < annual["period_end"]
                  and (date.fromisoformat(annual["period_end"]) - date.fromisoformat(item["end"])).days < 150),
                 key=lambda item: item["end"], default=None)
        if not q3 or not annual["period_start"]:
            continue
        anchor = next(item for item in annual_anchors if item["end"] == annual["period_end"])
        q4 = make_period(anchor, "quarterly", (_iso_date(q3["end"]) + timedelta(days=1)).isoformat(), 4)
        for metric in FLOW:
            if q4["values"][metric] is not None or f"ambiguous_{metric}" in q4["quality_issues"]:
                continue
            full = annual["values"][metric]
            nine_month, _ = _candidate(facts, metric, q3["end"], "full_ytd", filings, cik,
                                       data["retrieved_at"], annual["period_start"])
            q4["values"][metric] = _difference(full, nine_month, "Full fiscal year minus first nine months") if full and nine_month else None
            if q4["values"][metric] is not None and f"missing_{metric}" in q4["quality_issues"]:
                q4["quality_issues"].remove(f"missing_{metric}")
            elif full and nine_month and f"missing_{metric}" in q4["quality_issues"]:
                q4["quality_issues"].remove(f"missing_{metric}")
                q4["quality_issues"].append(f"inconsistent_{metric}")
        periods.append(q4)

    for kind in ("annual", "quarterly"):
        ordered = sorted((item for item in periods if item["type"] == kind), key=lambda item: item["period_end"])
        for index, period in enumerate(ordered):
            revenue = period["values"]["revenue"]
            period["metrics"] = {
                "net_profit_margin": _ratio(period["values"]["net_income"], revenue,
                                            "Net income / revenue × 100"),
                "operating_cash_flow_margin": _ratio(period["values"]["operating_cash_flow"], revenue,
                                                     "Operating cash flow / revenue × 100"),
                "revenue_growth": None,
            }
            previous = next((item for item in reversed(ordered[:index])
                             if item["fiscal_year"] is not None and period["fiscal_year"] is not None
                             and item["fiscal_year"] == period["fiscal_year"] - 1
                             and (kind == "annual" or item["fiscal_quarter"] == period["fiscal_quarter"])), None)
            if previous:
                old = previous["values"]["revenue"]
                if revenue and old and revenue["sources"][0]["concept"] == old["sources"][0]["concept"]:
                    period["metrics"]["revenue_growth"] = _ratio(
                        {**revenue, "value": revenue["value"] - old["value"],
                         "sources": revenue["sources"] + old["sources"]}, old,
                        "(Current revenue − comparable prior-year revenue) / comparable prior-year revenue × 100",
                    )
    periods.sort(key=lambda item: (item["period_end"], item["type"]), reverse=True)
    return {
        "ticker": data["ticker"], "cik": cik, "company_name": data["name"],
        "currency": "USD", "retrieved_at": data["retrieved_at"],
        "periods": periods,
        "data_quality": {
            "source": "SEC EDGAR CompanyFacts and Submissions",
            "note": "Only SEC us-gaap USD facts from 10-K/10-Q and amendments; missing or ambiguous values are null.",
            "issues_count": sum(len(item["quality_issues"]) for item in periods),
        },
    }
