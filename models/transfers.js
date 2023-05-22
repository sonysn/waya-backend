const mongoose = require('mongoose');
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

const userToDriver = mongoose.model('UserToDriver', userToDriverSchema);
const UsersToUsers = mongoose.model('UsersToUsers', userToUsers);

module.exports = { userToDriver, UsersToUsers };