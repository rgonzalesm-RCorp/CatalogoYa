const crypto = require('crypto');

const generatePublicToken = () => crypto.randomBytes(24).toString('hex');

module.exports = { generatePublicToken };
