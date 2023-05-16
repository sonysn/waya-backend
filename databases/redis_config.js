const redis = require('redis');
const dotenv = require('dotenv');
const { error, info } = require('../ansi-colors-config');
dotenv.config();
const client = redis.createClient({url: process.env.REDIS_LOCAL_URL || process.env.REDIS_RENDER_URL});

//REDIS CONNECTION
client.on('connect', function() {
    console.log(info('Connected to Redis!'));
  });

client.on('error', function(err) {
  console.error(error(`'Redis error: ${err}`));
});

module.exports = client;