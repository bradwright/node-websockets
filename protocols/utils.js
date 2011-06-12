/*
 * utils.js - utilities and miscellaneous shared functions
 */

function bigEndian(value) {
    // convert a regular number into a 32bit big-endian number
    var result = [
        String.fromCharCode(value >> 24 & 0xFF),
        String.fromCharCode(value >> 16 & 0xFF),
        String.fromCharCode(value >> 8 & 0xFF),
        String.fromCharCode(value & 0xFF)
    ];
    return result.join('');
}

exports.computeHybi00Key = function(key) {
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