const User = require('../models/user');

const errorUtils = require('../utils/error');

module.exports.getUserStatus = async (req, res, next) => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId)

        if (!user) {
            errorUtils.throwNewError('Validation failed', 404, 'The request user was not found');
        }

        res.status(200).json({
            message: 'User data fetched successfully',
            status: user.status
        });
    } catch (err) {
        errorUtils.handleError(err, 500, 'On getUserStatus at User.findById');
    }
}

module.exports.patchUserStatus = async (req, res, next) => {
    const userId = req.userId;
    const status = req.body.status;

    if (!status) {
        errorUtils.throwNewError('Validation failed', 422, 'Status is required');
    }

    try {
        const user = await User.findById(userId)
        
        if (!user) {
            errorUtils.throwNewError('Validation failed', 404, 'The request user was not found');
        }

        user.status = status;
        
        await user.save();
        
        res.status(200).json({
            message: 'User status updated successfully',
            status: status
        });
    } catch (err) {
        errorUtils.handleError(err, 500, 'On getUserStatus at User.findById');
    }
}