import { test, expect } from '@playwright/test';
import { AUTH_FILE, hasSavedLogin } from './support/credentials';
import { suppressInvitePromo } from './support/helpers';
import * as vocabLocator from './support/locators/vocabulary.locators';
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
    for (const label of Object.values(vocabLocator.SRS_STAT)) {
      const format = label === vocabLocator.SRS_STAT.accuracy ? PERCENT : COUNT;
      await expect.soft(box.label(label), `label "${label}"`).toBeVisible();
      await expect.soft(box.value(label), `value of "${label}"`).toHaveText(format);
    }
  });

  test('SRS-L-002 totals add up', async ({ page }) => {
    const vocabulary = new VocabularyPage(page);
    // Firestore can only be read once the page shows the user as signed in (fresh sign-in token).
    await vocabulary.gotoSignedIn();

    // Read the data from Firestore database
    const firestore = await readFirestoreSrsRecords(page);
    const firestoreCount = Object.keys(firestore).length;
    // With no card at all, every check below would be 0 = 0 and prove nothing.
    expect(firestoreCount, 'the test account has no SRS card yet (rate one card first)').toBeGreaterThan(0);

    //    "Tổng số Thẻ" = number of cards in Firestore:
    await vocabulary.waitForStats(firestoreCount);

    // Read the numbers in the stats box on UI
    const stat = await vocabulary.readAllStats ();
    expect.soft(stat.totalBar, '"Tổng Thẻ" = "Tổng số Thẻ"').toBe(stat.totalCards);
    expect.soft(stat.learning + stat.reviewing + stat.mastered, '"Đang Học" + "Đang Ôn tập" + "Thành thạo" = "Tổng số Thẻ"').toBe(stat.totalCards);

    // Read data on localStorage
    await expect
      .poll(async () => Object.keys(await readLocalSrsRecords(page)).length, {
        message: 'number of cards in localStorage = number in Firestore',
      })
      .toBe(firestoreCount);
    const local = await readLocalSrsRecords(page);

    // Each status tile = number of cards with that status, in localStorage and in Firestore.
    const statusTiles: Array<[status: string, label: string, shown: number]> = [
      ['learning', vocabLocator.SRS_STAT.learning, stat.learning],
      ['reviewing', vocabLocator.SRS_STAT.reviewing, stat.reviewing],
      ['mastered', vocabLocator.SRS_STAT.mastered, stat.mastered],
    ];
    for (const [status, label, shown] of statusTiles) {
      expect.soft(countByStatus(local, status), `localStorage cards with status "${status}" = "${label}"`).toBe(shown);
      expect.soft(countByStatus(firestore, status), `Firestore cards with status "${status}" = "${label}"`).toBe(shown);
    }
  });

  test('SRS-L-003 – Stats are the same after reload and in a second browser',
  async ({ page, browser, baseURL }) => {
    // Mở trang và đọc stats ban đầu
    const vocabulary = new VocabularyPage(page);
    await vocabulary.gotoSignedIn();
    await vocabulary.waitForStats();
    const before = await vocabulary.readAllStats();

    // 1. Sau khi reload, stats không đổi
    await page.reload();
    await vocabulary.waitForStats();
    expect(await vocabulary.readAllStats()).toEqual(before);

    // 2. Ở trình duyệt thứ hai (cùng tài khoản), stats không đổi
    const context2 = await browser.newContext({ baseURL, storageState: AUTH_FILE });
    const page2 = await context2.newPage();
    await suppressInvitePromo(page2);
    const vocabulary2 = new VocabularyPage(page2);
    await vocabulary2.gotoSignedIn();
    await vocabulary2.waitForStats();
    expect(await vocabulary2.readAllStats()).toEqual(before);

    await context2.close();
  });

  test('SRS-L-004 – Flipping a card without rating changes nothing', async ({page, isMobile}) => {
    const vocabulary = new VocabularyPage(page);
    await vocabulary.gotoSignedIn();

    // 1) Before: Firestore, the stats box and localStorage
    const firestoreBefore = await readFirestoreSrsRecords(page);
    const cardCount = Object.keys(firestoreBefore).length;
    await vocabulary.waitForStats(cardCount);
    const statsBefore = await vocabulary.readAllStats();
    const localBefore = await readLocalSrsRecords(page);

    // 2) Open Unit 1 in Flashcards mode
    await vocabulary.openCollection('3000 Từ Vựng Oxford thiết yếu');
    await expect(page).toHaveURL(/\/vocabulary\/oxford_3000$/);
    await vocabulary.openUnit('Unit 1', isMobile);
    await vocabLocator.unitActions(page).startOrContinue.click();
    await vocabLocator.studyMode(page, vocabLocator.STUDY_MODE.flashcards).click();

    // 3) Flip the card and flip it back, without rating it
    await vocabulary.expectCardSide('front');
    await vocabLocator.flashcard(page).root.click(); // flip with the mouse
    await vocabulary.expectCardSide('back');
    await page.keyboard.press('Space'); // flip back with the Space key
    await vocabulary.expectCardSide('front');
    
    // 4) Back on /vocabulary: nothing changed
    await vocabLocator.backToVocabulary(page).click();
    await vocabulary.waitForStats(cardCount);
    expect(await vocabulary.readAllStats(), 'stats box').toEqual(statsBefore);
    expect(await readLocalSrsRecords(page), 'localStorage').toEqual(localBefore);
    expect(await readFirestoreSrsRecords(page), 'Firestore').toEqual(firestoreBefore);
  });

  test('SRS-L-005 – "Trước" / "Tiếp theo" without rating changes nothing', async ({page,isMobile}) => {
    const vocabulary = new VocabularyPage(page);
    await vocabulary.gotoSignedIn();

    // 1) Before: Firestore, the stats box and localStorage
    const firestoreBefore = await readFirestoreSrsRecords(page);
    const cardCount = Object.keys(firestoreBefore).length;
    await vocabulary.waitForStats(cardCount);
    const statsBefore = await vocabulary.readAllStats();
    const localBefore = await readLocalSrsRecords(page);

    // 2) Open Unit 1 in Flashcards mode
    await vocabulary.openCollection('3000 Từ Vựng Oxford thiết yếu');
    await expect(page).toHaveURL(/\/vocabulary\/oxford_3000$/);
    await vocabulary.openUnit('Unit 1', isMobile);
    await vocabLocator.unitActions(page).startOrContinue.click();
    await vocabLocator.studyMode(page, vocabLocator.STUDY_MODE.flashcards).click();

    // 3) 
    const start = await vocabulary.readCardNumber();
    for (let i = 1; i <= 3; i++) {
      await vocabLocator.navButton(page, vocabLocator.NAV_BUTTON.next).click();
      await expect.poll(() => vocabulary.readCardNumber()).toBe(start + i);
    }

    await vocabLocator.navButton(page, vocabLocator.NAV_BUTTON.previous).click();
    await expect.poll(() => vocabulary.readCardNumber()).toBe(start + 2)
    
    
    // 4) Back on /vocabulary: nothing changed
    await vocabLocator.backToVocabulary(page).click();
    await vocabulary.waitForStats(cardCount);
    expect(await vocabulary.readAllStats(), 'stats box').toEqual(statsBefore);
    expect(await readLocalSrsRecords(page), 'localStorage').toEqual(localBefore);
    expect(await readFirestoreSrsRecords(page), 'Firestore').toEqual(firestoreBefore);
  })

});
