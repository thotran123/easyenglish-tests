# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A Playwright + TypeScript end-to-end test suite for the **Easy English** website (a Vietnamese English-learning site: "Easy English - Học Tiếng Anh Mỗi Ngày"). The app's source code is **not** in this repo. Tests run against the deployed site at `https://easyenglisheveryday.vercel.app`, which is the `baseURL` in `playwright.config.ts`, so tests use relative paths like `page.goto('/vocabulary')`.

So a failing test can mean the live site changed or is down, not only that the test is wrong.

## Commands

There are no npm scripts (`npm test` does not work). Use `npx playwright` directly:

```bash
npm ci                                   # install deps
npx playwright install chromium firefox webkit  # browsers used by the config (Galaxy A55 runs on Chromium, iPhone 13 on WebKit)
npx playwright test                      # run everything (all 4 projects)
npx playwright test tests/smoke.spec.ts  # one file
npx playwright test -g "home page"       # tests whose title matches
npx playwright test --project=chromium   # one project: chromium | firefox | mobile-galaxy-a55 | mobile-iphone13
npx playwright test --ui                 # interactive UI mode
npx playwright show-report               # open the HTML report (reporter is 'html')
npx tsc --noEmit                         # type-check (no linter is configured)
```

## Structure and conventions

- `tests/*.spec.ts` holds the tests (`testDir: './tests'`). Right now there is only `smoke.spec.ts`. It checks the home page title, and checks that `/vocabulary`, `/grammars`, `/dictionary` and `/games` return HTTP 200. It makes one test per path in a loop, so the report names the exact page that broke.
- Locators are organised one file per page: `tests/support/locators/<page>.locators.ts` (`common.locators.ts` for the header, sidebar and site-wide popups; `homepage.locators.ts`; `vocabulary.locators.ts`). Put a new page's locators in its own file; specs import from the page file directly (no barrel).
- Page objects live in `tests/support/pages/<page>.page.ts` (so far `vocabulary.page.ts`, class `VocabularyPage`). They hold a page's actions and reads (open the page, wait for data, read a number) and use that page's locators file; they don't replace it. Test files (`*.spec.ts`, `*.setup.ts`) stay directly in `tests/`, never in `support/`.
- `tests/srs.spec.ts` holds the SRS scenarios from `docs/srs-scenarios.md` (signed-in, via `storageState`). Use `expectSignedInHeader()` (helpers.ts) to check sign-in on pages other than `/`; `expectSignedIn()` needs the homepage greeting.
- Every test runs in 4 projects: Desktop Chrome, Desktop Firefox, Galaxy A55 (Android/Chromium) and iPhone 13 (iOS/WebKit). One test therefore produces 4 results.
- Behavior on CI (`process.env.CI`): `forbidOnly` is on, there are 2 retries, there is 1 worker, and traces are captured on the first retry. Locally there are no retries and Playwright picks the worker count.
- `.github/workflows/playwright.yml` (CI on GitHub Actions) runs on every push, on PRs into `main`, daily at 00:00 UTC, and from the manual "Run workflow" button. It type-checks with `tsc`, runs `npx playwright test`, and uploads `playwright-report/` and `test-results/` as artifacts. CI gets the signed-in session from the GitHub secret `PLAYWRIGHT_AUTH_STATE` (step "Restore signed-in session", see step 4 below); without that secret the `setup` project and the signed-in tests skip.
- The commented-out `dotenv` and `webServer` blocks in the config are unused scaffolding. There is no local dev server.
- `.claude/agents/code-reviewer.md` defines a read-only `code-reviewer` subagent (bugs + readability, with Playwright-specific checks).

## Signed-in session (Google login)

The site signs in with Google (Firebase popup). Google rejects every Playwright-controlled browser ("Couldn't sign you in / This browser or app may not be secure"), even headed with a person typing the password. So the login is never automated: a person signs in once in a normal Chrome, and the session is copied to `playwright/.auth/user.json` (`AUTH_FILE`, git-ignored). Signed-in tests load it with `storageState`.

- `tests/auth.setup.ts` (project `setup`, a dependency of every other project) runs first. It never signs in itself. With `CONNECT_CHROME=1` it copies the session from a signed-in Chrome into `user.json`. Otherwise, if `user.json` exists and still works, it re-saves it (keeps the Firebase tokens fresh); if the file is missing or expired it skips (on CI: when the `PLAYWRIGHT_AUTH_STATE` secret is missing or holds an expired session).
- `tests/support/credentials.ts` reads `.env` (via `process.loadEnvFile`) and exports `AUTH_FILE`, `hasSavedLogin()`, `testUser.displayName` (`TEST_USER_DISPLAY_NAME`, optional) and the `CONNECT_CHROME` flag.
- `user.json` keeps only this site's cookies, localStorage and IndexedDB (Firebase keeps the session in `firebaseLocalStorageDb`). It contains login tokens, so never commit or share it.

To create the session the first time, or renew it when it expires (the `setup` project then fails or skips, and signed-in tests skip):

1. Start a separate Chrome profile with remote debugging, and leave that terminal open:
   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222 --user-data-dir="$HOME/.easyenglish-test-chrome"
   ```
2. In that window, open `https://easyenglisheveryday.vercel.app` and sign in with Google. The profile remembers the login, so this is often already done.
3. In a second terminal, from the repo root:
   ```bash
   CONNECT_CHROME=1 npx playwright test --project=setup
   ```
   `1 passed` means `user.json` was overwritten with the new session. Then close that Chrome window. While it is open, any program on this machine can control it through port 9222.
4. Update the CI copy of the session. CI never sees your local `user.json`: it rebuilds it from the GitHub secret `PLAYWRIGHT_AUTH_STATE` (gzip + base64 of the file), so CI keeps using the old session until you run:
   ```bash
   gzip -c playwright/.auth/user.json | base64 | gh secret set PLAYWRIGHT_AUTH_STATE
   ```
   Then re-run the CI workflow. Do this every time you redo steps 1–3, so CI and your machine sign in as the same account with the same session.

The port in step 1 must match `CHROME_DEBUG_URL` (`http://localhost:9222`) in `credentials.ts`. The GCM / `chrome://newtab` errors Chrome prints in step 1 are harmless.
