# Easy English – Homepage Test Scenarios

Test scenarios for the homepage of <https://easyenglisheveryday.vercel.app/>, to be automated with Playwright.

- **Both** (`HP-B-###`): run once as a guest and once as a signed-in user.
- **Guest** (`HP-G-###`): visitor who is not signed in.
- **Logged-in** (`HP-L-###`): user signed in with Google. Tagged `verify after login`.
- Tags such as `mobile projects` or `changes account data` are hints for automation.

Total: **168** scenarios (Both 98, Guest 21, Logged-in 49).

### Guest access rule

A guest cannot open these features. Instead they are asked to sign in:

| Destination | What a guest sees |
|---|---|
| Collocations `/collocations`, Từ điển `/dictionary`, Ngữ pháp `/grammars`, Cấu trúc `/structures`, Kỹ năng `/skills`, Luyện thi `/tests`, Lớp học `/classrooms` | Popup "Đăng nhập để học miễn phí" with a "Đăng nhập với Google" button; the URL stays where it was |
| Tin nhắn (messages panel) | The same popup |
| Tiến độ `/user` | In-page prompt "Vui lòng đăng nhập để xem tiến độ học tập và thống kê cá nhân của bạn." with "Đăng nhập ngay" |

The rule applies however the guest gets there: sidebar, feature cards, shortcuts, stat cards or typing the URL directly. "Both" scenarios that lead to one of these destinations have a separate expected result for Guest and for Logged-in.

## Table of contents

