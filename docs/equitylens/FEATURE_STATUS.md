# EquityLens feature status — portfolio candidate v0.1

> **Current release distinction (2026-10-30):** this table records the live v0.1 portfolio baseline. The additional v0.2 capabilities below exist only in the local candidate and have not been published to Cloudflare or pushed to GitHub.

## Local v0.2 candidate additions

| Capability | Local candidate | Public v0.1 |
| --- | --- | --- |
| NVDA / MSFT / AMAT static issuer snapshots | Implemented; four recent fiscal periods per issuer independently checked against official CompanyFacts, with source links and hashes | NVDA only |
| Structured revenue and operating cash flow investigation | Implemented with a shared versioned Python/TypeScript contract, eight Decimal calculations, explicit noncomparable/missing reasons and no causal conclusion | Earlier narrower comparison |
| Financial metric explorer, three-company comparison and limited screener | Implemented over exactly three verified snapshots; no broad-market ranking | Unavailable |
| My Research | Versioned browser-local company/question save, reopen, remove and Markdown export; no account or automatic updates | Unavailable |
| Optional AI interpretation | Local backend adapter and mock contract tests; disabled by default; **no real-model quality verification** | Disabled |
| Inherited Market Tools | Preserved in local app and clearly labeled in static index; not publicly exposed as operational | Unavailable |

See [v0.2 release candidate](V0_2_RELEASE_CANDIDATE.md) and [final checks](TEST_RESULTS.md). This bounded issuer validation is not a universal SEC accuracy claim.

The v0.1 rows below were checked against the local worktree and [public static demo](https://equitylens-portfolio-v01.pages.dev/) on 2026-10-29. The static source was subsequently included in the **local-only v0.2 candidate commit**; the remote feature branch still contains the earlier core SEC workspace. “Tested” names the demonstrated scope; it does not mean every issuer or inherited route has been certified.

| Category | Capability | Evidence and boundary |
| --- | --- | --- |
| Implemented and tested | SEC ticker mapping, Submissions and CompanyFacts adapter | Contact identity gate, cache, pacing, retry/timeout and failure cases have deterministic Python tests. An earlier small live SEC check and a current local cached NVDA API check are recorded in [test results](TEST_RESULTS.md). |
| Implemented and tested | Fiscal period and XBRL normalization | Annual/quarterly facts, cumulative quarter differences, amended/repeated facts, concept/unit mismatch, ambiguity and missing values covered by fixtures. Original concept, period, accession and filing link retained. |
| Implemented and tested | NVDA research route and evidence | `/research/NVDA` shows real SEC-derived FY2026 data, charts, quality states and links. Prior SEC comparison covered 99 reported facts across a **limited NVDA sample**; this is not a cross-company accuracy rate. |
| Implemented and tested | Research Home and search | `/` uses the financial API for its NVDA preview and validates ticker syntax. Browser fixture tests cover search, navigation, responsive states and locale. It does not search company names or sectors. |
| Implemented and tested | Revenue/operating-cash-flow comparison | Existing `SecFinancialResponse` facts and backend-calculated metrics are displayed for comparable fiscal periods; incompatible facts remain un-compared. Browser fixture and live local page inspection cover the journey. No independent cash-flow-growth or free-cash-flow calculation is claimed. |
| Implemented and tested | English and Simplified Chinese **research routes** | Research Home, Company Research, shared shell and controls checked in both languages; historic/source-language content remains original. The whole inherited application is not fully localized. |
| Implemented and tested | Public static NVDA portfolio demo | Cloudflare Pages HTTPS site serves the dated 2026-10-29 snapshot, 22 periods, annual/quarterly charts, deterministic comparison and SEC evidence without public FastAPI or private configuration. Live Playwright 3/3 and four viewport checks passed; no live data updates or other tickers. |
| Implemented but incompletely tested | Other SEC-listed company tickers | Search and adapter can resolve official ticker mappings; issuer-specific accounting choices and historical restatements have not been independently checked beyond NVDA. |
| Implemented but incompletely tested | English generation and legacy report presentation | Selected language is passed to supported analysis/chat endpoints; Chinese historic reports are disclosed as original-language material. Actual LLM output quality and every legacy state are unverified. |
| Inherited from original project | Daily stock analysis, market review, screening, backtesting, alerts, portfolio, settings and other Market Tools | Routes and underlying services remain from `ZhuLinsen/daily_stock_analysis`, with some EquityLens navigation/localization adaptations. Operation can require optional provider or LLM setup and differs from the SEC research workflow. |
| Known defects | Legacy `/screening` and `/portfolio` English controls, notification template emoji, full-repo ESLint failures | See [localization audit](LOCALIZATION_AUDIT.md) and [known limitations](KNOWN_LIMITATIONS.md). These are not described as completed EquityLens bilingual research features. |
| Planned, not implemented | Full Research Question Engine, AI interpretation with verified citations, research memory/Follow, industry intelligence | No autonomous AI research agent, investment recommendation, forecast, trading function or public backend deployment is part of v0.1. |

**Attribution:** the pre-existing open-source system remains in the fork. EquityLens-specific work extends it; it is not a from-scratch implementation.
