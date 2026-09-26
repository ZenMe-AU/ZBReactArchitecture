/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */
import { TableClient } from "@azure/data-tables";
export declare function getTableClient(tableName: string): Promise<TableClient>;
export declare function isNotFoundError(err: unknown): boolean;
