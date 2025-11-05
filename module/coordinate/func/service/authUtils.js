/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;
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
    throw new Error("Invalid or expired token");
  }
};

module.exports = { generateToken, decode };
