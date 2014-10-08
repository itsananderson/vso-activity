var path = require('path');
var bunyan = require('bunyan');

var logger = bunyan.createLogger({
    name: 'vso-activity',
    serializers: bunyan.stdSerializers,
    streams: [
        {
            level: 'error',
            stream: process.stdout
        },
        {
            level: 'error',
            path: path.join(path.dirname(__dirname), 'error.log')
        },
        {
            level: 'info',
            path: path.join(path.dirname(__dirname), 'info.log')
        }
    ]
});

module.exports = logger;
