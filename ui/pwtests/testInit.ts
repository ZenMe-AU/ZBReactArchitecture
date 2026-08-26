/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Has browser viewport and URL configuration

export const HOME_URL = "http://localhost:5173/";
export const ACCESS_PASS_URL = "http://localhost:5173/quest3Tier";
export const CORP_URL = "http://localhost:5173/";

export const viewports = {
  Desktop: { width: 1920, height: 1080 },
  Mobile: { width: 414, height: 896 },
} as const;

export type ViewportName = keyof typeof viewports;

export type ViewportSize = (typeof viewports)[ViewportName];
