/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */
// This codebase attaches an HTTP status to Error; handlerWrapper reads it to pick the response code.
declare global {
  interface Error {
    status?: number;
  }
}

export {};
