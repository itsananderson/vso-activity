var mkdirp = require('mkdirp'),
    q = require('q');

var shell = require('shelljs');

function execPromise(command, options) {
    options = options || {silent: true};
    var deferred = q.defer();
    shell.exec(command, options, function(code, output) {
        if (code !== 0) {
            deferred.reject(new Error('Command "' + command + '" exited with code ' + code + '\n' + output));
        }
        deferred.resolve(output);
    });
    return deferred.promise;
}

function clone(url, path) {
    mkdirp.sync(path);
    shell.cd(path);
    return execPromise('sh -c "git clone \'' + url.replace(' ', '%20') + "' .\"", {silent: false});
}

function update(path, remote) {
    shell.cd(path);
    return execPromise('git fetch ' + remote);
}

function listBranches(path) {
    shell.cd(path);
    return execPromise('git branch -r').then(function(paths) {
        return paths.replace(/ *origin\//g, '').split(/\r?\n/).filter(function(item) {
            return item.length && !/HEAD ->.+/.test(item);
        });
    });
}

module.exports = {
    clone: clone,
    update: update,
    listBranches: listBranches
};