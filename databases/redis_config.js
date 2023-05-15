const redis = require('redis');
const { error } = require('../ansi-colors-config');
const client = redis.createClient({url: process.env.REDIS_URL});

//REDIS CONNECTION
client.on('connect', function() {
    console.log('Connected to Redis!');
  });

client.on('error', function(err) {
  console.error(error(`'Redis error: ${err}`));
});

module.exports = client;