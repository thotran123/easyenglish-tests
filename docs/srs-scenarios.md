# Easy English – SRS Test Scenarios (cases 1–16)

Test scenarios for the SRS (spaced repetition) flow of <https://easyenglisheveryday.vercel.app/>, to be automated with Playwright.
This file holds the first 16 cases: the stats box, how a rating starts SRS, and the schedule of new and learning cards.

- **Logged-in** (`SRS-L-###`): run with the saved session of the dedicated test account (`playwright/.auth/user.json`). Each case also checks the card in the **database** (Firestore).
- **Guest** (`SRS-B-###`): run in a fresh browser context with no account. The card is checked in **localStorage** only, because guest data never reaches the database.
- The number in the ID is the case number (SRS-L-001 … SRS-L-010, SRS-B-011 … SRS-B-015, SRS-L-016).
- Tags are hints for automation: `verify after login`, `changes account data`, `check database`, `mock clock (page.clock)`, `fuzz range`, `bug confirmed by dev`, `to confirm`, `to confirm with dev`.

Total: **16** scenarios (Logged-in 11, Guest 5).

The expected results come from the developer's document **"Kịch bản kiểm thử SRS"**, written for commit `6a760d1` (Nov 26, 2026):
<https://docs.google.com/document/d/16BA7EPwM20NByDq4kwObBrEL_R9THoPJ8EkufTSfCBI/edit?tab=t.0>.
Its case codes (A2, B7, …) are quoted where they match a case here. On 2026-11-26 the live site matched it (guest runs of A2–A5 and B7).

