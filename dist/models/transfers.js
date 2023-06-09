"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersToUsers = exports.userToDriver = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const userToDriverSchema = new Schema({
    userID: Number,
    driverID: Number,
    amountTransferred: Number,
    datePaid: String,
    timePaid: String
});
const userToUsers = new Schema({
    userSendingID: Number,
    userReceivingID: Number,
    amountTransferred: Number,
    datePaid: String,
    timePaid: String
});
exports.userToDriver = mongoose_1.default.model('UserToDriver', userToDriverSchema);
exports.UsersToUsers = mongoose_1.default.model('UsersToUsers', userToUsers);
module.exports = { userToDriver: exports.userToDriver, UsersToUsers: exports.UsersToUsers };
