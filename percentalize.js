/**
 * 
 * @param {String} str - a given URI string
 * @returns {String} a URI string encoded according to RFC6986, Section 2.1
 */
function percentalizedURIComponent(str) {
    return encodeURIComponent(str).replace(/\!/g, "%21")
        .replace(/\'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29")
        .replace(/\*/g, "%2A");

}

module.exports = percentalizedURIComponent;