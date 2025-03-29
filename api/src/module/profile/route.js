// This file is auto-loaded by functions/routes.js
const authHandler = require("./authHandler.js");
const profileHandler = require("./handler.js");

module.exports = [
  {
    name: "Login",
    path: "auth/login",
    methods: ["POST"],
    handler: authHandler.loginUser,
  },
  {
    name: "Verify",
    path: "auth/verify",
    methods: ["GET"],
    handler: authHandler.verify,
  },
  {
    name: "GetAttributes",
    path: "attributes/{userId}",
    methods: ["GET"],
    handler: profileHandler.GetAttributes,
  },
  {
    name: "PutAttributes",
    path: "attributes/{userId}",
    methods: ["PUT"],
    handler: profileHandler.PutAttributes,
  },
  {
    name: "CreateProfile",
    path: "profile",
    methods: ["POST"],
    handler: profileHandler.CreateProfile,
  },
  {
    name: "SearchProfile",
    path: "profile",
    methods: ["GET"],
    handler: profileHandler.SearchProfile,
  },
];
