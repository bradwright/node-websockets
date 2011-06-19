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

    return {
        parseMessage: function(data) {
            // this is for protocol 00
            // text-frame    = %x00 *( UTF8-char ) %xFF
            var chunks = data.split('');
            if (chunks[0] == '\u0000' &&
                chunks[data.length - 1] == '\uffff') {
                return data.slice(1, data.length - 1);
            }
            // framing was broken, we don't want to parse this
            // TODO: should we abort the message at this point?
            return false;
        },
        sendMessage: function(message) {
            // this is for protocol 00
            // text-frame    = %x00 *( UTF8-char ) %xFF
            this.socket.write('\u0000', 'binary');
            this.socket.write(message, 'utf8');
            this.socket.write('\uffff', 'binary');
            return true;
        },
        disconnect: function() {
            // Send a 0xFF byte and a 0x00 byte to the client
            // to indicate the start of the closing handshake.
            this.socket.write('\uffff', 'binary');
            this.socket.end('\u0000','binary');
        }
    };
};

module.exports = ProtocolHybi00;