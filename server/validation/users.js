import { query } from 'express-validator'

const usersValidation = {
  getUsers: [
    query('datetime')
      .optional()
      .isISO8601()
      .withMessage('must be a date')
      .toDate()
      .withMessage('must be a date'),
    query('interval')
      .optional()
      .isInt()
      .withMessage('interval must be an integer'),
    query('distance')
      .optional()
      .isInt()
      .withMessage('distance must be an integer'),
    query('limited')
      .optional()
      .isInt()
  ],
}


// module.exports = {
//     usersValidation,
//   }
export default usersValidation;