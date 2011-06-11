/*
 * node-ws - pure Javascript WebSockets server
 * Copyright Bradley Wright <brad@intranation.com>
 */

// Use strict compilation rules - we're not animals
'use strict';

var net = require('net');

function parseHeaders(headers) {
    // splits a list of headers into key/value pairs
    var parsedHeaders = {};

    headers.forEach(function(header) {
        // might contain a colon, so limit split
        var toParse = header.split(':', 2);

        if (toParse.length === 2) {
            // it has to be Key: Value
            var key = toParse[0].toLowerCase(),
                value = toParse[1].replace(/^\s\s*/, '')
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

// TODO: make this a class that varies based on which
//       ws protocol is being used
function validateHandshake(data) {
    /*
     * Returns a boolean for whether the handshake succeeded or not
     */
    var lines = data.split('\r\n'),
        headers = parseHeaders(lines);
    console.log(headers);
    return false;
}

var WebsocketServer = net.createServer(function (socket) {
    // listen for connections
    var wsConnected = false;

    socket.addListener('data', function (data) {
        // are we connected?
        if (wsConnected) {
            console.log(data.toString('utf8'));
        }
        else {
            if (validateHandshake(data.toString('binary'))) {
                wsConnected = true;
            }
        }
    });

});

WebsocketServer.listen(8080, "127.0.0.1");