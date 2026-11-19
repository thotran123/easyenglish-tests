import type { Page } from '@playwright/test';

// Locators for the vocabulary page (/vocabulary). Shared parts (header, sidebar, popups) are in common.locators.ts.

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// The box "Thống Kê Học Tập & SRS" (study stats). It has two kinds of tiles, and in both the label
// and its number are <span>s inside one tile element:
//   top tiles:          <div><span>Tổng số Thẻ</span><span>12</span></div>
//   distribution bars:  <div><div><span>3</span></div><span>Đang Học</span></div>
export const srsStatsBox = (page: Page) => {
  const root = page.locator('section').filter({
    has: page.getByRole('heading', { level: 2, name: 'Thống Kê Học Tập & SRS' }),
  });
  const label = (name: string) => root.getByText(name, { exact: true });
  return {
    root,
    label,
    // The number shown in the same tile as `name`: the tile's other <span>.
    value: (name: string) =>
      label(name)
        .locator('xpath=..')
        .locator('span')
        .filter({ hasNotText: new RegExp(`^\\s*${escapeRegExp(name)}\\s*$`) }),
  };
};
