/**
 * 
 * @param {String} str - a given URI string
 * @returns {String} a URI string encoded according to RFC6986, Section 2.1
 */
function percentalizedURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16);
    });
}

module.exports = percentalizedURIComponent;