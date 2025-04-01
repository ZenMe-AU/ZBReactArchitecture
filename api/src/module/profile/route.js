// This file is auto-loaded by functions/routes.js
const requestHandler = require("../shared/handler.js");
const authHandler = require("./authHandler.js");
const profileHandler = require("./handler.js");

module.exports = [
  {
    name: "Login",
    path: "auth/login",
    methods: ["POST"],
    handler: requestHandler(authHandler.loginUser),
  },
  {
    name: "Verify",
    path: "auth/verify",
    methods: ["GET"],
    handler: requestHandler(authHandler.verify),
  },
  {
    name: "GetAttributes",
    path: "attributes/{userId}",
    methods: ["GET"],
    handler: requestHandler(profileHandler.GetAttributes),
  },
  {
    name: "PutAttributes",
    path: "attributes/{userId}",
    methods: ["PUT"],
    handler: requestHandler(profileHandler.PutAttributes),
  },
  {
    name: "CreateProfile",
    path: "profile",
    methods: ["POST"],
    handler: requestHandler(profileHandler.CreateProfile),
  },
  {
    name: "SearchProfile",
    path: "profile",
    methods: ["GET"],
    handler: requestHandler(profileHandler.SearchProfile),
  },
];
