const { getById } = require("../service/profileService");
const { generateToken, decode } = require("../service/utils/authUtils");

/**
 * @swagger
 * /api/auth/login:
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
  const { userId } = request.params;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const profile = await getById(userId);

  if (!profile) {
    return res.status(404).json({ error: "User not found" });
  }

  // Generate JWT
  const token = generateToken({ profileId: profile.id });

  return { jsonBody: { return: { token } } };
}

/**
 * @swagger
 * /api/auth/verify:
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
  const authorization = request.headers.get("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authorization.split(" ")[1];
  const decoded = decode(token);

  if (!decoded.profileId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const profile = await getById(decoded.profileId);
  if (!profile) {
    return res.status(404).json({ error: "User not found" });
  }

  return { jsonBody: { detail: profile } };
}

module.exports = { loginUser, verify };
