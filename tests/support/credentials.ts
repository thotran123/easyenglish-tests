import fs from 'node:fs';
import path from 'node:path';

// Credentials and saved-login settings used by tests/auth.setup.ts.
//
// Real values never go in this file. Put them in a `.env` file at the repo root
// (it is git-ignored; copy `.env.example`), or set them as environment variables / CI secrets:
//
//   TEST_USER_EMAIL=...              Google account used for the tests (use a dedicated test account)
//   TEST_USER_PASSWORD=...           its password (accounts with 2-step verification need MANUAL_LOGIN=1)
//   TEST_USER_DISPLAY_NAME=...       optional: the name the site shows for this account
//   MANUAL_LOGIN=1                   optional: you finish the Google sign-in yourself in a headed browser
//   REFRESH_LOGIN=1                  optional: ignore the saved session and sign in again

// Load .env if it exists. Node >= 20.12 has this built in, so no dotenv package is needed.
const envFile = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

export const testUser = {
  email: process.env.TEST_USER_EMAIL ?? '',
  password: process.env.TEST_USER_PASSWORD ?? '',
  displayName: process.env.TEST_USER_DISPLAY_NAME ?? '',
};

export const hasCredentials = () => testUser.email !== '' && testUser.password !== '';

export const manualLogin = process.env.MANUAL_LOGIN === '1';
export const refreshLogin = process.env.REFRESH_LOGIN === '1';

// Where auth.setup.ts saves the signed-in browser state (cookies, localStorage and IndexedDB,
// where Firebase keeps the session). The folder is already in .gitignore.
export const AUTH_FILE = path.resolve(__dirname, '../../playwright/.auth/user.json');

export const hasSavedLogin = () => fs.existsSync(AUTH_FILE);
