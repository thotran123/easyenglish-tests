import { test, expect } from '@playwright/test';

// Smoke tests: quick checks that the main pages of the site are up.
test.describe('Smoke', () => {
  test('home page title contains "Easy English"', async ({ page }) => {
    // '/' is joined to baseURL from playwright.config.ts
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Easy English/);
  });

  // One separate test per page, so the report shows exactly which page broke.
  const pages = ['/vocabulary', '/grammars', '/dictionary', '/games'];

  for (const path of pages) {
    test(`${path} loads with status 200`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response, `no response received for ${path}`).not.toBeNull();
      expect(response!.status()).toBe(200);
    });
  }
});
