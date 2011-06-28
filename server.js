/*
 * node-ws - pure Javascript WebSockets server
 * Copyright Bradley Wright <brad@intranation.com>
 */

// Use strict compilation rules - we're not animals
'use strict';

var net = require('net'),
    EventEmitter = require('events').EventEmitter;

// import protocol
var factory = require('./protocols/factory');

// TODO: this should be part of the protocol-version class
function readData(data) {
    // this is for protocol 00
    // text-frame    = %x00 *( UTF8-char ) %xFF

    // lop off first and last character
    // TODO: this should be error checked
    return data.slice(1, data.length - 1);
}

var WebsocketServer = net.createServer(function(socket) {
    // listen for connections
    var emitter = new EventEmitter(),
        connection = null;

    socket.addListener('data', function(data) {
        // are we connected?
        if (connection !== null) {
            var message = connection.parseMessage(data.toString('utf8'));
            emitter.emit('message', message);
        }
        else {
            connection = factory(data.toString('binary'));
            if (connection) {
                // handshake succeeded, open connection
                socket.write(connection.join('\r\n'), 'binary');
                emitter.emit('open', socket);
            }
            else {
                // close connection, handshake bad
                emitter.emit('close', socket);
                socket.end();
                return;
            }
        }
    });

});

WebsocketServer.listen(8080, "127.0.0.1");