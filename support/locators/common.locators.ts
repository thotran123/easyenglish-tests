import type { Page } from '@playwright/test';

// Locators for parts that appear on every page (header, sidebar, site-wide popups).
// Page-specific locators live in support/locators/<page>.locators.ts, so a UI change only needs one edit.
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
    // Header menu button with the user's avatar and name; on every page, only when signed in.
    // (A guest has the same streak button but without the avatar <img>.)
    accountMenuButton: main
      .locator('button[aria-haspopup="menu"][title^="Mục tiêu Streak"]')
      .filter({ has: page.locator('img') }),
  };
};
