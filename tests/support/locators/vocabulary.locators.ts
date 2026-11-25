import type { Page } from '@playwright/test';

// Locators for the vocabulary page (/vocabulary). Shared parts (header, sidebar, popups) are in common.locators.ts.

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// =============================================================================================
// 1) /vocabulary: stats box and collection cards
// =============================================================================================
export const SRS_STAT = {
  totalCards: 'Tổng số Thẻ',
  due: 'Đến Hạn',
  sessions: 'Phiên ôn tập',
  accuracy: 'Độ Chính xác',
  learning: 'Đang Học',
  reviewing: 'Đang Ôn tập',
  mastered: 'Thành thạo',
  totalBar: 'Tổng Thẻ',
} as const;

// The box "Thống Kê Học Tập & SRS" (study stats).
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

// A vocabulary collection card on /vocabulary, found by its title (e.g. '3000 Từ Vựng Oxford thiết yếu').
export const collectionCard = (page: Page, title: string) =>
  page.getByRole('button').filter({ has: page.getByRole('heading', { level: 3, name: title }) })

// =============================================================================================
// 2) Collection page (e.g. /vocabulary/oxford_3000): units and study modes
// =============================================================================================
export const backToVocabulary = (page:Page) => page.getByRole('link', {name: 'Trở lại', exact: true})

export const unitCard = (page: Page, unitTitle: string) =>
  page.getByRole('button').filter({has: page.getByText(unitTitle, {exact:true})})

// The three buttons in the unit panel after a unit is selected.
export const unitActions = (page: Page) => ({
  viewWords: page.getByRole('button', { name: 'Xem từ vựng' }),
  startOrContinue: page
    .getByRole('button', { name: 'Học tiếp' })
    .or(page.getByRole('button', { name: 'Bắt đầu học' })),
  restart: page.getByRole('button', { name: 'Học lại từ đầu' }),
});

// Study mode names, shown after "Học tiếp" / "Bắt đầu học".
export const STUDY_MODE = {
  flashcards: 'Flashcards',
  quiz: 'Trắc nghiệm',
  speaking: 'Luyện nói',
  dictation: 'Chính tả',
  matching: 'Ghép thẻ',
  allWords: 'Tất cả từ',
} as const;

// One study mode button: the <button> that contains exactly this mode name
export const studyMode = (page: Page, name: string) =>
  page.getByRole('button').filter({ has: page.getByText(name, { exact: true }) });

// =============================================================================================
// 3) Flashcards mode
// =============================================================================================

// The "3 / 65" counter above the flashcard: which card is shown, out of how many.
export const cardCounter = (page: Page) => page.getByText(/^\d+ \/ \d+$/);

export const flashcard = (page: Page) => {
  const root = page.locator('div.cursor-pointer[style*="perspective"]');
  return {
    root,
    flipLayer: root.locator('> div').first(),
    front: root.locator('div[style*="backface-visibility"]').first(),
  };
};

// Names of the buttons on the front of the card.
// markNotLearned, markLearned, star and the four ratings change the SRS data when clicked.
export const CARD_BUTTON = {
  markNotLearned: 'Chưa thuộc (tự động qua phím 1-4)', // ⊗ icon
  markLearned: 'Đã thuộc (tự động qua phím 1-4)', // ✓ icon
  star: 'Gắn sao ghi nhớ', // ☆ icon
  practiceWord: 'Luyện phát âm từ này', // mic icon
  listen: 'Nghe phát âm (Phím P)', // speaker icon
  practice: 'Luyện phát âm', // "Luyện phát âm" under the word
  // SRS ratings at the bottom of the card. Clicking one saves the rating.
  again: '1. Chưa nhớ',
  hard: '2. Khó nhớ',
  good: '3. Nhớ tốt',
  easy: '4. Thuộc làu',
} as const;

// One button on the front of the card, e.g. cardButton(page, CARD_BUTTON.good).
export const cardButton = (page: Page, name: string) =>
  flashcard(page).front.getByRole('button', { name, exact: true });

// Tooltips (title) of the buttons in the bar above the card
export const TOOLBAR_BUTTON = {
  accent: 'Giọng phát âm', // "UK" / "US"
  speed: 'Tốc độ đọc', // "0.9x"
  autoplay: 'Tự động phát âm', // "ON" / "OFF"
  shuffle: 'Xáo trộn ngẫu nhiên thứ tự từ vựng', // ⤮ icon
  autoStudy: 'Bật chế độ tự động học', // "Tự học"
} as const;

// One button in the bar above the card, e.g. toolbarButton(page, TOOLBAR_BUTTON.speed).
export const toolbarButton = (page: Page, title: string) => page.getByTitle(title);

// Names of the buttons under the card.
export const NAV_BUTTON = {
  previous: 'Trước',
  showMeaning: 'Xem nghĩa',
  showFront: 'Mặt trước',
  next: 'Tiếp theo',
} as const;

// One button under the card, e.g. navButton(page, NAV_BUTTON.next).
export const navButton = (page: Page, name: string) => page.getByRole('button', { name, exact: true });

// One of the dots under the buttons, e.g. goToCard(page, 3) jumps to card 3.
export const goToCard = (page: Page, number: number) =>
  page.getByRole('button', { name: `Chuyển đến thẻ ${number}`, exact: true });