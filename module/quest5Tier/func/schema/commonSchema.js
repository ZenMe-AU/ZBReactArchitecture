const Joi = require("joi");

const uuidSchema = Joi.string().guid({ version: ["uuidv4", "uuidv5"] });

module.exports = {
  uuidSchema,
};