It replaces the older document **"Easy English – Cơ chế SRS cho tester"** (Nov 15, 2026,
<https://docs.google.com/document/d/1KfmqlSz2nzn-CjvsS4bKxNS4vi2wxQFhQQj_H_Ky2cM/edit?tab=t.0>). Section numbers such as §3.1 and §5.2 refer to that older document,
whose intervals and "again" rule are out of date.

## Table of contents

- [SRS rules used by these cases](#srs-rules-used-by-these-cases)
- [Where the data lives](#where-the-data-lives)
- [Preconditions](#preconditions)

**[A. Stats box (3)](#a-stats-box)**

- [SRS-L-001](#srs-l-001--stats-box-shows-all-labels-verify-after-login) – Stats box shows all labels `verify after login`
- [SRS-L-002](#srs-l-002--totals-add-up-verify-after-login-check-database) – Totals add up `verify after login` `check database`
- [SRS-L-003](#srs-l-003--stats-are-the-same-after-reload-and-in-a-second-browser-verify-after-login-check-database) – Stats are the same after reload and in a second browser `verify after login` `check database`

**[B. A rating starts SRS (7)](#b-a-rating-starts-srs)**

- [SRS-L-004](#srs-l-004--flipping-a-card-without-rating-changes-nothing-verify-after-login-check-database) – Flipping a card without rating changes nothing `verify after login` `check database`
- [SRS-L-005](#srs-l-005--trước--tiếp-theo-without-rating-changes-nothing-verify-after-login-check-database) – "Trước" / "Tiếp theo" without rating changes nothing `verify after login` `check database`
- [SRS-L-006](#srs-l-006--new-card-rated-1-chưa-nhớ-verify-after-login-changes-account-data-check-database-bug-confirmed-by-dev) – New card rated "1. Chưa nhớ" `verify after login` `changes account data` `check database` `bug confirmed by dev`
- [SRS-L-007](#srs-l-007--new-cards-rated-2-3-and-4-verify-after-login-changes-account-data-check-database-bug-confirmed-by-dev) – New cards rated 2, 3 and 4 `verify after login` `changes account data` `check database` `bug confirmed by dev`
- [SRS-L-008](#srs-l-008--keys-14-work-like-the-buttons-verify-after-login-changes-account-data-check-database) – Keys 1–4 work like the buttons `verify after login` `changes account data` `check database`
- [SRS-L-009](#srs-l-009--rating-the-same-card-again-does-not-add-a-card-verify-after-login-changes-account-data-check-database) – Rating the same card again does not add a card `verify after login` `changes account data` `check database`
- [SRS-L-010](#srs-l-010--unit-overview-and-stats-box-count-the-same-cards-verify-after-login-changes-account-data-check-database) – Unit overview and stats box count the same cards `verify after login` `changes account data` `check database`

**[C. New and learning cards (6)](#c-new-and-learning-cards)**

- [SRS-B-011](#srs-b-011--new-card-rated-3-nhớ-tốt-is-due-tomorrow-at-0000-mock-clock-pageclock) – New card rated "3. Nhớ tốt" is due tomorrow at 00:00 `mock clock (page.clock)`
- [SRS-B-012](#srs-b-012--nhớ-tốt-ladder-to-mastered-mock-clock-pageclock-fuzz-range) – "Nhớ tốt" ladder to mastered `mock clock (page.clock)` `fuzz range`
- [SRS-B-013](#srs-b-013--khó-nhớ-ladder-to-mastered-mock-clock-pageclock-fuzz-range) – "Khó nhớ" ladder to mastered `mock clock (page.clock)` `fuzz range`
- [SRS-B-014](#srs-b-014--thuộc-làu-ladder-to-mastered-mock-clock-pageclock-fuzz-range) – "Thuộc làu" ladder to mastered `mock clock (page.clock)` `fuzz range`
- [SRS-B-015](#srs-b-015--a-hint-answer-keeps-the-box-fuzz-range-to-confirm) – A hint answer keeps the box `fuzz range` `to confirm`
- [SRS-L-016](#srs-l-016--short-intervals-are-never-fuzzed-verify-after-login-changes-account-data-check-database) – Short intervals are never fuzzed `verify after login` `changes account data` `check database`

- [Questions for dev](#questions-for-dev)

---

## SRS rules used by these cases

**Boxes and grades.** A card moves through 5 boxes, H1 to H5. H5 means mastered. A grade is the answer the learner gives:

| Grade | Flashcard mode | Typing mode |
|---|---|---|
| again | "1. Chưa nhớ" | "Chưa thuộc" (Esc / Alt+X) |
| hard | "2. Khó nhớ" | – |
| good | "3. Nhớ tốt" | typed correctly, no hint |
| easy | "4. Thuộc làu" | – |
| hint | – | typed correctly after a hint |
| wrong | – | typed wrongly |

**Correct answers on a card that is not mastered yet.** Days until the next review (before fuzz):

| Grade | 1st answer | 2nd | 3rd | 4th | 5th |
|---|---|---|---|---|---|
| good | 1 (H1) | 3 (H2) | 7 (H3) | 14 (H4) | 30 (H5, mastered) |
| hard | 1 (H1) | 2 (H2) | 5 (H3) | 10 (H4) | 21 (H5, mastered) |
| easy | 3 (H2) | 14 (H4) | 30 (H5, mastered) | – | – |

Updated 2026-11-26: the developer changed these intervals after the Nov 15 document (which had good 1/2/4/7/15, hard 1/2/3/5/10, easy 2/4/7/15).
The values above are the live site's: its code uses good/easy `[1, 3, 7, 14, 30]` and hard `[1, 2, 5, 10, 21]` days for boxes H1–H5,
and guest runs with `page.clock` on 2026-11-26 gave matching results. "easy" moves a card up **two** boxes (a new card goes to H2).

- **hint** keeps the box. The interval comes from the box: H1 1, H2 3, H3 7, H4 14, H5 30 days. A new card answered with a hint goes to H1, 1 day.
- **again** (a wrong answer: "1. Chưa nhớ", "Chưa thuộc", typed wrongly) keeps the box, lowers `easeFactor` by 0.1, sets `lastMissDate` = today, and the card does **not** come back the same day. A new card answered "1. Chưa nhớ" goes to H1 with `intervalDays` **1**, due **tomorrow**, `status` `learning` (dev doc A5). There is no "+10 minutes". (Changed on 2026-11-26: before, it was `intervalDays` 0, due today.)
- **Days are calendar days in local time.** The day changes at 00:00. A card is due when `dueDate` ≤ today.
- **Status:** `learning` while the card has **never been answered correctly**; `reviewing` after a correct answer; `mastered` in H5.
- **Fuzz (§5.2).** Intervals of 0, 1 and 2 days are exact. 3–6 days get ±1 day. 7–29 days get ±10% (at least ±1). 30 days or more get ±5% (at least ±2). Expected results therefore give a **range**: 3 → 2–4, 5 → 4–6, 7 → 6–8, 10 → 9–11, 14 → 13–15, 21 → 19–23, 30 → 28–32 (the ± is rounded to the nearest whole day).
- **Ease factor** (`easeFactor`) is not checked in these cases. It gets its own group later.

## Where the data lives

Every rating is saved in two places:

1. **localStorage** in the browser, right away: key `vocab_srs_records`, a JSON object keyed by word id.
   ```json
   {"ss_1": {"wordId": "ss_1", "stage": 1, "intervalDays": 1, "easeFactor": 2.5, "repetition": 1,
             "dueDate": "2026-11-18", "lastStudiedAt": "2026-11-17T15:39:28.280Z", "totalReviews": 1,
             "status": "reviewing", "word": "watercolour", "meaning": "màu nước", "...": "..."}}
   ```
2. **Firestore** (signed-in users only), a few seconds later. The cards are split into 8 documents ("shards"):
   - Path: `users/{uid}/srs/vocab_{n}`, where `n` = FNV-1a 32-bit hash of the word id, modulo 8. Example: `ss_1` is in `vocab_7`.
   - Document: `{ records: { <wordId>: { stage, intervalDays, dueDate, status, repetition, easeFactor, lastStudiedAt, totalReviews } }, updatedAt }`.
   - The text fields (`word`, `meaning`, `phonetic`, `pos`, `topicId`, `level`) are **not** stored in Firestore.
   - `users/{uid}/data/vocabulary` only holds `lastTopic`, `lastCollection` and `srsShardStamps` (when each shard last changed).

**Database check** (tag `check database`). The test reads Firestore through the Firestore REST API with the **test account's own sign-in token**, taken from the page (IndexedDB `firebaseLocalStorageDb`). It can only read that account's own data. No admin account or service key is used, so CI needs nothing beyond the existing `PLAYWRIGHT_AUTH_STATE` secret. Never log the token.

A database check means:

1. Wait until the Firestore record of the rated card exists and its `lastStudiedAt` equals the one in localStorage (poll for up to 15 seconds).
2. Compare these 8 fields between Firestore and localStorage: `stage`, `intervalDays`, `dueDate`, `status`, `repetition`, `easeFactor`, `lastStudiedAt`, `totalReviews`. They must be **equal**.
3. A difference, or a record that never appears, is a **sync bug**.

Verified on 2026-11-17: the test account rated `ss_1` "3. Nhớ tốt", and Firestore `users/{uid}/srs/vocab_7` matched localStorage on all 8 fields.

## Preconditions

**Logged-in cases (SRS-L)**

- Use the dedicated test account (the saved session in `playwright/.auth/user.json`), never a personal account. The cases add real cards to it.
- Stats are not reset between runs, so every case **reads the numbers before** the action and checks the **difference** (for example "+1"), never an absolute number.
- "New card" means a word id that is not yet in `vocab_srs_records`. Pick the first such card of a unit in `/vocabulary/oxford_3000`. Each run uses up new cards, so the account will slowly run out of new cards in a unit; move to the next unit when that happens.
- Do not change the clock in logged-in cases. A future `lastStudiedAt` would be saved to the database and would win over later real answers.

**Guest cases (SRS-B)**

- Fresh browser context with empty localStorage. Set `easy_english_invite_promo_seen_v1` first so the invite promo dialog does not block clicks (helper `suppressInvitePromo`).
- Guests can only study **Unit 2 · Hành động** (topic `actions`, word ids `ac_1`, `ac_2`, …). Other units are locked.
- To move to another day, use `page.clock` (the dates are computed in the browser). A case may also seed a record in the format above with `page.addInitScript` before the page loads.
- **A guest's cards are wiped on every full page load** (`page.goto`, `page.reload`, typing a URL). After the first rating, move between pages only with links: "Trở lại" back to `/vocabulary`, or a collection card. (Checked 2026-11-25.)
- After `page.clock.setSystemTime`, the stats box recounts only when `/vocabulary` is shown again: open a collection and go back with "Trở lại".
- To answer the same card again on a later day: move the clock, click "Trở lại", open Unit 2, "HỌC TIẾP", Flashcards, then go to the card with its dot ("Chuyển đến thẻ N"). In Unit 2, card N is word id `ac_N`.

**How to rate a card**

1. Open `/vocabulary/oxford_3000`
2. Click a unit, then "BẮT ĐẦU HỌC" or "HỌC TIẾP"
3. Flip the card with Space (or "Xem nghĩa")
4. Rate it with keys **1–4**. The rating buttons exist twice in the page (front and back face of the card), so a plain button locator can hit the hidden one.

---

## A. Stats box

The box "Thống Kê Học Tập & SRS" on `/vocabulary` has the tiles "Tổng số Thẻ", "Đến Hạn", "Phiên ôn tập", "Độ Chính xác", and the line "Phân bố trạng thái từ vựng" with "Đang Học", "Đang Ôn tập", "Thành thạo" and "Tổng Thẻ".

The tile "Phiên ôn tập" was called "Lần Ôn tập" in earlier versions of this document; the site renamed it (seen 2026-11-18).

#### SRS-L-001 – Stats box shows all labels `verify after login`

**Steps**

1. Load the signed-in session
2. Open `/vocabulary`
3. Find the box "Thống Kê Học Tập & SRS"

**Expected result:** The box shows the labels "Tổng số Thẻ", "Đến Hạn", "Phiên ôn tập", "Độ Chính xác", "Đang Học", "Đang Ôn tập", "Thành thạo" and "Tổng Thẻ". Each tile shows a number; "Độ Chính xác" shows a percentage.

#### SRS-L-002 – Totals add up `verify after login` `check database`

**Steps**

1. Load the signed-in session
2. Open `/vocabulary`
3. Read every number in the stats box
4. Read all records in `vocab_srs_records` and in Firestore `users/{uid}/srs/vocab_0` … `vocab_7`

**Expected result:**

- "Tổng số Thẻ" = "Tổng Thẻ" = "Đang Học" + "Đang Ôn tập" + "Thành thạo".
- "Tổng số Thẻ" = number of records in localStorage = number of records in Firestore.
- "Đang Học" = records with status `learning`, "Đang Ôn tập" = `reviewing`, "Thành thạo" = `mastered` (same counts in localStorage and Firestore).

This check is repeated at the end of every logged-in case.

#### SRS-L-003 – Stats are the same after reload and in a second browser `verify after login` `check database`

**Steps**

1. Load the signed-in session and open `/vocabulary`
2. Read the stats box
3. Reload the page and read the box again
4. Open a second, new browser context with the same saved session (it starts from the database, not from the first browser's localStorage), open `/vocabulary` and read the box

**Expected result:** The numbers are the same in all three reads. In the second context, `vocab_srs_records` is filled from Firestore and has the same records as the first one.

## B. A rating starts SRS

#### SRS-L-004 – Flipping a card without rating changes nothing `verify after login` `check database`

**Steps**

1. Load the signed-in session, open `/vocabulary` and read the stats box
2. Open a unit and start studying
3. Flip a new card (Space) and flip it back, without rating it
4. Go back to `/vocabulary` and read the box

**Expected result:** The stats box is unchanged. The card has no record in `vocab_srs_records` and none in Firestore.

#### SRS-L-005 – "Trước" / "Tiếp theo" without rating changes nothing `verify after login` `check database`

**Steps**

1. Load the signed-in session, open `/vocabulary` and read the stats box
2. Open a unit and start studying
3. Click "Tiếp theo" a few times, then "Trước", without rating any card
4. Go back to `/vocabulary` and read the box

**Expected result:** The stats box is unchanged. None of the cards that were shown has a record in localStorage or Firestore.

#### SRS-L-006 – New card rated "1. Chưa nhớ" `verify after login` `changes account data` `check database` `bug confirmed by dev`

**Steps**

1. Load the signed-in session, open `/vocabulary` and read the stats box
2. Open a unit, start studying, and flip a new card
3. Press **1** ("1. Chưa nhớ")
4. Go back to `/vocabulary` and read the box
5. Read the card in localStorage and in Firestore

**Expected result:**

- Stats box: "Tổng số Thẻ" +1, "Đang Học" +1, "Đến Hạn" **unchanged** (the card is due tomorrow, not today). **"Phiên ôn tập" unchanged**: adding a new card is not a review.
- Card record: `stage` 1, `intervalDays` 1, `dueDate` = tomorrow, `status` `learning`, `lastMissDate` = today, `totalReviews` 1 (dev doc A5).
- Firestore record equals the localStorage record (see [Database check](#where-the-data-lives)).

`bug confirmed by dev`: today the site adds 1 to "Phiên ôn tập" when a new card is rated (seen 2026-11-16, confirmed by dev 2026-11-17). This case fails until it is fixed.

#### SRS-L-007 – New cards rated 2, 3 and 4 `verify after login` `changes account data` `check database` `bug confirmed by dev`

**Steps**

1. Load the signed-in session, open `/vocabulary` and read the stats box
2. Open a unit and start studying
3. Rate three new cards: the first with **2** ("2. Khó nhớ"), the second with **3** ("3. Nhớ tốt"), the third with **4** ("4. Thuộc làu")
4. Go back to `/vocabulary` and read the box
5. Read the three cards in localStorage and in Firestore

**Expected result:**

- Stats box: "Tổng số Thẻ" +3, "Đang Ôn tập" +3, "Đến Hạn" **unchanged** (no card is due today), **"Phiên ôn tập" unchanged**.
- Card rated 2: `stage` 1, `intervalDays` 1, `dueDate` = tomorrow, `status` `reviewing`.
- Card rated 3: `stage` 1, `intervalDays` 1, `dueDate` = tomorrow, `status` `reviewing`.
- Card rated 4: `stage` 2, `intervalDays` 2–4 (3 ± 1), `dueDate` = today + `intervalDays`, `status` `reviewing`.
- Each Firestore record equals its localStorage record.

`bug confirmed by dev`: same "Phiên ôn tập" bug as SRS-L-006.

#### SRS-L-008 – Keys 1–4 work like the buttons `verify after login` `changes account data` `check database`

**Steps**

1. Load the signed-in session and open a unit
2. Rate one new card by clicking the visible "3. Nhớ tốt" button
3. Rate the next new card by pressing key **3**
4. Repeat with the other grades if needed (button 1 vs key 1, and so on)
5. Read both cards in localStorage and in Firestore

**Expected result:** The card rated by button and the card rated by key get the same `stage`, `intervalDays`, `dueDate` and `status`. The stats box changes the same way for both. Firestore matches localStorage.

#### SRS-L-009 – Rating the same card again does not add a card `verify after login` `changes account data` `check database`

**Steps**

1. Load the signed-in session and rate a new card with **3**
2. Read the stats box and the card record
3. Go back to the same card ("Trước") and rate it **3** again
4. Read the stats box and the card record again

**Expected result:**

- "Tổng số Thẻ" does not change on the second rating.
- `vocab_srs_records` still has **one** record for that word id, and Firestore has one record for it in its shard (no duplicate).
- Answering again on the same day is an early review (dev doc B7), so `stage`, `intervalDays` and `dueDate` stay the same; only `totalReviews` goes up by 1.

#### SRS-L-010 – Unit overview and stats box count the same cards `verify after login` `changes account data` `check database`

**Steps**

1. Load the signed-in session
2. Open `/vocabulary/oxford_3000`, read "Đã học x/y" for a unit, and read "Tổng số Thẻ" on `/vocabulary`
3. Rate **N** new cards in that unit (for example N = 3, any grades)
4. Read "Đã học x/y" and "Tổng số Thẻ" again

**Expected result:** "Đã học x" and "Tổng số Thẻ" **both** go up by exactly N. localStorage and Firestore each have N more records, all with the unit's `topicId` in localStorage.

## C. New and learning cards

#### SRS-B-011 – New card rated "3. Nhớ tốt" is due tomorrow at 00:00 `mock clock (page.clock)`

**Steps**

1. Fresh guest context; install the clock at today 10:00 local time
2. Open Unit 2, select a card and press **3** ("3. Nhớ tốt")
3. Read the card record
4. Go back to `/vocabulary` with "Trở lại" and read "Đến Hạn". Set the clock to today 23:59, open the collection and go back with "Trở lại" (no reload: it would wipe the guest's card), and read "Đến Hạn" again
5. Set the clock to tomorrow 00:00, open the collection and go back with "Trở lại", and read "Đến Hạn"

**Expected result:**

- The card goes **into box 1 (H1)**: `stage` 1, `intervalDays` 1, `dueDate` = tomorrow, `status` `reviewing`. ("H1" is the box the card lands in, not button 1.)
- At 10:00 and at 23:59 today the card is **not** due ("Đến Hạn" = 0). At 00:00 tomorrow it **is** due ("Đến Hạn" = 1).

The same check was run signed in on 2026-11-17 (card `ss_1`): localStorage and Firestore both had `stage` 1, `intervalDays` 1, `dueDate` = tomorrow.

#### SRS-B-012 – "Nhớ tốt" ladder to mastered `mock clock (page.clock)` `fuzz range`

**Steps**

1. Fresh guest context; install the clock at today 10:00
2. Rate a new card **3** ("3. Nhớ tốt")
3. Move the clock to the card's `dueDate` (10:00), go back to the same card without reloading (see "Guest cases" above), and rate it **3** again
4. Repeat step 3 until the card has been answered 5 times
5. Read the record after each answer

**Expected result:**

| Answer | Box | `intervalDays` | Status |
|---|---|---|---|
| 1st | H1 | 1 | reviewing |
| 2nd | H2 | 2–4 (3 ± 1) | reviewing |
| 3rd | H3 | 6–8 (7 ± 1) | reviewing |
| 4th | H4 | 13–15 (14 ± 1) | reviewing |
| 5th | H5 | 28–32 (30 ± 2) | **mastered**, `masteredAt` set |

After each answer, `dueDate` = the day of the answer + `intervalDays`.

#### SRS-B-013 – "Khó nhớ" ladder to mastered `mock clock (page.clock)` `fuzz range`

**Steps**

1. Fresh guest context; install the clock at today 10:00
2. Rate a new card **2** ("2. Khó nhớ")
3. Move the clock to the card's `dueDate` (10:00), go back to the same card without reloading, and rate it **2** again
4. Repeat step 3 until the card has been answered 5 times
5. Read the record after each answer

**Expected result:**

| Answer | Box | `intervalDays` | Status |
|---|---|---|---|
| 1st | H1 | 1 | reviewing |
| 2nd | H2 | 2 | reviewing |
| 3rd | H3 | 4–6 (5 ± 1) | reviewing |
| 4th | H4 | 9–11 (10 ± 1) | reviewing |
| 5th | H5 | 19–23 (21 ± 2) | **mastered**, `masteredAt` set |

Note: "Khó nhớ" reaches H5 (mastered) at 21 days, not 30.

#### SRS-B-014 – "Thuộc làu" ladder to mastered `mock clock (page.clock)` `fuzz range`

**Steps**

1. Fresh guest context; install the clock at today 10:00
2. Rate a new card **4** ("4. Thuộc làu")
3. Move the clock to the card's `dueDate` (10:00), go back to the same card without reloading, and rate it **4** again
4. Repeat step 3 until the card has been answered 3 times
5. Read the record after each answer

**Expected result:**

| Answer | Box | `intervalDays` | Status |
|---|---|---|---|
| 1st | H2 | 2–4 (3 ± 1) | reviewing |
| 2nd | H4 | 13–15 (14 ± 1) | reviewing |
| 3rd | H5 | 28–32 (30 ± 2) | **mastered**, `masteredAt` set |

Note: "Thuộc làu" moves the card up two boxes each time (H2 → H4 → H5), so it is mastered after 3 answers.

#### SRS-B-015 – A hint answer keeps the box `fuzz range` `to confirm`

**Steps**

1. Fresh guest context. Seed a card in H3 that is due today (`stage` 3, `intervalDays` 7, `dueDate` = today, `status` `reviewing`)
2. Open the vocabulary review (typing mode) `/vocabulary/review`
3. Use a hint (Tab), then type the correct answer
4. Read the record
5. For a new card: start learning a topic's new words with the SRS button, use a hint, type the correct answer, and read the record

**Expected result:**

- Seeded H3 card: stays **H3**, `intervalDays` 6–8 (7 ± 1), `status` `reviewing`.
- New card answered with a hint: **H1**, `intervalDays` 1, due tomorrow.

`to confirm`: guest access to `/vocabulary/review` and to the topic SRS button has not been checked yet. If guests are locked out, run this case signed in, with the new-card part only (no seeding) and a database check.

#### SRS-L-016 – Short intervals are never fuzzed `verify after login` `changes account data` `check database`

**Steps**

1. Load the signed-in session and open a unit
2. Rate 5 new cards with **3** ("3. Nhớ tốt")
3. Rate 5 more new cards with **4** ("4. Thuộc làu")
4. Read all 10 records in localStorage and in Firestore

**Expected result:**

- All 5 cards rated 3: `intervalDays` exactly **1**, `dueDate` = tomorrow.
- All 5 cards rated 4: H2, `intervalDays` **2–4** (3 ± 1). This part shows the fuzz: across 5 cards the values may differ.
- The cards rated 3 are never off by a day (intervals of 0–2 days are not fuzzed, §5.2). Firestore matches localStorage for all 10 cards.

---

## Questions for dev

- **Q1. Should the first rating of a new card count as "Phiên ôn tập"?** Answered 2026-11-17: **no, it is a bug**. SRS-L-006 and SRS-L-007 expect "Phiên ôn tập" unchanged.
- **Q3. Fuzz on 4 and 7 days, and rounding of ±10%.** Closed 2026-11-26: the developer changed the intervals (now 1/3/7/14/30 and 1/2/5/10/21, see "SRS rules"). The site's code rounds the ± to the nearest whole day (10% of 14 = 1.4 → ±1; 5% of 30 = 1.5, at least ±2 → ±2), and every interval of 3 days or more is fuzzed. SRS-B-012 to SRS-B-014 use these ranges.
