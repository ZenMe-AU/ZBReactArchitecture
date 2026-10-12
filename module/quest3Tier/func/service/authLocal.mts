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
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    console.log("JWT verification failed:", error.message);
    const err = new Error("Invalid or expired token");
    err.status = 401;
    throw err;
  }
};

export { generateToken, decode };
