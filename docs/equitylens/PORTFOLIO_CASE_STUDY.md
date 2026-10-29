# EquityLens — an inspectable fundamental research workflow

> **Release note (2026-10-30):** the case study below documents the published v0.1 NVDA example. The local [v0.2 candidate](V0_2_RELEASE_CANDIDATE.md) extends the workflow to independently sampled MSFT and AMAT SEC facts, a versioned question report, read-only tools over three snapshots, and browser-local research continuity. None of those additions is yet live at the public URL.

## What v0.2 adds to the research method

The question “Is revenue growth translating into operating cash flow?” now has a deterministic server-side report instead of only a view-level comparison. It selects a prior fiscal year or the same fiscal quarter, checks duration, concept and unit compatibility, uses decimal arithmetic for absolute changes and growth, and records null reasons when comparison is unsafe. The report links each result to exact input facts and their SEC filings. Its observations say what changed; possible working-capital or timing explanations remain questions for further investigation, not asserted causes.

The additional Microsoft and Applied Materials examples were selected after inspecting their fiscal calendars and checking a bounded sample of recent annual and quarterly facts against official CompanyFacts. Their annual fiscal ends differ from NVIDIA's. The comparison therefore exposes dates and avoids treating all three as directly interchangeable peers. The static site candidate ships precomputed, hashed data; it requires no public financial API or model key. Browser-local saved research demonstrates continuity without claiming automatic monitoring.

**Portfolio case study · 2026-10-29 · public static demo v0.1 and local research application**

## The research problem

A company can report rapid growth while its cash generation follows a different path. A headline number alone does not explain which accounting period it belongs to, whether it was later amended, or which disclosure supports it. EquityLens makes one narrow investigation practical: start with a ticker, inspect reported company financials, compare revenue with operating cash flow on a consistent fiscal basis, then open the original SEC evidence.

The current target users are finance students, independent fundamental researchers and analysts who want a quick path from a figure to its provenance. This version offers **deterministic financial research support**. It does not offer a validated investment thesis or a buy/sell recommendation.

## What a user can do now

1. Search by US ticker on the bilingual Research Home. The featured NVDA case is fetched from the same API as Company Research.
2. Open `/research/NVDA` to see the company CIK, fiscal context, retrieved-at time, reported facts, derived metrics, and annual or quarterly history.
3. Switch revenue, net income and operating cash flow trends; select a fiscal period.
4. Open **“Is revenue growth translating into cash flow?”** to compare revenue and operating cash flow across eligible periods. The page presents existing backend-calculated revenue growth and operating cash flow margin; it does not calculate a new cash-flow-growth figure or interpret causality.
5. Expand a figure's evidence to inspect the XBRL concept and unit, period dates, filing form/date, accession, retrieval time, calculation definition where applicable, and original SEC filing link.

The [Research Home](images/research-home-en.png), [company view](images/company-research-en.png), [comparison](images/revenue-cash-flow-en.png), and [expanded source](images/sec-source-evidence-en.png) are screenshots of the actual local application using the real NVDA API response. [Chinese interface examples](images/research-home-zh.png) show the same source data with translated application controls.

