const express = require('express');
const mongoose = require('mongoose');
const morganMiddleware = require("./log/src/morganMiddleware");
const logger = require("./log/src/logger");
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(express.static('public'));
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Routes
app.use(require('./routes/views'));
app.use(require('./routes/movement'));

mongoose.set('strictQuery', false);
mongoose.connect(process.env.DB_STRING, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    app.listen(process.env.PORT, () => {
        logger.info(`App listening at http://localhost:${process.env.PORT}`);
    });
});