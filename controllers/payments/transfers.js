const { MySQLConnection } = require('../../index');
const { userToDriver, UsersToUsers } = require('../../models/transfers');
const { info, errormessage } = require('./../../ansi-colors-config')

exports.tranferUserstoDrivers = async (req, res) => {
    const { amountToBeTransferred, driverPhoneNumber, userPhoneNumber } = req.body;

    const SQLCOMMAND = `SELECT ACCOUNT_BALANCE, ID FROM users WHERE PHONE_NUMBER LIKE ?;`
    MySQLConnection.query(SQLCOMMAND, userPhoneNumber, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'An error occurred while processing your request.' });
            return;
        }
        const accountBalance = result[0].ACCOUNT_BALANCE;
        if (accountBalance < amountToBeTransferred) {
            res.status(403).json({ status: 403, message: 'Insufficient funds.' });
            return;
        }

        const userID = result[0].ID;

        // Check if driver exists
        const SQLCOMMAND1 = `SELECT ACCOUNT_BALANCE, ID FROM driver WHERE PHONE_NUMBER LIKE ?;`
        MySQLConnection.query(SQLCOMMAND1, driverPhoneNumber, function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({ status: 500, message: 'An error occurred while processing your request.' });
                return;
            }
            if (!result.length) {
                res.status(404).json({ status: 404, message: 'No driver found.' });
                return;
            }

            const driverID = result[0].ID;
            const driverAccountBalance = result[0].ACCOUNT_BALANCE;
            const value = amountToBeTransferred;
            const newUserBalance = accountBalance - value;
            const new_value = driverAccountBalance + value;
            const SQLCOMMAND2 = `UPDATE driver SET ACCOUNT_BALANCE = ? WHERE PHONE_NUMBER LIKE ?; UPDATE users SET ACCOUNT_BALANCE = ? WHERE ID = ?;`

            //SAVE TRANSACTION TO MONGO
            //get todays date and parse it for sql db
            const today = new Date();
            //month goes from 0 to 11
            var month = today.getMonth() + 1;
            const todaysDate = today.getDate() + '-' + month + '-' + today.getFullYear();

            const requestTime = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();

            const parsedPayment = {
                userID: userID,
                driverID: driverID,
                amountTransferred: value,
                datePaid: todaysDate,
                timePaid: requestTime,
            }

            MySQLConnection.query(SQLCOMMAND2, [new_value, driverPhoneNumber, newUserBalance, userID], function (err, result) {
                if (err) {
                    console.error(errormessage(err));
                    res.status(500).json({ status: 500, message: 'An error occurred while processing your request.' });
                    return;
                }
                const payment = new userToDriver(parsedPayment);
                payment.save()
                    .then(() => console.log(info('Payment saved to database')))
                    .catch(error => console.error(errormessage(`${error}`)));
                res.json({ status: 200, message: 'Transaction Complete' });
            });
        });
    });

};


