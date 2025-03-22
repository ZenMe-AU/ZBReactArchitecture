const Joi = require("joi");
const { uuidSchema } = require("../../shared/schema/commonSchema");

const sendFollowUpSchema = Joi.object({
  profile_id: uuidSchema.required(),
  new_question_id: uuidSchema.required(),
  question: Joi.array()
    .items(
      Joi.object({
        question_id: uuidSchema.required(),
        option: Joi.array().items(Joi.string().required()).required(),
      })
    )
    .required(),
  save: Joi.boolean().required(),
});

module.exports = sendFollowUpSchema;
