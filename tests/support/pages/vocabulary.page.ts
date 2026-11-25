import { expect, type Page } from '@playwright/test';
import { expectSignedInHeader } from '../helpers';
import * as vocabLocator from '../locators/vocabulary.locators';

// Page object for the vocabulary page (/vocabulary).
// The locators stay in locators/vocabulary.locators.ts; this class holds the actions and reads.
export class VocabularyPage {
  // The "Thống Kê Học Tập & SRS" box (root, label(name), value(name)).
  readonly stats: ReturnType<typeof vocabLocator.srsStatsBox>;

  constructor(private readonly page: Page) {
    this.stats = vocabLocator.srsStatsBox(page);
  }

  // Opens /vocabulary as a signed-in user. Fails clearly if the saved session has expired,
  // instead of reporting a missing stats box later.
  async gotoSignedIn() {
    await this.page.goto('/vocabulary');
    await expectSignedInHeader(this.page);
  }

  // The stats box shows 0 everywhere at first and fills in a few seconds later, once the cards are loaded.
  // Waits until "Tổng số Thẻ" shows `expectedTotal`, or, without it, until it is no longer 0
  // (only use that form for an account that has at least 1 card).
  async waitForStats(expectedTotal?: number) {
    const total = this.stats.value(vocabLocator.SRS_STAT.totalCards);
    if (expectedTotal === undefined)
      await expect(total).not.toHaveText('0');
    else
      await expect(total).toHaveText(String(expectedTotal));
    }

  // The number in one tile, e.g. readStat(SRS_STAT.learning). Thousands separators are removed: "1.234" → 1234.
  // Not for "Độ Chính xác", which is a percentage.
  async readStat(label: string): Promise<number> {
    const text = await this.stats.value(label).innerText();
    return Number(text.replace(/[.,\s]/g, ''));
  }

  // "Độ Chính xác" as a number: "60%" → 60, "80.5%" → 80.5, "80,5 %" → 80.5.
  async readAccuracy(): Promise<number> {
    const text = await this.stats.value(vocabLocator.SRS_STAT.accuracy).innerText();
    return Number(text.replace('%', '').replace(',', '.').trim());
  }

  // collection page
  async openCollection(title: string) {
    await vocabLocator.collectionCard(this.page, title).click();
  }

  async openUnit(unitTitle: string, isMobile: boolean) {
    if (isMobile) {
      await this.page.getByRole('button', { name: 'Danh sách Unit' }).click();
    }
    await vocabLocator.unitCard(this.page, unitTitle).click();
  }

  // Flashcard
  // Checks which side of the flashcard is showing: the flip layer is turned 0deg (front) or 180deg (back).
  // expect.poll retries, because the flip takes about half a second.
  async expectCardSide(side: 'front' | 'back') {
    const expected = side === 'front' ? 'rotateY(0deg)' : 'rotateY(180deg)';
    const flipLayer = vocabLocator.flashcard(this.page).flipLayer;
    // Reads the rotation of the card right now, e.g. 'rotateY(180deg)'.
    const readRotation = () => flipLayer.evaluate((element) => element.style.transform);
    // Reads it again and again until it equals `expected` (fails after 5 s).
    await expect.poll(readRotation).toBe(expected);
  }
}
