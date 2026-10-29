"""Export a checked, unmodified NVDA SEC response for the static portfolio demo.

Run against a local EquityLens API with SEC_CONTACT_EMAIL configured. This script
never reads or writes the contact identity; the public file contains only the
read-only financial response and its existing SEC provenance.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import urllib.request
from datetime import datetime
from pathlib import Path


DEFAULT_URL = "http://127.0.0.1:8000/api/v1/financials/company/NVDA"
DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / "apps/dsa-web/public-demo/demo/nvda-sec-snapshot.json"
SOURCE_PREFIX = "https://www.sec.gov/Archives/edgar/data/"
EMAIL_PATTERN = re.compile(rb"[A-Za-z0-9_.+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


def validate_snapshot(raw: bytes) -> dict:
    if EMAIL_PATTERN.search(raw) or b"localhost" in raw or b"127.0.0.1" in raw:
        raise ValueError("Snapshot contains a contact address or local URL")
    data = json.loads(raw)
    if data.get("ticker") != "NVDA" or data.get("cik") != 1045810:
        raise ValueError("Expected the official NVIDIA ticker and CIK")
    datetime.fromisoformat(data["retrieved_at"].replace("Z", "+00:00"))
    periods = data.get("periods")
    if not isinstance(periods, list) or not periods:
        raise ValueError("No SEC financial periods in response")
    if not any(period.get("type") == "annual" for period in periods):
        raise ValueError("No annual financial periods in response")
    if not any(period.get("type") == "quarterly" for period in periods):
        raise ValueError("No quarterly financial periods in response")
    source_count = 0
    for period in periods:
        if not str(period.get("filing_url", "")).startswith(SOURCE_PREFIX):
            raise ValueError("A period lacks an official SEC filing URL")
        if not period.get("period_end") or not period.get("filing_form"):
            raise ValueError("A period lacks its fiscal or filing context")
        for group in ("values", "metrics"):
            for value in period.get(group, {}).values():
                if value is None:
                    continue
                if value.get("kind") not in ("reported", "derived"):
                    raise ValueError("Financial value lacks reported/derived status")
                if value.get("kind") == "derived" and not value.get("definition"):
                    raise ValueError("Derived figure lacks a calculation definition")
                for source in value.get("sources", []):
                    if not str(source.get("url", "")).startswith(SOURCE_PREFIX):
                        raise ValueError("A financial source is not an SEC filing")
                    if not source.get("concept") or not source.get("unit") or not source.get("accession"):
                        raise ValueError("A financial source lacks its XBRL provenance")
                    source_count += 1
    if source_count == 0:
        raise ValueError("No original SEC source references found")
    return {"periods": len(periods), "sources": source_count, "retrieved_at": data["retrieved_at"]}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, help="Existing SEC API JSON; omit to request the local API")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    if args.input:
        raw = args.input.read_bytes()
    else:
        with urllib.request.urlopen(DEFAULT_URL, timeout=20) as response:
            if response.status != 200:
                raise ValueError(f"Local SEC API returned HTTP {response.status}")
            raw = response.read()
    summary = validate_snapshot(raw)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(raw)
    print(json.dumps({**summary, "sha256": hashlib.sha256(raw).hexdigest(), "output": str(args.output)}))


if __name__ == "__main__":
    main()
