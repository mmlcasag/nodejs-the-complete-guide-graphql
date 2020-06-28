const path = require('path');
const fs = require('fs');

const { validationResult } = require("express-validator");

const Post = require('../models/post');
const User = require('../models/user');
const errorUtils = require('../utils/error');

//////////////////////////////////////////////////////////////////////////////////////////

const clearImage = filePath => {
    if (filePath) {
        filePath = path.join(__dirname, '..', filePath);

        fs.unlink(filePath, err => {
            if (err) {
                // throw new Error('There was an error trying to delete the image');
                console.log(err);
            }
        });
    }
}

//////////////////////////////////////////////////////////////////////////////////////////

module.exports.getPosts = async (req, res, next) => {
    const curPage = req.query.page || 1;
    const perPage = 2;
    
    try {
        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
            .populate('creator')
            .sort({ createdAt: -1}) // order by createdAt desc
            .skip((curPage - 1) * perPage)
            .limit(perPage);
        
        res.status(200).json({ 
            message: 'Posts fetched successfully', 
            posts: posts,
            totalItems: totalItems
        });
    } catch (err) {
        next(errorUtils.handleError(err, 500, 'On getPosts when trying to find all the posts'));
    }
};

//////////////////////////////////////////////////////////////////////////////////////////

module.exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId).populate('creator');
        
        if (!post) {
            errorUtils.throwNewError('Could not find post', 404);
        }
        
        res.status(200).json({
            message: 'Post fetched successfully',
            post: post
        });
    } catch (err) {
        next(errorUtils.handleError(err, 500, 'On getPost when trying to findById a post'));
    }
}

//////////////////////////////////////////////////////////////////////////////////////////

module.exports.postPost = async (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        errorUtils.throwNewError('Validation failed, entered data is incorrect', 422, errors.array());
    }
    
    const title = req.body.title;
    const content = req.body.content;
    
    let imageUrl;

    if (req.file) {
        imageUrl = req.file.path.replace("\\" ,"/");
    } else if (req.body.image) {
        imageUrl = req.body.image;
    } else if (req.body.imageUrl) {
        imageUrl = req.body.imageUrl;
    }

    if (!imageUrl) {
        errorUtils.throwNewError('Validation failed, image is required', 422, 'Image is required');
    }

    try {
        const post = new Post({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator: req.userId
        });

        await post.save();

        const user = await User.findById(req.userId);
        
        user.posts.push(post);

        await user.save();
        
        res.status(201).json({
            message: 'Post created successfully',
            post: post,
            creator: {
                _id: user._id,
                name: user.name
            }
        });
    } catch (err) {
        next(errorUtils.handleError(err, 500, 'On postPost when trying to save a post'));
    }
}

//////////////////////////////////////////////////////////////////////////////////////////

module.exports.putPost = async (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        errorUtils.throwNewError('Validation failed, entered data is incorrect', 422, errors.array());
    }
    
    const postId  = req.params.postId;
    const title   = req.body.title;
    const content = req.body.content;
    
    let imageUrl;

    if (req.file) {
        imageUrl = req.file.path.replace("\\" ,"/");
    } else if (req.body.image) {
        imageUrl = req.body.image;
    } else if (req.body.imageUrl) {
        imageUrl = req.body.imageUrl;
    }

    try {
        const post = await Post.findById(postId).populate('creator');
        
        if (!post) {
            errorUtils.throwNewError('Could not find post', 404);
        }

        if (post.creator._id.toString() !== req.userId) {
            errorUtils.throwNewError('Authorization failed', 403, 'Users can only update their own posts');
        }
        
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;

        await post.save();

        return res.status(200).json({
            message: 'Post updated successfully',
            post: post
        });
    } catch (err) {
        next(errorUtils.handleError(err, 500, 'On putPost when trying to findById a post'));
    }
}

//////////////////////////////////////////////////////////////////////////////////////////

module.exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId);
        
        if (!post) {
            errorUtils.throwNewError('Could not find post', 404);
        }
        
        if (post.creator.toString() !== req.userId) {
            errorUtils.throwNewError('Authorization failed', 403, 'Users can only delete their own posts');
        }
        
        clearImage(post.imageUrl);
        
        await Post.findByIdAndRemove(postId);
        
        const user = await User.findById(req.userId);

        user.posts.pull(postId);
        
        await user.save();
        
        res.status(200).json({
            message: 'Post deleted successfully'
        });
    } catch(err) {
        next(errorUtils.handleError(err, 500, 'On deletePost when trying to findById a post'));
    }
}