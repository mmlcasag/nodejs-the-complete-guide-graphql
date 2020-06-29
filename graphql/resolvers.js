const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');
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
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
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


    ,


    login: async function({ email, password }) {
        const user = await User.findOne({ email: email});
        if (!user) {
            const error = new Error ('E-mail address does not exist');
            error.code = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Invalid password');
            error.code = 401;
            throw error;
        }

        const token = jwt.sign({ userId: user._id.toString(), email: user.email }, 'super-ubber-dubber-secret-key', { expiresIn: '1h' });

        return {
            userId: user._id.toString(),
            token: token
        }
    }


    ,


    createPost: async function({ postInput }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated');
            error.code = 401;
            throw error;
        }
        
        const user = await User.findById(req.userId);

        if (!user) {
            const error = new Error('Invalid user');
            error.code = 401;
            throw error;
        }

        const errors = [];

        if (validator.isEmpty(postInput.title)) {
            errors.push({ message: 'Title is required'});
        }
        if (!validator.isLength(postInput.title, { min: 5 })) {
            errors.push({ message: 'Title must be at least 5 characters long'});
        }
        if (validator.isEmpty(postInput.content)) {
            errors.push({ message: 'Content is required'});
        }
        if (!validator.isLength(postInput.content, { min: 5 })) {
            errors.push({ message: 'Content must be at least 5 characters long'});
        }

        if (errors.length > 0) {
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const post = new Post({
            title: postInput.title,
            content: postInput.content,
            imageUrl: postInput.imageUrl,
            creator: user
        });
        
        const createdPost = await post.save();
        
        user.posts.push(createdPost);

        await user.save();

        return {
            ...createdPosts._doc,
            _id: createdPost._id.toString(),
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString()
        }
    }
}