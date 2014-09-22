var fs = require('fs'),
    path = require('path'),
    api = require('./lib/vso-api'),
    repo = require('./lib/repo');

var username = process.env.VSOUserName;
var password = process.env.VSOPassword;
var vsoUrl = process.env.VSOUrl;

var basePath = path.join(__dirname, 'workspace');

if (process.argv[2] === 'upsert') {
    api.repositories(vsoUrl, username, password, function(err, repositories) {
        if (err) throw err;
        repo.upsert(repositories, username, password, basePath, function (err) {
            if (err) throw err;
            console.log("Done upserting");
        });
    });
}

if (process.argv[2] === 'branches') {
    api.repositories(vsoUrl, username, password, function(err, repositories) {
        if (err) throw err;
        repo.branches(repositories, basePath, function(err, branches) {
            if (err) throw err;
            console.log(branches);
        });
    });
}
