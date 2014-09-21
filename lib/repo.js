var fs = require('fs'),
    path = require('path'),
    repo = require('edge-git').repository;

function upsert(repositories, username, password, basePath, cb) {
    var index = 0;

    (function cloneNext() {
        if (repositories.length === index) {
            return cb();
        }
        var repository = repositories[index];
        index++;
        var dir = path.join(basePath, repository.project.name, repository.name);
        console.log(repository.project.name + '\t' + repository.name + ' => ' + repository.remoteUrl);
        if (fs.existsSync(dir)) {
            return new repo(path.join(dir, '.git')).NetworkSync()
                .Fetch('origin', { credentials: { username: username, password: password } }, function(err, result) {
                    if (err) cb(err);
                    console.log("Done fetching " + repository.project.name + '/' + repository.name);
                    cloneNext();
                });
        } else {
            return repo.Clone(repository.remoteUrl.replace(' ', '%20'), dir, { credentials: { username: username, password: password } }, function(err, result) {
                if (err) cb(err);
                console.log("done cloning " + repository.project.name + '/' + repository.name);
                cloneNext();
            });
        }
    })();
}

function branches(repositories, basePath, cb) {
    cb(undefined, repositories.map(function(repository) {
        return {
            project: repository.project.name,
            repository: repository.name,
            branches: new repo(path.join(basePath, repository.project.name, repository.name)).BranchesSync().map(function (b) {
                return b.Name;
            })
        }
    }));
}

module.exports = {
    upsert: upsert,
    branches: branches
};