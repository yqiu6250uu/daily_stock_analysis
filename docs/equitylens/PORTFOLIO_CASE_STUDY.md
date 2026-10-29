# EquityLens — an inspectable fundamental research workflow

> **Public release (2026-10-30):** [Portfolio Demo v0.2.1](https://equitylens-portfolio-v01.pages.dev/) extends the original NVDA example with independently sampled MSFT and AMAT SEC facts, a versioned question report, read-only tools over three snapshots, browser-local research continuity and an About/Methodology page. The static site uses fixed, dated data and no public AI calls.

## What v0.2 adds to the research method

The question “Is revenue growth translating into operating cash flow?” now has a deterministic server-side report instead of only a view-level comparison. It selects a prior fiscal year or the same fiscal quarter, checks duration, concept and unit compatibility, uses decimal arithmetic for absolute changes and growth, and records null reasons when comparison is unsafe. The report links each result to exact input facts and their SEC filings. Its observations say what changed; possible working-capital or timing explanations remain questions for further investigation, not asserted causes.

The additional Microsoft and Applied Materials examples were selected after inspecting their fiscal calendars and checking a bounded sample of recent annual and quarterly facts against official CompanyFacts. Their annual fiscal ends differ from NVIDIA's. The comparison therefore exposes dates and avoids treating all three as directly interchangeable peers. The public static site ships precomputed, hashed data; it requires no public financial API or model key. Browser-local saved research demonstrates continuity without claiming automatic monitoring.

**Portfolio case study · 2026-10-30 · public v0.2.1**

## The research problem

A company can report rapid growth while its cash generation follows a different path. A headline number alone does not explain which accounting period it belongs to, whether it was later amended, or which disclosure supports it. EquityLens makes one narrow investigation practical: start with a ticker, inspect reported company financials, compare revenue with operating cash flow on a consistent fiscal basis, then open the original SEC evidence.

The current target users are finance students, independent fundamental researchers and analysts who want a quick path from a figure to its provenance. This version offers **deterministic financial research support**. It does not offer a validated investment thesis or a buy/sell recommendation.

## What a user can do now

1. Search the bilingual Research Home for one of **NVDA, MSFT or AMAT**, or choose a period-labeled company entry. Other tickers are explicitly unsupported in this public snapshot.
2. Open a company page to inspect CIK, fiscal context, retrieval time, reported facts, derived metrics, annual/quarterly history and original filing links.
3. Switch revenue, net income and operating cash flow trends; select a fiscal period. The limited Metric Explorer, Company Comparison and Screener operate only on the three verified snapshots.
4. Open **“Is revenue growth translating into operating cash flow?”** for a versioned deterministic report. Python calculates eight comparable-period indicators with Decimal arithmetic where the evidence supports them; observations describe movement and do not claim causality or AI authorship.
5. Expand evidence to inspect the XBRL concept and unit, period dates, filing form/date, accession, retrieval time, calculation definition where applicable, and original SEC filing link. Save/reopen/remove the investigation in the current browser or export its context as Markdown.

The [Research Home](images/v021-home-en-light.png), [MSFT company page](images/v021-company-msft-en.png), [full question report](images/v021-report-nvda-en.png), and [expanded SEC evidence](images/v021-evidence-nvda-en.png) are screenshots from the real public v0.2.1 site. [Chinese dark mode](images/v021-home-zh-dark.png) and [mobile company research](images/v021-company-amat-zh-mobile.png) show the same static research workflow with translated controls.

The [public portfolio demo](https://equitylens-portfolio-v01.pages.dev/) uses the same React research views with three dated, precomputed SEC responses and report JSON files. It supports financial exploration without exposing the local backend or private contact identity. Its fixed snapshots are labeled and require a deliberate export, source review and redeployment to update.

## Financial data pipeline

The project extends the existing FastAPI application rather than creating a parallel service. A new SEC adapter requests official ticker mapping, Submissions and CompanyFacts JSON with an identified contact address. It refuses network access without valid `SEC_CONTACT_EMAIL`, uses conservative pacing and bounded retries/timeouts, and caches public JSON locally. The local contact address is neither committed nor returned through the financial API.

The normalization layer chooses facts by the requested fiscal context, duration, concept preference and USD unit. It accounts for annual, stand-alone quarter and fiscal year-to-date reporting, derives eligible quarter differences from matching cumulative facts, and handles amendments and duplicate/conflicting XBRL facts deterministically. A conflict can produce an empty field with a quality marker. A newer filing is **not** enough by itself to make a fact comparable. Every displayed value has a `reported` or `derived` type; derived metrics include definitions and input sources.

The response contract (`SecFinancialResponse`) gives the React app a typed list of fiscal periods, financial values, metrics and data-quality flags. The relevant code is in `data_provider/sec_edgar.py`, `src/services/sec_financials.py`, `api/v1/endpoints/financials.py`, and `apps/dsa-web/src/pages/CompanyResearchPage.tsx`.

## Why revenue and cash flow

Revenue and operating cash flow are complementary views of a business. Comparing them encourages questions about collection timing, working capital and earnings quality, while resisting a simplistic conclusion from one chart. EquityLens aligns fiscal years or quarters and requires compatible period lengths, source concepts and USD units for comparable-change presentation. Where the evidence is insufficient, it says so. A similar movement is an **observation**, not proof that revenue caused a cash-flow change.

The code intentionally avoids treating NVIDIA's broader “productive-assets” acquisition concept as pure PP&E spending. Free cash flow is therefore outside this first comparison. The v0.2.1 public demo has a complete deterministic report for this one question; real-model interpretation and additional questions remain future work.

## How the open-source foundation was extended

The fork retains the MIT-licensed [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) backend, React frontend, legacy Market Tools, reporting and provider infrastructure. EquityLens adds the SEC-specific adapter, normalization and read-only API; a research-first brand, shell and bilingual pages; a focused comparison and evidence disclosure; and dedicated backend/frontend tests. Existing daily analysis is still available under `/tools/daily-analysis`, while `/` now starts a financial-research journey.

The product direction, scope, accounting requirements, design review and acceptance criteria were directed by the project owner. AI-assisted coding was used to inspect the inherited architecture, implement incremental modules, generate drafts and test fixtures, and run iterative checks. The project records those checks and their limitations; AI assistance is not presented as independent authorship of inherited code or as proof of financial accuracy. The owner remains responsible for reviewing the final repository release and claims.

## Verification and honest boundaries

- Prior real-data validation matched 99 NVDA `reported` facts in a **limited sample** to official SEC CompanyFacts by concept, fiscal period, USD unit, form, accession and value, with selected original 10-K/10-Q filings opened. The latest local run again returned the SEC-backed NVDA API and visible original filing links. This does **not** establish a cross-issuer accuracy rate.
- Deterministic Python tests cover mapping, selection, amendments, cumulative quarters, ambiguous facts, missing fields, metrics and request failure/rate handling. Frontend tests cover routes, localization, search, responsive research views and source inspection. Browser fixtures use synthetic data and are labeled accordingly.
- The v0.2.1 release code passed 1,395 Vitest tests / 2 skipped, 35 inherited Playwright fixtures and 213 relevant Python tests / 10 warnings; TypeScript and both Vite builds passed. The public preview passed 8/8 interactive Playwright tests, including 176 route/width/language/theme loads. Exact commands, final production results and boundaries are in [TEST_RESULTS.md](TEST_RESULTS.md).
- The v0.2 data export independently checked **30 reported facts and six derived-quarter values** across the latest two annual and two quarterly periods for NVDA/MSFT/AMAT against official SEC CompanyFacts. That is a bounded sample, not a market-wide accuracy rate. Public files match the six manifest SHA-256 values; this establishes snapshot integrity, not fresh live SEC retrieval.
- Full-repository ESLint and inherited localization defects remain. The core NVDA research path is suitable for a bounded public portfolio demonstration; the broader DSA application is not being represented as a fully localized EquityLens release.

## What comes next

The v0.2.1 system calculates a validated fact packet server-side and renders the same structured report from static snapshots. A future reviewed LLM output could explain possible mechanisms, alternatives and missing evidence while remaining separate from confirmed facts. Additional questions, synchronized research history and broad issuer validation are later work. The public product is a **static v0.2.1 demo**, with no autonomous EquityLens research agent, public backend, user activity metrics or commercial traction. The [Universal Company Coverage roadmap](UNIVERSAL_COMPANY_COVERAGE_ROADMAP.md) records the US-first, A-share-later architecture without claiming it exists.

### CV wording — finance / analyst roles

- Directed and built EquityLens, a bilingual fundamental-research portfolio project extending an MIT-licensed stock-analysis platform; organized NVDA, MSFT and AMAT SEC disclosures into period-aware financial statements, trends and source-linked evidence.
- Designed a revenue-versus-operating-cash-flow investigation with comparable-period checks and transparent calculations; independently sampled 30 reported facts and six derived quarters against SEC CompanyFacts and published a dated, read-only demo.

### CV wording — fintech / analytics / AI product roles

- Extended an existing React/TypeScript and FastAPI system with an SEC EDGAR adapter, cached and rate-limited data retrieval, deterministic XBRL fiscal-period normalization, a typed financial API and bilingual research views.
- Directed AI-assisted implementation and verified a bounded three-issuer SEC sample with Python, Vitest and Playwright checks; published a read-only Cloudflare Pages demo while keeping AI interpretation and the private FastAPI backend out of the public site.
