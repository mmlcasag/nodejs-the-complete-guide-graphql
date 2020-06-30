const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const header = req.headers.authorization;
    
    if (!header) {
        req.isAuth = false;
        return next();
    }

    const parts = header.split(' ');

    if (parts.length !== 2) {
        req.isAuth = false;
        return next();
    }

    const prefix = parts[0];
    const token  = parts[1];

    if (prefix !== 'Bearer') {
        req.isAuth = false;
        return next();
    }

    let decodedToken;
    
    try {
        decodedToken = jwt.verify(token, 'super-ubber-dubber-secret-key');
    } catch (err) {
        req.isAuth = false;
        return next();
    }

    if (!decodedToken) {
        req.isAuth = false;
        return next();
    }

    req.userId = decodedToken.userId;
    req.isAuth = true;
    
    next();
}