**[1. Both states (run as Guest and as Logged-in)](#1-both-states-run-as-guest-and-as-logged-in)**

*Page load (7)*

- [HP-B-001](#hp-b-001--homepage-returns-http-200) – Homepage returns HTTP 200
- [HP-B-002](#hp-b-002--page-title-is-correct) – Page title is correct
- [HP-B-003](#hp-b-003--no-console-errors-on-load) – No console errors on load
- [HP-B-004](#hp-b-004--logo-links-to-homepage) – Logo links to homepage
- [HP-B-005](#hp-b-005--favicon-and-manifest-load) – Favicon and manifest load
- [HP-B-006](#hp-b-006--todays-date-shown-in-hero) – Today's date shown in hero
- [HP-B-007](#hp-b-007--hero-heading-and-tagline) – Hero heading and tagline

*Sidebar navigation (20)*

- [HP-B-008](#hp-b-008--sidebar-link-trang-chủ-navigates-to-) – Sidebar link "Trang chủ" navigates to /
- [HP-B-009](#hp-b-009--sidebar-link-từ-vựng-navigates-to-vocabulary) – Sidebar link "Từ vựng" navigates to /vocabulary
- [HP-B-010](#hp-b-010--sidebar-link-collocations-navigates-to-collocations) – Sidebar link "Collocations" navigates to /collocations
- [HP-B-011](#hp-b-011--sidebar-link-từ-điển-navigates-to-dictionary) – Sidebar link "Từ điển" navigates to /dictionary
- [HP-B-012](#hp-b-012--sidebar-link-ngữ-pháp-navigates-to-grammars) – Sidebar link "Ngữ pháp" navigates to /grammars
- [HP-B-013](#hp-b-013--sidebar-link-cấu-trúc-navigates-to-structures) – Sidebar link "Cấu trúc" navigates to /structures
- [HP-B-014](#hp-b-014--sidebar-link-kỹ-năng-navigates-to-skills) – Sidebar link "Kỹ năng" navigates to /skills
- [HP-B-015](#hp-b-015--sidebar-link-luyện-thi-navigates-to-tests) – Sidebar link "Luyện thi" navigates to /tests
- [HP-B-016](#hp-b-016--sidebar-link-lớp-học-navigates-to-classrooms) – Sidebar link "Lớp học" navigates to /classrooms
- [HP-B-017](#hp-b-017--sidebar-link-trò-chơi-navigates-to-games) – Sidebar link "Trò chơi" navigates to /games
- [HP-B-018](#hp-b-018--sidebar-link-sổ-tay-navigates-to-diary) – Sidebar link "Sổ tay" navigates to /diary
- [HP-B-019](#hp-b-019--sidebar-link-bảng-xếp-hạng-navigates-to-leaderboard) – Sidebar link "Bảng xếp hạng" navigates to /leaderboard
- [HP-B-020](#hp-b-020--sidebar-link-supporter-navigates-to-supporter) – Sidebar link "Supporter" navigates to /supporter
- [HP-B-021](#hp-b-021--sidebar-link-mời-bạn-bè-navigates-to-invite) – Sidebar link "Mời bạn bè" navigates to /invite
- [HP-B-022](#hp-b-022--sidebar-link-cài-đặt-navigates-to-settings) – Sidebar link "Cài đặt" navigates to /settings
- [HP-B-023](#hp-b-023--sidebar-groups-are-displayed) – Sidebar groups are displayed
- [HP-B-024](#hp-b-024--trang-chủ-is-marked-active) – "Trang chủ" is marked active
- [HP-B-025](#hp-b-025--từ-điển-shows-16k-badge) – Từ điển shows 16K+ badge
- [HP-B-026](#hp-b-026--collapse-and-expand-sidebar-desktop-only) – Collapse and expand sidebar `Desktop only`
- [HP-B-027](#hp-b-027--tin-nhắn-opens-messages) – "Tin nhắn" opens messages

*Mobile menu (4)*

- [HP-B-028](#hp-b-028--open-mobile-navigation-menu-mobile-projects) – Open mobile navigation menu `mobile projects`
- [HP-B-029](#hp-b-029--close-mobile-navigation-menu-mobile-projects) – Close mobile navigation menu `mobile projects`
- [HP-B-030](#hp-b-030--navigate-from-mobile-menu-mobile-projects) – Navigate from mobile menu `mobile projects`
- [HP-B-031](#hp-b-031--no-horizontal-scroll-on-mobile-mobile-projects) – No horizontal scroll on mobile `mobile projects`

*Header shortcuts (3)*

- [HP-B-032](#hp-b-032--bảng-xếp-hạng-shortcut) – "Bảng xếp hạng" shortcut
- [HP-B-033](#hp-b-033--tiến-độ-shortcut) – "Tiến độ" shortcut
- [HP-B-034](#hp-b-034--greeting-matches-time-of-day-mock-the-clock-pageclock-for-each-time-band) – Greeting matches time of day `Mock the clock (page.clock) for each time band`

*Hero quote (4)*

- [HP-B-035](#hp-b-035--daily-quote-is-displayed) – Daily quote is displayed
- [HP-B-036](#hp-b-036--change-to-next-quote) – Change to next quote
- [HP-B-037](#hp-b-037--copy-quote-grant-clipboard-permissions-in-the-context) – Copy quote `Grant clipboard permissions in the context`
- [HP-B-038](#hp-b-038--credits-ticker-is-displayed) – Credits ticker is displayed

*Feature cards (10)*

- [HP-B-039](#hp-b-039--feature-card-từ-vựng-opens-vocabulary) – Feature card "Từ vựng" opens /vocabulary
- [HP-B-040](#hp-b-040--feature-card-collocations-opens-collocations) – Feature card "Collocations" opens /collocations
- [HP-B-041](#hp-b-041--feature-card-từ-điển-opens-dictionary) – Feature card "Từ điển" opens /dictionary
- [HP-B-042](#hp-b-042--feature-card-ngữ-pháp-opens-grammars) – Feature card "Ngữ pháp" opens /grammars
- [HP-B-043](#hp-b-043--feature-card-cấu-trúc-opens-structures) – Feature card "Cấu trúc" opens /structures
- [HP-B-044](#hp-b-044--feature-card-kỹ-năng-opens-skills) – Feature card "Kỹ năng" opens /skills
- [HP-B-045](#hp-b-045--feature-card-luyện-thi-opens-tests) – Feature card "Luyện thi" opens /tests
- [HP-B-046](#hp-b-046--feature-card-lớp-học-opens-classrooms) – Feature card "Lớp học" opens /classrooms
- [HP-B-047](#hp-b-047--feature-card-trò-chơi-opens-games) – Feature card "Trò chơi" opens /games
- [HP-B-048](#hp-b-048--all-9-feature-cards-are-displayed) – All 9 feature cards are displayed

*Feedback (2)*

- [HP-B-049](#hp-b-049--messenger-feedback-link) – Messenger feedback link
- [HP-B-050](#hp-b-050--email-feedback-link) – Email feedback link

*Calendar (9)*

- [HP-B-051](#hp-b-051--calendar-shows-current-month) – Calendar shows current month
- [HP-B-052](#hp-b-052--go-to-previous-month) – Go to previous month
- [HP-B-053](#hp-b-053--go-to-next-month) – Go to next month
- [HP-B-054](#hp-b-054--return-to-current-month) – Return to current month
- [HP-B-055](#hp-b-055--today-is-highlighted) – Today is highlighted
- [HP-B-056](#hp-b-056--weekday-header-order) – Weekday header order
- [HP-B-057](#hp-b-057--lunar-dates-are-shown) – Lunar dates are shown
- [HP-B-058](#hp-b-058--calendar-legend) – Calendar legend
- [HP-B-059](#hp-b-059--days-in-month-count) – Days in month count

*Stats carousel (17)*

- [HP-B-060](#hp-b-060--stats-section-heading) – Stats section heading
- [HP-B-061](#hp-b-061--stat-card-lượt-rèn-luyện-links-to-user) – Stat card "Lượt rèn luyện" links to /user
- [HP-B-062](#hp-b-062--stat-card-học-viên-tham-gia-links-to-leaderboard) – Stat card "Học viên tham gia" links to /leaderboard
- [HP-B-063](#hp-b-063--stat-card-lượt-học-từ-vựng-links-to-vocabulary) – Stat card "Lượt học từ vựng" links to /vocabulary
- [HP-B-064](#hp-b-064--stat-card-từ-vựng-toeic--ets-links-to-vocabulary) – Stat card "Từ vựng TOEIC & ETS" links to /vocabulary
- [HP-B-065](#hp-b-065--stat-card-từ-vựng-ielts-links-to-vocabulary) – Stat card "Từ vựng IELTS" links to /vocabulary
- [HP-B-066](#hp-b-066--stat-card-trò-chơi-tương-tác-links-to-games) – Stat card "Trò chơi tương tác" links to /games
- [HP-B-067](#hp-b-067--stat-card-đề-thi-thực-chiến-links-to-tests) – Stat card "Đề thi thực chiến" links to /tests
- [HP-B-068](#hp-b-068--stat-card-từ-vựng-đa-cấp-độ-links-to-vocabulary) – Stat card "Từ vựng đa cấp độ" links to /vocabulary
- [HP-B-069](#hp-b-069--stat-card-cấu-trúc-mẫu-câu-links-to-structures) – Stat card "Cấu trúc mẫu câu" links to /structures
- [HP-B-070](#hp-b-070--stat-card-bài-luyện-nghe-audio-links-to-skills) – Stat card "Bài luyện nghe Audio" links to /skills
- [HP-B-071](#hp-b-071--stat-card-cụm-từ-collocations-links-to-collocations) – Stat card "Cụm từ Collocations" links to /collocations
- [HP-B-072](#hp-b-072--carousel-auto-rotates) – Carousel auto-rotates
- [HP-B-073](#hp-b-073--pause-and-resume-auto-rotate) – Pause and resume auto-rotate
- [HP-B-074](#hp-b-074--next-and-previous-slide) – Next and previous slide
- [HP-B-075](#hp-b-075--dot-navigation) – Dot navigation
- [HP-B-076](#hp-b-076--swipe-carousel-on-mobile-mobile-projects) – Swipe carousel on mobile `mobile projects`

*Supporter section (4)*

- [HP-B-077](#hp-b-077--supporter-section-content) – Supporter section content
- [HP-B-078](#hp-b-078--supporter-count-matches-avatars) – Supporter count matches avatars
- [HP-B-079](#hp-b-079--mời-team-một-ly-cà-phê-button) – "Mời team một ly cà phê" button
- [HP-B-080](#hp-b-080--xem-bảng-vinh-danh-link) – "Xem bảng vinh danh" link

*Facebook community (5)*

- [HP-B-081](#hp-b-081--community-section-content) – Community section content
- [HP-B-082](#hp-b-082--theo-dõi-fanpage-link) – "Theo dõi Fanpage" link
- [HP-B-083](#hp-b-083--tham-gia-nhóm-link) – "Tham gia nhóm" link
- [HP-B-084](#hp-b-084--copy-fanpage-link-grant-clipboard-permissions) – Copy Fanpage link `Grant clipboard permissions`
- [HP-B-085](#hp-b-085--copy-group-link-grant-clipboard-permissions) – Copy Group link `Grant clipboard permissions`

*FAQ (5)*

- [HP-B-086](#hp-b-086--faq-section-shows-8-items) – FAQ section shows 8 items
- [HP-B-087](#hp-b-087--first-faq-is-expanded-by-default) – First FAQ is expanded by default
- [HP-B-088](#hp-b-088--expand-another-faq-item) – Expand another FAQ item
- [HP-B-089](#hp-b-089--collapse-an-expanded-faq-item) – Collapse an expanded FAQ item
- [HP-B-090](#hp-b-090--vào-ôn-tập-srs-link) – "Vào Ôn Tập SRS" link

*Footer (4)*

- [HP-B-091](#hp-b-091--footer-content) – Footer content
- [HP-B-092](#hp-b-092--footer-privacy-link) – Footer Privacy link
- [HP-B-093](#hp-b-093--footer-terms-link) – Footer Terms link
- [HP-B-094](#hp-b-094--footer-facebook-links) – Footer Facebook links

*Public chat widget (2)*

- [HP-B-095](#hp-b-095--open-public-chat) – Open public chat
- [HP-B-096](#hp-b-096--collapse-chat-bubble-to-edge) – Collapse chat bubble to edge

*Accessibility (2)*

- [HP-B-097](#hp-b-097--keyboard-navigation) – Keyboard navigation
- [HP-B-098](#hp-b-098--icon-buttons-have-accessible-names) – Icon buttons have accessible names

**[2. Guest only](#2-guest-only)**

*Authentication (3)*

- [HP-G-001](#hp-g-001--đăng-nhập-button-is-visible) – "Đăng nhập" button is visible
- [HP-G-002](#hp-g-002--sign-in-starts-google-flow-assert-only-the-popupurl-never-automate-google-login) – Sign-in starts Google flow `Assert only the popup/URL, never automate Google login`
- [HP-G-003](#hp-g-003--no-account-menu-or-notifications) – No account menu or notifications

*Greeting (1)*

- [HP-G-004](#hp-g-004--guest-greeting) – Guest greeting

*Daily goal (2)*

- [HP-G-005](#hp-g-005--guest-daily-goal-values) – Guest daily goal values
- [HP-G-006](#hp-g-006--guest-check-in-button) – Guest check-in button

*Shortcuts (1)*

- [HP-G-007](#hp-g-007--guest-sổ-tay-shortcut) – Guest "Sổ tay" shortcut

*Reviews (2)*

- [HP-G-008](#hp-g-008--guest-reviews-section) – Guest reviews section
- [HP-G-009](#hp-g-009--đăng-nhập-để-viết-prompts-sign-in) – "Đăng nhập để viết" prompts sign-in

*Calendar (1)*

- [HP-G-010](#hp-g-010--guest-calendar-has-no-studied-days) – Guest calendar has no studied days

*Feature cards (1)*

- [HP-G-011](#hp-g-011--no-review-badges-for-guest) – No review badges for guest

*Local progress (1)*

- [HP-G-012](#hp-g-012--guest-progress-kept-offline) – Guest progress kept offline

*Sidebar navigation (1)*

- [HP-G-013](#hp-g-013--sidebar-tiến-độ-asks-guest-to-sign-in-on-user) – Sidebar "Tiến độ" asks guest to sign in on /user

*Direct URL access (8)*

- [HP-G-014](#hp-g-014--direct-url-collocations-asks-guest-to-sign-in-known-bug-content-currently-shown) – Direct URL /collocations asks guest to sign in `known bug: content currently shown`
- [HP-G-015](#hp-g-015--direct-url-dictionary-asks-guest-to-sign-in) – Direct URL /dictionary asks guest to sign in
- [HP-G-016](#hp-g-016--direct-url-grammars-asks-guest-to-sign-in-known-bug-content-currently-shown) – Direct URL /grammars asks guest to sign in `known bug: content currently shown`
- [HP-G-017](#hp-g-017--direct-url-structures-asks-guest-to-sign-in-known-bug-content-currently-shown) – Direct URL /structures asks guest to sign in `known bug: content currently shown`
- [HP-G-018](#hp-g-018--direct-url-skills-asks-guest-to-sign-in-known-bug-content-currently-shown) – Direct URL /skills asks guest to sign in `known bug: content currently shown`
- [HP-G-019](#hp-g-019--direct-url-tests-asks-guest-to-sign-in-known-bug-content-currently-shown) – Direct URL /tests asks guest to sign in `known bug: content currently shown`
- [HP-G-020](#hp-g-020--direct-url-classrooms-asks-guest-to-sign-in-known-bug-content-currently-shown) – Direct URL /classrooms asks guest to sign in `known bug: content currently shown`
- [HP-G-021](#hp-g-021--direct-url-user-asks-guest-to-sign-in) – Direct URL /user asks guest to sign in

**[3. Logged-in only](#3-logged-in-only)**

*Authentication (3)*

- [HP-L-001](#hp-l-001--logged-in-state-on-load-verify-after-login) – Logged-in state on load `verify after login`
- [HP-L-002](#hp-l-002--session-persists-after-reload-verify-after-login-use-playwright-storagestate) – Session persists after reload `verify after login` `Use Playwright storageState`
- [HP-L-003](#hp-l-003--logout-verify-after-login-re-login-needed-afterwards-run-last) – Logout `verify after login` `Re-login needed afterwards` `run last`

*Header (6)*

- [HP-L-004](#hp-l-004--greeting-shows-users-name-verify-after-login) – Greeting shows user's name `verify after login`
- [HP-L-005](#hp-l-005--rename-display-name-verify-after-login) – Rename display name `verify after login`
- [HP-L-006](#hp-l-006--rename-validation-verify-after-login) – Rename validation `verify after login`
- [HP-L-007](#hp-l-007--switch-to-công-việc-mode-verify-after-login) – Switch to "Công việc" mode `verify after login`
- [HP-L-008](#hp-l-008--switch-back-to-học-tập-mode-verify-after-login) – Switch back to "Học tập" mode `verify after login`
- [HP-L-009](#hp-l-009--xp--streak-chip-verify-after-login) – XP / streak chip `verify after login`

*Notifications (6)*

- [HP-L-010](#hp-l-010--open-notifications-panel-verify-after-login) – Open notifications panel `verify after login`
- [HP-L-011](#hp-l-011--close-notifications-panel-verify-after-login) – Close notifications panel `verify after login`
- [HP-L-012](#hp-l-012--scroll-notifications-verify-after-login) – Scroll notifications `verify after login`
- [HP-L-013](#hp-l-013--claim-xp-from-notification-verify-after-login-changes-account-data-use-a-test-account) – Claim XP from notification `verify after login` `Changes account data` `use a test account`
- [HP-L-014](#hp-l-014--open-certificate-from-notification-verify-after-login) – Open certificate from notification `verify after login`
- [HP-L-015](#hp-l-015--unread-indicator-verify-after-login) – Unread indicator `verify after login`

*Account menu (9)*

- [HP-L-016](#hp-l-016--open-account-menu-verify-after-login) – Open account menu `verify after login`
- [HP-L-017](#hp-l-017--daily-goal-options-verify-after-login) – Daily goal options `verify after login`
- [HP-L-018](#hp-l-018--change-daily-goal-verify-after-login-changes-account-data) – Change daily goal `verify after login` `Changes account data`
- [HP-L-019](#hp-l-019--hồ-sơ-cá-nhân-link-verify-after-login) – "Hồ sơ cá nhân" link `verify after login`
- [HP-L-020](#hp-l-020--cài-đặt--lộ-trình-link-verify-after-login) – "Cài đặt & Lộ trình" link `verify after login`
- [HP-L-021](#hp-l-021--cài-app--thông-báo-verify-after-login) – "Cài App & Thông báo" `verify after login`
- [HP-L-022](#hp-l-022--dark-mode-toggle-verify-after-login) – Dark mode toggle `verify after login`
- [HP-L-023](#hp-l-023--sync-status-verify-after-login) – Sync status `verify after login`
- [HP-L-024](#hp-l-024--close-account-menu-verify-after-login) – Close account menu `verify after login`

*Shortcuts (3)*

- [HP-L-025](#hp-l-025--sổ-tay-opens-notebook-verify-after-login) – "Sổ tay" opens notebook `verify after login`
- [HP-L-026](#hp-l-026--bảng-xếp-hạng-shortcut-verify-after-login) – "Bảng xếp hạng" shortcut `verify after login`
- [HP-L-027](#hp-l-027--tiến-độ-shortcut-verify-after-login) – "Tiến độ" shortcut `verify after login`

*Daily goal (7)*

- [HP-L-028](#hp-l-028--daily-goal-minutes-and-progress-bar-verify-after-login) – Daily goal minutes and progress bar `verify after login`
- [HP-L-029](#hp-l-029--đã-đạt-badge-when-goal-met-verify-after-login) – "Đã đạt" badge when goal met `verify after login`
- [HP-L-030](#hp-l-030--streak-and-total-days-verify-after-login) – Streak and total days `verify after login`
- [HP-L-031](#hp-l-031--check-in-disabled-before-goal-verify-after-login) – Check-in disabled before goal `verify after login`
- [HP-L-032](#hp-l-032--check-in-after-reaching-goal-verify-after-login-changes-account-data-once-per-day) – Check-in after reaching goal `verify after login` `Changes account data` `once per day`
- [HP-L-033](#hp-l-033--completed-state-after-check-in-verify-after-login) – Completed state after check-in `verify after login`
- [HP-L-034](#hp-l-034--study-time-updates-daily-goal-verify-after-login) – Study time updates daily goal `verify after login`

*Feature cards (3)*

- [HP-L-035](#hp-l-035--vocabulary-review-badge-verify-after-login) – Vocabulary review badge `verify after login`
- [HP-L-036](#hp-l-036--collocations-review-badge-verify-after-login) – Collocations review badge `verify after login`
- [HP-L-037](#hp-l-037--badges-hidden-when-nothing-to-review-verify-after-login) – Badges hidden when nothing to review `verify after login`

*Calendar (4)*

- [HP-L-038](#hp-l-038--studied-days-highlighted-verify-after-login) – Studied days highlighted `verify after login`
- [HP-L-039](#hp-l-039--monthly-studied-count-verify-after-login) – Monthly studied count `verify after login`
- [HP-L-040](#hp-l-040--days-with-notes-verify-after-login) – Days with notes `verify after login`
- [HP-L-041](#hp-l-041--studied-days-in-previous-month-verify-after-login) – Studied days in previous month `verify after login`

*Reviews (7)*

- [HP-L-042](#hp-l-042--reviews-count-verify-after-login) – Reviews count `verify after login`
- [HP-L-043](#hp-l-043--review-card-content-verify-after-login) – Review card content `verify after login`
- [HP-L-044](#hp-l-044--review-carousel-navigation-verify-after-login) – Review carousel navigation `verify after login`
- [HP-L-045](#hp-l-045--sửa-đánh-giá-opens-own-review-verify-after-login) – "Sửa đánh giá" opens own review `verify after login`
- [HP-L-046](#hp-l-046--edit-review-validation-verify-after-login) – Edit review validation `verify after login`
- [HP-L-047](#hp-l-047--save-edited-review-verify-after-login-changes-public-data-use-a-test-account) – Save edited review `verify after login` `Changes public data` `use a test account`
- [HP-L-048](#hp-l-048--write-first-review-verify-after-login-needs-a-second-test-account) – Write first review `verify after login` `Needs a second test account`

*Sync (1)*

- [HP-L-049](#hp-l-049--progress-synced-across-devices-verify-after-login) – Progress synced across devices `verify after login`

---

## 1. Both states (run as Guest and as Logged-in)

### Page load

#### HP-B-001 – Homepage returns HTTP 200

**Steps**

1. Open the homepage `/`

**Expected result:** Response status is 200 and the page renders without a blank screen.

#### HP-B-002 – Page title is correct

**Steps**

1. Open the homepage `/`
2. Read the document title

**Expected result:** Title is "Easy English - Học Tiếng Anh Mỗi Ngày".

#### HP-B-003 – No console errors on load

**Steps**

1. Open the homepage `/`
2. Collect console messages until network is idle

**Expected result:** No console errors (type=error) are logged.

#### HP-B-004 – Logo links to homepage

**Steps**

1. Open the homepage `/`
2. Click the logo "Easy English - Học tiếng Anh mỗi ngày" in the sidebar

**Expected result:** URL stays/returns to '/'.

#### HP-B-005 – Favicon and manifest load

**Steps**

1. Open the homepage `/`
2. Request /icon.png and /manifest.json

**Expected result:** Both return HTTP 200.

#### HP-B-006 – Today's date shown in hero

**Steps**

1. Open the homepage `/`
2. Read the date above the H1

**Expected result:** Date shows today in dd/MM/yyyy format.

#### HP-B-007 – Hero heading and tagline

**Steps**

1. Open the homepage `/`

**Expected result:** H1 "Easy English" is visible with tagline "Dành 30 phút mỗi ngày để nâng cao trình độ tiếng Anh.".

### Sidebar navigation

#### HP-B-008 – Sidebar link "Trang chủ" navigates to /

**Steps**

1. Open the homepage `/`
2. Click "Trang chủ" in the sidebar

**Expected result:** URL is / and the target page loads (HTTP 200).

#### HP-B-009 – Sidebar link "Từ vựng" navigates to /vocabulary

**Steps**

1. Open the homepage `/`
2. Click "Từ vựng" in the sidebar

**Expected result:** URL is /vocabulary and the target page loads (HTTP 200).

#### HP-B-010 – Sidebar link "Collocations" navigates to /collocations

**Steps**

1. Open the homepage `/`
2. Click "Collocations" in the sidebar

**Expected result:**

- Guest: the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears and the URL stays `/`.
- Logged-in: URL is /collocations and the target page loads (HTTP 200).

#### HP-B-011 – Sidebar link "Từ điển" navigates to /dictionary

**Steps**

1. Open the homepage `/`
2. Click "Từ điển" in the sidebar

**Expected result:**

- Guest: the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears and the URL stays `/`.
- Logged-in: URL is /dictionary and the target page loads (HTTP 200).

#### HP-B-012 – Sidebar link "Ngữ pháp" navigates to /grammars

**Steps**

1. Open the homepage `/`
2. Click "Ngữ pháp" in the sidebar

**Expected result:**

- Guest: the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears and the URL stays `/`.
- Logged-in: URL is /grammars and the target page loads (HTTP 200).

#### HP-B-013 – Sidebar link "Cấu trúc" navigates to /structures

**Steps**

1. Open the homepage `/`
2. Click "Cấu trúc" in the sidebar

**Expected result:**

- Guest: the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears and the URL stays `/`.
- Logged-in: URL is /structures and the target page loads (HTTP 200).

#### HP-B-014 – Sidebar link "Kỹ năng" navigates to /skills

**Steps**

1. Open the homepage `/`
2. Click "Kỹ năng" in the sidebar

**Expected result:**

- Guest: the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears and the URL stays `/`.
- Logged-in: URL is /skills and the target page loads (HTTP 200).

#### HP-B-015 – Sidebar link "Luyện thi" navigates to /tests

**Steps**

1. Open the homepage `/`
2. Click "Luyện thi" in the sidebar

**Expected result:**

- Guest: the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears and the URL stays `/`.
- Logged-in: URL is /tests and the target page loads (HTTP 200).

#### HP-B-016 – Sidebar link "Lớp học" navigates to /classrooms

**Steps**

1. Open the homepage `/`
2. Click "Lớp học" in the sidebar

**Expected result:**

- Guest: the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears and the URL stays `/`.
- Logged-in: URL is /classrooms and the target page loads (HTTP 200).

#### HP-B-017 – Sidebar link "Trò chơi" navigates to /games

**Steps**

1. Open the homepage `/`
2. Click "Trò chơi" in the sidebar

**Expected result:** URL is /games and the target page loads (HTTP 200).

#### HP-B-018 – Sidebar link "Sổ tay" navigates to /diary

**Steps**

1. Open the homepage `/`
2. Click "Sổ tay" in the sidebar

**Expected result:** URL is /diary and the target page loads (HTTP 200).

#### HP-B-019 – Sidebar link "Bảng xếp hạng" navigates to /leaderboard

**Steps**

1. Open the homepage `/`
2. Click "Bảng xếp hạng" in the sidebar

**Expected result:** URL is /leaderboard and the target page loads (HTTP 200).

#### HP-B-020 – Sidebar link "Supporter" navigates to /supporter

**Steps**

1. Open the homepage `/`
2. Click "Supporter" in the sidebar

**Expected result:** URL is /supporter and the target page loads (HTTP 200).

#### HP-B-021 – Sidebar link "Mời bạn bè" navigates to /invite

**Steps**

1. Open the homepage `/`
2. Click "Mời bạn bè" in the sidebar

**Expected result:** URL is /invite and the target page loads (HTTP 200).

#### HP-B-022 – Sidebar link "Cài đặt" navigates to /settings

**Steps**

1. Open the homepage `/`
2. Click "Cài đặt" in the sidebar

**Expected result:** URL is /settings and the target page loads (HTTP 200).

#### HP-B-023 – Sidebar groups are displayed

**Steps**

1. Open the homepage `/`

**Expected result:** Group labels "Tổng quan", "Học tập", "Luyện tập" (and "Cá nhân" for guest) are visible.

#### HP-B-024 – "Trang chủ" is marked active

**Steps**

1. Open the homepage `/`

**Expected result:** "Trang chủ" item is highlighted as the current page.

#### HP-B-025 – Từ điển shows 16K+ badge

**Steps**

1. Open the homepage `/`

**Expected result:** "Từ điển" item shows the "16K+" badge.

#### HP-B-026 – Collapse and expand sidebar `Desktop only`

**Steps**

1. Open the homepage `/`
2. Click "Thu gọn thanh điều hướng"
3. Click the toggle again

**Expected result:** Sidebar collapses to icons only, then expands back to full labels.

#### HP-B-027 – "Tin nhắn" opens messages

**Steps**

1. Open the homepage `/`
2. Click "Tin nhắn" in the sidebar

**Expected result:**

- Guest: the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears and the URL stays `/`.
- Logged-in: Messages panel opens.

### Mobile menu

#### HP-B-028 – Open mobile navigation menu `mobile projects`

**Steps**

1. Open the homepage `/` on a mobile device
2. Tap "Menu" (Mở menu điều hướng)

**Expected result:** Navigation drawer slides in with all sidebar links.

#### HP-B-029 – Close mobile navigation menu `mobile projects`

**Steps**

1. Open the homepage `/` on a mobile device
2. Open the menu
3. Tap "Đóng menu"

**Expected result:** Drawer closes and page content is visible.

#### HP-B-030 – Navigate from mobile menu `mobile projects`

**Steps**

1. Open the homepage `/` on a mobile device
2. Open the menu
3. Tap "Từ vựng"

**Expected result:** URL is /vocabulary and the drawer is closed.

#### HP-B-031 – No horizontal scroll on mobile `mobile projects`

**Steps**

1. Open the homepage `/` on a mobile device
2. Compare document scrollWidth with viewport width

**Expected result:** scrollWidth <= viewport width.

### Header shortcuts

#### HP-B-032 – "Bảng xếp hạng" shortcut

**Steps**

1. Open the homepage `/`
2. Click "Bảng xếp hạng" in the top shortcuts bar

**Expected result:** URL is /leaderboard.

#### HP-B-033 – "Tiến độ" shortcut

**Steps**

1. Open the homepage `/`
2. Click "Tiến độ" in the top shortcuts bar

**Expected result:**

- Guest: URL is /user and the page shows the in-page sign-in prompt "Vui lòng đăng nhập để xem tiến độ học tập và thống kê cá nhân của bạn." with a "Đăng nhập ngay" button; no progress data is shown.
- Logged-in: URL is /user and the progress page loads.

#### HP-B-034 – Greeting matches time of day `Mock the clock (page.clock) for each time band`

**Steps**

1. Open the homepage `/`
2. Read the greeting at the top

**Expected result:** Greeting is "Good morning" / "Good afternoon" / "Good evening" according to local time.

### Hero quote

#### HP-B-035 – Daily quote is displayed

**Steps**

1. Open the homepage `/`

**Expected result:** An English quote, its Vietnamese translation and the author are shown.

#### HP-B-036 – Change to next quote

**Steps**

1. Open the homepage `/`
2. Note the quote text
3. Click "Đổi câu tiếp theo" (refresh icon)

**Expected result:** A different quote is shown.

#### HP-B-037 – Copy quote `Grant clipboard permissions in the context`

**Steps**

1. Open the homepage `/`
2. Click "Sao chép câu trích dẫn" (copy icon)

**Expected result:** Quote text is copied to the clipboard and a confirmation/toast or icon change appears.

#### HP-B-038 – Credits ticker is displayed

**Steps**

1. Open the homepage `/`

**Expected result:** Credits line starting "Lời tri ân" is visible and scrolls horizontally.

### Feature cards

#### HP-B-039 – Feature card "Từ vựng" opens /vocabulary

**Steps**

1. Open the homepage `/`
2. Click the "Từ vựng" card

**Expected result:** Card shows title "Từ vựng" and its description (guest: "Kho từ vựng Oxford, TOEIC, IELTS, v.v..."); URL is /vocabulary.

#### HP-B-040 – Feature card "Collocations" opens /collocations

**Steps**

1. Open the homepage `/`
2. Click the "Collocations" card

**Expected result:**

- Guest: card shows its description "Collocations, phrasal verbs & idioms"; clicking it opens the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) and the URL stays `/`.
- Logged-in: Card shows title "Collocations" and its description; URL is /collocations.

#### HP-B-041 – Feature card "Từ điển" opens /dictionary

**Steps**

1. Open the homepage `/`
2. Click the "Từ điển" card

**Expected result:**

- Guest: card shows its description "Tra cứu từ vựng & collocations"; clicking it opens the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) and the URL stays `/`.
- Logged-in: Card shows title "Từ điển" and its description; URL is /dictionary.

#### HP-B-042 – Feature card "Ngữ pháp" opens /grammars

**Steps**

1. Open the homepage `/`
2. Click the "Ngữ pháp" card

**Expected result:**

- Guest: card shows its description "Cẩm nang ngữ pháp"; clicking it opens the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) and the URL stays `/`.
- Logged-in: Card shows title "Ngữ pháp" and its description; URL is /grammars.

#### HP-B-043 – Feature card "Cấu trúc" opens /structures

**Steps**

1. Open the homepage `/`
2. Click the "Cấu trúc" card

**Expected result:**

- Guest: card shows its description "200 mẫu câu thiết yếu & nâng cao"; clicking it opens the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) and the URL stays `/`.
- Logged-in: Card shows title "Cấu trúc" and its description; URL is /structures.

#### HP-B-044 – Feature card "Kỹ năng" opens /skills

**Steps**

1. Open the homepage `/`
2. Click the "Kỹ năng" card

**Expected result:**

- Guest: card shows its description "Nghe • Nói • Đọc • Viết"; clicking it opens the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) and the URL stays `/`.
- Logged-in: Card shows title "Kỹ năng" and its description; URL is /skills.

#### HP-B-045 – Feature card "Luyện thi" opens /tests

**Steps**

1. Open the homepage `/`
2. Click the "Luyện thi" card

**Expected result:**

- Guest: card shows its description "TOEIC, IELTS, cấp 1, 2, 3"; clicking it opens the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) and the URL stays `/`.
- Logged-in: Card shows title "Luyện thi" and its description; URL is /tests.

#### HP-B-046 – Feature card "Lớp học" opens /classrooms

**Steps**

1. Open the homepage `/`
2. Click the "Lớp học" card

**Expected result:**

- Guest: card shows its description "Lớp học video & đề thi"; clicking it opens the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) and the URL stays `/`.
- Logged-in: Card shows title "Lớp học" and its description; URL is /classrooms.

#### HP-B-047 – Feature card "Trò chơi" opens /games

**Steps**

1. Open the homepage `/`
2. Click the "Trò chơi" card

**Expected result:** Card shows title "Trò chơi" and its description (guest: "Trò chơi học tập"); URL is /games.

#### HP-B-048 – All 9 feature cards are displayed

**Steps**

1. Open the homepage `/`
2. Count the feature cards

**Expected result:** Exactly 9 cards are visible.

### Feedback

#### HP-B-049 – Messenger feedback link

**Steps**

1. Open the homepage `/`
2. Inspect "Messenger" in "Góp ý & Phát triển ứng dụng"

**Expected result:** href is https://m.me/112080280307263 and it opens in a new tab.

#### HP-B-050 – Email feedback link

**Steps**

1. Open the homepage `/`
2. Inspect "Gửi Email"

**Expected result:** href is mailto:easyenglishteam.2026@gmail.com with subject "[Easy English Feedback] Góp ý phát triển ứng dụng".

### Calendar

#### HP-B-051 – Calendar shows current month

**Steps**

1. Open the homepage `/`
2. Scroll to the calendar

**Expected result:** Header shows "Tháng MM/YYYY" for the current month and a lunar subtitle (e.g. "Tháng 9 - 10 Âm lịch (Ất Tỵ)").

#### HP-B-052 – Go to previous month

**Steps**

1. Open the homepage `/`
2. Click "Tháng trước"

**Expected result:** Header changes to the previous month and day grid updates.

#### HP-B-053 – Go to next month

**Steps**

1. Open the homepage `/`
2. Click "Tháng sau"

**Expected result:** Header changes to the next month and day grid updates.

#### HP-B-054 – Return to current month

**Steps**

1. Open the homepage `/`
2. Click "Tháng trước"
3. Click "Tháng sau"

**Expected result:** Header returns to the current month.

#### HP-B-055 – Today is highlighted

**Steps**

1. Open the homepage `/`

**Expected result:** Today's date cell has the 'Hôm nay' outline style.

#### HP-B-056 – Weekday header order

**Steps**

1. Open the homepage `/`

**Expected result:** Columns are T2, T3, T4, T5, T6, T7, CN.

#### HP-B-057 – Lunar dates are shown

**Steps**

1. Open the homepage `/`

**Expected result:** Each day cell shows the lunar day; lunar day 1 (as 1/M) and 15 are shown in red.

#### HP-B-058 – Calendar legend

**Steps**

1. Open the homepage `/`

**Expected result:** Legend shows "Đã học", "Có ghi chú", "Hôm nay", "Âm lịch (1/M: Mùng 1, 15: Rằm)".

#### HP-B-059 – Days in month count

**Steps**

1. Open the homepage `/`

**Expected result:** "Đã học trong tháng X/N ngày" where N equals the number of days in the current month.

### Stats carousel

#### HP-B-060 – Stats section heading

**Steps**

1. Open the homepage `/`

**Expected result:** Heading "Easy English qua những con số" is visible.

#### HP-B-061 – Stat card "Lượt rèn luyện" links to /user

**Steps**

1. Open the homepage `/`
2. Navigate the carousel to "Lượt rèn luyện"
3. Click the card

**Expected result:**

- Guest: URL is /user and the page shows the in-page sign-in prompt "Vui lòng đăng nhập để xem tiến độ học tập và thống kê cá nhân của bạn." with a "Đăng nhập ngay" button; no progress data is shown.
- Logged-in: Card shows a numeric value; URL is /user.

#### HP-B-062 – Stat card "Học viên tham gia" links to /leaderboard

**Steps**

1. Open the homepage `/`
2. Navigate the carousel to "Học viên tham gia"
3. Click the card

**Expected result:** Card shows a numeric value; URL is /leaderboard.

#### HP-B-063 – Stat card "Lượt học từ vựng" links to /vocabulary

**Steps**

1. Open the homepage `/`
2. Navigate the carousel to "Lượt học từ vựng"
3. Click the card

**Expected result:** Card shows a numeric value; URL is /vocabulary.

#### HP-B-064 – Stat card "Từ vựng TOEIC & ETS" links to /vocabulary

**Steps**

1. Open the homepage `/`
2. Navigate the carousel to "Từ vựng TOEIC & ETS"
3. Click the card

**Expected result:** Card shows a numeric value; URL is /vocabulary.

#### HP-B-065 – Stat card "Từ vựng IELTS" links to /vocabulary

**Steps**

1. Open the homepage `/`
2. Navigate the carousel to "Từ vựng IELTS"
3. Click the card

**Expected result:** Card shows a numeric value; URL is /vocabulary.

#### HP-B-066 – Stat card "Trò chơi tương tác" links to /games

**Steps**

1. Open the homepage `/`
2. Navigate the carousel to "Trò chơi tương tác"
3. Click the card

**Expected result:** Card shows a numeric value; URL is /games.

#### HP-B-067 – Stat card "Đề thi thực chiến" links to /tests

**Steps**

1. Open the homepage `/`
2. Navigate the carousel to "Đề thi thực chiến"
3. Click the card

**Expected result:**

- Guest: the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears and the URL stays `/`.
- Logged-in: Card shows a numeric value; URL is /tests.

#### HP-B-068 – Stat card "Từ vựng đa cấp độ" links to /vocabulary

**Steps**

1. Open the homepage `/`
2. Navigate the carousel to "Từ vựng đa cấp độ"
3. Click the card

**Expected result:** Card shows a numeric value; URL is /vocabulary.

#### HP-B-069 – Stat card "Cấu trúc mẫu câu" links to /structures

**Steps**

1. Open the homepage `/`
2. Navigate the carousel to "Cấu trúc mẫu câu"
3. Click the card

**Expected result:**

- Guest: the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears and the URL stays `/`.
- Logged-in: Card shows a numeric value; URL is /structures.

#### HP-B-070 – Stat card "Bài luyện nghe Audio" links to /skills

**Steps**

1. Open the homepage `/`
2. Navigate the carousel to "Bài luyện nghe Audio"
3. Click the card

**Expected result:**

- Guest: the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears and the URL stays `/`.
- Logged-in: Card shows a numeric value; URL is /skills.

#### HP-B-071 – Stat card "Cụm từ Collocations" links to /collocations

**Steps**

1. Open the homepage `/`
2. Navigate the carousel to "Cụm từ Collocations"
3. Click the card

**Expected result:**

- Guest: the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears and the URL stays `/`.
- Logged-in: Card shows a numeric value; URL is /collocations.

#### HP-B-072 – Carousel auto-rotates

**Steps**

1. Open the homepage `/`
2. Wait ~5–10 s

**Expected result:** Active dot/slide changes automatically.

#### HP-B-073 – Pause and resume auto-rotate

**Steps**

1. Open the homepage `/`
2. Click "Tạm dừng tự động"
3. Wait 10 s
4. Click it again

**Expected result:** Slides do not change while paused; rotation resumes after clicking again.

#### HP-B-074 – Next and previous slide

**Steps**

1. Open the homepage `/`
2. Click "Thẻ kế tiếp"
3. Click "Thẻ trước"

**Expected result:** Carousel moves forward one step then back to the original slide.

#### HP-B-075 – Dot navigation

**Steps**

1. Open the homepage `/`
2. Click "Chuyển tới slide 3"

**Expected result:** Slide 3 becomes active and its dot is highlighted.

#### HP-B-076 – Swipe carousel on mobile `mobile projects`

**Steps**

1. Open the homepage `/` on a mobile device
2. Swipe left on the cards

**Expected result:** Carousel moves to the next slide.

### Supporter section

#### HP-B-077 – Supporter section content

**Steps**

1. Open the homepage `/`

**Expected result:** Label "Bảng vinh danh", heading "Cảm ơn các Supporter" and supporter avatars with names are visible.

#### HP-B-078 – Supporter count matches avatars

**Steps**

1. Open the homepage `/`

**Expected result:** "N người đã mời team cà phê..." where N equals the number of supporter avatars shown.

#### HP-B-079 – "Mời team một ly cà phê" button

**Steps**

1. Open the homepage `/`
2. Click "Mời team một ly cà phê"

**Expected result:** URL is /supporter.

#### HP-B-080 – "Xem bảng vinh danh" link

**Steps**

1. Open the homepage `/`
2. Click "Xem bảng vinh danh"

**Expected result:** Full supporter list page/section opens.

### Facebook community

#### HP-B-081 – Community section content

**Steps**

1. Open the homepage `/`

**Expected result:** Heading "Học cùng bạn bè trên Facebook" with Fanpage and Group cards is visible.

#### HP-B-082 – "Theo dõi Fanpage" link

**Steps**

1. Open the homepage `/`
2. Click "Theo dõi Fanpage"

**Expected result:** New tab opens https://www.facebook.com/easyenglisheverydayapp/.

#### HP-B-083 – "Tham gia nhóm" link

**Steps**

1. Open the homepage `/`
2. Click "Tham gia nhóm"

**Expected result:** New tab opens https://www.facebook.com/groups/1816952786165681.

#### HP-B-084 – Copy Fanpage link `Grant clipboard permissions`

**Steps**

1. Open the homepage `/`
2. Click "Sao chép liên kết" on the Fanpage card

**Expected result:** Fanpage URL is copied to the clipboard with a confirmation.

#### HP-B-085 – Copy Group link `Grant clipboard permissions`

**Steps**

1. Open the homepage `/`
2. Click "Sao chép liên kết" on the Group card

**Expected result:** Group URL is copied to the clipboard with a confirmation.

### FAQ

#### HP-B-086 – FAQ section shows 8 items

**Steps**

1. Open the homepage `/`
2. Scroll to "Giải Đáp & Hướng Dẫn Học Hiệu Quả"

**Expected result:** 8 FAQ items numbered 01–08 are listed.

#### HP-B-087 – First FAQ is expanded by default

**Steps**

1. Open the homepage `/`

**Expected result:** Item 01 "Phương pháp Lặp lại ngắt quãng (SRS) là gì..." is expanded with SRS details and the 4 flashcard levels.

#### HP-B-088 – Expand another FAQ item

**Steps**

1. Open the homepage `/`
2. Click item 03 "Lộ trình 10-15-5"

**Expected result:** Item 03 expands and shows the 10 - 15 - 5 explanation.

#### HP-B-089 – Collapse an expanded FAQ item

**Steps**

1. Open the homepage `/`
2. Click the header of the expanded item 01

**Expected result:** Item 01 collapses.

#### HP-B-090 – "Vào Ôn Tập SRS" link

**Steps**

1. Open the homepage `/`
2. In item 01 click "Vào Ôn Tập SRS"

**Expected result:** URL is /vocabulary.

### Footer

#### HP-B-091 – Footer content

**Steps**

1. Open the homepage `/`
2. Scroll to the footer

**Expected result:** Text "Easy English, learn English with ease!" and "© 2026 Easy English. All rights reserved." are visible.

#### HP-B-092 – Footer Privacy link

**Steps**

1. Open the homepage `/`
2. Click "Privacy Policy"

**Expected result:** URL is /privacy.

#### HP-B-093 – Footer Terms link

**Steps**

1. Open the homepage `/`
2. Click "Terms of Service"

**Expected result:** URL is /terms.

#### HP-B-094 – Footer Facebook links

**Steps**

1. Open the homepage `/`
2. Inspect the Fanpage and Group links

**Expected result:** hrefs point to the Facebook fanpage and group URLs.

### Public chat widget

#### HP-B-095 – Open public chat

**Steps**

1. Open the homepage `/`
2. Click "Mở khung Public chat" (bottom-right bubble)

**Expected result:** Public chat panel opens.

#### HP-B-096 – Collapse chat bubble to edge

**Steps**

1. Open the homepage `/`
2. Click "Thu gọn chat vào cạnh" (x on the bubble)

**Expected result:** Chat bubble collapses to the screen edge.

### Accessibility

#### HP-B-097 – Keyboard navigation

**Steps**

1. Open the homepage `/`
2. Press Tab repeatedly

**Expected result:** Focus moves through sidebar links, header buttons and page controls with a visible focus ring.

#### HP-B-098 – Icon buttons have accessible names

**Steps**

1. Open the homepage `/`
2. Query icon-only buttons

**Expected result:** Buttons such as carousel, calendar and copy controls have aria-labels.

---

## 2. Guest only

### Authentication

#### HP-G-001 – "Đăng nhập" button is visible

**Steps**

1. Use a fresh browser session that is not signed in
2. Open the homepage `/`

**Expected result:** "Đăng nhập" button is shown at the bottom of the sidebar.

#### HP-G-002 – Sign-in starts Google flow `Assert only the popup/URL, never automate Google login`

**Steps**

1. Use a fresh browser session that is not signed in
2. Open the homepage `/`
3. Click "Đăng nhập"

**Expected result:** Google sign-in popup/redirect starts (accounts.google.com); do not complete it.

#### HP-G-003 – No account menu or notifications

**Steps**

1. Use a fresh browser session that is not signed in
2. Open the homepage `/`

**Expected result:** Avatar/account menu and notification bell are not shown.

### Greeting

#### HP-G-004 – Guest greeting

**Steps**

1. Use a fresh browser session that is not signed in
2. Open the homepage `/`

**Expected result:** Greeting reads "Good <time>, bạn !".

### Daily goal

#### HP-G-005 – Guest daily goal values

**Steps**

1. Use a fresh browser session that is not signed in
2. Open the homepage `/`

**Expected result:** "Mục tiêu hôm nay 0 / 30 phút", "Chuỗi ngày học 0 ngày", "Tổng ngày học 0 ngày".

#### HP-G-006 – Guest check-in button

**Steps**

1. Use a fresh browser session that is not signed in
2. Open the homepage `/`
3. Click "Học thêm 30 phút để điểm danh"

**Expected result:** Check-in is not completed (button disabled or sign-in prompt shown).

### Shortcuts

#### HP-G-007 – Guest "Sổ tay" shortcut

**Steps**

1. Use a fresh browser session that is not signed in
2. Open the homepage `/`
3. Click "Sổ tay" in the shortcuts bar

**Expected result:** Notebook opens in guest mode or a sign-in prompt is shown.

### Reviews

#### HP-G-008 – Guest reviews section

**Steps**

1. Use a fresh browser session that is not signed in
2. Open the homepage `/`
3. Scroll to "Cảm nhận"

**Expected result:** Reviews are listed, or empty state "Chưa có đánh giá nào" with "Hãy là người đầu tiên chia sẻ".

#### HP-G-009 – "Đăng nhập để viết" prompts sign-in

**Steps**

1. Use a fresh browser session that is not signed in
2. Open the homepage `/`
3. Click "Đăng nhập để viết"

**Expected result:** Google sign-in flow starts.

### Calendar

#### HP-G-010 – Guest calendar has no studied days

**Steps**

1. Use a fresh browser session that is not signed in
2. Open the homepage `/`

**Expected result:** "Đã học trong tháng 0 / N ngày" and no days are highlighted as studied.

### Feature cards

#### HP-G-011 – No review badges for guest

**Steps**

1. Use a fresh browser session that is not signed in
2. Open the homepage `/`

**Expected result:** Từ vựng and Collocations cards and sidebar items show no review-count badges.

### Local progress

#### HP-G-012 – Guest progress kept offline

**Steps**

1. Use a fresh browser session that is not signed in
2. As guest, study on /vocabulary for a few minutes
3. Return to `/`

**Expected result:** Daily goal minutes reflect the local study time (stored offline).

### Sidebar navigation

#### HP-G-013 – Sidebar "Tiến độ" asks guest to sign in on /user

**Steps**

1. Use a fresh browser session that is not signed in
2. Open the homepage `/`
3. Click "Tiến độ" in the sidebar ("Cá nhân" group)

**Expected result:** URL is /user and the page shows the in-page sign-in prompt "Vui lòng đăng nhập để xem tiến độ học tập và thống kê cá nhân của bạn." with a "Đăng nhập ngay" button; no progress data is shown.

### Direct URL access

A guest who types a gated URL must be asked to sign in, the same as when clicking a link. The messages panel has no URL (`/messages` returns 404), so it is not listed here.

#### HP-G-014 – Direct URL /collocations asks guest to sign in `known bug: content currently shown`

**Steps**

1. Use a fresh browser session that is not signed in
2. Open `/collocations` directly by typing the URL

**Expected result:** The Collocations content is not shown; the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears.

#### HP-G-015 – Direct URL /dictionary asks guest to sign in

**Steps**

1. Use a fresh browser session that is not signed in
2. Open `/dictionary` directly by typing the URL

**Expected result:** The Từ điển content is not shown; the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears.

#### HP-G-016 – Direct URL /grammars asks guest to sign in `known bug: content currently shown`

**Steps**

1. Use a fresh browser session that is not signed in
2. Open `/grammars` directly by typing the URL

**Expected result:** The Ngữ pháp content is not shown; the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears.

#### HP-G-017 – Direct URL /structures asks guest to sign in `known bug: content currently shown`

**Steps**

1. Use a fresh browser session that is not signed in
2. Open `/structures` directly by typing the URL

**Expected result:** The Cấu trúc content is not shown; the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears.

#### HP-G-018 – Direct URL /skills asks guest to sign in `known bug: content currently shown`

**Steps**

1. Use a fresh browser session that is not signed in
2. Open `/skills` directly by typing the URL

**Expected result:** The Kỹ năng content is not shown; the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears.

#### HP-G-019 – Direct URL /tests asks guest to sign in `known bug: content currently shown`

**Steps**

1. Use a fresh browser session that is not signed in
2. Open `/tests` directly by typing the URL

**Expected result:** The Luyện thi content is not shown; the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears.

#### HP-G-020 – Direct URL /classrooms asks guest to sign in `known bug: content currently shown`

**Steps**

1. Use a fresh browser session that is not signed in
2. Open `/classrooms` directly by typing the URL

**Expected result:** The Lớp học content is not shown; the sign-in popup "Đăng nhập để học miễn phí" (with a "Đăng nhập với Google" button) appears.

#### HP-G-021 – Direct URL /user asks guest to sign in

**Steps**

1. Use a fresh browser session that is not signed in
2. Open `/user` directly by typing the URL

**Expected result:** No progress data is shown; the sign-in popup or the in-page prompt "Vui lòng đăng nhập để xem tiến độ học tập và thống kê cá nhân của bạn." with "Đăng nhập ngay" is shown.

---

## 3. Logged-in only

### Authentication

#### HP-L-001 – Logged-in state on load `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`

**Expected result:** "Đăng nhập" button is not shown; avatar with user name and XP chip appears in the header.

#### HP-L-002 – Session persists after reload `verify after login` `Use Playwright storageState`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Reload the page

**Expected result:** User stays signed in.

#### HP-L-003 – Logout `verify after login` `Re-login needed afterwards` `run last`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Open the account menu
4. Click "Đăng xuất"

**Expected result:** Page returns to guest state with "Đăng nhập" visible.

### Header

#### HP-L-004 – Greeting shows user's name `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`

**Expected result:** Greeting reads "Good <time>, <display name>!".

#### HP-L-005 – Rename display name `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Click the name in the greeting ("Nhấn để đổi tên")
4. Enter a new name and save

**Expected result:** Greeting and header show the new name; it persists after reload.

#### HP-L-006 – Rename validation `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Click the name ("Nhấn để đổi tên")
4. Submit an empty name / a very long name

**Expected result:** Invalid name is rejected with a message; old name is kept.

#### HP-L-007 – Switch to "Công việc" mode `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Click "Công việc"

**Expected result:** Mode becomes "Chế độ Công việc (30 phút tổng kết việc trong ngày)" and the hero/goal content updates.

#### HP-L-008 – Switch back to "Học tập" mode `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Click "Công việc"
4. Click "Học tập"

**Expected result:** Study mode content is restored.

#### HP-L-009 – XP / streak chip `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`

**Expected result:** Header chip next to the avatar shows the daily goal (e.g. 30p) with streak icon.

### Notifications

#### HP-L-010 – Open notifications panel `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Click the bell ("Thông báo")

**Expected result:** Panel "Thông báo" opens listing notifications with sender, tag (e.g. "Thành tích", "Có ví"), message and date.

#### HP-L-011 – Close notifications panel `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Open the bell panel
4. Click the close (x) button

**Expected result:** Panel closes.

#### HP-L-012 – Scroll notifications `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Open the bell panel
4. Scroll inside it

**Expected result:** Older notifications load/scroll into view.

#### HP-L-013 – Claim XP from notification `verify after login` `Changes account data` `use a test account`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Open the bell panel
4. Click "Nhận +25 XP" on a milestone notification

**Expected result:** XP is added once; button changes to claimed state.

#### HP-L-014 – Open certificate from notification `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Open the bell panel
4. Click "Nhận Thẻ Chứng Nhận"

**Expected result:** Certificate view/modal opens.

#### HP-L-015 – Unread indicator `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Open and close the bell panel

**Expected result:** Unread badge/dot on the bell is cleared after viewing.

### Account menu

#### HP-L-016 – Open account menu `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Click the avatar/name in the header

**Expected result:** Menu shows avatar, display name, Supporter badge (if supporter) and Google email.

#### HP-L-017 – Daily goal options `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Open the account menu

**Expected result:** Section "Mục tiêu mỗi ngày" shows Dễ 10p, Vừa 20p, Khó 30p with the current one selected.

#### HP-L-018 – Change daily goal `verify after login` `Changes account data`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Open the account menu
4. Select a different goal

**Expected result:** Goal changes only when allowed ("Đổi vào Thứ 2" rule); otherwise a message explains the restriction.

#### HP-L-019 – "Hồ sơ cá nhân" link `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Open the account menu
4. Click "Hồ sơ cá nhân"

**Expected result:** User profile page opens.

#### HP-L-020 – "Cài đặt & Lộ trình" link `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Open the account menu
4. Click "Cài đặt & Lộ trình"

**Expected result:** Settings page (/settings) opens.

#### HP-L-021 – "Cài App & Thông báo" `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Open the account menu
4. Click "Cài App & Thông báo"

**Expected result:** PWA install & notification setup opens (iOS · Android).

#### HP-L-022 – Dark mode toggle `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Open the account menu
4. Click "Chế độ tối"

**Expected result:** Theme switches to dark; preference persists after reload; toggle back restores light.

#### HP-L-023 – Sync status `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Open the account menu

**Expected result:** "Đã đồng bộ" status is shown.

#### HP-L-024 – Close account menu `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Open the account menu
4. Click outside the menu

**Expected result:** Menu closes.

### Shortcuts

#### HP-L-025 – "Sổ tay" opens notebook `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Click "Sổ tay" ("Mở Sổ tay")

**Expected result:** Personal notebook opens.

#### HP-L-026 – "Bảng xếp hạng" shortcut `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Click "Bảng xếp hạng" ("Xem Bảng Xếp Hạng")

**Expected result:** URL is /leaderboard and the user appears on the board.

#### HP-L-027 – "Tiến độ" shortcut `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Click "Tiến độ" ("Xem Tiến độ học tập")

**Expected result:** URL is /user and the page shows the signed-in user's progress.

### Daily goal

#### HP-L-028 – Daily goal minutes and progress bar `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`

**Expected result:** "Mục tiêu hôm nay X / G phút" with the progress bar width proportional to X/G.

#### HP-L-029 – "Đã đạt" badge when goal met `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/` after studying >= goal minutes

**Expected result:** "Đã đạt" badge is shown and the progress bar is full.

#### HP-L-030 – Streak and total days `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Compare with /user

**Expected result:** "Chuỗi ngày học" and "Tổng ngày học" match the values on /user.

#### HP-L-031 – Check-in disabled before goal `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/` with today's study time < goal

**Expected result:** "Học thêm N phút để điểm danh" is shown and check-in is not possible.

#### HP-L-032 – Check-in after reaching goal `verify after login` `Changes account data` `once per day`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/` with goal reached and not yet checked in
3. Click the check-in button

**Expected result:** Check-in succeeds; streak +1 and total days +1; today is marked on the calendar.

#### HP-L-033 – Completed state after check-in `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/` after checking in today

**Expected result:** "Đã hoàn thành hôm nay" is shown and the button cannot be clicked again ("Đã hoàn thành mục tiêu hôm nay!").

#### HP-L-034 – Study time updates daily goal `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Study on /vocabulary for a few minutes
3. Return to `/`

**Expected result:** Daily goal minutes increase accordingly.

### Feature cards

#### HP-L-035 – Vocabulary review badge `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`

**Expected result:** "Từ vựng" card shows bell badge N and "N từ cần ôn tập hôm nay"; N equals the sidebar Từ vựng counter.

#### HP-L-036 – Collocations review badge `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`

**Expected result:** "Collocations" card shows bell badge N and "N cụm cần ôn tập hôm nay"; N equals the sidebar counter.

#### HP-L-037 – Badges hidden when nothing to review `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/` with no due items

**Expected result:** No review badge is shown on the cards or sidebar.

### Calendar

#### HP-L-038 – Studied days highlighted `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`

**Expected result:** Days with completed study are highlighted green (Đã học).

#### HP-L-039 – Monthly studied count `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`

**Expected result:** "Đã học trong tháng X/N ngày" where X equals the number of green days; progress bar matches X/N.

#### HP-L-040 – Days with notes `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/` with a diary note on a date

**Expected result:** That day shows the 'Có ghi chú' dot.

#### HP-L-041 – Studied days in previous month `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Click "Tháng trước"

**Expected result:** Studied days and count for the previous month are shown correctly.

### Reviews

#### HP-L-042 – Reviews count `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Scroll to "Cảm nhận"

**Expected result:** "N đánh giá từ cộng đồng" count is shown and matches the number of carousel dots.

#### HP-L-043 – Review card content `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`

**Expected result:** Each review shows avatar, name, star rating, date (dd/MM/yyyy) and text.

#### HP-L-044 – Review carousel navigation `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Click the next arrow
4. Click the previous arrow
5. Click a dot

**Expected result:** Carousel moves to the next, previous and selected review.

#### HP-L-045 – "Sửa đánh giá" opens own review `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Click "Sửa đánh giá"

**Expected result:** Edit form opens prefilled with the user's existing rating and text.

#### HP-L-046 – Edit review validation `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Click "Sửa đánh giá"
4. Clear the text / remove the rating
5. Save

**Expected result:** Save is blocked with a validation message.

#### HP-L-047 – Save edited review `verify after login` `Changes public data` `use a test account`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/`
3. Click "Sửa đánh giá"
4. Change the text and save

**Expected result:** Updated review appears in the carousel.

#### HP-L-048 – Write first review `verify after login` `Needs a second test account`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Open the homepage `/` as a user without a review

**Expected result:** A "write review" button is shown instead of "Sửa đánh giá"; submitting adds the review.

### Sync

#### HP-L-049 – Progress synced across devices `verify after login`

**Steps**

1. Sign in with Google (or load the saved Playwright session)
2. Study on device/context A
3. Open `/` on context B with the same account

**Expected result:** Daily goal, streak and calendar match on both.
