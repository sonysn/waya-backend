import mongoose from 'mongoose';
const { Schema } = mongoose;

const userToDriverSchema = new Schema({
    userID: Number,
    driverID: Number,
    amountTransferred: Number,
    datePaid: String,
    timePaid: String
})

const userToUsers = new Schema({
    userSendingID: Number,
    userReceivingID: Number,
    amountTransferred: Number,
    datePaid: String,
    timePaid: String
})

export const userToDriver = mongoose.model('UserToDriver', userToDriverSchema);
export const UsersToUsers = mongoose.model('UsersToUsers', userToUsers);

module.exports = { userToDriver, UsersToUsers };