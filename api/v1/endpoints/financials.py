"""SEC-backed, read-only company financial research endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from api.deps import get_config_dep
from api.v1.schemas.sec_financials import SecFinancialResponse
from data_provider.sec_edgar import SecEdgarClient, SecNotConfigured, SecRequestError, SecTickerNotFound
from src.config import Config
from src.services.sec_financials import normalize_sec_company

router = APIRouter()


def get_sec_client(config: Config = Depends(get_config_dep)) -> SecEdgarClient:
    return SecEdgarClient(config.sec_contact_email)


@router.get("/company/{ticker}", response_model=SecFinancialResponse,
            summary="Company financials with SEC filing provenance")
def get_company_financials(ticker: str, client: SecEdgarClient = Depends(get_sec_client)) -> SecFinancialResponse:
    try:
        payload = normalize_sec_company(client.company_data(ticker))
        return SecFinancialResponse.model_validate(payload)
    except SecNotConfigured as exc:
        raise HTTPException(status_code=503, detail={"error": "sec_not_configured", "message": str(exc)}) from exc
    except SecTickerNotFound as exc:
        raise HTTPException(status_code=404, detail={"error": "ticker_not_found", "message": str(exc)}) from exc
    except SecRequestError as exc:
        raise HTTPException(status_code=502, detail={"error": "sec_unavailable", "message": str(exc)}) from exc
