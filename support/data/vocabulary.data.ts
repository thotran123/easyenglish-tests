// Test data for the vocabulary pages: which collection and unit the tests use, and the expected SRS results.
// Expected values come from docs/srs-scenarios.md ("SRS rules used by these cases").
// When the developer changes the SRS rules, change them here; the tests do not need to change.

// localStorage data format
// "ac_1": {
//   "wordId": "ac_1",
//   "stage": 1,
//   "intervalDays": 1,
//   "easeFactor": 2.5,
//   "repetition": 1,
//   "dueDate": "2026-11-26",
//   "lastStudiedAt": "2026-11-25T14:14:48.575Z",
//   "totalReviews": 1,
//   "status": "reviewing",
//   "word": "pack",
//   "meaning": "bó, gói",
//   "phonetic": "/pæk/",
//   "pos": "verb",
//   "topicId": "actions",
//   "level": "A2"
// }


// A whole number, optionally with thousands separators ("1.234" / "1,234").
export const COUNT = /^\d{1,3}(?:[.,]\d{3})*$/;
// A percentage such as "80%", "80 %" or "80.5%".
export const PERCENT = /^\d+(?:[.,]\d+)?\s?%$/;

export const OXFORD_3000 = '3000 Từ Vựng Oxford thiết yếu';
export const TEST_UNIT = 'Unit 2';
export const VOCAB_URL = '/vocabulary';

// The record a card should have after one answer: its box, the allowed range of intervalDays
// (intervals of 3 days or more are fuzzed) and its status.
export type LadderStep = {
  stage: number;
  minDays: number;
  maxDays: number;
  status: 'learning' | 'reviewing' | 'mastered';
};

// SRS-B-012: a new card answered "3. Nhớ tốt" on each due date.
export const GOOD_LADDER: LadderStep[] = [
  { stage: 1, minDays: 1, maxDays: 1, status: 'reviewing' },
  { stage: 2, minDays: 2, maxDays: 4, status: 'reviewing' },
  { stage: 3, minDays: 6, maxDays: 8, status: 'reviewing' },
  { stage: 4, minDays: 13, maxDays: 15, status: 'reviewing' },
  { stage: 5, minDays: 28, maxDays: 32, status: 'mastered' },
];
