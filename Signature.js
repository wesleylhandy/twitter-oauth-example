const crypto = require('crypto');
const algorithm = 'sha1';

const percentalizedURIComponent = require('./percentalize');

/**
 * Function that takes in raw data and outputs a cryptographic signature
 * @param {String} url - endpoint of api being called
 * @param {String} method - HTTP method called on url
 * @param {Object[]} keys - array of signing keys
 * @param {Object} oauth - headers to be encoded into singature
 * @returns {String} hashed signature of data being sent to api
 */
function createSignature(url, method, keys = [], oauth = {}) {
    const headers = Object.keys(oauth);
    const paramString = headers.map(function(header) {
        return percentalizedURIComponent(header) + '=' + percentalizedURIComponent(oauth[header]);
    }).join("&");

    // console.log({ paramString: paramString })

    const baseString = method.toUpperCase() + '&' + percentalizedURIComponent(url) + '&' + percentalizedURIComponent(paramString);

    // console.log({ baseString: baseString });

    // console.log({ keyString: keys.join('&') })

    const hmac = crypto.createHmac(algorithm, keys.join('&'));
    hmac.update(baseString);

    return hmac.digest('base64');
}

module.exports = createSignature;