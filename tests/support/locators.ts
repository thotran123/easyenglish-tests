import type { Page } from '@playwright/test';

// All locators used by the specs live here, so a UI change only needs one edit.
// Each group is a function of `page` because Playwright locators belong to a page.

// The "Mời bạn bè" (invite friends) promo dialog the site opens a few seconds after load.
export const invitePromo = (page: Page) => {
  const dialog = page.getByRole('dialog').filter({
    has: page.getByRole('heading', { name: 'Rủ bạn cùng học, cùng nhận kim cương!' }),
  });
  return {
    dialog,
    closeButton: dialog.getByRole('button', { name: 'Đóng' }),
  };
};

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

// Left navigation. On phones it is a drawer opened by `menuButton`.
export const sidebar = (page: Page) => {
  const root = page.locator('aside');
  return {
    root,
    menuButton: page.getByRole('button', { name: 'Mở menu điều hướng' }),
    logoLink: root.getByRole('link', { name: /Easy English.*Học tiếng Anh mỗi ngày/ }),
    homeLink: root.getByRole('link', { name: 'Trang chủ' }),
    vocabularyLink: root.getByRole('link', { name: 'Từ vựng', exact: true }),
    collocationsLink: root.getByRole('link', { name: 'Collocations', exact: true }),
  };
};

// Popup shown when a guest opens a page that needs an account.
export const guestSignInPopup = (page: Page) => ({
  message: page.getByText('Đăng nhập để học miễn phí'),
  googleButton: page.getByRole('button', { name: 'Đăng nhập với Google' }),
});

// Header controls at the top of <main> that show whether someone is signed in.
export const header = (page: Page) => {
  const main = page.getByRole('main');
  return {
    // The name in the greeting "Good morning, <name>!". A guest sees "bạn".
    nameButton: page.locator('#user-name-button'),
    // Only shown to guests. Opens the guestSignInPopup.
    signInButton: main.getByRole('button', { name: 'Đăng nhập', exact: true }),
  };
};
