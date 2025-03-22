const { app } = require("@azure/functions");
const authHandler = require("../module/profile/authHandler.js");
const profileHandler = require("../module/profile/profileHandler.js");

app.http("Login", {
  route: "auth/login",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: authHandler.loginUser,
});

app.http("Verify", {
  route: "auth/verify",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: authHandler.verify,
});

app.http("GetAttributes", {
  route: "attributes/{userId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: profileHandler.GetAttributes,
});

app.http("PutAttributes", {
  route: "attributes/{userId}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: profileHandler.PutAttributes,
});

app.http("CreateProfile", {
  route: "profile",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: profileHandler.CreateProfile,
});

app.http("SearchProfile", {
  route: "profile",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: profileHandler.SearchProfile,
});
