# EquityLens Portfolio Demo v0.1 — static deployment

> The production URL below remains v0.1. For the **unpublished** v0.2 candidate, see [v0.2 release candidate](V0_2_RELEASE_CANDIDATE.md). Build with `npm run build:demo`, verify the SHA manifest in `public-demo/demo/v02/`, and deploy only after separate approval. A Direct Upload preview may use `wrangler pages deploy demo-dist --project-name equitylens-portfolio-v01 --branch v02-preview`; production remains unchanged until an approved production deployment and live acceptance pass.

## Status and scope

The public v0.1 site is live at **https://equitylens-portfolio-v01.pages.dev/** on Cloudflare Pages Free. The final production deployment was checked on 2026-10-29 after a second upload removed a misleading refresh control from the static company page. The demo supports NVIDIA (`NVDA`) only. It uses a dated, read-only response from the existing SEC-backed EquityLens API; it does not query SEC or FastAPI from visitors' browsers and does not provide live financial updates.

The public routes are `/`, `/research`, and `/research/NVDA`. Other paths show an explicit unavailable page. The local application and its legacy Market Tools remain in the source repository but are not part of the demo route tree. The demo retains the React research home, company research, annual and quarterly views, revenue and operating cash flow comparison, SEC evidence, English and Simplified Chinese, and light and dark themes.

## Rebuild the snapshot and site

1. Run the **local-only** FastAPI application with a valid `SEC_CONTACT_EMAIL` in the ignored `.env`. Never publish the contact value. The existing SEC adapter controls its requests and cache.
2. From the repository root, export the current verified response:

   ```bash
   .venv/bin/python scripts/export_equitylens_demo_snapshot.py
   ```

   The script checks NVIDIA's ticker/CIK, annual and quarterly periods, reported/derived labels, definitions and SEC filing provenance. It rejects an email address or localhost URL in the snapshot. It copies the API JSON without changing financial values and prints its SHA-256 digest and retrieval timestamp. Review the latest figures against the original SEC filing before publishing a new snapshot.
3. Build from `apps/dsa-web`:

   ```bash
   npm run build:demo
   ```

   The upload folder is **`demo-dist/` at the repository root**, not Vite's normal `static/` output. Vite's demo mode copies only `apps/dsa-web/public-demo/` into that folder. It selects the static adapter and separate demo route tree; the normal local build remains unchanged.
4. Run the deterministic local browser checks with an installed Playwright Chromium or the `EQUITYLENS_CHROME_PATH` override:

   ```bash
   cd apps/dsa-web
   npx playwright test --config=playwright.demo.config.ts
   ```

5. Review every file in `demo-dist/` and scan the built output for credentials, personal paths, localhost references and private API calls. The build output is ignored by Git. Upload only this folder, not the repository, `.env`, `static/`, caches, logs or databases.

## Cloudflare Pages Free upload

The approved deployment uses Cloudflare Pages **Direct Upload**, project `equitylens-portfolio-v01`, and the 13 files in `demo-dist/`. The project uses its `*.pages.dev` HTTPS address. It has no Git connection, environment secrets, scheduled workflow or FastAPI backend. For a repeat upload, build and review the same static output, then use the project's **Create deployment → Production → file upload → Save and deploy** flow. Direct Upload projects cannot subsequently be changed to Git integration in place, so any later switch requires a new project.

Cloudflare Pages serves a single-page application fallback when the output has no top-level `404.html`. This build intentionally has none. Test direct navigation and refresh at `/research/NVDA` on the **public** URL, not just in the local preview.

The final public URL passed the three Playwright demo scenarios, including `/research/NVDA` direct navigation and refresh. A second live browser pass checked 1440/1024/768/390px, all English/Chinese and light/dark combinations, no whole-page overflow, no console/page/request failures, no localhost or `/api/` requests, the dated snapshot notice, charts, comparison and expandable SEC evidence. The public snapshot SHA-256 exactly matches the locally exported JSON. Five final live-site screenshots are stored outside Git at `/tmp/equitylens-demo-live/*-final.png`; see [test results](TEST_RESULTS.md) for exact outcomes.

## Data and limitations

The initial snapshot was retrieved on `2026-10-29T08:56:49.694214+00:00`; its SHA-256 digest is `04cd4dc9af578e030bd6eee5e5dcff90560079f9bf4ae9eb888c6d2ab86b3583`. It contains 22 financial periods and 325 value-level SEC source references. FY2026 10-K revenue is 215,938,000,000 USD and operating cash flow is 102,718,000,000 USD for 2025-01-27 through 2026-01-25. These are reported figures from the existing verified pipeline, not forecasts. The snapshot must be regenerated and rechecked for future updates; the site will not refresh itself.

The first public demo has no account, LLM service, automated research, monitoring, or arbitrary ticker coverage. The regular local FastAPI app retains those inherited or future paths separately. Do not present this static build as live SEC integration or a production investment service.

## Rollback

If a public upload fails validation, remove or disable that Cloudflare Pages deployment and leave the local application unchanged. Preserve the previous verified snapshot and build digest for comparison before uploading a replacement.
