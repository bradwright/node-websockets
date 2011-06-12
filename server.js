/*
 * node-ws - pure Javascript WebSockets server
 * Copyright Bradley Wright <brad@intranation.com>
 */

// Use strict compilation rules - we're not animals
'use strict';

var net = require('net');

// import protocol
var protoFactory = require('./protocols/factory.js').factory;

// TODO: this should be part of the protocol-version class
function readData(data) {
    // this is for protocol 00
    // text-frame    = %x00 *( UTF8-char ) %xFF

    // lop off first and last character
    // TODO: this should be error checked
    return data.slice(1, data.length - 1);
}

var WebsocketServer = net.createServer(function (socket) {
    // listen for connections
    var wsConnected = false;

    socket.addListener('data', function (data) {
        // are we connected?
        if (wsConnected) {
            console.log(readData(data.toString('utf8')));
        }
        else {
            var response = protoFactory(data.toString('binary'));
            if (response) {
                // handshake succeeded, open connection
                socket.write(response.join('\r\n'), 'binary');
                wsConnected = true;
            }
            else {
                // close connection, handshake bad
                socket.end();
                return;
            }
        }
    });

});

WebsocketServer.listen(8080, "127.0.0.1");