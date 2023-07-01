import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { getUserNotifications, getDriverNotifications, writeUserNotifications, writeDriverNotifications } from '../controllers/notifications';

// Create an instance of the Express router
const router = express.Router();

// Define the route for getting user notifications
router.get('/user-notifications', getUserNotifications);
router.get('/driver-notifications', getDriverNotifications);

//Define the route for writing user notifications
router.post('/write-user-notifications', writeUserNotifications);
router.post('/write-driver-notifications', writeDriverNotifications);

module.exports = router;
