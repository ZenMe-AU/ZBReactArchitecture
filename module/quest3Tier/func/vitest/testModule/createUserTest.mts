/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { randomUUID } from "crypto";
import * as authEntraID from "../../service/authEntraID.mjs";
import * as authDev from "../../service/authDev.mjs";
import { ensureProfile } from "../../service/profile.mjs";

const authProviders = {
  Dev: authDev,
  Prod: authEntraID,
};

const loadAuthProvider = authProviders[process.env.AUTH_PROVIDER ?? "Prod"];

const authProviderModule = loadAuthProvider;

const createUser = async () => {
  await Promise.all(
    createUserData().map(async (u) => {
      profileIdLookup.add(u.userId);
      await profileIdLookup.getProfileId(u.userId);
    })
  );
};

const profileIdLookup = {
  data: [],
  add: function (testId) {
    this.data.push({
      externalId: randomUUID(),
      testUserId: testId,
    });
  },
  getAuthToken: function (id) {
    const token = authProviderModule.generateToken({
      oid: this.data.find(d => d.testUserId === id)?.externalId,
    });
    return token;
  },
  getProfileId: async function (id) {
    const user = this.data.find((d) => d.testUserId === id);
    if (!user.profileId) {
      const { profile } = await ensureProfile(user.externalId);
      user.profileId = profile.internal_id;
    }
    return user.profileId;
  },
};

function createUserData() {
  return [
    {
      userId: 1,
      avatar: "pic/avatar_1.jpg",
      attributes: [],
    },
    {
      userId: 2,
      avatar: "pic/avatar_2.jpg",
      attributes: [],
    },
    {
      userId: 3,
      avatar: "pic/avatar_3.jpg",
      attributes: [],
    },
    {
      userId: 4,
      avatar: "pic/avatar_4.jpg",
      attributes: [],
    },
    {
      userId: 5,
      avatar: "pic/avatar_5.jpg",
      attributes: [],
    },
    {
      userId: 6,
      avatar: "pic/avatar_6.jpg",
      attributes: [],
    },
    {
      userId: 7,
      avatar: "pic/avatar_7.jpg",
      attributes: [],
    },
    {
      userId: 8,
      avatar: "pic/avatar_8.jpg",
      attributes: [],
    },
    {
      userId: 9,
      avatar: "pic/avatar_9.jpg",
      attributes: [],
    },
    {
      userId: 10,
      avatar: "pic/avatar_10.jpg",
      attributes: [],
    },
    {
      userId: 11,
      avatar: "pic/avatar_11.jpg",
      attributes: [],
    },
    {
      userId: 12,
      avatar: "pic/avatar_12.jpg",
      attributes: [],
    },
    {
      userId: 13,
      avatar: "pic/avatar_13.jpg",
      attributes: [],
    },
    {
      userId: 14,
      avatar: "pic/avatar_14.jpg",
      attributes: [],
    },
    {
      userId: 15,
      avatar: "pic/avatar_15.jpg",
      attributes: [],
    },
    {
      userId: 16,
      avatar: "pic/avatar_16.jpg",
      attributes: [],
    },
    {
      userId: 17,
      avatar: "pic/avatar_17.jpg",
      attributes: [],
    },
    {
      userId: 18,
      avatar: "pic/avatar_18.jpg",
      attributes: [],
    },
    {
      userId: 19,
      avatar: "pic/avatar_19.jpg",
      attributes: [],
    },
    {
      userId: 20,
      avatar: "pic/avatar_20.jpg",
      attributes: [],
    },
  ];
}

export { createUser, profileIdLookup };
