/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import jwt from "jsonwebtoken";

const jwtSecret = process.env.AUTH_LOCAL_SECRET;
const jwtSignOptions = {
  algorithm: "HS256",
  expiresIn: "10h",
};

const generateToken = (payload) => {
  return jwt.sign(payload, jwtSecret, jwtSignOptions);
};

const decode = (token) => {
  // Azure sets WEBSITE_SITE_NAME automatically on every Function App
  if (process.env.WEBSITE_SITE_NAME) {
    throw new Error("authLocal is for local development only and is disabled on Azure");
  }
  try {
    return jwt.verify(token, jwtSecret, { algorithms: [jwtSignOptions.algorithm] });
  } catch (error) {
    console.log("JWT verification failed:", error.message);
    const err = new Error("Invalid or expired token");
    err.status = 401;
    throw err;
  }
};

export { generateToken, decode };
