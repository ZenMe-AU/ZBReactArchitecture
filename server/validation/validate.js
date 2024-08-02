import { validationResult } from 'express-validator'

const myValidationResult = validationResult.withDefaults({
  formatter: error => error.msg,
})

const validate = validations => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req)
      if (result.errors.length) break
    }

    const errors = myValidationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    res.status(400).json({
      status: 'error',
      errors: errors.array(),
    })
  }
}

// module.exports = {
//   validate,
// }

export default validate;