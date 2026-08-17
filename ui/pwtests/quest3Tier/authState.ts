// Generates .auth files for authentication tests by saving sessionStorage.

/// <reference types="node" />

import fs from "fs";
import path from "path";
import type { Page } from "@playwright/test";

export const authDir = path.join(process.cwd(), "web/pwtests/access-pass-src/auth/.auth");
export const storageStateFile = path.join(authDir,"azure-access-pass-user.json",);
export const sessionStorageFile = path.join(authDir,"azure-session-storage.json",);

// Normalizes a user id into a safe filename segment.
export function safeAuthFileName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Returns per-user auth storage and session file paths.
export function getUserAuthFiles(userId: string) {
  const safeId = safeAuthFileName(userId);

  return {
    storageStateFile: path.join(authDir, `${safeId}.storage.json`),
    sessionStorageFile: path.join(authDir, `${safeId}.session.json`),
  };
}

// Checks whether both required auth files exist for a user.
export function userAuthFilesExist(userId: string) {
  const files = getUserAuthFiles(userId);

  return (
    fs.existsSync(files.storageStateFile) &&
    fs.existsSync(files.sessionStorageFile)
  );
}

// Saves current browser sessionStorage to disk for later authenticated test runs.
export async function saveSessionStorage(page: Page, targetSessionStorageFile = sessionStorageFile,) {
  fs.mkdirSync(path.dirname(targetSessionStorageFile), { recursive: true });

  const sessionStorageData = await page.evaluate(() => {
    return Object.fromEntries(
      Array.from({ length: sessionStorage.length }, (_, index) => {
        const key = sessionStorage.key(index)!;
        return [key, sessionStorage.getItem(key)];
      }),
    );
  });

  fs.writeFileSync(
    targetSessionStorageFile,
    JSON.stringify(sessionStorageData, null, 2),
  );
}

// Restores previously saved sessionStorage values into a new page context.
export async function restoreSessionStorage(page: Page, targetSessionStorageFile = sessionStorageFile,) {
  if (!fs.existsSync(targetSessionStorageFile)) {
    throw new Error(
      `Missing session storage file: ${targetSessionStorageFile}. Run pwtests/auth/azure-passkey.setup.ts first.`,
    );
  }

  const sessionStorageData = JSON.parse(
    fs.readFileSync(targetSessionStorageFile, "utf-8"),
  ) as Record<string, string>;

  await page.addInitScript((data) => {
    for (const [key, value] of Object.entries(data)) {
      window.sessionStorage.setItem(key, value);
    }
  }, sessionStorageData);
}