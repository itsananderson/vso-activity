var _ = require('lodash'),
    fs = require('fs'),
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
    var branches = repo(path.join(basePath, repository.project.name, repository.name)).BranchesSync();
    delete branches['master'];
    cb(undefined, repositories.map(function(repository) {
        return {
            project: repository.project.name,
            repository: repository.name,
            branches: Object.keys(branches).filter(function(b) {
                return b !== "master"
            })
        };
    }));
}

function commits(repositories, basePath, cb) {
    cb(undefined, repositories.map(function(repository) {
        console.log("loading commits for " + repository.project.name + " " + repository.name);
        var commits = {};
        var branches = new repo(path.join(basePath, repository.project.name, repository.name)).BranchesSync();
        delete branches['master'];
        _.values(branches).forEach(function(branch) {
            branch.CommitsSync().forEach(function(commit) {
                commits[commit.Sha] = commit;
            });
        });
        return {
            project: repository.project.name,
            repository: repository.name,
            commits: commits
        };
    }));
    console.log("done loading commits");
}

module.exports = {
    upsert: upsert,
    branches: branches,
    commits: commits
};