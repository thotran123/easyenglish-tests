import { test, expect } from '@playwright/test';

// Homepage scenarios from docs/homepage-scenarios.md, added one at a time.
test.describe('Homepage', () => {
  test('HP-B-001 homepage returns HTTP 200', async ({ page }) => {
    const response = await page.goto('/');
    expect(response, 'no response received for /').not.toBeNull();
    expect(response!.status()).toBe(200);

    // Not a blank screen: the main heading "Easy English" is rendered.
    await expect(page.getByRole('heading', { level: 1, name: 'Easy English' })).toBeVisible();
  });

  test('HP-B-002 page title is correct', async ({ page }) => {
    await page.goto('/');

    // Exact match: the whole title must be this text, not just contain it.
    await expect(page).toHaveTitle('Easy English - Học Tiếng Anh Mỗi Ngày');
  });
});
