var api = require('../lib/vso-api.js'),
    assert = require('assert');

describe('vso-api', function() {
    it('exists', function() {
        assert.notStrictEqual(api, undefined);
    });
});