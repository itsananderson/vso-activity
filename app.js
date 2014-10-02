var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    api = require('./lib/vso-api'),
    repo = require('./lib/repo'),
    config = require('./lib/config');

var express = require('express');
var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'vso-activity',
    serializers: bunyan.stdSerializers,
    streams: [
        {
            level: 'error',
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

var app = express();

var activity = [];

function updateActivity() {
    api.repositories(config.vsoUrl, config.username, config.password, function(err, repositories) {
        if (err) throw err;

        function upsert(cb) {
            repo.upsert(repositories, config.username, config.password, config.basePath, logger, function (err) {
                if (err) cb(err);
                logger.info("Done upserting");
                cb(null);
            });
        }

        function commits(err) {
            if (err) throw err;
            repo.commits(repositories, config.basePath, logger, function(err, branches) {
                if (err) throw err;
                activity = branches;
            });
        }

        config.skipUpsert ? commits() : upsert(commits);
    });
}

if (process.argv[2] === 'upsert') {
    require('./upsert')();
} else if (process.argv[2] === 'branches') {
    require('./branches')();
} else {

    updateActivity();

    logger.info(config.updateInterval);
    setInterval(updateActivity, config.updateInterval);

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
        var since = parseInt(req.query.since || (new Date().getTime()/1000) - (60*60*24*7));
        var author = req.query.author || '';
        var token = req.cookies.auth_token || req.headers.auth_token;
        if (!token || -1 === config.tokens.indexOf(token)) {
            res.send(401, 'You need to provide an auth token');
        } else {
            res.send(activity.map(function(repo) {
                var filteredCommits = _.values(repo.commits).filter(function (commit) {
                    return -1 !== commit.Author.Email.indexOf(author) && new Date(commit.Author.When).getTime() / 1000 > since
                });
                return {
                    project: repo.project,
                    repository: repo.repository,
                    commits: _.zipObject(filteredCommits.map(function(c) { return c.Sha }), filteredCommits)
                };
            }).filter(function(repo) {
                return _.keys(repo.commits).length > 0;
            }));
        }
    });

    app.get('/api/get-vso-url', function(req, res) {
        res.send({url: config.vsoUrl});
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
