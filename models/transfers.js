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

const DebitToDriver = mongoose.model('DebitToDriver', userToDriverSchema);
const DebitToOtherUsers = mongoose.model('DebitToOtherUsers', userToUsers);

module.exports = { DebitToDriver, DebitToOtherUsers };