"""Small, server-side SEC EDGAR JSON client with identified and paced requests.

No network request is possible without an explicitly configured contact address.
Only fixed SEC endpoints and CIKs obtained from the SEC ticker file are used.
"""

from __future__ import annotations

import json
import re
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

import requests


class SecNotConfigured(RuntimeError):
    pass


class SecRequestError(RuntimeError):
    pass


class SecTickerNotFound(LookupError):
    pass


_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
_TICKER = re.compile(r"^[A-Z][A-Z0-9.-]{0,9}$")
_REQUEST_LOCK = threading.Lock()
_NEXT_REQUEST_AT = 0.0


def valid_contact(email: str | None) -> bool:
    value = (email or "").strip()
    return bool(_EMAIL.fullmatch(value)) and "example." not in value.lower()


def _same_cik(value: object, expected: int) -> bool:
    # Submissions uses a zero-padded string; CompanyFacts may use an integer.
    return isinstance(value, (str, int)) and str(value).isdigit() and int(value) == expected


class SecEdgarClient:
    """Three SEC JSON endpoints, disk TTL cache, 2 req/s process-wide pacing.

    Injection points make network, clock and sleep tests fully offline. Cache files
    contain public SEC data only; the contact address is never stored in them.
    """

    def __init__(
        self,
        contact_email: str | None,
        *,
        cache_dir: Path | str = Path("data/sec_cache"),
        session: requests.Session | None = None,
        clock: Callable[[], float] = time.time,
        sleep: Callable[[float], None] = time.sleep,
    ) -> None:
        self.contact_email = (contact_email or "").strip()
        self.cache_dir = Path(cache_dir)
        self.session = session or requests.Session()
        self.clock = clock
        self.sleep = sleep

    def _ensure_contact(self) -> None:
        if not valid_contact(self.contact_email):
            raise SecNotConfigured("Set SEC_CONTACT_EMAIL to a valid project contact before requesting SEC data")

    def _get_json(self, name: str, url: str, ttl_seconds: int) -> tuple[dict[str, Any], str]:
        self._ensure_contact()
        path = self.cache_dir / f"{name}.json"
        try:
            if path.is_file() and self.clock() - path.stat().st_mtime < ttl_seconds:
                cached = json.loads(path.read_text(encoding="utf-8"))
                if isinstance(cached, dict) and isinstance(cached.get("payload"), dict) and isinstance(cached.get("fetched_at"), str):
                    return cached["payload"], cached["fetched_at"]
        except (OSError, ValueError):
            pass

        global _NEXT_REQUEST_AT
        for attempt in range(3):
            # SEC allows at most 10 requests/s; stay well below that even across
            # concurrent client instances in this process. Multiple workers need
            # an external shared limiter before production deployment.
            with _REQUEST_LOCK:
                delay = max(0.0, _NEXT_REQUEST_AT - time.monotonic())
                if delay:
                    self.sleep(delay)
                _NEXT_REQUEST_AT = time.monotonic() + 0.5
            try:
                response = self.session.get(
                    url,
                    headers={
                        "User-Agent": f"EquityLens Research ({self.contact_email})",
                        "Accept": "application/json",
                    },
                    timeout=(5, 15),
                )
            except requests.RequestException as exc:
                if attempt == 2:
                    raise SecRequestError("SEC request failed after three attempts") from exc
                self.sleep(float(2**attempt))
                continue
            if response.status_code == 200:
                try:
                    payload = response.json()
                except ValueError as exc:
                    raise SecRequestError("SEC returned invalid JSON") from exc
                if not isinstance(payload, dict):
                    raise SecRequestError("SEC returned an unexpected JSON shape")
                fetched_at = datetime.fromtimestamp(self.clock(), timezone.utc).isoformat()
                try:
                    self.cache_dir.mkdir(parents=True, exist_ok=True)
                    temporary = path.with_suffix(".tmp")
                    temporary.write_text(json.dumps({"fetched_at": fetched_at, "payload": payload}, separators=(",", ":")), encoding="utf-8")
                    temporary.replace(path)
                except OSError:
                    pass  # A cache write failure must not hide a valid SEC response.
                return payload, fetched_at
            if response.status_code in (429, 500, 502, 503, 504) and attempt < 2:
                retry_after = response.headers.get("Retry-After", "")
                backoff = min(5.0, float(retry_after)) if retry_after.isdigit() else float(2**attempt)
                self.sleep(backoff)
                continue
            raise SecRequestError(f"SEC returned HTTP {response.status_code}")
        raise SecRequestError("SEC request failed")

    def resolve_ticker(self, ticker: str) -> tuple[int, str]:
        normalized = ticker.strip().upper()
        if not _TICKER.fullmatch(normalized):
            raise SecTickerNotFound("Invalid ticker")
        payload, _ = self._get_json("company_tickers", "https://www.sec.gov/files/company_tickers.json", 86400)
        matches = [
            row for row in payload.values()
            if isinstance(row, dict) and str(row.get("ticker", "")).upper() == normalized
        ]
        if len(matches) != 1:
            raise SecTickerNotFound(f"Ticker {normalized} was not uniquely found in the SEC mapping")
        try:
            return int(matches[0]["cik_str"]), str(matches[0]["title"])
        except (KeyError, TypeError, ValueError) as exc:
            raise SecRequestError("SEC ticker mapping is malformed") from exc

    def company_data(self, ticker: str) -> dict[str, Any]:
        cik, name = self.resolve_ticker(ticker)
        cik_padded = f"{cik:010d}"
        submissions, _ = self._get_json(
            f"submissions_{cik_padded}",
            f"https://data.sec.gov/submissions/CIK{cik_padded}.json",
            3600,
        )
        if not _same_cik(submissions.get("cik"), cik):
            raise SecRequestError("SEC submissions CIK does not match ticker mapping")
        companyfacts, facts_retrieved_at = self._get_json(
            f"companyfacts_{cik_padded}",
            f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik_padded}.json",
            21600,
        )
        if not _same_cik(companyfacts.get("cik"), cik):
            raise SecRequestError("SEC CompanyFacts CIK does not match ticker mapping")
        return {
            "ticker": ticker.strip().upper(),
            "cik": cik,
            "name": submissions.get("name") or name,
            "submissions": submissions,
            "companyfacts": companyfacts,
            "retrieved_at": facts_retrieved_at,
        }
