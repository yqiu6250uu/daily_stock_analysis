# Known limitations — portfolio candidate v0.1

Status checked 2026-10-29. These limits are part of an honest portfolio presentation, not silent release gates for the core local NVDA demonstration.

## Core financial research

- **Validation scope:** the live SEC comparison documented in `TEST_RESULTS.md` covers a small NVDA sample, including 99 `reported` values matched by concept, period, form, accession, unit and number. It is not an accuracy percentage for all SEC issuers, all historical periods or all derived values. This checkpoint rechecked the **cached** NVDA API and links; it did not repeat all 99 network comparisons.
- **Public data freshness:** the adapter applies different TTLs to ticker mapping, Submissions and CompanyFacts. The interface displays `retrieved_at`; a cache hit keeps the original timestamp. A static screenshot is a dated illustration, not a live quote.
- **Accounting scope:** `PaymentsToAcquireProductiveAssets` can include PP&E, software and other intangible assets. Its number must not be described as pure PP&E capital expenditure or used as an unqualified free-cash-flow input.
- **Comparable periods:** the displayed question compares annual with annual or matching fiscal quarter with quarter, with period-length and concept/unit checks. It does not infer causation or calculate operating-cash-flow growth. Missing or conflicting data can leave a figure blank.
- **Other tickers:** the code accepts SEC-mapped tickers, but company-specific taxonomy, fiscal calendars, amendments and older reporting have not been exhaustively validated. The public portfolio example is NVDA.
- **Deployment safety:** SEC pacing is in-process only. The inherited FastAPI app has broader routes and may run without authentication locally. It must not be internet-exposed as a ready public service.

## Product and inherited tools

- **Localization:** the core EquityLens research routes have English and Simplified Chinese controls. Legacy `/screening` and `/portfolio` still show Chinese standard UI in English mode; older notification templates include decorative emoji. The [audit](LOCALIZATION_AUDIT.md) lists other partial states. A Chinese historical report is labeled as original-language content and is not silently translated.
- **AI:** the inherited DSA project contains optional LLM-assisted analysis/chat. EquityLens's full research question engine, verified AI interpretation and Follow/history workflow are **not built**. This candidate makes no claim that AI generated the SEC comparison.
- **Lint:** the last recorded full frontend ESLint diagnostic reports 37 errors and one warning, concentrated in inherited React effect patterns; a stale dependency warning in screening may affect correctness. Build, TypeScript and tested core interactions pass. This debt is disclosed rather than erased or relabeled as zero risk.
- **Tests:** browser fixtures intercept API calls with synthetic values; they validate interaction, not live data integrity. Real-data evidence is separate. Neither all legacy routes nor production hosting have undergone release-level acceptance.
- **Workflows:** the fork inherits scheduled analysis, network smoke and stale-issue workflows. Local fork guards are prepared, but they only take effect on a branch containing them; no GitHub Actions setting or default branch has been changed in this checkpoint.

There is no public EquityLens demo, no user adoption data, no paid infrastructure, and no claim of institutional production readiness.
