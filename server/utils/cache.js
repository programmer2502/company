const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Default TTL: 5 minutes

module.exports = cache;
