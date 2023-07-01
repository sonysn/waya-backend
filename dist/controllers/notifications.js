"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeDriverNotifications = exports.getDriverNotifications = exports.writeUserNotifications = exports.getUserNotifications = void 0;
const notifications_1 = require("../models/notifications");
const ansi_colors_config_1 = require("../ansi-colors-config");
const mysql_config_1 = require("../databases/mysql_config");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const getUserNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield notifications_1.UserNotifications.find().exec();
        res.status(200).json(data);
    }
    catch (error) {
        console.error((0, ansi_colors_config_1.errormessage)(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
});
exports.getUserNotifications = getUserNotifications;
const writeUserNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { Title, Message } = req.body;
    const parsedData = {
        Title: Title,
        Message: Message,
    };
    const data = new notifications_1.UserNotifications(parsedData);
    data.save();
    const SQLCOMMAND = `SELECT DEVICE_REG_TOKEN FROM users`;
    mysql_config_1.MySQLConnection.query(SQLCOMMAND, function (err, result) {
        if (err) {
            console.log((0, ansi_colors_config_1.errormessage)(`${err}`));
            res.sendStatus(500);
        }
        else {
            // Extract the device registration tokens from the result
            const tokens = result.map((row) => row.DEVICE_REG_TOKEN).filter((token) => token !== null);
            // Do something with the tokens
            console.log(tokens.length);
            for (let i = 0; i < tokens.length; i++) {
                sendNotifications(tokens[i], Title, Message);
            }
            res.sendStatus(200);
        }
    });
});
exports.writeUserNotifications = writeUserNotifications;
const getDriverNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield notifications_1.DriverNotifications.find().exec();
        res.status(200).json(data);
    }
    catch (error) {
        console.error((0, ansi_colors_config_1.errormessage)(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
});
exports.getDriverNotifications = getDriverNotifications;
const writeDriverNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { Title, Message } = req.body;
    const parsedData = {
        Title: Title,
        Message: Message,
    };
    const data = new notifications_1.DriverNotifications(parsedData);
    data.save();
    const SQLCOMMAND = `SELECT DEVICE_REG_TOKEN FROM driver`;
    mysql_config_1.MySQLConnection.query(SQLCOMMAND, function (err, result) {
        if (err) {
            console.log((0, ansi_colors_config_1.errormessage)(`${err}`));
            res.sendStatus(500);
        }
        else {
            // Extract the device registration tokens from the result
            const tokens = result.map((row) => row.DEVICE_REG_TOKEN).filter((token) => token !== null);
            // Do something with the tokens
            console.log(tokens.length);
            for (let i = 0; i < tokens.length; i++) {
                sendNotifications(tokens[i], Title, Message);
            }
            res.sendStatus(200);
        }
    });
});
exports.writeDriverNotifications = writeDriverNotifications;
/**
 * Sends notifications to the specified device registration tokens.
 * @param tokens - Device registration token.
 * @param title - Notification title.
 * @param message - Notification message.
 */
function sendNotifications(tokens, title, message) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create the notification payload
        const payload = {
            notification: {
                title: title,
                body: message,
            },
            token: tokens
        };
        // Send the notifications to the specified tokens
        try {
            firebase_admin_1.default.messaging().send(payload);
        }
        catch (error) {
            console.error('Error sending notifications:', error);
        }
    });
}
