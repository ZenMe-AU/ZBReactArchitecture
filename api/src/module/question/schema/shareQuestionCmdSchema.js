const Joi = require("joi");
const { uuidSchema } = require("../../shared/schema/commonSchema");

const shareQuestionSchema = Joi.object({
  newQuestionId: uuidSchema.required(),
  profileId: uuidSchema.required(),
  receiverIds: Joi.array().items(uuidSchema.required()).min(1).required(),
  correlationId: uuidSchema,
});

module.exports = shareQuestionSchema;
