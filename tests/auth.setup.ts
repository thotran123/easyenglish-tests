import { test as setup, chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { AUTH_FILE, CHROME_DEBUG_URL, connectChrome, hasSavedLogin } from '../support/credentials';
import { expectSignedIn, suppressInvitePromo } from '../support/helpers';

// Keeps the signed-in session in AUTH_FILE (playwright/.auth/user.json) up to date.
// Signed-in tests load that file with storageState instead of signing in.
//
// Playwright never signs in through Google itself: Google rejects every automated browser
// ("This browser or app may not be secure"). A person signs in once in a normal Chrome and the
// session is copied from there:
//   1. "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222 --user-data-dir="$HOME/.easyenglish-test-chrome"
//   2. In that window, open the site and sign in with Google.
//   3. CONNECT_CHROME=1 npx playwright test --project=setup
//
// On a normal run this setup only checks that AUTH_FILE still works and re-saves it, which keeps the
// Firebase tokens fresh. With no file, or an expired one, it skips (always the case on CI).

const RENEW_HINT = 'Renew it: see "Signed-in session (Google login)" in CLAUDE.md (CONNECT_CHROME=1).';

setup('refresh the saved Google session', async ({ browser, baseURL }) => {
  // Copy the session from a Chrome you signed in to yourself.
  if (connectChrome) {
    await saveSessionFromRealChrome(baseURL!);
    return;
  }

  setup.skip(!hasSavedLogin(), `No saved session at ${AUTH_FILE}. ${RENEW_HINT}`);

  // Reuse the saved session if it still works (Firebase refresh tokens last a long time).
  const context = await browser.newContext({ storageState: AUTH_FILE });
  try {
    const page = await context.newPage();
    await suppressInvitePromo(page);
    await page.goto('/');
    const stillSignedIn = await expectSignedIn(page).then(
      () => true,
      () => false,
    );
    setup.skip(!stillSignedIn, `The saved session has expired. ${RENEW_HINT}`);

    await context.storageState({ path: AUTH_FILE, indexedDB: true }); // keep the tokens fresh
  } finally {
    await context.close();
  }
});

// Connects to a normal Chrome (started with --remote-debugging-port) where you already signed in,
// checks the site shows you as signed in, and saves only this site's part of the state to AUTH_FILE.
// Google's own cookies from that profile are left out, so AUTH_FILE cannot sign anyone in to Google.
async function saveSessionFromRealChrome(baseURL: string) {
  const chrome = await chromium.connectOverCDP(CHROME_DEBUG_URL).catch((error) => {
    throw new Error(
      `Could not reach Chrome at ${CHROME_DEBUG_URL}. Start it first (see the comment at the top of this file).\n` +
        error,
    );
  });
  const context = chrome.contexts()[0];
  const page = await context.newPage();
  try {
    await page.goto(baseURL);
    await expectSignedIn(page).catch((error) => {
      throw new Error('That Chrome window is not signed in to the site. Sign in there with Google first.\n' + error);
    });

    const siteHost = new URL(baseURL).hostname;
    const state = await context.storageState({ indexedDB: true });
    const siteOnly = {
      cookies: state.cookies.filter((cookie) => cookie.domain.replace(/^\./, '') === siteHost),
      origins: state.origins.filter((origin) => new URL(origin.origin).hostname === siteHost),
    };
    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
    fs.writeFileSync(AUTH_FILE, JSON.stringify(siteOnly, null, 2));
  } finally {
    await page.close(); // only the tab opened here; your Chrome stays open
  }
}
