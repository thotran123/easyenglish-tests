import { test, expect } from '@playwright/test';
import { AUTH_FILE, hasSavedLogin } from './support/credentials';
import { suppressInvitePromo } from './support/helpers';
import { SRS_STAT } from './support/locators/vocabulary.locators';
import { VocabularyPage } from './support/pages/vocabulary.page';
import { countByStatus, readFirestoreSrsRecords, readLocalSrsRecords } from './support/srs-data';

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
    // Firestore can only be read once the page shows the user as signed in (fresh sign-in token).
    await vocabulary.gotoSignedIn();

    // 1) The database is the source of truth: read it first.
    const firestore = await readFirestoreSrsRecords(page);
    const firestoreCount = Object.keys(firestore).length;
    // With no card at all, every check below would be 0 = 0 and prove nothing.
    expect(firestoreCount, 'the test account has no SRS card yet (rate one card first)').toBeGreaterThan(0);

    // 2) The stats box and localStorage start empty and fill in a few seconds later, so wait for them
    //    to catch up with the database instead of reading them right away.
    //    "Tổng số Thẻ" = number of cards in Firestore:
    await vocabulary.waitForStats(firestoreCount);
    //    Number of cards in localStorage = number in Firestore (expect.poll retries until it matches):
    await expect
      .poll(async () => Object.keys(await readLocalSrsRecords(page)).length, {
        message: 'number of cards in localStorage = number in Firestore',
      })
      .toBe(firestoreCount);
    const local = await readLocalSrsRecords(page);

    // 3) Read the numbers in the stats box.
    const total = await vocabulary.readStat(SRS_STAT.totalCards);
    const totalBar = await vocabulary.readStat(SRS_STAT.totalBar);
    const learning = await vocabulary.readStat(SRS_STAT.learning);
    const reviewing = await vocabulary.readStat(SRS_STAT.reviewing);
    const mastered = await vocabulary.readStat(SRS_STAT.mastered);

    // 4) The box adds up.
    expect.soft(totalBar, '"Tổng Thẻ" = "Tổng số Thẻ"').toBe(total);
    expect.soft(learning + reviewing + mastered, '"Đang Học" + "Đang Ôn tập" + "Thành thạo" = "Tổng số Thẻ"').toBe(total);

    // 5) Each status tile = number of cards with that status, in localStorage and in Firestore.
    const statusTiles: Array<[status: string, label: string, shown: number]> = [
      ['learning', SRS_STAT.learning, learning],
      ['reviewing', SRS_STAT.reviewing, reviewing],
      ['mastered', SRS_STAT.mastered, mastered],
    ];
    for (const [status, label, shown] of statusTiles) {
      expect.soft(countByStatus(local, status), `localStorage cards with status "${status}" = "${label}"`).toBe(shown);
      expect.soft(countByStatus(firestore, status), `Firestore cards with status "${status}" = "${label}"`).toBe(shown);
    }
  });
});
