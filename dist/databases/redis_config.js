"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const dotenv_1 = require("dotenv");
const ansi_colors_config_1 = require("../ansi-colors-config");
(0, dotenv_1.config)();
const client = (0, redis_1.createClient)({ url: process.env.REDIS_LOCAL_URL || process.env.REDIS_RENDER_URL });
//REDIS CONNECTION
client.on('connect', function () {
    console.log((0, ansi_colors_config_1.info)('Connected to Redis!'));
});
client.on('error', function (err) {
    console.error((0, ansi_colors_config_1.errormessage)('Redis error:' + err));
});
exports.default = client;
