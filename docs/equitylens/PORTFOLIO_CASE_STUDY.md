# EquityLens — an inspectable fundamental research workflow

**Portfolio case study · 2026-10-29 · local release candidate v0.1**

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

## Financial data pipeline

The project extends the existing FastAPI application rather than creating a parallel service. A new SEC adapter requests official ticker mapping, Submissions and CompanyFacts JSON with an identified contact address. It refuses network access without valid `SEC_CONTACT_EMAIL`, uses conservative pacing and bounded retries/timeouts, and caches public JSON locally. The local contact address is neither committed nor returned through the financial API.

The normalization layer chooses facts by the requested fiscal context, duration, concept preference and USD unit. It accounts for annual, stand-alone quarter and fiscal year-to-date reporting, derives eligible quarter differences from matching cumulative facts, and handles amendments and duplicate/conflicting XBRL facts deterministically. A conflict can produce an empty field with a quality marker. A newer filing is **not** enough by itself to make a fact comparable. Every displayed value has a `reported` or `derived` type; derived metrics include definitions and input sources.

The response contract (`SecFinancialResponse`) gives the React app a typed list of fiscal periods, financial values, metrics and data-quality flags. The relevant code is in `data_provider/sec_edgar.py`, `src/services/sec_financials.py`, `api/v1/endpoints/financials.py`, and `apps/dsa-web/src/pages/CompanyResearchPage.tsx`.

## Why revenue and cash flow

Revenue and operating cash flow are complementary views of a business. Comparing them encourages questions about collection timing, working capital and earnings quality, while resisting a simplistic conclusion from one chart. EquityLens aligns fiscal years or quarters and requires compatible period lengths, source concepts and USD units for comparable-change presentation. Where the evidence is insufficient, it says so. A similar movement is an **observation**, not proof that revenue caused a cash-flow change.

The code intentionally avoids treating NVIDIA's broader “productive-assets” acquisition concept as pure PP&E spending. Free cash flow is therefore outside this first comparison. The fuller AI-assisted question report remains a separately specified future milestone.

## How the open-source foundation was extended

The fork retains the MIT-licensed [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) backend, React frontend, legacy Market Tools, reporting and provider infrastructure. EquityLens adds the SEC-specific adapter, normalization and read-only API; a research-first brand, shell and bilingual pages; a focused comparison and evidence disclosure; and dedicated backend/frontend tests. Existing daily analysis is still available under `/tools/daily-analysis`, while `/` now starts a financial-research journey.

The candidate's product direction, scope, accounting requirements, design review and acceptance criteria were directed by the project owner. AI-assisted coding was used to inspect the inherited architecture, implement incremental modules, generate drafts and test fixtures, and run iterative checks. The project records those checks and their limitations; AI assistance is not presented as independent authorship of inherited code or as proof of financial accuracy. The owner remains responsible for reviewing the final repository release and claims.

## Verification and honest boundaries

- Prior real-data validation matched 99 NVDA `reported` facts in a **limited sample** to official SEC CompanyFacts by concept, fiscal period, USD unit, form, accession and value, with selected original 10-K/10-Q filings opened. The latest local run again returned the SEC-backed NVDA API and visible original filing links. This does **not** establish a cross-issuer accuracy rate.
- Deterministic Python tests cover mapping, selection, amendments, cumulative quarters, ambiguous facts, missing fields, metrics and request failure/rate handling. Frontend tests cover routes, localization, search, responsive research views and source inspection. Browser fixtures use synthetic data and are labeled accordingly.
- At the Step C code state, recorded suites were 1,387 Vitest passed / 2 skipped, 35 Playwright fixture passed, and 194 relevant Python passed / 8 warnings; TypeScript and Vite build passed. The final portfolio-checkpoint rerun and exact scope are recorded in [TEST_RESULTS.md](TEST_RESULTS.md).
- Full-repository ESLint and inherited localization defects remain. The core NVDA research path is suitable for a local portfolio demonstration; the broader DSA application is not being represented as a fully localized EquityLens release.

## What comes next

A future Research Question Engine can calculate a validated fact packet server-side, then optionally ask an LLM to explain possible mechanisms, alternatives and missing evidence. Any model output must be clearly separated from source-confirmed facts and verified calculations. Research memory, broader issuer validation and a static, read-only public demo are also later work. The current code has **no autonomous EquityLens research agent, public deployment, user activity metrics or commercial traction**.

### CV wording — finance / analyst roles

- Directed and built EquityLens, a bilingual fundamental-research portfolio project extending an MIT-licensed stock-analysis platform; organized NVIDIA SEC disclosures into period-aware financial statements, trends and source-linked evidence.
- Designed a revenue-versus-operating-cash-flow investigation with comparable-period checks and transparent calculation definitions; validated a limited NVDA fact sample against SEC CompanyFacts and documented testing and data-quality limits.

### CV wording — fintech / analytics / AI product roles

- Extended an existing React/TypeScript and FastAPI system with an SEC EDGAR adapter, cached and rate-limited data retrieval, deterministic XBRL fiscal-period normalization, a typed financial API and bilingual research views.
- Directed AI-assisted implementation and verified the NVDA workflow with Python, Vitest and Playwright checks plus source-level SEC spot validation; built inspectable revenue/cash-flow comparisons while keeping AI interpretation and public deployment explicitly out of scope.
