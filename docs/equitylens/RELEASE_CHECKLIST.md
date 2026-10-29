# EquityLens GitHub portfolio release checkpoint v0.1

> **v0.2 local gate (2026-10-30):** the 91-file path list below is historical and must not be reused for v0.2. The new candidate adds the v0.1 static demo source plus three-issuer snapshots, shared report contract, read-only tools, local saves, tests and five labeled local screenshots. The public v0.1 site and remote feature branch remain unchanged until separate approval. Review [v0.2 candidate](V0_2_RELEASE_CANDIDATE.md), [final tests](TEST_RESULTS.md), the actual staged diff and the six SHA-256 manifest entries before any push or production upload. Never stage `.env`, local SEC cache, databases, logs, `demo-dist/` or the 14 excluded design drafts.

**Status update, 2026-10-30:** This checklist records the historical approval gate for the exact 91-file release set below. That set was subsequently committed in `74ce2f8fc5d519109b22b6093b1fe861f9f8fa53` and `6d794c450d5fcdd6b57b08731afef89f236c7529` and pushed to `feature/equitylens-foundation` only. A separate [Cloudflare Pages static NVDA demo](https://equitylens-portfolio-v01.pages.dev/) is live after its own user approval. Its source is now included in the **unpublished local v0.2 commit**, not yet on GitHub. The default `main` README is still inherited DSA until a separately approved branch transition. The historical staging instructions below are retained for audit and must not be rerun blindly.

## Release claims and evidence

- [x] README and [case study](PORTFOLIO_CASE_STUDY.md) distinguish inherited DSA code from EquityLens additions.
- [x] [Feature inventory](FEATURE_STATUS.md) separates built/tested, partially tested, inherited, defective and planned work.
- [x] [Limitations](KNOWN_LIMITATIONS.md) disclose NVDA-only deep validation, no AI research conclusion, incomplete legacy localization and no public server.
- [x] Seven screenshots were recaptured on 2026-10-29 from the **actual localhost React/FastAPI application and SEC-backed NVDA response**; visual inspection confirms English/Chinese labels, FY2026 context, revenue/cash-flow comparison and an expanded filing source. They are product documentation images, not test-fixture or prototype screenshots.
- [x] Original MIT `LICENSE` and upstream attribution are preserved. Do not replace the license or imply independent authorship of inherited modules.
- [x] Final checks were rerun on this candidate: 1,387 Vitest pass / 2 skip, 35 fixture Playwright pass, 194 relevant Python pass / 8 warnings, TypeScript/Vite pass; 37 inherited ESLint errors / 1 warning remain. Real NVDA API, 10-K HTTP 200, 54 local Markdown links, seven screenshot files, explicit dry-run staging and heuristic secret scan checked. Exact commands, boundaries and results are in [TEST_RESULTS.md](TEST_RESULTS.md).

## Security and workflow gate

- The local `.env` is ignored and untracked. Also excluded: `.venv/`, `node_modules/`, `data/` SEC cache, `logs/`, local databases and `static/` build output. Never add them by force.
- The proposed set is explicit below; it excludes historical standalone prototypes, old design evidence and local runtime files. Review **modified** and **untracked** files separately before staging. Use the same explicit paths when staging; never use `git add -A` for this candidate.
- The inherited `00-daily-analysis.yml`, `network-smoke.yml` and `stale.yml` have local **upstream-repository guards** on their jobs. These guards take effect only after the guarded workflow versions reach the default branch. Before any default-branch merge, check the fork's Actions settings and disable inherited scheduled workflows if they are currently enabled. The read-only public GitHub Actions history showed zero runs at this checkpoint, which does not prove Actions are disabled.
- The inherited auto-tag job runs only for `main` commits containing `#patch`, `#minor` or `#major`; the proposed commit messages avoid those markers. Tag-triggered release and Docker workflows are outside this checkpoint. The current local server must stay on `127.0.0.1`; it is not a public demo backend.
- The inherited PR `web-gate` runs full `npm run lint`; the current 37 errors / 1 warning mean that check is expected to fail if a PR executes it. This is a **default-branch merge/CI issue**, not evidence that the tested SEC route is broken. Do not weaken the rule or call the full CI green. Branch protection could not be read through the connected GitHub integration, so whether this blocks a protected merge is unknown.
- Scan only the exact proposed file set for credentials, personal paths, unexpected binaries and unsafe links, then inspect the resulting diff. No `.env` value or contact email should appear in logs, docs, screenshots or API responses.

## Checks and publication sequence

1. Finish and record exact final-state TypeScript/Vite, Vitest, Playwright fixture, relevant pytest, lint diagnostic, link, screenshot, SEC-source and `git diff --check` results in [TEST_RESULTS.md](TEST_RESULTS.md). A passing browser fixture is **not** live SEC validation.
2. Review the explicit paths below and a `git add --dry-run` result. Confirm no unstated or ignored paths are included. No staging occurs until approval.
3. Upon **separate explicit approval**, create local commit(s) on `feature/equitylens-foundation`. Recommended minimal structure: one coherent implementation-and-tests commit, then one documentation/screenshots/fork-workflow-safety commit. Suggested messages: `feat: add SEC-backed EquityLens research workspace` and `docs: prepare EquityLens portfolio release candidate`. Do not put auto-tag markers in either.
4. Only upon explicit authorization for each action, push the feature branch and update the fork's public default branch. A feature-branch push alone does not replace the repository landing-page README. Do not merge, rename or deploy by implication.
5. Update the GitHub repository description to a factual sentence, after separate approval: **“EquityLens: evidence-based company financial research built on daily_stock_analysis; SEC-sourced NVDA analysis, period-aware metrics, and bilingual React workspace.”** Recommended eventual repository name: `equitylens-research` (retain fork attribution and links); keeping the existing fork name for the first release avoids an unnecessary rename during the urgent CV checkpoint.

## Optional demo, not part of Deliverable A

A future static, read-only demo can bundle a dated, precomputed NVDA SEC snapshot, original filing URLs, working navigation and chart interactions. It must say when the snapshot was retrieved and never claim live updates. [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) supports static sites from public repositories on GitHub Free, so the hosting layer could fit a $0 incremental budget; this has **not** been built, deployed or cost-tested. The current frontend still calls the financial API; a static data adapter/export and deployment review would be additional work. Do not deploy it in this checkpoint.

## Exact proposed Git staging set

The following list is intentionally explicit. It includes source, tests, three workflow guards, release documents and seven genuine screenshots. Files under `docs/equitylens/concepts/` and other historical design drafts remain local and are **not** proposed for this portfolio commit.

```text
.env.example
.github/workflows/00-daily-analysis.yml
.github/workflows/network-smoke.yml
.github/workflows/stale.yml
README.md
api/v1/endpoints/agent.py
api/v1/endpoints/financials.py
api/v1/router.py
api/v1/schemas/sec_financials.py
apps/dsa-web/e2e/fixtures/company-research.spec.ts
apps/dsa-web/e2e/fixtures/data-center.spec.ts
apps/dsa-web/e2e/fixtures/research-home.spec.ts
apps/dsa-web/e2e/fixtures/research-step-b.spec.ts
apps/dsa-web/e2e/fixtures/screening-entry.spec.ts
apps/dsa-web/e2e/fixtures/settings-guard.spec.ts
apps/dsa-web/index.html
apps/dsa-web/playwright.fixture.config.ts
apps/dsa-web/public/equitylens.svg
apps/dsa-web/src/App.test.tsx
apps/dsa-web/src/App.tsx
apps/dsa-web/src/api/__tests__/secFinancials.test.ts
apps/dsa-web/src/api/agent.ts
apps/dsa-web/src/api/secFinancials.ts
apps/dsa-web/src/components/alerts/AlertTriggerHistory.tsx
apps/dsa-web/src/components/brand/EquityLensMark.tsx
apps/dsa-web/src/components/layout/DesktopUpdateIndicator.tsx
apps/dsa-web/src/components/layout/Shell.tsx
apps/dsa-web/src/components/layout/ShellHeader.tsx
apps/dsa-web/src/components/layout/SidebarNav.tsx
apps/dsa-web/src/components/layout/__tests__/DesktopUpdateIndicator.test.tsx
apps/dsa-web/src/components/layout/__tests__/RouteBoundary.test.tsx
apps/dsa-web/src/components/layout/__tests__/SidebarNav.test.tsx
apps/dsa-web/src/components/layout/equitylens.css
apps/dsa-web/src/components/report/MarketReviewReportView.tsx
apps/dsa-web/src/components/report/OriginalReportDisclosure.tsx
apps/dsa-web/src/components/report/ReportMarkdownDrawer.tsx
apps/dsa-web/src/components/report/ReportMarkdownPanel.tsx
apps/dsa-web/src/components/report/ReportOverview.tsx
apps/dsa-web/src/components/report/ReportSummary.tsx
apps/dsa-web/src/components/report/__tests__/MarketReviewReportView.test.tsx
apps/dsa-web/src/components/report/__tests__/OriginalReportDisclosure.test.tsx
apps/dsa-web/src/components/report/__tests__/ReportMarkdown.test.tsx
apps/dsa-web/src/components/settings/__tests__/NotificationTestPanel.test.tsx
apps/dsa-web/src/components/theme/ThemeProvider.tsx
apps/dsa-web/src/i18n/equitylensText.ts
apps/dsa-web/src/i18n/uiText.ts
apps/dsa-web/src/locales/featureText.ts
apps/dsa-web/src/pages/AlertsPage.tsx
apps/dsa-web/src/pages/ChatPage.tsx
apps/dsa-web/src/pages/CompanyResearchPage.tsx
apps/dsa-web/src/pages/DataCenterPage.tsx
apps/dsa-web/src/pages/HomePage.tsx
apps/dsa-web/src/pages/NotFoundPage.tsx
apps/dsa-web/src/pages/ResearchHomePage.tsx
apps/dsa-web/src/pages/SettingsPage.tsx
apps/dsa-web/src/pages/ToolsIndexPage.tsx
apps/dsa-web/src/pages/__tests__/AlertsPage.test.tsx
apps/dsa-web/src/pages/__tests__/ChatPage.test.tsx
apps/dsa-web/src/pages/__tests__/CompanyResearchPage.test.tsx
apps/dsa-web/src/pages/__tests__/DecisionSignalsPage.test.tsx
apps/dsa-web/src/pages/__tests__/HomePage.test.tsx
apps/dsa-web/src/pages/__tests__/ResearchHomePage.test.tsx
apps/dsa-web/src/pages/__tests__/SettingsPage.test.tsx
apps/dsa-web/src/types/secFinancials.ts
apps/dsa-web/tests/index.theme-bootstrap.test.ts
data_provider/sec_edgar.py
docs/CHANGELOG.md
docs/equitylens/DECISIONS.md
docs/equitylens/FEATURE_STATUS.md
docs/equitylens/KNOWN_LIMITATIONS.md
docs/equitylens/LOCALIZATION_AUDIT.md
docs/equitylens/PHASE_1A5_STEP_B_PLAN.md
docs/equitylens/PORTFOLIO_CASE_STUDY.md
docs/equitylens/PROGRESS.md
docs/equitylens/RELEASE_CHECKLIST.md
docs/equitylens/REVENUE_CASH_FLOW_SPEC.md
docs/equitylens/TEST_RESULTS.md
docs/equitylens/images/company-research-en.png
docs/equitylens/images/company-research-mobile-en.png
docs/equitylens/images/company-research-zh.png
docs/equitylens/images/research-home-en.png
docs/equitylens/images/research-home-zh.png
docs/equitylens/images/revenue-cash-flow-en.png
docs/equitylens/images/sec-source-evidence-en.png
src/config.py
src/core/market_review.py
src/services/sec_financials.py
tests/test_agent_chat_api.py
tests/test_market_review.py
tests/test_report_language_fallbacks_ko.py
tests/test_sec_financials.py
```

**Untracked, intentionally excluded from this candidate (14 paths):** `BASELINE_AUDIT.md`, `DESIGN_BRIEF.md`, `DESIGN_SYSTEM.md`, `EquityLens_Phase_1A5_StepB_Decision_Brief.md`, `EquityLens_Product_Strategy_2_1.md`, `IMPLEMENTATION_PLAN.md`, `PHASE_1A5_CHECKPOINT.md`, `STRATEGY_2_1_ALIGNMENT.md`, `UX_IMPLEMENTATION_PLAN.md` (all under `docs/equitylens/`), plus five files under `docs/equitylens/concepts/`: `evidence-ledger.html`, `prototype.css`, `prototype.js`, `recommended-workspace.html`, `research-desk.html`. These local drafts are preserved untouched; omitting them from this curated public candidate avoids presenting outdated designs or user-specific baseline paths as current product evidence.
