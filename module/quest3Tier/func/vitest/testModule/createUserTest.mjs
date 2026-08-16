/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { v4 as uuidv4 } from "uuid";
import { Client } from "pg";

import * as authEntraID from "../../service/authEntraID.mjs";
import * as authLocal from "../../service/authLocal.mjs";

const authProviders = {
  authEntraID,
  authLocal,
};

const loadAuthProvider = authProviders[process.env.AUTH_PROVIDER ?? "authEntraID"];

const authProviderModule = loadAuthProvider;

const profileProvisionUrl = new URL("/question/00000000-0000-0000-0000-000000000000", process.env.QUESTION_URL);

const createUser = async () => {
  createUserData().forEach((u) => {
    const externalId = uuidv4();
    profileIdLookup.add(u.userId, externalId);
  });

  await Promise.all(
    profileIdLookup.data.map(async ({ testId }) => {
      const response = await fetch(profileProvisionUrl, {
        method: "GET",
        headers: {
          authorization: `Bearer ${profileIdLookup.getAuthToken(testId)}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(`Failed to provision test profile ${testId}: ${result.message ?? response.statusText}`);
      }
    })
  );

  await profileIdLookup.loadInternalIds();
};

const profileIdLookup = {
  data: [],
  add: function (testId, externalId) {
    this.data.push({
      testId: testId,
      externalId: externalId,
      internalId: null,
    });
  },
  getProfileId: function (id) {
    let obj = this.data.filter(({ testId }) => testId == id).pop();
    return obj ? obj.internalId : null;
  },
  getExternalId: function (id) {
    let obj = this.data.filter(({ testId }) => testId == id).pop();
    return obj ? obj.externalId : null;
  },
  getAuthToken: function (id) {
    const token = authProviderModule.generateToken({
      oid: this.getExternalId(id),
    });
    return token;
  },
  loadInternalIds: async function () {
    const client = new Client({
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
    });

    try {
      await client.connect();
      const externalIds = this.data.map(({ externalId }) => externalId);
      const result = await client.query(
        `SELECT internal_id, external_id
           FROM profile
          WHERE external_id = ANY($1::uuid[])
          ORDER BY "createdAt" ASC, internal_id ASC`,
        [externalIds]
      );

      const internalIdsByExternalId = new Map();
      result.rows.forEach(({ internal_id: internalId, external_id: externalId }) => {
        if (!internalIdsByExternalId.has(externalId)) {
          internalIdsByExternalId.set(externalId, internalId);
        }
      });

      this.data.forEach((profile) => {
        profile.internalId = internalIdsByExternalId.get(profile.externalId) ?? null;
        if (!profile.internalId) {
          throw new Error(`Internal profile ID not found for test user ${profile.testId}`);
        }
      });
    } finally {
      await client.end();
    }
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
