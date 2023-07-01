import { Schema, model } from 'mongoose';

const userNotificationsSchema = new Schema({
    Title: {
        type: String,
        required: true
    },
    Message: {
        type: String,
        required: true
    }
})

const driverNotificationsSchema = new Schema({
    Title: {
        type: String,
        required: true
    },
    Message: {
        type: String,
        required: true
    }
})

export const UserNotifications = model('UserNotifications', userNotificationsSchema);
export const DriverNotifications = model('DriverNotifications', driverNotificationsSchema);

module.exports = { UserNotifications, DriverNotifications };