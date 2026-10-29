"""Read-only, keyless financial investigation endpoint."""

from __future__ import annotations

import os
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query

from api.v1.endpoints.financials import get_sec_client
from api.deps import get_config_dep
from api.v1.schemas.research_questions import RevenueCashFlowReport
from data_provider.sec_edgar import SecEdgarClient, SecNotConfigured, SecRequestError, SecTickerNotFound
from src.services.revenue_cashflow_research import build_revenue_cashflow_report
from src.services.sec_financials import normalize_sec_company
from src.services.research_interpretation import validated_interpretation
from src.config import Config

router = APIRouter()


@router.get("/company/{ticker}/revenue-cash-flow", response_model=RevenueCashFlowReport)
def get_revenue_cash_flow_report(
    ticker: str,
    basis: Literal["annual", "quarterly"] = Query("annual"),
    period_end: str | None = Query(None),
    client: SecEdgarClient = Depends(get_sec_client),
) -> RevenueCashFlowReport:
    try:
        financials = normalize_sec_company(client.company_data(ticker))
        return RevenueCashFlowReport.model_validate(
            build_revenue_cashflow_report(financials, basis=basis, period_end=period_end)
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail={"error": "invalid_period", "message": str(exc)}) from exc
    except SecNotConfigured as exc:
        raise HTTPException(status_code=503, detail={"error": "sec_not_configured", "message": str(exc)}) from exc
    except SecTickerNotFound as exc:
        raise HTTPException(status_code=404, detail={"error": "ticker_not_found", "message": str(exc)}) from exc
    except SecRequestError as exc:
        raise HTTPException(status_code=502, detail={"error": "sec_unavailable", "message": str(exc)}) from exc


@router.post("/company/{ticker}/revenue-cash-flow/interpretation")
def interpret_revenue_cash_flow(
    ticker: str,
    basis: Literal["annual", "quarterly"] = Query("annual"),
    locale: Literal["en", "zh"] = Query("en"),
    period_end: str | None = Query(None),
    client: SecEdgarClient = Depends(get_sec_client),
    config: Config = Depends(get_config_dep),
) -> dict:
    """Explicit, private local action. The public static site has no such route."""
    if os.getenv("EQUITYLENS_AI_INTERPRETATION_ENABLED", "false").lower() != "true":
        return {"status": "not_configured"}
    models = getattr(config, "llm_model_list", []) or []
    if not models:
        return {"status": "not_configured"}
    report = get_revenue_cash_flow_report(ticker, basis, period_end, client).model_dump(mode="json")
    model_id = str(models[0].get("model_name", ""))
    if not model_id:
        return {"status": "not_configured"}

    def complete(messages: list[dict[str, str]]) -> str:
        from litellm import Router
        router = Router(model_list=models)
        response = router.completion(model=model_id, messages=messages, timeout=20, max_tokens=700)
        return str(response.choices[0].message.content or "")

    try:
        return validated_interpretation(report, locale=locale, model_id=model_id, completion=complete)
    except (ValueError, TypeError, KeyError, IndexError) as exc:
        raise HTTPException(status_code=502, detail={"error": "interpretation_rejected", "message": "Model output did not pass verification"}) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail={"error": "interpretation_unavailable", "message": "Model service unavailable"}) from exc
