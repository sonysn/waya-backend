"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLConnection = void 0;
const mysql_1 = __importDefault(require("mysql"));
const ansi_colors_config_1 = require("../ansi-colors-config");
exports.MySQLConnection = mysql_1.default.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    //Enable multiple statements in command
    multipleStatements: true
});
exports.MySQLConnection.getConnection((err) => {
    if (err)
        throw err;
    console.log((0, ansi_colors_config_1.info)("MYSQL DB Connected!"));
});
