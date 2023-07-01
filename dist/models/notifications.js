"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverNotifications = exports.UserNotifications = void 0;
const mongoose_1 = require("mongoose");
const userNotificationsSchema = new mongoose_1.Schema({
    Title: {
        type: String,
        required: true
    },
    Message: {
        type: String,
        required: true
    }
});
const driverNotificationsSchema = new mongoose_1.Schema({
    Title: {
        type: String,
        required: true
    },
    Message: {
        type: String,
        required: true
    }
});
exports.UserNotifications = (0, mongoose_1.model)('UserNotifications', userNotificationsSchema);
exports.DriverNotifications = (0, mongoose_1.model)('DriverNotifications', driverNotificationsSchema);
module.exports = { UserNotifications: exports.UserNotifications, DriverNotifications: exports.DriverNotifications };
