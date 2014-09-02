var repo = require('../lib/repo.js'),
    rimraf = require('rimraf'),
    assert = require('assert');

describe('repo', function() {
    this.timeout(10000);
    it('updates', function(done) {
        rimraf('./testrepo/', function() {
            repo.clone('http://github.com/itsananderson/arduino-pusher.git', './testrepo')
                .done(function() {
                    repo.update('./testrepo/', 'origin')
                        .done(function() {
                            done();
                        });
                });
        });
    });
});

