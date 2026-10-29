"""Evidence-linked, deterministic revenue and operating cash flow investigation.

This module consumes the existing normalized SEC response. It never selects raw
XBRL facts or infers a cause for a financial movement.
"""

from __future__ import annotations

import hashlib
import json
from datetime import date, datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Any


QUESTION_ID = "revenue-operating-cash-flow-v1"
METHOD_VERSION = "1.0.0"
FIELDS = ("revenue", "operating_cash_flow", "net_income")


def _days(period: dict[str, Any]) -> int | None:
    try:
        return (date.fromisoformat(period["period_end"]) - date.fromisoformat(period["period_start"])).days + 1
    except (KeyError, TypeError, ValueError):
        return None


def _prior(current: dict[str, Any], periods: list[dict[str, Any]]) -> dict[str, Any] | None:
    year = current.get("fiscal_year")
    duration = _days(current)
    if not isinstance(year, int) or duration is None:
        return None
    for candidate in periods:
        if candidate.get("type") != current.get("type") or candidate.get("fiscal_year") != year - 1:
            continue
        if candidate.get("fiscal_quarter") != current.get("fiscal_quarter"):
            continue
        earlier = _days(candidate)
        if earlier is not None and abs(earlier - duration) <= 10:
            return candidate
    return None


def _compatible(current: dict[str, Any] | None, prior: dict[str, Any] | None) -> bool:
    if not current or not prior or current.get("unit") != "USD" or prior.get("unit") != "USD":
        return False
    concepts = []
    for value in (current, prior):
        sources = value.get("sources", [])
        unique = {source.get("concept") for source in sources if isinstance(source, dict)}
        if len(unique) != 1 or not all(source.get("unit") == "USD" for source in sources):
            return False
        concepts.append(next(iter(unique)))
    return concepts[0] == concepts[1]


def _number(value: Any) -> Decimal:
    if isinstance(value, bool) or not isinstance(value, (int, float, str)):
        raise ValueError("Invalid financial number")
    result = Decimal(str(value))
    if not result.is_finite():
        raise ValueError("Non-finite financial number")
    return result


def _decimal(value: Decimal) -> str:
    return format(value.quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP).normalize(), "f")


def build_revenue_cashflow_report(
    financials: dict[str, Any], *, basis: str = "annual", period_end: str | None = None,
) -> dict[str, Any]:
    """Create one investigation; missing/incompatible inputs yield explicit nulls."""
    if basis not in ("annual", "quarterly"):
        raise ValueError("basis must be annual or quarterly")
    periods = sorted(
        (item for item in financials.get("periods", []) if item.get("type") == basis),
        key=lambda item: item.get("period_end", ""), reverse=True,
    )
    current = next((item for item in periods if item.get("period_end") == period_end), None) if period_end else (periods[0] if periods else None)
    if period_end and current is None:
        raise ValueError("Requested financial period is unavailable")
    prior = _prior(current, periods) if current else None
    facts: list[dict[str, Any]] = []
    values: dict[str, dict[str, Any] | None] = {}
    for role, period in (("current", current), ("prior", prior)):
        for field in FIELDS:
            fact_id = f"{role}.{field}"
            value = period.get("values", {}).get(field) if period else None
            values[fact_id] = value
            facts.append({"id": fact_id, "field": field, "role": role,
                          "period_end": period.get("period_end") if period else None,
                          "status": "source_confirmed" if value and value.get("kind") == "reported"
                          else "calculation_verified" if value else "insufficient_evidence",
                          "value": value})

    calculations: list[dict[str, Any]] = []

    def add(identifier: str, formula: str, input_ids: tuple[str, ...], *,
            percentage: bool = False, same_concept: bool = False,
            positive_base: bool = False) -> None:
        inputs = [values[key] for key in input_ids]
        reason = None
        if any(item is None for item in inputs):
            reason = "missing_input"
        elif same_concept and not _compatible(inputs[0], inputs[1]):
            reason = "incompatible_concept_or_unit"
        elif any(item.get("unit") != "USD" for item in inputs):
            reason = "incompatible_unit"
        elif positive_base and _number(inputs[-1]["value"]) <= 0:
            reason = "nonpositive_base"
        result = None
        if reason is None:
            numbers = [_number(item["value"]) for item in inputs]
            if formula == "difference":
                result = numbers[0] - numbers[1]
            elif formula == "growth":
                result = (numbers[0] - numbers[1]) / numbers[1] * 100
            elif formula == "margin":
                result = numbers[0] / numbers[1] * 100
        calculations.append({"id": identifier, "formula_id": formula, "input_fact_ids": list(input_ids),
                             "definition": "(current − prior) / prior × 100" if formula == "growth" else
                             "numerator / revenue × 100" if formula == "margin" else "current − prior",
                             "value": _decimal(result) if result is not None else None,
                             "unit": "percent" if percentage else "USD",
                             "status": "calculation_verified" if result is not None else "insufficient_evidence",
                             "reason": reason})

    for field in FIELDS:
        add(f"{field}.change", "difference", (f"current.{field}", f"prior.{field}"), same_concept=True)
        add(f"{field}.growth", "growth", (f"current.{field}", f"prior.{field}"),
            percentage=True, same_concept=True, positive_base=True)
    for role in ("current", "prior"):
        add(f"{role}.operating_cash_flow_margin", "margin", (f"{role}.operating_cash_flow", f"{role}.revenue"),
            percentage=True, positive_base=True)

    by_id = {item["id"]: item for item in calculations}
    rev_growth = by_id["revenue.growth"]["value"]
    cash_growth = by_id["operating_cash_flow.growth"]["value"]
    observations: list[dict[str, Any]] = []
    if rev_growth is not None and cash_growth is not None:
        rev = Decimal(rev_growth)
        cash = Decimal(cash_growth)
        code = "both_increased" if rev > 0 and cash > 0 else "revenue_up_cash_not_up" if rev > 0 and cash <= 0 else "mixed_movement"
        observations.append({"id": "growth_direction", "template_id": code, "status": "calculation_verified",
                             "calculation_ids": ["revenue.growth", "operating_cash_flow.growth"]})
    else:
        observations.append({"id": "growth_direction", "template_id": "insufficient_comparable_growth",
                             "status": "insufficient_evidence", "calculation_ids": ["revenue.growth", "operating_cash_flow.growth"]})

    source_payload = {"ticker": financials.get("ticker"), "cik": financials.get("cik"),
                      "retrieved_at": financials.get("retrieved_at"), "current": current,
                      "prior": prior, "method_version": METHOD_VERSION}
    fact_hash = hashlib.sha256(json.dumps(source_payload, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    return {
        "schema_version": 1, "question_id": QUESTION_ID, "method_version": METHOD_VERSION,
        "ticker": financials.get("ticker"), "cik": financials.get("cik"), "company_name": financials.get("company_name"),
        "basis": basis, "current_period": current, "prior_period": prior,
        "facts": facts, "calculations": calculations, "observations": observations,
        "alternative_explanations": ["working_capital_timing", "tax_or_non_cash_items", "customer_payment_timing"],
        "needs_review": ["inspect_cash_flow_statement_and_notes"],
        "quality_issues": [] if prior else ["no_comparable_prior_period"],
        "retrieved_at": financials.get("retrieved_at"),
        "calculated_at": datetime.now(timezone.utc).isoformat(), "fact_hash": fact_hash,
        "interpretation": {"status": "not_requested"},
    }
