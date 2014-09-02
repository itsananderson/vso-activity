var git = require('nodegit'),
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
    return execPromise('git clone ' + url + ' ' + path);
}

function update(path, remote) {
    shell.cd(path);
    return execPromise('git fetch ' + remote);
}

module.exports = {
    clone: clone,
    update: update
};