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

  // vocabulary.page.ts
  async openCollection(title: string) {
    await vocabLocator.collectionCard(this.page, title).click();
  }

  async openUnit(unitTitle: string) {
    await vocabLocator.unitCard(this.page, unitTitle).click();
  }

}
