/*
 * factory.js - WebSocket protocol factory to resolve
 * different versions of WebSockets
 */

// Use strict compilation rules - we're not animals
'use strict';

var Hybi00 = require('./hybi-00');

function parseHeaders(headers) {
    // splits a list of headers into key/value pairs
    var parsedHeaders = {};
    headers.forEach(function(header) {
        // might contain a colon, so limit split
        var toParse = header.split(':');
        if (toParse.length >= 2) {
            // it has to be Key: Value
            var key = toParse[0].toLowerCase(),
                // might be more than 1 colon
                value = toParse.slice(1).join(':')
                    .replace(/^\s\s*/, '')
                    .replace(/\s\s*$/, '');
            parsedHeaders[key] = value;
        }
        else {
            // it might be a method request,
            // which we want to store and check
            if (header.indexOf('GET') === 0) {
                parsedHeaders['X-Request-Method'] = 'GET';
            }
        }
    });

    return parsedHeaders;
}

module.exports = function(data) {
    // split up the data
    var lines = data.split('\r\n'),
        parsedHeaders = parseHeaders(lines);
    return Hybi00(parsedHeaders, lines.slice(-1)[0]);
};