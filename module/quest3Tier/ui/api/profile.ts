/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { jwtFetch } from "@zenmechat/shared-ui/api/jwtFetch";
import { getConfig, loadConfig } from "@zenmechat/shared-ui/config/loadConfig"; //Config file: /ui/env.json
import type { Profile } from "../types/interfaces";

// People a question can be shared with: Quest 3 profiles that have a name, excluding the current user.
export const getProfiles = async (): Promise<Profile[]> => {
  await loadConfig();
  const apiDomain = getConfig("QUEST3TIER_DOMAIN");
  const response = await jwtFetch(`${apiDomain}/profiles`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profiles. Status: ${response.status}`);
  }

  const data = await response.json();
  return data.return.list;
};
