import fs from 'node:fs';
import path from 'node:path';

// Saved-login settings used by tests/auth.setup.ts and the signed-in specs.
//
// Set these in a `.env` file at the repo root (it is git-ignored; copy `.env.example`)
// or as environment variables:
//
//   TEST_USER_DISPLAY_NAME=...       optional: the name the site shows for the signed-in account
//   CONNECT_CHROME=1                 copy the session from a normal Chrome (see tests/auth.setup.ts)

// Load .env if it exists. Node >= 20.12 has this built in, so no dotenv package is needed.
const envFile = path.resolve(__dirname, '../.env');
if (fs.existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

export const testUser = {
  displayName: process.env.TEST_USER_DISPLAY_NAME ?? '',
};

// CONNECT_CHROME=1: copy the session from a normal Chrome you signed in to yourself, instead of
// signing in from Playwright's browser (Google rejects that one: "This browser or app may not be secure").
// That Chrome must be started with remote debugging on this address; see tests/auth.setup.ts.
export const connectChrome = process.env.CONNECT_CHROME === '1';
export const CHROME_DEBUG_URL = 'http://localhost:9222';

// Where auth.setup.ts saves the signed-in browser state (cookies, localStorage and IndexedDB,
// where Firebase keeps the session). The folder is already in .gitignore.
export const AUTH_FILE = path.resolve(__dirname, '../playwright/.auth/user.json');

export const hasSavedLogin = () => fs.existsSync(AUTH_FILE);
