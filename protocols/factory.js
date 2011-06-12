/*
 * factory.js - WebSocket protocol factory to resolve
 * different versions of WebSockets
 */

// Use strict compilation rules - we're not animals
'use strict';

var crypto = require('crypto');

function bigEndian(value) {
    var result = [
        String.fromCharCode(value >> 24 & 0xFF),
        String.fromCharCode(value >> 16 & 0xFF),
        String.fromCharCode(value >> 8 & 0xFF),
        String.fromCharCode(value & 0xFF)
    ];
    return result.join('');
}

function computeKey(key) {
    /*
     * For each of these fields, the server has to
     * take the digits from the value to obtain a
     * number, then divide that number by the number
     * of spaces characters in the value to obtain
     * a 32-bit number.
     */
    var length = parseInt(key.match(/\s/g).length),
        chars = parseInt(key.replace(/[^0-9]/g, ''));
    // convert to a 32 bit number
    return bigEndian((chars / length));
}

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

// protocol 00
// http://tools.ietf.org/html/draft-ietf-hybi-thewebsocketprotocol-00
function HandshakeHYBI00(request) {
    // split up lines and parse
    var lines = request.split('\r\n'),
        headers = parseHeaders(lines);
    if ('sec-websocket-key1' in headers &&
        'sec-websocket-key2' in headers) {
        var key1 = computeKey(headers['sec-websocket-key1']),
            key2 = computeKey(headers['sec-websocket-key2']),
            /*
             * The third piece of information is given
             * after the fields, in the last eight
             * bytes of the handshake, expressed here
             * as they would be seen if interpreted as ASCII
             */
            data = request.slice(-8),
            // md5 hhash
            hash = crypto.createHash('md5');
        // update hash with all values
        hash.update(key1);
        hash.update(key2);
        hash.update(data);
        // TODO: make this a template maybe
        var response = [
            'HTTP/1.1 101 WebSocket Protocol Handshake',
            'Upgrade: WebSocket',
            'Connection: Upgrade',
            'Sec-WebSocket-Origin: ' + headers['origin'],
            // TODO: ws or wss
            // TODO: add actual request path
            'Sec-WebSocket-Location: ws://' + headers['host'] + '/',
            '',
            hash.digest('binary')
        ];
        return response;
    }
    return false;
}


exports.factory = function(data) {
    return HandshakeHYBI00(data);
};