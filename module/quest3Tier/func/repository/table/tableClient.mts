/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Explicit TableClient factory, mirroring the two auth modes already used by
// repository/model/connection/postgres.mjs: a connection string for local
// dev (Azurite), DefaultAzureCredential against the user-assigned identity
// in Azure. No ORM, no model loader: one TableClient per table name.

import { TableClient } from "@azure/data-tables";
import { DefaultAzureCredential } from "@azure/identity";

const clients = new Map<string, TableClient>();
const ensuredTables = new Set<string>();

function buildClient(tableName: string): TableClient {
  // Local dev / Azurite: AzureWebJobsStorage is already the connection
  // string used by the Functions host itself (see local.settings.json).
  const connectionString = process.env.AzureWebJobsStorage;
  if (connectionString) {
    return TableClient.fromConnectionString(connectionString, tableName, {
      allowInsecureConnection: true,
    });
  }

  // Azure: the Function App is already configured with a table endpoint and
  // a user-assigned identity (see deploy/env/functionApps/functionApps.tf).
  const tableServiceUri = process.env.AzureWebJobsStorage__tableServiceUri;
  if (!tableServiceUri) {
    throw new Error("Table storage is not configured: set AzureWebJobsStorage (local) or AzureWebJobsStorage__tableServiceUri (Azure).");
  }
  const managedIdentityClientId = process.env.AzureWebJobsStorage__clientId;
  const credential = new DefaultAzureCredential(managedIdentityClientId ? { managedIdentityClientId } : undefined);
  return new TableClient(tableServiceUri, tableName, credential);
}

export async function getTableClient(tableName: string): Promise<TableClient> {
  let client = clients.get(tableName);
  if (!client) {
    client = buildClient(tableName);
    clients.set(tableName, client);
  }
  if (!ensuredTables.has(tableName)) {
    await client.createTable(); // no-op if the table already exists
    ensuredTables.add(tableName);
  }
  return client;
}

export function isNotFoundError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { statusCode?: number }).statusCode === 404;
}
