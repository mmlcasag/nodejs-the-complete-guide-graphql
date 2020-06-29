const bcrypt = require('bcryptjs');
const validator = require('validator');

const User = require('../models/user');
const { create } = require('../models/user');

module.exports = {
    createUser: async function(args, req) {
        const errors = [];
        
        if (validator.isEmpty(args.userInput.name)) {
            errors.push({ message: 'Name is required'});
        }
        if (!validator.isLength(args.userInput.name, { min: 5 })) {
            errors.push({ message: 'Name must be at least 5 characters long'});
        }
        if (validator.isEmpty(args.userInput.email)) {
            errors.push({ message: 'E-mail is required'});
        }
        if (!validator.isEmail(args.userInput.email)) {
            errors.push({ message: 'Please enter a valid e-mail address'});
        }
        if (validator.isEmpty(args.userInput.password)) {
            errors.push({ message: 'Password is required'});
        }
        if (!validator.isLength(args.userInput.password, { min: 5 })) {
            errors.push({ message: 'Password must be at least 5 characters long'});
        }
        
        if (errors.length > 0) {
            throw new Error('Invalid input');
        }
        
        const email = args.userInput.email;
        const name = args.userInput.name;
        const password = args.userInput.password;
        const hashedPassword = await bcrypt.hash(password, 12);

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            throw new Error('User exists already');
        }

        const user = new User({
            name: name,
            email: email,
            password: hashedPassword
        });

        const createdUser = await user.save();
        return {
            ...createdUser._doc,
            _id: createdUser._id.toString()
        }
    }
}