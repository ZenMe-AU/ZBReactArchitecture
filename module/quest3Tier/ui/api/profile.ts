/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { jwtFetch } from "@zenmechat/shared-ui/api/jwtFetch";
import { getConfig, loadConfig } from "@zenmechat/shared-ui/config/loadConfig"; //Config file: /ui/env.json
import type { Profile } from "../types/interfaces";

// People a question can be shared with. Their real name appears only after they disclose it to this user.
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

export const shareName = async (receiverId: string): Promise<void> => {
  await loadConfig();
  const apiDomain = getConfig("QUEST3TIER_DOMAIN");
  const response = await jwtFetch(`${apiDomain}/profile/share-name`, {
    method: "POST",
    body: JSON.stringify({ receiverId }),
  });
  if (!response.ok) throw new Error(`Failed to share name. Status: ${response.status}`);
};
