const Joi = require("joi");
const { uuidSchema } = require("./commonSchema");

const sendFollowUpSchema = Joi.object({
  profileId: uuidSchema.required(),
  questionIdList: Joi.array().items(uuidSchema.required()).min(1).required(),
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
