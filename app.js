const express = require('express');
const mongoose = require('mongoose');
const morganMiddleware = require("./log/src/morganMiddleware");
const logger = require("./log/src/logger");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express')
const AdminJSMongoose = require('@adminjs/mongoose');
const movementModel = require('./models/movement');
const userModel = require('./models/user');
const bcrypt = require('bcrypt');

require('dotenv').config();

const app = express();

AdminJS.registerAdapter(AdminJSMongoose);

const adminJs = new AdminJS({
    resources: [
        {resource: movementModel},
        {resource: userModel,
            options: {
                properties: {
                    encrypted_password: {
                        isVisible: {
                            list: true,
                            edit: true,
                            filter: false,
                            show: true
                        },
                    },
                    password: {
                        type: 'string',
                        isVisible: {
                            // Make password visible in the edit mode.
                            list: false,
                            edit: true,
                            filter: false,
                            show: false,
                        },
                    },
                },
                actions: {
                    new: {
                        // Hash the password.
                        before: async (request) => {
                            if(request?.payload?.password) {
                                request.payload = {
                                    ...request.payload, 
                                    encrypted_password: await bcrypt.hash(request.payload.password, 10),
                                    password: undefined,
                                }
                            }
                            return request
                        }
                    }
                }
            }
        }
    ],
    rootPath: '/admin'
});

const router = AdminJSExpress.buildAuthenticatedRouter(
    adminJs,
    {
        cookieName: 'adminjs',
        cookiePassword: 'complicatedsecurepassword',
        authenticate: async (email, password) => {
            const user = await userModel.findOne({ email });
            if (user) {
                const matched = await bcrypt.compare(password, user.encrypted_password);
                if (matched) {
                    return user;
                }
            }
            return false;
        },
    },
    null,
    // Add configuration required by the express-session plugin.
    {
        resave: false, 
        saveUninitialized: true,
    }
);

// const router = AdminJSExpress.buildRouter(adminJs);
app.use(adminJs.options.rootPath, router);

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
const mongooseDb = mongoose.connect(process.env.DB_STRING, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    app.listen(process.env.PORT, () => {
        logger.info(`App listening at http://localhost:${process.env.PORT}`);
    });
});