import { test, expect } from '@playwright/test';
import { AUTH_FILE, hasSavedLogin } from './support/credentials';
import { suppressInvitePromo } from './support/helpers';
import { SRS_STAT } from './support/locators/vocabulary.locators';
import { VocabularyPage } from './support/pages/vocabulary.page';

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
    const vocabulary = new VocabularyPage(page);
    await vocabulary.gotoSignedIn();
    const box = vocabulary.stats;
    await expect(box.root).toBeVisible();

    // Every tile shows a count, except "Độ Chính xác", which shows a percentage.
    // Soft assertions: one run reports every missing label or bad value, not just the first.
    for (const label of Object.values(SRS_STAT)) {
      const format = label === SRS_STAT.accuracy ? PERCENT : COUNT;
      await expect.soft(box.label(label), `label "${label}"`).toBeVisible();
      await expect.soft(box.value(label), `value of "${label}"`).toHaveText(format);
    }
  });

  test('SRS-L-002 totals add up', async ({ page }) => {
    const vocabulary = new VocabularyPage(page);
    await vocabulary.gotoSignedIn();
    // Without this wait every tile still reads 0, and 0 = 0 + 0 + 0 would pass without checking anything.
    await vocabulary.waitForStats();

    const total = await vocabulary.readStat(SRS_STAT.totalCards);
    const totalBar = await vocabulary.readStat(SRS_STAT.totalBar);
    const learning = await vocabulary.readStat(SRS_STAT.learning);
    const reviewing = await vocabulary.readStat(SRS_STAT.reviewing);
    const mastered = await vocabulary.readStat(SRS_STAT.mastered);

    expect.soft(totalBar, '"Tổng Thẻ" = "Tổng số Thẻ"').toBe(total);
    expect.soft(learning + reviewing + mastered, '"Đang Học" + "Đang Ôn tập" + "Thành thạo" = "Tổng số Thẻ"').toBe(total);
  });
});
