import { test, expect } from '@playwright/test';
import { AUTH_FILE, hasSavedLogin, testUser } from './support/credentials';
import { expectSignedIn, suppressInvitePromo } from './support/helpers';
import { header } from './support/locators/common.locators';

// Login scenarios HP-L-001 and HP-L-002 from docs/homepage-scenarios.md.
// They never sign in through Google themselves: they load the session saved by tests/auth.setup.ts.
// Logout (HP-L-003) and the other logged-in scenarios come later.

// Load the saved session. This runs when the test starts (after the setup project has run),
// so a session saved by this same run is picked up. With no saved session the tests skip.
test.use({
  storageState: async ({}, use) => {
    test.skip(
      !hasSavedLogin(),
      'No saved session. See "Signed-in session (Google login)" in CLAUDE.md to create one.',
    );
    await use(AUTH_FILE);
  },
});

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await suppressInvitePromo(page);
  });

  test('HP-L-001 logged-in state on load', async ({ page }) => {
    await page.goto('/');

    // Greeting shows a real name (not the guest "bạn") and there is no "Đăng nhập" button.
    await expectSignedIn(page);

    // If the account's display name is known, the greeting must show exactly that name.
    if (testUser.displayName) {
      await expect(header(page).nameButton).toHaveText(testUser.displayName);
    }
  });

  test('HP-L-002 session persists after reload', async ({ page }) => {
    await page.goto('/');
    await expectSignedIn(page);

    await page.reload();

    await expectSignedIn(page);
  });
});
