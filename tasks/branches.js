var api = require('../lib/vso-api'),
    config = require('../lib/config');

module.exports = function branches() {
    api.repositories(config.vsoUrl, config.username, config.password, function (err, repositories) {
        if (err) throw err;
        repo.branches(repositories, config.basePath, function (err, branches) {
            if (err) throw err;
            logger.info(branches);
        });
    });
};
