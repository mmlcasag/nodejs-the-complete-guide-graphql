const jwt = require('jsonwebtoken');

const errorUtils = require('../utils/error');

module.exports = (req, res, next) => {
    const header = req.headers.authorization;
    
    if (!header) {
        errorUtils.throwNewError('Authorization failed', 401, 'No token provided');
    }

    const parts = header.split(' ');

    if (parts.length !== 2) {
        errorUtils.throwNewError('Authorization failed', 401, 'Token should be comprised of two parts');
    }

    const prefix = parts[0];
    const token  = parts[1];

    if (prefix !== 'Bearer') {
        errorUtils.throwNewError('Authorization failed', 401, 'Token must have a Bearer prefix');
    }

    let decodedToken;
    
    try {
        decodedToken = jwt.verify(token, 'super-ubber-dubber-secret-key');
    } catch (err) {
        errorUtils.throwNewError('Authorization failed', 401, 'Invalid token');
    }

    if (!decodedToken) {
        errorUtils.throwNewError('Authorization failed', 401, 'Invalid token');
    }

    req.userId = decodedToken.userId;

    next();
}