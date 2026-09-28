/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// 這個 codebase 慣例上會在 Error 上掛 HTTP status，handlerWrapper 會讀它來決定回應碼
declare global {
  interface Error {
    status?: number;
  }
}

export {};
