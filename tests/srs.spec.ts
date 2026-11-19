import { test, expect } from '@playwright/test';
import { AUTH_FILE, hasSavedLogin } from './support/credentials';
import { expectSignedInHeader, suppressInvitePromo } from './support/helpers';
import { srsStatsBox } from './support/locators/vocabulary.locators';

// SRS scenarios from docs/srs-scenarios.md, added one at a time.
// Signed-in cases (SRS-L) load the session saved by tests/auth.setup.ts; with no saved session they skip.

test.use({
  storageState: async ({}, use) => {
    test.skip(
      !hasSavedLogin(),
      'No saved session. See "Signed-in session (Google login)" in CLAUDE.md to create one.',
    );
    await use(AUTH_FILE);
  },
});

// A whole number, optionally with thousands separators ("1.234" / "1,234").
const COUNT = /^\d{1,3}(?:[.,]\d{3})*$/;
// A percentage such as "80%", "80 %" or "80.5%".
const PERCENT = /^\d+(?:[.,]\d+)?\s?%$/;

test.describe('SRS', () => {
  test.beforeEach(async ({ page }) => {
    await suppressInvitePromo(page);
  });

  test('SRS-L-001 stats box shows all labels', async ({ page }) => {
    await page.goto('/vocabulary');
    // Fail clearly if the session has expired, instead of reporting a missing stats box.
    await expectSignedInHeader(page);

    const box = srsStatsBox(page);
    await expect(box.root).toBeVisible();

    const tiles: Array<[label: string, format: RegExp]> = [
      ['Tổng số Thẻ', COUNT],
      ['Đến Hạn', COUNT],
      ['Phiên ôn tập', COUNT],
      ['Độ Chính xác', PERCENT],
      ['Đang Học', COUNT],
      ['Đang Ôn tập', COUNT],
      ['Thành thạo', COUNT],
      ['Tổng Thẻ', COUNT],
    ];

    // Soft assertions: one run reports every missing label or bad value, not just the first.
    for (const [label, format] of tiles) {
      await expect.soft(box.label(label), `label "${label}"`).toBeVisible();
      await expect.soft(box.value(label), `value of "${label}"`).toHaveText(format);
    }
  });
});
