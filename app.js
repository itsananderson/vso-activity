var fs = require('fs'),
    path = require('path'),
    api = require('./lib/vso-api'),
    repo = require('./lib/repo');

var express = require('express');
var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'vso-activity',
    serializers: bunyan.stdSerializers,
    streams: [
        {
            level: 'info',
            stream: process.stdout
        },
        {
            level: 'error',
            path: path.join(__dirname, 'error.log')
        },
        {
            level: 'info',
            path: path.join(__dirname, 'info.log')
        }
    ]
});
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var username = process.env.VSOUserName;
var password = process.env.VSOPassword;
var vsoUrl = process.env.VSOUrl; // https://foo.visualstudio.com/DefaultCollection/
var tokens = process.env.AUTH_TOKENS ? process.env.AUTH_TOKENS.split(',') : [];
var basePath = path.join(__dirname, 'workspace');

var app = express();

var activity = [];

function updateActivity() {
    api.repositories(vsoUrl, username, password, function(err, repositories) {
        if (err) throw err;

        function upsert(cb) {
            repo.upsert(repositories, username, password, basePath, logger, function (err) {
                if (err) cb(err);
                logger.info("Done upserting");
                cb(null);
            });
        }

        function commits(err) {
            if (err) throw err;
            repo.commits(repositories, basePath, logger, function(err, branches) {
                if (err) throw err;
                activity = branches;
            });
        }

        //upsert(commits);
        // To just do commits
        commits();
    });
}

updateActivity();

var updateInterval = (parseInt(process.env.UPDATE_INTERVAL) || 5 ) * 60 * 1000;
logger.info(updateInterval);
setInterval(updateActivity, updateInterval);

if (process.argv[2] === 'upsert') {
    api.repositories(vsoUrl, username, password, function(err, repositories) {
        if (err) throw err;
        repo.upsert(repositories, username, password, basePath, function (err) {
            if (err) throw err;
            logger.info("Done upserting");
        });
    });
} else if (process.argv[2] === 'branches') {
    api.repositories(vsoUrl, username, password, function(err, repositories) {
        if (err) throw err;
        repo.branches(repositories, basePath, function(err, branches) {
            if (err) throw err;
            logger.info(branches);
        });
    });
} else {

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    // uncomment after placing your favicon in /public
    //app.use(favicon(__dirname + '/public/favicon.ico'));
    app.use(function(req, res, next) {
        logger.info({req:req});
        next();
    });
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/api/get-activity', function(req, res) {
        var token = req.cookies.auth_token || req.headers.auth_token;
        if (!token || -1 === tokens.indexOf(token)) {
            res.send(401, 'You need to provide an auth token');
        } else {
            res.send(activity);
        }
    });

    app.get('/api/get-vso-url', function(req, res) {
        res.send({url: vsoUrl});
    });

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

    app.listen(process.env.PORT || 3000);
}
