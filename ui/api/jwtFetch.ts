/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { getOperationId } from "../monitor/telemetry";

export const jwtFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const correlationId = getOperationId();
  console.log("Correlation ID:", correlationId);
  const headers = new Headers({
    Accept: "application/json",
    "Access-Control-Allow-Origin": "*",
    "X-Correlation-Id": correlationId ?? "",
    ...options.headers,
  });

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed with status ${response.status}: ${errorText}`);
  }

  return response;
};
