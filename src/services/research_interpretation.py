"""Optional local-only AI explanation over a verified, immutable fact packet.

The deterministic investigation remains fully usable if this adapter is absent.
Model text is never promoted to a reported or calculated financial fact.
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from typing import Any, Callable

from pydantic import BaseModel, Field, field_validator


PROMPT_VERSION = "1.0.0"
_NUMERIC_CLAIM = re.compile(r"\d|[０-９]")
_UNSUPPORTED_CAUSALITY = re.compile(r"\b(caused|proves|guarantees|buy|sell|target price)\b|导致|证明|保证|买入|卖出|目标价", re.I)
_CACHE: dict[tuple[str, str, str, str], dict[str, Any]] = {}


class InterpretationItem(BaseModel):
    text: str = Field(min_length=12, max_length=800)
    citation_ids: list[str] = Field(min_length=1, max_length=8)

    @field_validator("text")
    @classmethod
    def conservative_text(cls, value: str) -> str:
        if _NUMERIC_CLAIM.search(value) or _UNSUPPORTED_CAUSALITY.search(value):
            raise ValueError("Interpretation contains an unverified numeric or causal claim")
        return value


class InterpretationDraft(BaseModel):
    interpretations: list[InterpretationItem] = Field(max_length=4)
    alternative_explanations: list[InterpretationItem] = Field(max_length=4)
    needs_review: list[InterpretationItem] = Field(max_length=4)


def validated_interpretation(
    report: dict[str, Any], *, locale: str, model_id: str,
    completion: Callable[[list[dict[str, str]]], str],
) -> dict[str, Any]:
    """Call an injected model once, validate JSON schema and every citation."""
    if locale not in ("en", "zh") or not report.get("fact_hash"):
        raise ValueError("Invalid locale or verified report")
    key = (report["fact_hash"], locale, model_id, PROMPT_VERSION)
    if key in _CACHE:
        return {**_CACHE[key], "cached": True}
    allowed = {item["id"] for item in report["facts"] if item.get("value") is not None}
    allowed.update(item["id"] for item in report["calculations"] if item.get("value") is not None)
    packet = {
        "question_id": report["question_id"], "basis": report["basis"], "fact_hash": report["fact_hash"],
        "facts": [{"id": item["id"], "value": item["value"]["value"], "unit": item["value"]["unit"],
                   "period_end": item["period_end"]} for item in report["facts"] if item.get("value")],
        "calculations": [{"id": item["id"], "value": item["value"], "unit": item["unit"],
                          "input_fact_ids": item["input_fact_ids"]} for item in report["calculations"] if item.get("value")],
    }
    messages = [
        {"role": "system", "content": "Explain the verified financial packet cautiously in " +
         ("Simplified Chinese" if locale == "zh" else "English") +
         ". Return JSON only with arrays interpretations, alternative_explanations, needs_review. "
         "Each item has text and citation_ids. Do not write any numbers, URLs, prices, investment advice or causal certainty. "
         "Cite only the supplied fact/calculation identifiers. Label mechanisms as possibilities needing investigation."},
        {"role": "user", "content": json.dumps(packet, separators=(",", ":"))},
    ]
    draft = InterpretationDraft.model_validate(json.loads(completion(messages)))
    for item in (*draft.interpretations, *draft.alternative_explanations, *draft.needs_review):
        if any(identifier not in allowed for identifier in item.citation_ids):
            raise ValueError("Model cited an unverified or missing fact identifier")
    result = {"status": "generated", "prompt_version": PROMPT_VERSION, "fact_hash": report["fact_hash"],
              "generated_at": datetime.now(timezone.utc).isoformat(), "cached": False,
              "content": draft.model_dump(mode="json")}
    if len(_CACHE) >= 64:
        _CACHE.pop(next(iter(_CACHE)))
    _CACHE[key] = result
    return result
