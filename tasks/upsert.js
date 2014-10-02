var api = require('../lib/vso-api'),
    config = require('../lib/config');

module.exports = function upsert() {
    api.repositories(config.vsoUrl, config.username, config.password, function(err, repositories) {
        if (err) throw err;
        repo.upsert(repositories, config.username, config.password, config.basePath, function (err) {
            if (err) throw err;
            logger.info("Done upserting");
        });
    });
};
