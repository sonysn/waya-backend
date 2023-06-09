import { createClient } from 'redis';
import { config } from 'dotenv';
import { errormessage, info } from '../ansi-colors-config';
config();
const client = createClient({ url: process.env.REDIS_LOCAL_URL || process.env.REDIS_RENDER_URL });

//REDIS CONNECTION
client.on('connect', function () {
  console.log(info('Connected to Redis!'));
});

client.on('error', function (err) {
  console.error(errormessage('Redis error:' + err));
});

export default client;