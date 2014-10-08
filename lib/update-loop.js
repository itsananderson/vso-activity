var api = require('./vso-api'),
    config = require('./config'),
    logger = require('./logger'),
    repo = require('./repo');

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
                process.send({activity: branches});
            });
        }

        config.skipUpsert ? commits() : upsert(commits);
    });
}

updateActivity();

logger.info(config.updateInterval);
setInterval(updateActivity, config.updateInterval);

