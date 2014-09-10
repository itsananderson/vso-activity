var git = require('nodegit'),
    fs = require('fs'),
    path = require('path'),
    repo = require('./lib/repo'),
    async = require('async'),
    request = require('request');

/*git.Repo.open('./testrepo/.git', function(err, repository) {
    if (err) throw err;

    repository.getMaster(function(err, branch) {
        if (err) throw err;

        var history = branch.history();

        var count = 0;

        history.on("commit", function(commit) {
            // Disregard commits past 9.
            if (++count >= 9) {
                return;
            }

            // Show the commit sha.
            console.log("commit " + commit.sha());

            // Store the author object.
            var author = commit.author();

            // Display author information.
            console.log("Author:\t" + author.name() + " <", author.email() + ">");

            // Show the commit date.
            console.log("Date:\t" + commit.date());

            // Give some space and show the message.
            console.log("\n    " + commit.message());
        });


        history.start();
    });
});*/

var username = process.env.VSOUserName;
var password = process.env.VSOPassword;
var vsoUrl = process.env.VSOUrl;

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
                console.log('update');
                return repo.update(dir, 'origin').then(cloneNext).done();
            } else {
                console.log('clone');
                return repo.clone(repository.remoteUrl, dir).then(cloneNext).done();
            }
        }

        cloneNext();
    }).auth(username, password, true);
}

if (process.argv[2] === 'branches') {
    request.get({url: vsoUrl + '_apis/git/repositories', json: true}, function (err, response, body) {
        body.value.forEach(function(repository) {
            repo.listBranches(path.join(basePath, repository.project.name, repository.name)).then(function(branches) {
                console.log('=============');
                console.log(repository.project.name, '/', repository.name);
                console.log('=============\n');
                console.log(branches);
                console.log('\n\n\n\n');
            }).done();
        });
    }).auth(username, password, true);
}
