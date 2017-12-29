var ntpClient = require('ntp-client');
var moment = require('moment');

function timestamp() {
    return new Promise(function(resolve, reject) {
        ntpClient.getNetworkTime("pool.ntp.org", 123, function(err, date) {
            if (err) {
                console.error(err);
                return reject(err);
            }

            console.log("Current time : ");
            console.log(moment(date).format('X'));

            return resolve(moment(date).format("X"));
        });
    })
}

module.exports = timestamp;