const Joi = require("joi");
const { uuidSchema } = require("../shared/schema/commonSchema");

const sendFollowUpSchema = Joi.object({
  profileId: uuidSchema.required(),
  newQuestionId: uuidSchema.required(),
  question: Joi.array()
    .items(
      Joi.object({
        questionId: uuidSchema.required(),
        option: Joi.array().items(Joi.string().required()).required(),
      })
    )
    .required(),
  isSave: Joi.boolean().required(),
});

module.exports = sendFollowUpSchema;
