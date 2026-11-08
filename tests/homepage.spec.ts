import { test, expect } from '@playwright/test';
import { collectConsoleErrors, openSidebar, suppressInvitePromo, todayDdMmYyyy } from './support/helpers';
import { guestSignInPopup, hero } from './support/locators';

// Homepage scenarios from docs/homepage-scenarios.md, added one at a time.
test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await suppressInvitePromo(page);
  });

  test('HP-B-001 homepage returns HTTP 200', async ({ page }) => {
    const response = await page.goto('/');
    expect(response, 'no response received for /').not.toBeNull();
    expect(response!.status()).toBe(200);

    // Not a blank screen: the main heading "Easy English" is rendered.
    await expect(hero(page).heading).toBeVisible();
  });

  test('HP-B-002 page title is correct', async ({ page }) => {
    await page.goto('/');

    // Exact match: the whole title must be this text, not just contain it.
    await expect(page).toHaveTitle('Easy English - Học Tiếng Anh Mỗi Ngày');
  });

  test('HP-B-003 no console errors on load', async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    // The scenario says "until network is idle", but 'networkidle' never fires here:
    // the site keeps a Firestore long-polling request (Firestore/Listen/channel) open.
    // Instead wait for load + the rendered heading, then give async errors time to appear.
    await page.goto('/', { waitUntil: 'load' });
    await expect(hero(page).heading).toBeVisible();
    await page.waitForTimeout(3000);

    // Print every error in the failure message so the report shows what broke.
    expect(consoleErrors, `console errors:\n${consoleErrors.join('\n')}`).toEqual([]);
  });

  test('HP-B-004 logo links to homepage', async ({ page, isMobile }) => {
    await page.goto('/');
    const sidebar = await openSidebar(page, isMobile);

    await sidebar.logoLink.click();

    await expect(page).toHaveURL('/');
    await expect(hero(page).heading).toBeVisible();
  });

  test('HP-B-005 favicon and manifest load', async ({ page, request }) => {
    await page.goto('/');

    // Check each file separately so the failure message names the one that broke.
    for (const path of ['/icon.png', '/manifest.json']) {
      const response = await request.get(path);
      expect(response.status(), `status of ${path}`).toBe(200);
    }
  });

  test("HP-B-006 today's date shown in hero", async ({ page }) => {
    await page.goto('/');

    await expect(hero(page).date).toHaveText(todayDdMmYyyy());
  });

  test('HP-B-007 hero heading and tagline', async ({ page }) => {
    await page.goto('/');
    const { heading, tagline } = hero(page);

    await expect(heading).toBeVisible();
    await expect(tagline).toBeVisible();
  });

  // Sidebar links are client-side (Next.js) navigation, so there is no document response
  // to read the status from; the HTTP 200 check requests the target URL separately.
  test('HP-B-008 sidebar link "Trang chủ" navigates to /', async ({ page, request, isMobile }) => {
    await page.goto('/');
    const sidebar = await openSidebar(page, isMobile);

    await sidebar.homeLink.click();

    await expect(page).toHaveURL('/');
    expect((await request.get('/')).status()).toBe(200);
  });

  test('HP-B-009 sidebar link "Từ vựng" navigates to /vocabulary', async ({ page, request, isMobile }) => {
    await page.goto('/');
    const sidebar = await openSidebar(page, isMobile);

    await sidebar.vocabularyLink.click();

    await expect(page).toHaveURL('/vocabulary');
    expect((await request.get('/vocabulary')).status()).toBe(200);
  });

  // Guest branch only: there is no logged-in setup (storageState) in this suite yet.
  test('HP-B-010 sidebar link "Collocations" asks a guest to sign in', async ({ page, isMobile }) => {
    await page.goto('/');
    const sidebar = await openSidebar(page, isMobile);

    await sidebar.collocationsLink.click();

    const popup = guestSignInPopup(page);
    await expect(popup.message).toBeVisible();
    await expect(popup.googleButton).toBeVisible();
    await expect(page).toHaveURL('/');
  });
});
