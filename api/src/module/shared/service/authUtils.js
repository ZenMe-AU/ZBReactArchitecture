const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || "bb64c67554381aff324d26669540f591e02e3e993ce85c2d1ed2962e22411634";
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
