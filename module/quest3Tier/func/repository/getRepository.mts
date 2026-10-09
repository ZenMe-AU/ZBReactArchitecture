/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import container from "../di/diContainer.mjs";
import type { QuestRepository } from "./contracts.mjs";

export function getRepository(): QuestRepository {
  return container.get("repository");
}