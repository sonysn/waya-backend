import { Request, Response, NextFunction } from "express";
import { UserNotifications, DriverNotifications } from "../models/notifications";
import { errormessage, info } from "../ansi-colors-config";
import { MySQLConnection } from "../databases/mysql_config";
import admin from 'firebase-admin';


//!USER NOTIFICATIONS
export const getUserNotifications = async (req: Request, res: Response) => {
    try {
        const data = await UserNotifications.find().exec();
        res.status(200).json(data);
    } catch (error) {
        console.error(errormessage(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
}

export const writeUserNotifications = async (req: Request, res: Response) => {
    const { Title, Message } = req.body;

    const parsedData = {
        Title: Title,
        Message: Message,
    }

    const data = new UserNotifications(parsedData);
    data.save();

    const SQLCOMMAND = `SELECT DEVICE_REG_TOKEN FROM users`
    MySQLConnection.query(SQLCOMMAND, function (err, result) {
        if (err) {
            console.log(errormessage(`${err}`));
            res.sendStatus(500);
        } else {
            // Extract the device registration tokens from the result
            const tokens = result.map((row: any) => row.DEVICE_REG_TOKEN).filter((token: any) => token !== null);

            // Do something with the tokens
            console.log(tokens.length);
            for (let i = 0; i < tokens.length; i++) {
                sendNotifications(tokens[i], Title, Message);
            }


            res.sendStatus(200);
        }
    });
}


//!DRIVER NOTIFICATIONS
export const getDriverNotifications = async (req: Request, res: Response) => {
    try {
        const data = await DriverNotifications.find().exec();
        res.status(200).json(data);
    } catch (error) {
        console.error(errormessage(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
}

export const writeDriverNotifications = async (req: Request, res: Response) => {
    const { Title, Message } = req.body;

    const parsedData = {
        Title: Title,
        Message: Message,
    }

    const data = new DriverNotifications(parsedData);
    data.save();

    const SQLCOMMAND = `SELECT DEVICE_REG_TOKEN FROM driver`
    MySQLConnection.query(SQLCOMMAND, function (err, result) {
        if (err) {
            console.log(errormessage(`${err}`));
            res.sendStatus(500);
        } else {
            // Extract the device registration tokens from the result
            const tokens = result.map((row: any) => row.DEVICE_REG_TOKEN).filter((token: any) => token !== null);

            // Do something with the tokens
            console.log(tokens.length);
            for (let i = 0; i < tokens.length; i++) {
                sendNotifications(tokens[i], Title, Message);
            }


            res.sendStatus(200);
        }
    });
}

/**
 * Sends notifications to the specified device registration tokens.
 * @param tokens - Device registration token.
 * @param title - Notification title.
 * @param message - Notification message.
 */
async function sendNotifications(tokens: string, title: string, message: string) {
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
        admin.messaging().send(payload);
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
}