exports.tranferUserstoOtherUsers = async (req, res) => {
    const { amountToBeTransferred, userReceivingPhoneNumber, userSendingPhoneNumber } = req.body;

    const SQLCOMMAND = `SELECT ACCOUNT_BALANCE, ID FROM users WHERE PHONE_NUMBER LIKE ?;`
    MySQLConnection.query(SQLCOMMAND, userSendingPhoneNumber, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'An error occurred while processing your request.' });
            return;
        }
        const accountBalance = result[0].ACCOUNT_BALANCE;
        if (accountBalance < amountToBeTransferred) {
            res.status(403).json({ status: 403, message: 'Insufficient funds.' });
            return;
        }

        const userSendingID = result[0].ID;

        // Check if user exists
        const SQLCOMMAND1 = `SELECT ACCOUNT_BALANCE, ID FROM users WHERE PHONE_NUMBER LIKE ?;`
        MySQLConnection.query(SQLCOMMAND1, userReceivingPhoneNumber, function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({ status: 500, message: 'An error occurred while processing your request.' });
                return;
            }
            if (!result.length) {
                res.status(404).json({ status: 404, message: 'No User found.' });
                return;
            }

            const userReceivingID = result[0].ID;
            const userReceivingAccountBalance = result[0].ACCOUNT_BALANCE;
            const value = amountToBeTransferred;
            const newUserBalance = accountBalance - value;
            const new_value = userReceivingAccountBalance + value;
            const SQLCOMMAND2 = `UPDATE users SET ACCOUNT_BALANCE = ? WHERE PHONE_NUMBER LIKE ?; UPDATE users SET ACCOUNT_BALANCE = ? WHERE ID = ?;`

            //SAVE TRANSACTION TO MONGO
            //get todays date and parse it for sql db
            const today = new Date();
            //month goes from 0 to 11
            var month = today.getMonth() + 1;
            const todaysDate = today.getDate() + '-' + month + '-' + today.getFullYear();

            const requestTime = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();

            const parsedPayment = {
                userSendingID: userSendingID,
                userReceivingID: userReceivingID,
                amountTransferred: value,
                datePaid: todaysDate,
                timePaid: requestTime,
            }


            MySQLConnection.query(SQLCOMMAND2, [new_value, userReceivingPhoneNumber, newUserBalance, userSendingID], function (err, result) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ status: 500, message: 'An error occurred while processing your request.' });
                    return;
                }
                const payment = new UsersToUsers(parsedPayment);
                payment.save()
                    .then(() => console.log(info('Payment saved to database')))
                    .catch(error => console.error(errormessage(`${error}`)));
                res.json({ status: 200, message: 'Transaction Complete' });
            });
        });
    });

};

/**
 * Transfer funds from one driver's account to another driver's account.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {void}
 */
exports.tranferDriverstoOtherDrivers = async (req, res) => {
    // Get the data from the request body.
    const { amountToBeTransferred, driverReceivingPhoneNumber, driverSendingPhoneNumber } = req.body;

    if (driverSendingPhoneNumber === driverReceivingPhoneNumber) {
        // If the sender and receiver phone numbers are the same, return an error.
        res.status(400).json({ status: 400, message: 'Sender and receiver phone numbers cannot be the same.' });
        return;
    }

    // Get the account balance of the driver sending the funds.
    const SQLCOMMAND = `SELECT ACCOUNT_BALANCE FROM driver WHERE PHONE_NUMBER LIKE ?;`
    MySQLConnection.query(SQLCOMMAND, driverSendingPhoneNumber, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'An error occurred while processing your request.' });
            return;
        }
        const accountBalance = result[0].ACCOUNT_BALANCE;
        if (accountBalance < amountToBeTransferred) {
            // If the driver does not have sufficient funds, return an error.
            res.status(403).json({ status: 403, message: 'Insufficient funds.' });
            return;
        }

        // Check if the driver receiving the funds exists.
        const SQLCOMMAND1 = `SELECT ACCOUNT_BALANCE FROM driver WHERE PHONE_NUMBER LIKE ?;`
        MySQLConnection.query(SQLCOMMAND1, driverReceivingPhoneNumber, function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({ status: 500, message: 'An error occurred while processing your request.' });
                return;
            }
            if (!result.length) {
                // If the driver receiving the funds does not exist, return an error.
                res.status(404).json({ status: 404, message: 'No Driver found.' });
                return;
            }

            // Update the account balances of both drivers.
            const userReceivingAccountBalance = result[0].ACCOUNT_BALANCE;
            const value = amountToBeTransferred / 1;
            const new_value = userReceivingAccountBalance + value;
            const new_balance_forSender = accountBalance - value;
            const SQLCOMMAND2 = `UPDATE driver SET ACCOUNT_BALANCE = ? WHERE PHONE_NUMBER LIKE ?; UPDATE driver SET ACCOUNT_BALANCE = ? WHERE PHONE_NUMBER LIKE ?;`
            // Update the account balance of the driver sending the funds.
            MySQLConnection.query(SQLCOMMAND2, [new_value, driverReceivingPhoneNumber, new_balance_forSender, driverSendingPhoneNumber], function (err, result) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ status: 500, message: 'An error occurred while processing your request.' });
                    return;
                }
                res.json({ status: 200, message: 'Transaction Complete' });
            });
        });
    });
};

