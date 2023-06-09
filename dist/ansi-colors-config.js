"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = exports.warning = exports.errormessage = void 0;
const ansi_colors_1 = __importDefault(require("ansi-colors"));
exports.errormessage = ansi_colors_1.default.red;
exports.warning = ansi_colors_1.default.yellow;
exports.info = ansi_colors_1.default.blue;
// USAGE:
// console.log(error('Error'));
// console.log(warning('Warning'));
// console.log(info('Info'));
module.exports = { errormessage: exports.errormessage, warning: exports.warning, info: exports.info };
