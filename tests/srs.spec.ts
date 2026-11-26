import { test, expect } from '@playwright/test';
import { AUTH_FILE, hasSavedLogin } from '../support/credentials';
import { suppressInvitePromo } from '../support/helpers';
import * as vocabLocator from '../support/locators/vocabulary.locators';
import { VocabularyPage } from '../support/pages/vocabulary.page';
import { countByStatus, readFirestoreSrsRecords, readLocalSrsRecords } from '../support/srs-data';

// SRS scenarios from docs/srs-scenarios.md, added one at a time.
// Signed-in cases (SRS-L) load the session saved by tests/auth.setup.ts; with no saved session they skip.

test.use({
  storageState: async ({}, use) => {
    test.skip(!hasSavedLogin(), 'No saved session. See "Signed-in session (Google login)" in CLAUDE.md to create one.');
    await use(AUTH_FILE);
  },
});

// A whole number, optionally with thousands separators ("1.234" / "1,234").
const COUNT = /^\d{1,3}(?:[.,]\d{3})*$/;
// A percentage such as "80%", "80 %" or "80.5%".
const PERCENT = /^\d+(?:[.,]\d+)?\s?%$/;

const OXFORD_3000 = '3000 Từ Vựng Oxford thiết yếu';
const TEST_UNIT = 'Unit 2';
const VOCAB_URL = '/vocabulary';

test.describe('SRS Login', () => {
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
    const stat = await vocabulary.readAllStats();
    expect.soft(stat.totalBar, '"Tổng Thẻ" = "Tổng số Thẻ"').toBe(stat.totalCards);
    expect
      .soft(stat.learning + stat.reviewing + stat.mastered, '"Đang Học" + "Đang Ôn tập" + "Thành thạo" = "Tổng số Thẻ"')
      .toBe(stat.totalCards);

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

  test('SRS-L-003 – Stats are the same after reload and in a second browser', async ({ page, browser, baseURL }) => {
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

  test('SRS-L-004 – Flipping a card without rating changes nothing', async ({ page, isMobile }) => {
    const vocabulary = new VocabularyPage(page);
    await vocabulary.gotoSignedIn();

    // 1) Before: Firestore, the stats box and localStorage
    const firestoreBefore = await readFirestoreSrsRecords(page);
    const cardCount = Object.keys(firestoreBefore).length;
    await vocabulary.waitForStats(cardCount);
    const statsBefore = await vocabulary.readAllStats();
    const localBefore = await readLocalSrsRecords(page);

    // 2) Open Unit in Flashcards mode
    await vocabulary.openUnit(OXFORD_3000, TEST_UNIT, isMobile);
    await expect(page).toHaveURL(/\/vocabulary\/oxford_3000$/);
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

  test('SRS-L-005 – "Trước" / "Tiếp theo" without rating changes nothing', async ({ page, isMobile }) => {
    const vocabulary = new VocabularyPage(page);
    await vocabulary.gotoSignedIn();

    // 1) Before: Firestore, the stats box and localStorage
    const firestoreBefore = await readFirestoreSrsRecords(page);
    const cardCount = Object.keys(firestoreBefore).length;
    await vocabulary.waitForStats(cardCount);
    const statsBefore = await vocabulary.readAllStats();
    const localBefore = await readLocalSrsRecords(page);

    // 2) Open Unit in Flashcards mode
    await vocabulary.openUnit(OXFORD_3000, TEST_UNIT, isMobile);
    await expect(page).toHaveURL(/\/vocabulary\/oxford_3000$/);
    await vocabLocator.unitActions(page).startOrContinue.click();
    await vocabLocator.studyMode(page, vocabLocator.STUDY_MODE.flashcards).click();

    // 3)
    const start = await vocabulary.readCardNumber();
    for (let i = 1; i <= 3; i++) {
      await vocabLocator.navButton(page, vocabLocator.NAV_BUTTON.next).click();
      await expect.poll(() => vocabulary.readCardNumber()).toBe(start + i);
    }

    await vocabLocator.navButton(page, vocabLocator.NAV_BUTTON.previous).click();
    await expect.poll(() => vocabulary.readCardNumber()).toBe(start + 2);

    // 4) Back on /vocabulary: nothing changed
    await vocabLocator.backToVocabulary(page).click();
    await vocabulary.waitForStats(cardCount);
    expect(await vocabulary.readAllStats(), 'stats box').toEqual(statsBefore);
    expect(await readLocalSrsRecords(page), 'localStorage').toEqual(localBefore);
    expect(await readFirestoreSrsRecords(page), 'Firestore').toEqual(firestoreBefore);
  });
});

// =============================================================================================
// Guest cases (SRS-B): a fresh browser with no account. Guest data lives only in localStorage.
// =============================================================================================

// A local date and time `days` days from today, e.g. at(1, 0, 0) = tomorrow 00:00.
function at(days: number, hours: number, minutes: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, hours, minutes);
}

// "2026-11-26": the format of dueDate in the SRS records.
function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

test.describe('SRS guest', () => {
  // No saved session: a guest. This replaces the signed-in storageState set at the top of the file.
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await suppressInvitePromo(page);
  });

  // A guest's SRS cards are wiped on every full page load (goto / reload), so after rating
  // this test only moves between pages with links ("Trở lại", the collection card).
  test('SRS-B-011 – New card rated "3. Nhớ tốt" is due tomorrow at 00:00', async ({ page, isMobile }) => {
    const vocabulary = new VocabularyPage(page);

    // 1) Fake clock: today 10:00 local time. It keeps running from there.
    await page.clock.install({ time: at(0, 10, 0) });
    await page.goto(VOCAB_URL);

    // 2) Unit 2 (the only unit open to guests): press 3 ("3. Nhớ tốt")
    await vocabulary.openUnit(OXFORD_3000, TEST_UNIT, isMobile);
    await vocabLocator.unitActions(page).startOrContinue.click();
    await vocabLocator.studyMode(page, vocabLocator.STUDY_MODE.flashcards).click();
    await vocabulary.expectCardSide('front');
    await vocabulary.openCard(1);
    await vocabulary.rateCard(3);

    // 3) The card record: box 1 (H1), due tomorrow
    await expect.poll(async () => Object.keys(await readLocalSrsRecords(page)).length).toBe(1);
    const records = await readLocalSrsRecords(page);
    const wordId = Object.keys(records)[0];
    expect(records[wordId]).toMatchObject({
      stage: 1,
      intervalDays: 1,
      dueDate: isoDate(at(1, 0, 0)),
      status: 'reviewing',
    });

    // 4) Not due today, neither now nor at 23:59
    const due = vocabulary.stats.value(vocabLocator.SRS_STAT.due);
    await vocabLocator.backToVocabulary(page).click();
    await vocabulary.waitForStats(1);
    await expect(due, 'today 10:00').toHaveText('0');

    await page.clock.setSystemTime(at(0, 23, 59));
    await vocabLocator.collectionCard(page, OXFORD_3000).click(); // a round trip makes the box recount
    await vocabLocator.backToVocabulary(page).click();
    await vocabulary.waitForStats(1);
    await expect(due, 'today 23:59').toHaveText('0');

    // 5) Due at 00:00 tomorrow
    await page.clock.setSystemTime(at(1, 0, 0));
    await vocabLocator.collectionCard(page, OXFORD_3000).click();
    await vocabLocator.backToVocabulary(page).click();
    await vocabulary.waitForStats(1);
    await expect(due, 'tomorrow 00:00').toHaveText('1');
  });
});
