import type { Page } from '@playwright/test';

// Locators for the homepage (/). Shared parts (header, sidebar, popups) are in common.locators.ts.

// Hero section at the top of the homepage.
export const hero = (page: Page) => {
  const heading = page.getByRole('heading', { level: 1, name: 'Easy English' });
  return {
    heading,
    // The date is the <p> directly before the H1.
    date: heading.locator('xpath=preceding-sibling::p[1]'),
    tagline: page.getByText('Dành 30 phút mỗi ngày để nâng cao trình độ tiếng Anh.', { exact: true }),
  };
};
