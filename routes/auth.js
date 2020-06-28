const express = require('express');

const authController = require('../controllers/auth');
const authValidator = require('../validators/auth');

const router = express.Router();

router.post('/signup', authValidator.postSignupValidator, authController.postSignup);
router.post('/login', authValidator.postLoginValidator, authController.postLogin);

module.exports = router;