The [public portfolio demo](https://equitylens-portfolio-v01.pages.dev/) uses the same React research views with a dated, precomputed NVDA SEC response. It supports financial exploration without exposing the local backend or private contact identity. Its fixed snapshot is clearly labeled and must be regenerated deliberately for future updates.

## Financial data pipeline

The project extends the existing FastAPI application rather than creating a parallel service. A new SEC adapter requests official ticker mapping, Submissions and CompanyFacts JSON with an identified contact address. It refuses network access without valid `SEC_CONTACT_EMAIL`, uses conservative pacing and bounded retries/timeouts, and caches public JSON locally. The local contact address is neither committed nor returned through the financial API.

The normalization layer chooses facts by the requested fiscal context, duration, concept preference and USD unit. It accounts for annual, stand-alone quarter and fiscal year-to-date reporting, derives eligible quarter differences from matching cumulative facts, and handles amendments and duplicate/conflicting XBRL facts deterministically. A conflict can produce an empty field with a quality marker. A newer filing is **not** enough by itself to make a fact comparable. Every displayed value has a `reported` or `derived` type; derived metrics include definitions and input sources.

The response contract (`SecFinancialResponse`) gives the React app a typed list of fiscal periods, financial values, metrics and data-quality flags. The relevant code is in `data_provider/sec_edgar.py`, `src/services/sec_financials.py`, `api/v1/endpoints/financials.py`, and `apps/dsa-web/src/pages/CompanyResearchPage.tsx`.

## Why revenue and cash flow

Revenue and operating cash flow are complementary views of a business. Comparing them encourages questions about collection timing, working capital and earnings quality, while resisting a simplistic conclusion from one chart. EquityLens aligns fiscal years or quarters and requires compatible period lengths, source concepts and USD units for comparable-change presentation. Where the evidence is insufficient, it says so. A similar movement is an **observation**, not proof that revenue caused a cash-flow change.

The code intentionally avoids treating NVIDIA's broader “productive-assets” acquisition concept as pure PP&E spending. Free cash flow is therefore outside this first comparison. The local v0.2 candidate now has a complete deterministic report for this one question; real-model interpretation and additional questions remain future work.

## How the open-source foundation was extended

The fork retains the MIT-licensed [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) backend, React frontend, legacy Market Tools, reporting and provider infrastructure. EquityLens adds the SEC-specific adapter, normalization and read-only API; a research-first brand, shell and bilingual pages; a focused comparison and evidence disclosure; and dedicated backend/frontend tests. Existing daily analysis is still available under `/tools/daily-analysis`, while `/` now starts a financial-research journey.

The candidate's product direction, scope, accounting requirements, design review and acceptance criteria were directed by the project owner. AI-assisted coding was used to inspect the inherited architecture, implement incremental modules, generate drafts and test fixtures, and run iterative checks. The project records those checks and their limitations; AI assistance is not presented as independent authorship of inherited code or as proof of financial accuracy. The owner remains responsible for reviewing the final repository release and claims.

## Verification and honest boundaries

- Prior real-data validation matched 99 NVDA `reported` facts in a **limited sample** to official SEC CompanyFacts by concept, fiscal period, USD unit, form, accession and value, with selected original 10-K/10-Q filings opened. The latest local run again returned the SEC-backed NVDA API and visible original filing links. This does **not** establish a cross-issuer accuracy rate.
- Deterministic Python tests cover mapping, selection, amendments, cumulative quarters, ambiguous facts, missing fields, metrics and request failure/rate handling. Frontend tests cover routes, localization, search, responsive research views and source inspection. Browser fixtures use synthetic data and are labeled accordingly.
- At the Step C code state, recorded suites were 1,387 Vitest passed / 2 skipped, 35 Playwright fixture passed, and 194 relevant Python passed / 8 warnings; TypeScript and Vite build passed. The final portfolio-checkpoint rerun and exact scope are recorded in [TEST_RESULTS.md](TEST_RESULTS.md).
- The public Cloudflare Pages demo passed its final 3/3 live Playwright checks, direct `/research/NVDA` refresh, English/Chinese and light/dark combinations, and 1440/1024/768/390px overflow checks. The public JSON SHA-256 matches the locally exported API response; this is deployment and snapshot-integrity evidence, not a fresh SEC audit.
- Full-repository ESLint and inherited localization defects remain. The core NVDA research path is suitable for a bounded public portfolio demonstration; the broader DSA application is not being represented as a fully localized EquityLens release.

## What comes next

The local v0.2 candidate calculates a validated fact packet server-side and renders the same structured report from static snapshots. A future reviewed LLM output could explain possible mechanisms, alternatives and missing evidence while remaining separate from confirmed facts. Additional questions, synchronized research history and broad issuer validation are later work. The current product has **a static public v0.1 demo, but no autonomous EquityLens research agent, public backend, user activity metrics or commercial traction**.

### CV wording — finance / analyst roles

- Directed and built EquityLens, a bilingual fundamental-research portfolio project extending an MIT-licensed stock-analysis platform; organized NVIDIA SEC disclosures into period-aware financial statements, trends and source-linked evidence.
- Designed a revenue-versus-operating-cash-flow investigation with comparable-period checks and transparent calculation definitions; validated a limited NVDA fact sample against SEC CompanyFacts and documented testing and data-quality limits.

### CV wording — fintech / analytics / AI product roles

- Extended an existing React/TypeScript and FastAPI system with an SEC EDGAR adapter, cached and rate-limited data retrieval, deterministic XBRL fiscal-period normalization, a typed financial API and bilingual research views.
- Directed AI-assisted implementation and verified the NVDA workflow with Python, Vitest and Playwright checks plus source-level SEC spot validation; published a read-only Cloudflare Pages demo while keeping AI interpretation and the private FastAPI backend out of the public site.
