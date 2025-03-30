const Joi = require("joi");
const { uuidSchema } = require("../../shared/schema/commonSchema");

const shareQuestionSchema = Joi.object({
  new_question_id: uuidSchema.required(),
  profile_id: uuidSchema.required(),
  receiver_ids: Joi.array().items(uuidSchema.required()).min(1).required(),
  correlationId: uuidSchema,
});

module.exports = shareQuestionSchema;
