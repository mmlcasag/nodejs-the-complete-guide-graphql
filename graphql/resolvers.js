const bcrypt = require('bcryptjs');

const User = require('../models/user');
const { create } = require('../models/user');

module.exports = {
    createUser: async function(args, req) {
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