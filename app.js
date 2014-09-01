var git = require('nodegit'),
    async = require('async');

git.Repo.open('./testrepo/.git', function(err, repository) {
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
});