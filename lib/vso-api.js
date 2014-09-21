var request = require('request'),
    repo = require('edge-git').repository;

function repositories(vsoUrl, username, password, cb) {
    request.get({url: vsoUrl + '_apis/git/repositories', json: true}, function (err, response, body) {
        cb(undefined, body.value);
    }).auth(username, password, true);
}

module.exports = {
    repositories: repositories
};