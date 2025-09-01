const Profile = require("../service/profileService");
const { generateToken, decode } = require("@zenmechat/shared/service/authUtils");

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login and retrieve a JWT token
 *     description: Authenticate the user by their ID and return a JWT token if the user exists.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The unique ID of the user
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: Successful login, returns a JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The generated JWT token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
async function loginUser(request, context) {
  const { userId } = request.clientParams;
  if (!userId) {
    const err = new Error("User ID is required");
    err.statusCode = 400;
    throw err;
  }

  const profile = await Profile.getProfileById(userId);

  if (!profile) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  // Generate JWT
  const token = generateToken({ profileId: profile.id });

  return { return: { token } };
}

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Verify a JWT token
 *     description: Validates the provided JWT token from the Authorization header and retrieves the associated user profile details.
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         required: true
 *         description: Bearer token for authentication
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9maWxlSWQiOjI0OCwiaWF0IjoxNzM2NzAxNDY3LCJleHAiOjE3MzY3MDUwNjd9.Sam1Y8kjR7rnoU4Xi421uVWr8PlVH698cJhnvSs-3no"
 *     responses:
 *       200:
 *         description: Token successfully verified and user details returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 detail:
 *                   type: object
 *                   description: The user profile associated with the token
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The unique ID of the user
 *                       example: "12345"
 *                     name:
 *                       type: string
 *                       description: The name of the user
 *                       example: "John Doe"
 *                     avatar:
 *                       type: string
 *                       description: The URL of the user's avatar
 *                       example: "https://example.com/avatar.jpg"
 */
async function verify(request, context) {
  try {
    const authorization = request.headers.get("authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }
    const token = authorization.split(" ")[1];
    const decoded = decode(token);

    if (!decoded.profileId) {
      const err = new Error("User ID is required");
      err.statusCode = 400;
      throw err;
    }

    const profile = await Profile.getProfileById(decoded.profileId);
    if (!profile) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    return { return: { detail: profile } };
  } catch (error) {
    context.log("in");
    return { status: 401 };
  }
}

module.exports = { loginUser, verify };
