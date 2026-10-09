/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { AzureNamedKeyCredential } from "@azure/data-tables";

export const storageConnectionString = process.env.AzureWebJobsStorage?.trim() || process.env.AZURE_STORAGE_CONNECTION_STRING?.trim() || "UseDevelopmentStorage=true";
export const useDevelopmentStorage = storageConnectionString.trim().toLowerCase() === "usedevelopmentstorage=true";
export const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "devstoreaccount1";
export const accountKey = process.env.AZURE_STORAGE_KEY;
export const endpoint = process.env.AZURE_STORAGE_TABLE_ENDPOINT || (useDevelopmentStorage ? "http://127.0.0.1:10002/devstoreaccount1" : undefined);
export const credential = accountKey ? new AzureNamedKeyCredential(accountName, accountKey) : undefined;