const { body } = require('express-validator');

const User = require('../models/user');

module.exports.postSignupValidator = [
    body('name')
        .trim()
        .not().isEmpty().withMessage('Name is required').bail()
        .isLength({ min: 5 }).withMessage('Name must be at least 5 characters long').bail(),
    body('email')
        .trim()
        .not().isEmpty().withMessage('E-mail is required').bail()
        .isEmail().withMessage('Please enter a valid e-mail address').bail()
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(user => {
                    if (user) {
                        return Promise.reject('E-mail address already exists');
                    }
                })
        }).bail()
        .normalizeEmail(),
    body('password')
        .trim()    
        .not().isEmpty().withMessage('Password is required').bail()
        .isLength({ min: 5 }).withMessage('Password must be at least 5 characters long').bail()
];

module.exports.postLoginValidator = [
    body('email')
        .trim()
        .not().isEmpty().withMessage('E-mail is required').bail()
        .isEmail().withMessage('Please enter a valid e-mail address').bail()
        .normalizeEmail(),
    body('password')
        .trim()    
        .not().isEmpty().withMessage('Password is required').bail()
        .isLength({ min: 5 }).withMessage('Password must be at least 5 characters long').bail()
];