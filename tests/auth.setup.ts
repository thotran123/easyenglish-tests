import { test as setup, expect, chromium, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {
  AUTH_FILE,
  CHROME_DEBUG_URL,
  connectChrome,
  hasCredentials,
  hasSavedLogin,
  manualLogin,
  refreshLogin,
  testUser,
} from './support/credentials';
import { expectSignedIn, suppressInvitePromo } from './support/helpers';
import { guestSignInPopup, header } from './support/locators';

// Signs in once and saves the browser state to AUTH_FILE. Logged-in tests (added later) will load that file
// (storageState) instead of signing in again, so Google is only contacted when needed.
//
// The site uses Firebase "Sign in with Google" in a popup window, and Firebase keeps the session
// in IndexedDB, so the state is saved with `indexedDB: true`.
//
// Google often blocks sign-ins from automated browsers, and 2-step verification cannot be
// automated. In that case run it headed once and finish the sign-in yourself:
//   MANUAL_LOGIN=1 npx playwright test --project=setup --headed
//
// If Google rejects even that ("This browser or app may not be secure"), sign in from a normal Chrome
// and copy its session instead:
//   1. "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222 --user-data-dir="$HOME/.easyenglish-test-chrome"
//   2. In that window, open the site and sign in with Google.
//   3. CONNECT_CHROME=1 npx playwright test --project=setup

setup('sign in with Google and save the session', async ({ browser, baseURL }) => {
  setup.setTimeout(manualLogin ? 5 * 60_000 : 2 * 60_000);

  // 0) Copy the session from a Chrome you signed in to yourself.
  if (connectChrome) {
    await saveSessionFromRealChrome(baseURL!);
    return;
  }

  // 1) Reuse the saved session if it still works (Firebase refresh tokens last a long time).
  if (hasSavedLogin() && !refreshLogin) {
    const context = await browser.newContext({ storageState: AUTH_FILE });
    const page = await context.newPage();
    await suppressInvitePromo(page);
    await page.goto('/');
    const stillSignedIn = await expectSignedIn(page).then(() => true, () => false);
    if (stillSignedIn) {
      await context.storageState({ path: AUTH_FILE, indexedDB: true }); // keep the tokens fresh
      await context.close();
      return;
    }
    await context.close();
  }

  setup.skip(
    !hasCredentials() && !manualLogin,
    'No credentials: set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env, or run with MANUAL_LOGIN=1 --headed.',
  );

  // 2) Sign in from scratch.
  const context = await browser.newContext();
  const page = await context.newPage();
  await suppressInvitePromo(page);
  await page.goto('/');

  const popupPromise = page.waitForEvent('popup');
  await header(page).signInButton.click();
  await guestSignInPopup(page).googleButton.click();
  const popup = await popupPromise;

  if (manualLogin) {
    console.log('MANUAL_LOGIN: finish the Google sign-in in the popup window (5 minutes).');
  } else {
    await fillGoogleSignIn(popup);
  }

  await expectSignedIn(page, manualLogin ? 5 * 60_000 : 30_000).catch((error) => {
    throw new Error(
      'Google sign-in did not finish. Google may have blocked the automated browser or asked for ' +
        'verification. Try: MANUAL_LOGIN=1 npx playwright test --project=setup --headed\n' + error,
    );
  });

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await context.storageState({ path: AUTH_FILE, indexedDB: true });
  await context.close();
});

// Connects to a normal Chrome (started with --remote-debugging-port) where you already signed in,
// checks the site shows you as signed in, and saves only this site's part of the state to AUTH_FILE.
// Google's own cookies from that profile are left out, so AUTH_FILE cannot sign anyone in to Google.
async function saveSessionFromRealChrome(baseURL: string) {
  const chrome = await chromium.connectOverCDP(CHROME_DEBUG_URL).catch((error) => {
    throw new Error(
      `Could not reach Chrome at ${CHROME_DEBUG_URL}. Start it first (see the comment at the top of this file).\n` + error,
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

// Google's own sign-in pages (accounts.google.com). Their ids are stable across UI languages.
async function fillGoogleSignIn(popup: Page) {
  const timeout = 30_000;

  await popup.locator('input[type="email"]').fill(testUser.email);
  await popup.locator('#identifierNext').click();

  const password = popup.locator('input[type="password"][name="Passwd"]');
  await expect(password, 'Google did not show the password step (blocked browser or unknown account?)').toBeVisible({ timeout });
  await password.fill(testUser.password);
  await popup.locator('#passwordNext').click();

  // First sign-in to this app may show a consent screen ("Continue" / "Tiếp tục").
  // The popup closes itself once Firebase receives the result.
  const consent = popup.getByRole('button', { name: /^(Continue|Tiếp tục)$/ });
  await Promise.race([
    popup.waitForEvent('close', { timeout }),
    consent.click({ timeout }).catch(() => {}),
  ]);
}
