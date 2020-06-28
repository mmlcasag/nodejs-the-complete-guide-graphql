module.exports.handleError = (err, status, details) => {
    if (!err.status) {
        err.status = status;
    }
    if (!err.details) {
        err.details = details;
    }
    return err;
}

module.exports.throwNewError = (message, status, details) => {
    const error = new Error(message);
    if (status) {
        error.status = status;
    }
    if (details) {
        error.details = details
    }
    throw error;
}