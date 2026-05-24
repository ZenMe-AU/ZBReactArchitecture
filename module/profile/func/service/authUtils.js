/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

/* deprecated */
const jwtSecret = process.env.JWT_SECRET;
const jwtSignOptions = {
  algorithm: "HS256",
  expiresIn: "10h",
};

const generateToken = (payload) => {
  return jwt.sign(payload, jwtSecret, jwtSignOptions);
};
/* --------- */

const CLIENT_ID = process.env.CLIENT_ID;
const TENANT_ID = process.env.TENANT_ID;

// Microsoft JWKS client
const msJwks = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 6 * 60 * 60 * 1000,
  timeout: 3000,
});

async function getSigningKey(kid) {
  return new Promise((resolve, reject) => {
    msJwks.getSigningKey(kid, (err, key) => {
      if (err) return reject(err);
      resolve(key.getPublicKey());
    });
  });
}
const decode = async (token) => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded?.header?.kid) {
      throw new Error("The token is missing key id header (kid)");
    }
    const publicKey = await getSigningKey(decoded.header.kid);
    const verified = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
      issuer: `https://sts.windows.net/${TENANT_ID}/`,
      audience: `api://${CLIENT_ID}`,
    });
    return verified;
  } catch (error) {
    console.log("JWT verification failed:", error.message);
    const err = new Error("Invalid or expired token");
    err.status = 401;
    throw err;
  }
};

export default { generateToken, decode };
