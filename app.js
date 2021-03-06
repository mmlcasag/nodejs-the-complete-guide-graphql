// npm install graphql --save
// npm install express-graphql --save

const path = require('path');

const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const graphqlHttp = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

const authMiddleware = require('./middlewares/auth');
const fileUtils = require('./utils/file');

const app = express();

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        callback(null, true);
    } else {
        callback(null, false);
    }
}

app.use(bodyparser.json());
app.use(multer({ storage: storage, fileFilter: fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // workaround to work with graphql
    // the browser sends some random OPTIONS methods
    // and graphql blocks any OPTIONS request method by default
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// how to validate the token
app.use(authMiddleware);

// uploading files
// graphql only supports json
// so the way to go is to use a rest api to upload the file
// then return the path
// then request again via graphql passing the path as the argument
app.put('/post-image', (req, res, next) => {
    if (!req.isAuth) {
        const error = new Error('Not authenticated');
        error.code = 401;
        throw error;
    }

    if (!req.file) {
        return res.status(200).json({ message: 'No file provided' });
    }

    if (req.body.oldPath) {
        fileUtils.clearImage(req.body.oldPath);
    }
    
    return res.status(201).json({ 
        message: 'File uploaded successfully', 
        filePath: req.file.path.replace("\\" ,"/")
    });
});

// this is our only route: /graphql
// we use app.use so we can use our visual tool graphiql which makes a GET request
// and also for our API to work, which requires always POST requests
app.use('/graphql', graphqlHttp({
    // this is required
    schema: graphqlSchema,
    // this is required
    rootValue: graphqlResolver,
    // visual tool
    // here we specify whether or not our project should use the visual tool
    // it is interesting because it automatically creates a documentation of all our queries and mutations
    // this is not required
    graphiql: true,
    // error handling
    // here we specify how the error object should look like
    // this is not required
    customFormatErrorFn(err) {
        if (!err.originalError) {
            return err;
        }
        const data = err.originalError.data;
        const message = err.message || 'An error occurred';
        const code = err.originalError.code || 500;
        return { 
            status: code,
            message: message,
            data: data
        }
    }
}));

mongoose.connect('mongodb+srv://admin:admin@mmlcasag-cvtew.mongodb.net/udemy-rest-api', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(result => {
        app.listen(8080);
    })
    .catch(err => {
        console.log(err);
    });