const bcrypt = require('bcrypt');
const saltRounds = 10;
const id = require('shortid').generate();
const oauth_nonce = function() {
    return new Promise(function(res, rej) {
        bcrypt.hash(id, saltRounds, function(err, hash) {
            if (err) {
                rej(err);
            }
            let digit = parseInt(Math.random() * 10);
            res(hash.replace(/[^A-Za-z0-9]/g, digit));
        });
    })
}

module.exports = oauth_nonce;