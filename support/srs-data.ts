import type { Page } from '@playwright/test';

// Reads the vocabulary SRS cards from the two places the site keeps them
// (see "Where the data lives" in docs/srs-scenarios.md):
//   1) localStorage "vocab_srs_records" in the browser, written right after each rating;
//   2) Firestore users/{uid}/srs/vocab_0 ... vocab_7, written a few seconds later.

// One SRS card, with only the fields the tests compare.
export type SrsRecord = {
  stage: number;
  intervalDays: number;
  dueDate: string;
  status: string; // 'learning', 'reviewing' or 'mastered'
  totalReviews: number;
};

// All cards of the account, by word id. Example: { ss_1: { stage: 1, status: 'reviewing', ... } }
export type SrsRecords = Record<string, SrsRecord>;

// ---------------------------------------------------------------------------------------------
// 1) localStorage
// ---------------------------------------------------------------------------------------------

// Reads the cards that the site saved in this browser (localStorage key "vocab_srs_records").
export async function readLocalSrsRecords(page: Page): Promise<SrsRecords> {
  const text = await page.evaluate(() => localStorage.getItem('vocab_srs_records'));
  if (text === null) {
    return {}; // no card saved yet
  }
  return JSON.parse(text);
}

// ---------------------------------------------------------------------------------------------
// 2) Firestore
// ---------------------------------------------------------------------------------------------

// Who is signed in: the account id (uid) and its sign-in token.
type SignedInUser = {
  uid: string;
  token: string;
};

// Firebase keeps the signed-in user in the browser's IndexedDB (database "firebaseLocalStorageDb").
// IndexedDB has no simple "get" function, only callbacks (onsuccess), so the code is wrapped in a Promise
// to be able to use await. The token stays in the test and is never printed.
async function getSignedInUser(page: Page): Promise<SignedInUser> {
  return page.evaluate(() => {
    return new Promise<SignedInUser>((resolve, reject) => {
      const openRequest = indexedDB.open('firebaseLocalStorageDb');
      openRequest.onerror = () => reject(new Error('Could not open firebaseLocalStorageDb'));
      openRequest.onsuccess = () => {
        const database = openRequest.result;
        const store = database.transaction('firebaseLocalStorage').objectStore('firebaseLocalStorage');
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => {
          for (const row of getAllRequest.result) {
            if (row.value && row.value.uid) {
              resolve({ uid: row.value.uid, token: row.value.stsTokenManager.accessToken });
              return;
            }
          }
          reject(new Error('Nobody is signed in on this page'));
        };
      };
    });
  });
}

// Address of one Firestore shard. The cards are split over 8 documents: vocab_0 ... vocab_7.
function shardUrl(uid: string, shard: number): string {
  return (
    'https://firestore.googleapis.com/v1/projects/easyenglish-app-d7b3a/databases/(default)/documents' +
    `/users/${uid}/srs/vocab_${shard}`
  );
}

// Reads the cards that the site saved in Firestore for the signed-in account.
// Call it only after the page shows the user as signed in (e.g. after VocabularyPage.gotoSignedIn()):
// right after page.goto() the saved token may still be the expired one, and Firestore answers HTTP 401.
export async function readFirestoreSrsRecords(page: Page): Promise<SrsRecords> {
  const user = await getSignedInUser(page);
  const records: SrsRecords = {};

  for (let shard = 0; shard < 8; shard++) {
    const url = shardUrl(user.uid, shard);

    // Send the request from inside the browser (fetch), the same way the site itself talks to Firestore.
    // A request sent from the test process (page.request) once hung until the whole test timed out.
    // Give up after 10 seconds, so a network problem fails fast with a clear message.
    // The second argument of page.evaluate passes url and token from the test into the browser.
    const body = await page
      .evaluate(
        async ({ url, token }) => {
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(10_000),
          });
          // A shard that has no card yet does not exist.
          if (response.status === 404) {
            return null;
          }
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.json();
        },
        { url, token: user.token },
      )
      .catch((error) => {
        throw new Error(`Reading Firestore vocab_${shard} failed: ${error.message}`);
      });

    if (body === null) {
      continue;
    }

    // Firestore wraps every value with its type, for example:
    //   "ss_1": { "mapValue": { "fields": {
    //       "stage":   { "integerValue": "1" },
    //       "dueDate": { "stringValue": "2026-11-18" },
    //       "status":  { "stringValue": "reviewing" }, ... } } }
    const cards = body.fields.records.mapValue.fields;

    for (const wordId of Object.keys(cards)) {
      const fields = cards[wordId].mapValue.fields;
      records[wordId] = {
        stage: Number(fields.stage.integerValue),
        intervalDays: Number(fields.intervalDays.integerValue),
        dueDate: fields.dueDate.stringValue,
        status: fields.status.stringValue,
        totalReviews: Number(fields.totalReviews.integerValue),
      };
    }
  }

  return records;
}

// ---------------------------------------------------------------------------------------------
// 3) Counting
// ---------------------------------------------------------------------------------------------

// How many cards have this status ('learning', 'reviewing' or 'mastered').
export function countByStatus(records: SrsRecords, status: string): number {
  let count = 0;
  for (const wordId of Object.keys(records)) {
    if (records[wordId].status === status) {
      count = count + 1;
    }
  }
  return count;
}
