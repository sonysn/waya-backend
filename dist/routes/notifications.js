"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notifications_1 = require("../controllers/notifications");
// Create an instance of the Express router
const router = express_1.default.Router();
// Define the route for getting user notifications
router.get('/user-notifications', notifications_1.getUserNotifications);
router.get('/driver-notifications', notifications_1.getDriverNotifications);
//Define the route for writing user notifications
router.post('/write-user-notifications', notifications_1.writeUserNotifications);
router.post('/write-driver-notifications', notifications_1.writeDriverNotifications);
module.exports = router;
