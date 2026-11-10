import { expect, type Page } from '@playwright/test';
import { header, invitePromo, sidebar } from './locators';

// The site opens a "Mời bạn bè" (invite friends) promo dialog ~2-3 s after load, once per day.
// It blocks clicks and stops other popups (e.g. the guest sign-in popup) from opening.
// Call this before page.goto().
export async function suppressInvitePromo(page: Page) {
  // 1) Prevent it: mark the promo as already seen today, the same way the site does when it is closed.
  await page.addInitScript(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    window.localStorage.setItem('easy_english_invite_promo_seen_v1', today);
  });

  // 2) Fallback if the site renames that key: close the promo whenever it blocks an action.
  const promo = invitePromo(page);
  await page.addLocatorHandler(promo.dialog, async () => {
    await promo.closeButton.click();
  });
}

// On phones the sidebar is a drawer hidden behind the "Menu" button; on desktop it is always open.
// Returns the sidebar locators once the sidebar is on screen.
export async function openSidebar(page: Page, isMobile: boolean) {
  const nav = sidebar(page);
  if (isMobile) {
    await nav.menuButton.click();
  }
  await expect(nav.homeLink).toBeInViewport();
  return nav;
}

// Starts collecting console errors. Call it before page.goto() so errors during load are captured.
// The returned array fills up as errors arrive.
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`${msg.text()} (${msg.location().url})`);
    }
  });
  return errors;
}

// Today's date as dd/MM/yyyy in the browser's time zone (Playwright uses the machine's zone by default).
export function todayDdMmYyyy(): string {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
}

// Waits until the page shows a signed-in user: a real name in the greeting and no "Đăng nhập" button.
export async function expectSignedIn(page: Page, timeout = 15_000) {
  const { signInButton, nameButton } = header(page);
  await expect(nameButton).not.toHaveText('bạn', { timeout });
  await expect(signInButton).toBeHidden();
}
