// Dependencies
const compression = require('compression');
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");
const path = require('path');
const assert = require('assert');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
    // require('babel-register')({
    //     ignore: /\/(build|node_modules)\//,
    //     presets: ['env', 'react-app']
    // });
}

// set Mongoose promises to es6 promises
mongoose.Promise = Promise;
// Initialize Express Server
const app = express();
// Specify the port.
var port = process.env.PORT || 3001;
//support gzip
app.use(compression());
// Use morgan for logs 
app.use(logger("dev"));
//body parser for routes our app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

app.set('port', port);

// MongoDB
var uri = process.env.MLAB_URI;

//connect to mongodb//set controllers and sockets here to have access to DB
mongoose.connect(uri, { useMongoClient: true })
const db = mongoose.connection;
mongoose.set('debug', true);
db.on('error', console.error.bind(console, '# Mongo DB: connection error:'));

//add session support
app.set('trust proxy', 1) // trust first proxy
const month = 1000 * 60 * 60 * 24 * 31;
app.use(cookieParser());
app.use(session({
    secret: 'twentythree@#@#2323',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: month },
    store: new MongoStore({ mongooseConnection: db })
}));

//middleware to display session data in console - remove for production
if (process.env.NODE_ENV !== 'production') {
    //log SESSION
    app.use(function(req, res, next) {
        console.log('');
        console.log('*************SESSION MIDDLEWARE***************');
        console.log(req.session);
        console.log('');
        console.log('Logged In: ');
        console.log('__________ ' + req.isAuthenticated());
        console.log('**********************************************');
        console.log('');
        next();
    });
    //enable CORS
    app.use(cors());
}

app.use(express.static(path.join(__dirname, 'client/public/index.html')));

app.post('/auth/twitter/callback', function(req, res) {
    console.log({ twitterCallbackParams: req.params });
});

require('./Nonce')().then(function(oauth_nonce) {
    console.log({ oauth_nonce: oauth_nonce });

    const axios = require('axios');
    const moment = require('moment');
    const percentalizedURIComponent = require('./percentalize');

    const oauth_url = 'https://api.twitter.com/oauth/request_token'
    const oauth_method = 'POST';
    const oauth_callback = process.env.TWITTER_CALLBACK;
    const oauth_consumer_key = process.env.TWITTER_CONSUMER_KEY;
    const oauth_signature_method = 'HMAC-SHA1';
    const oauth_timestamp = parseInt(moment.now() / 1000);
    const oauth_version = '1.0';
    const oauth_signature = require('./Signature')(oauth_url, oauth_method, [process.env.TWITTER_CONSUMER_SECRET], { oauth_callback, oauth_consumer_key, oauth_nonce, oauth_signature_method, oauth_timestamp, oauth_version });

    console.log({ oauth_signature: oauth_signature });

    axios({
        method: oauth_method,
        url: oauth_url,
        headers: {
            Authorization: "OAuth oauth_callback=\"" +
                percentalizedURIComponent(oauth_callback) + "\", oauth_consumer_key=\"" +
                percentalizedURIComponent(oauth_consumer_key) + "\", oauth_nonce=\"" +
                percentalizedURIComponent(oauth_nonce) + "\", oauth_signature_method=\"" +
                percentalizedURIComponent(oauth_signature_method) + "\", oauth_timestamp=\"" +
                percentalizedURIComponent(oauth_timestamp) + "\", oauth_version=\"" +
                percentalizedURIComponent(oauth_version) + "\", oauth_signature=\"" +
                percentalizedURIComponent(oauth_signature) + "\""
        }
    }).then(function(response) {
        console.log({ tokenResponse: response })
    }).catch(function(error) {
        console.error({ twitterTokenError: error })
    });

}).catch(function(err) { console.error({ createSignatureError: err }) });

const server = app.listen(app.get('port'), function() {
    console.log(`App running on ${app.get('port')}`);
});