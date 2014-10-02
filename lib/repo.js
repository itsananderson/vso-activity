var _ = require('lodash'),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),
    repo = require('edge-git').repository;

function upsert(repositories, username, password, basePath, logger, cb) {
    var index = 0;

    (function cloneNext() {
        if (repositories.length === index) {
            return cb();
        }
        var repository = repositories[index];
        index++;
        var dir = path.join(basePath, repository.project.name, repository.name);
        logger.info(repository.project.name + '\t' + repository.name + ' => ' + repository.remoteUrl);
        if (fs.existsSync(dir)) {
            return new repo(path.join(dir, '.git')).NetworkSync()
                .Fetch('origin', { credentials: { username: username, password: password } }, function(err, result) {
                    if (err) cb(err);
                    logger.info("Done fetching " + repository.project.name + '/' + repository.name);
                    cloneNext();
                });
        } else {
            return repo.Clone(repository.remoteUrl.replace(' ', '%20'), dir, { credentials: { username: username, password: password } }, function(err, result) {
                if (err) cb(err);
                logger.info("done cloning " + repository.project.name + '/' + repository.name);
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
            branches: Object.keys(branches)
        };
    }));
}

function commits(repositories, basePath, logger, cb) {
    var loaders = repositories.map(function(repository) {
        return function(asyncCb) {
            var allCommits = {};
            var branches = new repo(path.join(basePath, repository.project.name, repository.name)).BranchesSync();
            delete branches['master'];
            var masterTip = null;
            if (branches['origin/master']) {
                masterTip = branches['origin/master'].TipSync().Sha;
            }
            async.parallel(_.values(branches).map(function(branch) {
                logger.info("loading commits for " + repository.project.name + " " + repository.name + " " + branch.Name);
                return function(innerAsyncCb) {
                    var thisMasterTip = branch.Name === 'origin/master' ? null : masterTip;
                    branch.Commits(thisMasterTip, function(err, commits) {
                        if (err) innerAsyncCb(err);
                        logger.info(repository.project.name + " " + repository.name + " " + branch.Name + " " + commits.length);
                        commits.forEach(function (commit) {
                            allCommits[commit.Sha] = {
                                Sha: commit.Sha,
                                Author: commit.Author,
                                MessageShort: commit.MessageShort
                            };
                        });
                        innerAsyncCb(null);
                    });
                }
            }), function(err) {
                if (err) asyncCb(err);
                asyncCb(null, {
                    project: repository.project.name,
                    repository: repository.name,
                    commits: allCommits
                });
            });
        }
    });

    async.parallel(loaders, function(err, results) {
        if (err) cb(err);

        cb(null, results);
    });
}

module.exports = {
    upsert: upsert,
    branches: branches,
    commits: commits
};