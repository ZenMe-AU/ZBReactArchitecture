// todo:merge int requestHandler.js
const validate = async (request, schemas) => {
  for (const schema of schemas) {
    const { error, value } = schema.validate(request.clientParams);
    if (error) {
      throw new Error("Validation failed: " + error.details[0].message);
    }
    return value;
  }
};

module.exports = validate;
