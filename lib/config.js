var path = require('path');

module.exports = {
    username: process.env.VSOUsername,
    password: process.env.VSOPassword,
    vsoUrl: process.env.VSOUrl, // https://foo.visualstudio.com/DefaultCollection/
    tokens: process.env.AUTH_TOKENS ? process.env.AUTH_TOKENS.split(',') : [],
    basePath: path.join(path.dirname(__dirname), 'workspace'),
    updateInterval: (parseInt(process.env.UPDATE_INTERVAL) || 5 ) * 60 * 1000,
    skipUpsert: process.env.SKIP_UPSERT
};

