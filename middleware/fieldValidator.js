const { check, validationResult } = require('express-validator');

const checkAddUser = [

  check('userType').notEmpty().isIn(['client', 'developer']),

  check('email').notEmpty().withMessage('email is required'),
  check('email').isEmail().withMessage('email is not valid'),

  check('password').notEmpty().withMessage('password is required'),
  check('password').isLength({ min: 8 }).withMessage('password must be at least 8 characters'),

  check('userName').notEmpty().withMessage('userName is required'),
  check('userName').not().custom((val) => /[^A-za-z0-9\s]/g.test(val)).withMessage('userName can not use unique characters'),

  check('phoneNumber').trim().isNumeric().withMessage('phone number must be numeric.'),
  check('phoneNumber').bail().isLength({ max: 12, min: 7 }).withMessage('phone number must be at least 10 digits long.').bail()

]

const checkLoginUser = [

  check('userName').notEmpty().withMessage('userName is required'),
  check('userName').not().custom((val) => /[^A-za-z0-9\s]/g.test(val)).withMessage('userName can not use unique characters'),

  check('password').notEmpty().withMessage('password is required'),
  check('password').isLength({ min: 8 }).withMessage('password must be at least 8 characters')

]

const checkAddProject = [
  check('technologies').notEmpty().withMessage('Add required technologies'),
  check('credentials').notEmpty().withMessage('Add credentials of the project'),
  check('details').notEmpty().withMessage('Add project details'),
  check('duration').notEmpty().withMessage('Add project duration'),
  check('projectName').notEmpty().withMessage('Add project name')
]

const checkAddClient = [

  check('businessCategory').notEmpty().withMessage('add business category'),
  check('companyName').notEmpty().withMessage('add company name'),
  check('ledgerName').notEmpty().withMessage('add ledgername'),

  check('mobileNum').trim().isNumeric().withMessage('mobile number must be numeric.'),
  check('mobileNum').bail().isLength({ max: 15, min: 10 }).withMessage('mobile number must be at least 10 digits long.').bail(),

  check('contactNum').trim().isNumeric().withMessage('contact number must be numeric.'),
  check('contactNum').bail().isLength({ max: 12, min: 7 }).withMessage('contact number must be at least 10 digits long.').bail(),

  check('address').notEmpty().withMessage('add address'),

  check('countryName').notEmpty().withMessage('add country name'),
  check('countryName').not().custom((val) => /[^a-zA-Z]/gi.test(val)).withMessage('country name cannot include unique character'),

  check('stateName').notEmpty().withMessage('add state name'),
  check('stateName').not().custom((val) => /[^a-zA-Z]/gi.test(val)).withMessage('state name cannot include unique character'),

  check('cityName').notEmpty().withMessage('add city name'),
  check('cityName').not().custom((val) => /[^a-zA-Z]/gi.test(val)).withMessage('city name cannot include unique character'),

  check('pinCode').trim().isNumeric().withMessage('pincode must be numeric.')
]

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  return res.status(422).json({
    errors: extractedErrors
  })
}

module.exports = {
  validate,
  checkAddUser,
  checkLoginUser,
  checkAddProject,
  checkAddClient
}
