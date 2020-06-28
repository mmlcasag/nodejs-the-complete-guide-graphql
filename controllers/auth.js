const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require("express-validator");

const User = require('../models/user');
const errorUtils = require('../utils/error');

//////////////////////////////////////////////////////////////////////////////////////////

module.exports.postSignup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            errorUtils.throwNewError('Validation failed, entered data is incorrect', 422, errors.array());
        }

        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const user = new User({
            name: name,
            email: email,
            password: hashedPassword
        });
        
        await user.save();

        res.status(201).json({
            message: 'User created successfully',
            user: user
        });
    } catch (err) {
        next(errorUtils.handleError(err, 500, 'On postSignUp when bcrypting the password'));
    }
}

//////////////////////////////////////////////////////////////////////////////////////////

module.exports.postLogin = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            errorUtils.throwNewError('Validation failed, entered data is incorrect', 422, errors.array());
        }

        const email = req.body.email;
        const password = req.body.password;
        
        const user = await User.findOne({ email: email });

        if (!user) {
            errorUtils.throwNewError('Authentication failed', 401, 'E-mail address does not exist');
        }

        const doMatch = await bcrypt.compare(password, user.password);
        
        if (!doMatch) {
            errorUtils.throwNewError('Authentication failed', 401, 'Invalid password');
        }
        
        const token = jwt.sign({ userId: user._id.toString(), email: user.email }, 'super-ubber-dubber-secret-key', { expiresIn: '1h' });
        
        res.status(200).json({
            message: 'User authenticated successfully',
            token: token,
            userId: user._id.toString()
        });
    } catch (err) {
        next(errorUtils.handleError(err, 500, 'On postLogin when trying to findOne user'));
    }
}

//////////////////////////////////////////////////////////////////////////////////////////