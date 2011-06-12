/*
 * hybi-00.js - Implementation of HYBI 00 WebSockets protocol
 * http://tools.ietf.org/html/draft-ietf-hybi-thewebsocketprotocol-00
 */

'use strict';

var utils = require('./utils'),
    crypto = require('crypto');

function ProtocolHybi00(parsedRequest, data) {
    // split up lines and parse
    if ('sec-websocket-key1' in parsedRequest &&
        'sec-websocket-key2' in parsedRequest) {
        var key1 = utils.computeHybi00Key(parsedRequest['sec-websocket-key1']),
            key2 = utils.computeHybi00Key(parsedRequest['sec-websocket-key2']),
            /*
             * The third piece of information is given
             * after the fields, in the last eight
             * bytes of the handshake, expressed here
             * as they would be seen if interpreted as ASCII
             */
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
            'Sec-WebSocket-Origin: ' + parsedRequest['origin'],
            // TODO: ws or wss
            // TODO: add actual request path
            'Sec-WebSocket-Location: ws://' + parsedRequest['host'] + '/',
            '',
            hash.digest('binary')
        ];
        return response;
    }
    return false;

};

module.exports = ProtocolHybi00;