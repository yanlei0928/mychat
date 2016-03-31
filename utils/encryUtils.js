var crypto = require('crypto');
var getStringMd5 = function (content) {
    return crypto.createHash('md5').update(content).update('mychat').digest('hex');
}


exports.getStringMd5 = getStringMd5;