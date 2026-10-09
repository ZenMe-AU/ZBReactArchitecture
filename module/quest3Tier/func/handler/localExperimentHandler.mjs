/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import * as authLocal from "../service/authLocal.mjs";

export const JOSH = {
  oid: "10000000-0000-4000-8000-000000000005",
  name: "Josh",
  email: "josh@q3.local",
};

async function HumanSession() {
  if (process.env.AUTH_PROVIDER !== "authLocal" || process.env.ENABLE_HUMAN_TEST !== "1") {
    const error = new Error("Human test login is disabled");
    error.status = 404;
    throw error;
  }
  return {
    return: {
      token: authLocal.generateToken({ oid: JOSH.oid, name: JOSH.name, preferred_username: JOSH.email, experiment: "human" }),
      profileId: JOSH.oid,
      name: JOSH.name,
    },
  };
}

export default { HumanSession };
