var fs = require('fs'),
    path = require('path'),
    repo = require('edge-git').repository,
    request = require('request');

var username = process.env.VSOUserName;
var password = process.env.VSOPassword;
var vsoUrl = process.env.VSOUrl;

console.log(vsoUrl);

var basePath = path.join(__dirname, 'workspace');

if (process.argv[2] === 'upsert') {
    request.get({url: vsoUrl + '_apis/git/repositories', json: true}, function (err, response, body) {
        var index = 0;

        function cloneNext() {
            if (body.value.length === index) {
                return;
            }
            var repository = body.value[index];
            index++;
            var dir = path.join(basePath, repository.project.name, repository.name);
            console.log(repository.project.name + '\t' + repository.name + ' => ' + repository.remoteUrl);
            if (fs.existsSync(dir)) {
                return new repo(path.join(dir, '.git')).NetworkSync()
                    .Fetch('origin', { credentials: { username: username, password: password } }, function(err, result) {
                        if (err) throw err;
                        console.log("Done fetching " + repository.project.name + '/' + repository.name);
                        cloneNext();
                    });
            } else {
                return repo.Clone(repository.remoteUrl.replace(' ', '%20'), dir, { credentials: { username: username, password: password } }, function(err, result) {
                    if (err) throw err;
                    console.log("done cloning " + repository.project.name + '/' + repository.name);
                    cloneNext();
                });
            }
        }

        cloneNext();
    }).auth(username, password, true);
}

if (process.argv[2] === 'branches') {
    request.get({url: vsoUrl + '_apis/git/repositories', json: true}, function (err, response, body) {
        body.value.forEach(function(repository) {
            console.log("branches for " + repository.project.name + '/' + repository.name);
            console.log(new repo(path.join(basePath, repository.project.name, repository.name)).BranchesSync().map(function(b) {
                return b.Name;
            }));
        });
    }).auth(username, password, true);
}
