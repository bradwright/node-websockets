/*
 * node-ws - pure Javascript WebSockets server
 * Copyright Bradley Wright <brad@intranation.com>
 */

var net = require('net');

function parseHeaders(headers) {
    // splits a list of headers into key/value pairs
    var parsed = {};
    headers.forEach(function(header) {
        var toParse = header.split(':', 2);
        if (toParse.length == 2) {
            // it has to be Key: Value
            var key = toParse[0].toLowerCase(),
                value = toParse[1].replace(/^\s\s*/, '')
                    .replace(/\s\s*$/, '');
            parsed[key] = value;
        }
        else {
            // it might be a method request,
            // which we want to store and check
            if (header.indexOf('GET') == 0) {
                parsed['X-Method'] = 'GET';
            }
        }
    });
    return parsed;
}

function validateHandshake(data) {
    // validates that the handshake is okay and we can connect
    var lines = data.split('\r\n');
    console.log(parseHeaders(lines));
    return false;
}

var WebsocketServer = net.createServer(function (socket) {
    // listen for connections
    var wsConnected = false;
    socket.addListener("data", function (data) {
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