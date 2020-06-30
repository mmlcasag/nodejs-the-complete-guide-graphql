const path = require('path');
const fs = require('fs');

module.exports.clearImage = filePath => {
    if (filePath) {
        filePath = path.join(__dirname, '..', filePath);

        fs.unlink(filePath, err => {
            if (err) {
                console.log(err);
            }
        });
    }
}