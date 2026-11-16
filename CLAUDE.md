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
- Every test runs in 4 projects: Desktop Chrome, Desktop Firefox, Galaxy A55 (Android/Chromium) and iPhone 13 (iOS/WebKit). One test therefore produces 4 results.
- Behavior on CI (`process.env.CI`): `forbidOnly` is on, there are 2 retries, there is 1 worker, and traces are captured on the first retry. Locally there are no retries and Playwright picks the worker count.
- `.github/workflows/playwright.yml` (CI on GitHub Actions) runs on every push, on PRs into `main`, daily at 00:00 UTC, and from the manual "Run workflow" button. It type-checks with `tsc`, runs `npx playwright test`, and uploads `playwright-report/` and `test-results/` as artifacts. CI has no Google credentials, so the `setup` project skips itself there.
- The commented-out `dotenv` and `webServer` blocks in the config are unused scaffolding. There is no local dev server.
- `.claude/agents/code-reviewer.md` defines a read-only `code-reviewer` subagent (bugs + readability, with Playwright-specific checks).
