const crypto = require('crypto');

function generateMD5Hash(inputString) {
    return crypto.createHash('md5').update(inputString).digest('hex');
}

module.exports = generateMD5Hash;