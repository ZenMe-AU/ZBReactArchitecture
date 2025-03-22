const Profiles = require("../service/profileService.js");
const Attributes = require("../service/attributeService.js");

/**
 * @swagger
 * /api/attributes/{userId}:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get user's attributes
 *     description: Get a list of attributes of a specific user.
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: The id of the user
 *         required: true
 *         schema:
 *           type: string
 *           example: "3"
 *     responses:
 *       200:
 *         description: Successfully retrieved user attributes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     attributes:
 *                       type: array
 *                       description: Array of user attributes
 *                       items:
 *                         type: string
 *                         example: "blond"
 */
async function GetAttributes(request, context) {
  const userId = parseInt(request.params.userId);
  let attributes = await Attributes.getByUser(userId);
  return { jsonBody: { return: { attributes: attributes } } };
}

/**
 * @swagger
 * /api/attributes/{userId}:
 *   put:
 *     tags:
 *       - Profile
 *     summary: Update user's attributes
 *     description: Update the attributes of a specific user.
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: The id of the user
 *         required: true
 *         schema:
 *           type: string
 *           example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attributes:
 *                 type: array
 *                 description: Array of attributes to update for the user
 *                 items:
 *                   type: string
 *                   example: "blond"
 *     responses:
 *       200:
 *         description: Successfully updated user attributes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     attributes:
 *                       type: array
 *                       description: Array of updated user attributes
 *                       items:
 *                         type: string
 *                         example: "blond"
 */
async function PutAttributes(request, context) {
  const userId = parseInt(request.params.userId);
  const bodyText = await request.text();
  const bodyJson = JSON.parse(bodyText);
  let attributes = bodyJson["attributes"];
  let attrData = await Attributes.update(userId, attributes);
  return { jsonBody: { return: { attributes: attrData } } };
}

/**
 * @swagger
 * /api/profile:
 *   post:
 *     tags:
 *       - Profile
 *     summary: Create a new user profile
 *     description: Create a new profile with a name and a list of attributes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the profile
 *                 example: "John Doe"
 *               avatar:
 *                 type: string
 *                 description: The name of the profile pic
 *                 example: "pic/avatar_1.jpg"
 *               attributes:
 *                 type: array
 *                 description: A list of attributes for the profile
 *                 items:
 *                   type: string
 *                 example: ["blond", "tall", "athlete"]
 *     responses:
 *       200:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: The UUID of the created profile
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 */
async function CreateProfile(request, context) {
  const bodyText = await request.text();
  const bodyJson = JSON.parse(bodyText);
  let name = bodyJson["name"];
  let avatar = bodyJson["avatar"] || null;
  let attributes = bodyJson["attributes"] || [];
  let profile = await Profiles.create(name, attributes, avatar);
  return { jsonBody: { return: { id: profile.id } } };
}

/**
 * @swagger
 * /api/profile:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Search for profiles
 *     description: Retrieve profiles matching specific attributes with optional fuzzy search.
 *     parameters:
 *       - name: attributes
 *         in: query
 *         description: Attributes to filter profiles by, separated by commas (e.g., "blond,athlete,tall")
 *         required: false
 *         schema:
 *           type: string
 *           example: "blond,athlete,tall"
 *       - name: fuzzySearch
 *         in: query
 *         description: Enable fuzzy search on attributes by setting this to `true`.
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *     responses:
 *       200:
 *         description: List of profiles matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             description: The UUID of the profile
 *                             example: "550e8400-e29b-41d4-a716-446655440000"
 *                           name:
 *                             type: string
 *                             description: The name of the profile
 *                             example: "John Doe"
 *                           avatar:
 *                             type: string
 *                             description: The path to the user's avatar image
 *                             example: "pic/avatar_1.jpg"
 *                           attributes:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: Attributes of the profile
 *                             example: ["blond", "athlete", "tall"]
 */
async function SearchProfile(request, context) {
  let attributes = null;
  if (request.query.get("attributes")) {
    attributes = request.query.get("attributes").split(",").filter(Boolean);
    if (request.query.get("fuzzySearch") === true || request.query.get("fuzzySearch")?.toLowerCase?.() === "true") {
      attributes = attributes.map((tag) => "%" + tag + "%");
    }
  }
  let profile = await Profiles.getList(null, attributes);
  return { jsonBody: { return: { profile: profile } } };
}

module.exports = {
  GetAttributes,
  PutAttributes,
  CreateProfile,
  SearchProfile,
};
