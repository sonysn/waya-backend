const { errormessage } = require('../../ansi-colors-config');
const { PaystackDepositsRiders } = require('../../models/paystack_deposit_riders');
const { userToDriver, UsersToUsers } = require('../../models/transfers');

exports.getRiderPaystackDepositTransactions = async (req, res) => {
    try {
        const userID = req.params.userID;

        const data = await PaystackDepositsRiders.find({ userID }).exec();

        //console.log(data);

        res.status(200).json(data);
    } catch (error) {
        console.error(errormessage(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
}

exports.getUserToDriverTransactions = async (req, res) => {
    try {
        const userID = req.params.userID;

        const data = await userToDriver.find({ userID }).exec();

        //console.log(data);

        res.status(200).json(data);
    } catch (error) {
        console.error(errormessage(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
}

exports.getUserToUserTransactions = async (req, res) => {
    try {
        const userSendingID = req.params.userID;

        const data = await UsersToUsers.find({ userSendingID }).exec();

        console.log(data);

        res.status(200).json(data);
    } catch (error) {
        console.error(errormessage(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
}

exports.getUserToUserTransactionsForReceiver = async (req, res) => {
    try {
        const userReceivingID = req.params.userID;

        const data = await UsersToUsers.find({ userReceivingID }).exec();

        console.log(data);

        res.status(200).json(data);
    } catch (error) {
        console.error(errormessage(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
}