# Known limitations — portfolio candidate v0.1

> This document's baseline describes the live v0.1 site. The local v0.2 candidate adds MSFT and AMAT, a structured question report and browser-local saves; it has **not** replaced the public site.

## Local v0.2 candidate boundaries

- Three issuer snapshots are a curated, dated universe. The cross-company table shows fiscal dates and terminology but cannot establish peer equivalence or a market-wide rank. AMD was excluded after an amended annual anchor lacked a reliable fiscal-year label in the current normalizer.
- The new report checks positive-base growth, compatible concepts/units and like fiscal periods. It does not prove causation, validate every historical SEC revision, generate an investment recommendation, or calculate unqualified free cash flow.
- Saved research is versioned browser-local metadata, not synchronized or monitored. It can disappear when browser storage is cleared; a saved item does not automatically refresh after a new SEC filing.
- Optional local AI interpretation is disabled by default and has only schema/mock verification. No real model output was generated or independently reviewed. No public AI service or backend is exposed.
- Existing inherited `/screening`, `/portfolio` and legacy reporting/localization issues remain outside the curated static tool set. Full-repository lint debt is separately recorded in `TEST_RESULTS.md`.

Status checked 2026-10-29. These limits are part of an honest portfolio presentation, not silent release gates for the core local NVDA demonstration.

## Core financial research

- **Validation scope:** the live SEC comparison documented in `TEST_RESULTS.md` covers a small NVDA sample, including 99 `reported` values matched by concept, period, form, accession, unit and number. It is not an accuracy percentage for all SEC issuers, all historical periods or all derived values. This checkpoint rechecked the **cached** NVDA API and links; it did not repeat all 99 network comparisons.
- **Public data freshness:** the [portfolio demo](https://equitylens-portfolio-v01.pages.dev/) serves a fixed NVDA snapshot retrieved on 2026-10-29 and never calls the live SEC API. The local adapter applies different TTLs to ticker mapping, Submissions and CompanyFacts; a local cache hit keeps its original `retrieved_at`. Neither the demo nor a screenshot is a live quote.
- **Accounting scope:** `PaymentsToAcquireProductiveAssets` can include PP&E, software and other intangible assets. Its number must not be described as pure PP&E capital expenditure or used as an unqualified free-cash-flow input.
- **Comparable periods:** the displayed question compares annual with annual or matching fiscal quarter with quarter, with period-length and concept/unit checks. It does not infer causation or calculate operating-cash-flow growth. Missing or conflicting data can leave a figure blank.
- **Other tickers:** the local code accepts SEC-mapped tickers, but company-specific taxonomy, fiscal calendars, amendments and older reporting have not been exhaustively validated. The public demo deliberately accepts only NVDA.
- **Deployment safety:** SEC pacing is in-process only. The inherited FastAPI app has broader routes and may run without authentication locally. It must not be internet-exposed as a ready public service.

## Product and inherited tools

- **Localization:** the core EquityLens research routes have English and Simplified Chinese controls. Legacy `/screening` and `/portfolio` still show Chinese standard UI in English mode; older notification templates include decorative emoji. The [audit](LOCALIZATION_AUDIT.md) lists other partial states. A Chinese historical report is labeled as original-language content and is not silently translated.
- **AI:** the inherited DSA project contains optional LLM-assisted analysis/chat. EquityLens's full research question engine, verified AI interpretation and Follow/history workflow are **not built**. This candidate makes no claim that AI generated the SEC comparison.
- **Lint:** the last recorded full frontend ESLint diagnostic reports 37 errors and one warning, concentrated in inherited React effect patterns; a stale dependency warning in screening may affect correctness. Build, TypeScript and tested core interactions pass. This debt is disclosed rather than erased or relabeled as zero risk.
- **Tests:** inherited browser fixtures intercept API calls with synthetic values; they validate interaction, not live data integrity. Separate live-site browser checks verify the Cloudflare deployment and public snapshot digest, but not new live SEC retrieval. The entire inherited application has not undergone release-level acceptance.
- **Workflows:** the fork inherits scheduled analysis, network smoke and stale-issue workflows. Local fork guards are prepared, but they only take effect on a branch containing them; no GitHub Actions setting or default branch has been changed in this checkpoint.

There is a read-only public NVDA demo, but no public FastAPI backend, user adoption data, paid infrastructure, or claim of institutional production readiness.
