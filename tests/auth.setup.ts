import { test as setup, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { AUTH_FILE, hasCredentials, hasSavedLogin, manualLogin, refreshLogin, testUser } from './support/credentials';
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

setup('sign in with Google and save the session', async ({ browser }) => {
  setup.setTimeout(manualLogin ? 5 * 60_000 : 2 * 60_000);

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
