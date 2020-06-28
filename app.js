const path = require('path');

const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const authRoutes = require('./routes/auth');
const feedRoutes = require('./routes/feed');
const userRoutes = require('./routes/user');

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
    next();
});

app.use('/auth', authRoutes);
app.use('/feed', feedRoutes);
app.use('/user', userRoutes);

app.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message;
    const details = error.details || null;
    
    res.status(status).json({ message: message, details: details });
});

mongoose.connect('mongodb+srv://admin:admin@mmlcasag-cvtew.mongodb.net/udemy-rest-api', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(result => {
        const server = app.listen(8080);
        
        // WEBSOCKETS & Socket.io
        //
        // how to install it?
        // npm install --save socket.io
        //
        // how to use it?
        // when we start our server
        // we also want to establish a websocket connection
        // the line below returns a function which receives as an argument
        // the http server defined above
        // so how do we do that?
        // we need to create a const and pass it as an argument to the socket.io
        const io = require('./sockets').init(server);
        // this sets up socket.io
        // and here we can see that websockets builds up upon http
        // that's why we need to pass the http server as an argument

        // now we need to register the event listeners
        // the first one being whenever a client connects on our server
        io.on('connection', socket => {
            console.log('Client connected');
        });
    })
    .catch(err => {
        console.log(err);
    });