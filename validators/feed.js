const { body } = require('express-validator');

module.exports.postPostValidator = [
    body('title')
        .trim()
        .not().isEmpty().withMessage('Title is required').bail()
        .isLength({ min: 5 }).withMessage('Title must be at least 5 characters long').bail(),
    body('content')
        .trim()
        .not().isEmpty().withMessage('Content is required').bail()
        .isLength({ min: 5 }).withMessage('Content must be at least 5 characters long').bail()
];

module.exports.putPostValidator = [
    body('title')
        .trim()
        .not().isEmpty().withMessage('Title is required').bail()
        .isLength({ min: 5 }).withMessage('Title must be at least 5 characters long').bail(),
    body('content')
        .trim()
        .not().isEmpty().withMessage('Content is required').bail()
        .isLength({ min: 5 }).withMessage('Content must be at least 5 characters long').bail()
];