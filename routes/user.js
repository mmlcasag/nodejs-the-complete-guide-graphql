const express = require('express');

const userController = require('../controllers/user');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/status', authMiddleware, userController.getUserStatus);
router.patch('/status', authMiddleware, userController.patchUserStatus);

module.exports = router;