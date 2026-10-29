# Known limitations — public v0.2.1

> The public site now runs v0.2.1 with NVDA, MSFT, AMAT, a structured deterministic question report, limited tools and browser-local saves. This file distinguishes that scope from older v0.1 validation records. See the [v0.2.1 release record](V0_2_1_RELEASE.md).

## v0.2.1 boundaries

- Three issuer snapshots are a curated, dated universe. The cross-company table shows fiscal dates and terminology but cannot establish peer equivalence or a market-wide rank. AMD was excluded after an amended annual anchor lacked a reliable fiscal-year label in the current normalizer.
- The new report checks positive-base growth, compatible concepts/units and like fiscal periods. It does not prove causation, validate every historical SEC revision, generate an investment recommendation, or calculate unqualified free cash flow.
- Saved research is versioned browser-local metadata, not synchronized or monitored. It can disappear when browser storage is cleared; a saved item does not automatically refresh after a new SEC filing. Opening a saved question compares its fact hash and retrieval time with the currently loaded report and flags a mismatch; an exported saved context is metadata, not an updated financial conclusion.
- Optional local AI interpretation is disabled by default and has only schema/mock verification. No real model output was generated or independently reviewed. No public AI service or backend is exposed.
- Existing inherited `/screening`, `/portfolio` and legacy reporting/localization issues remain outside the curated static tool set. Full-repository lint debt is separately recorded in `TEST_RESULTS.md`.

Status checked 2026-10-30. These limits are part of an honest portfolio presentation, not a claim of market-wide readiness.

## Core financial research

- **Validation scope:** an earlier NVDA-specific comparison checked 99 reported facts. The v0.2 three-issuer export independently sampled 30 reported and six derived-quarter values across selected recent periods. Neither sample is a universal accuracy percentage or a check of every historical amendment. The v0.2.1 UI release did not repeat live SEC retrieval.
- **Public data freshness:** the [portfolio demo](https://equitylens-portfolio-v01.pages.dev/) serves fixed NVDA, MSFT and AMAT snapshots retrieved on 2026-10-29 and never calls the live SEC API. The local adapter applies different TTLs to ticker mapping, Submissions and CompanyFacts; a local cache hit keeps its original `retrieved_at`. Neither the demo nor a screenshot is a live quote.
- **Accounting scope:** `PaymentsToAcquireProductiveAssets` can include PP&E, software and other intangible assets. Its number must not be described as pure PP&E capital expenditure or used as an unqualified free-cash-flow input.
- **Comparable periods:** the structured report compares annual with annual or matching fiscal quarter with quarter, with period-length and concept/unit checks. It calculates operating-cash-flow growth only with a positive comparable base; it never infers causation. Missing or conflicting data can leave a figure blank.
- **Other tickers:** the local code accepts SEC-mapped tickers, but company-specific taxonomy, fiscal calendars, amendments and older reporting have not been exhaustively validated. The public demo deliberately accepts only NVDA, MSFT and AMAT.
- **Deployment safety:** SEC pacing is in-process only. The inherited FastAPI app has broader routes and may run without authentication locally. It must not be internet-exposed as a ready public service.

## Product and inherited tools

- **Localization:** the core EquityLens research routes have English and Simplified Chinese controls. Legacy `/screening` and `/portfolio` still show Chinese standard UI in English mode; older notification templates include decorative emoji. The [audit](LOCALIZATION_AUDIT.md) lists other partial states. A Chinese historical report is labeled as original-language content and is not silently translated.
- **AI:** the inherited DSA project contains optional LLM-assisted analysis/chat. EquityLens has one deterministic, evidence-linked question report; verified live-model interpretation, additional questions and automatic Follow are **not built**. The public report is not AI-generated.
- **Lint:** the last recorded full frontend ESLint diagnostic reports 37 errors and one warning, concentrated in inherited React effect patterns; a stale dependency warning in screening may affect correctness. Build, TypeScript and tested core interactions pass. This debt is disclosed rather than erased or relabeled as zero risk.
- **Tests:** inherited browser fixtures intercept API calls with synthetic values; they validate interaction, not live data integrity. Separate live-site browser checks verify the Cloudflare deployment and public snapshot digest, but not new live SEC retrieval. The entire inherited application has not undergone release-level acceptance.
- **Workflows:** the fork inherits scheduled analysis, network smoke and stale-issue workflows. Fork guards exist on the feature branch, but the remote default branch remains unchanged; no GitHub Actions setting has been enabled for this release.

There is a read-only public three-issuer demo, but no public FastAPI backend, user adoption data, paid infrastructure, or claim of institutional production readiness.
