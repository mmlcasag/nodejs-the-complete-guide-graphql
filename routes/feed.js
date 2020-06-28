const express = require('express');

const feedController = require('../controllers/feed');
const authMiddleware = require('../middlewares/auth');
const feedValidator = require('../validators/feed');

const router = express.Router();

router.get('/posts', authMiddleware, feedController.getPosts);
router.post('/post', authMiddleware, feedValidator.postPostValidator, feedController.postPost);
router.get('/post/:postId', authMiddleware, feedController.getPost);
router.put('/post/:postId', authMiddleware, feedValidator.putPostValidator, feedController.putPost);
router.delete('/post/:postId', authMiddleware, feedController.deletePost);

module.exports = router;