const { MySQLConnection } = require('../../index');

exports.tranferUserstoDrivers = async (req, res) => {
    const { amountToBeTransferred, driverPhoneNumber, userPhoneNumber } = req.body;

    const SQLCOMMAND = `SELECT ACCOUNT_BALANCE FROM users WHERE PHONE_NUMBER LIKE ?;`
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

        // Check if driver exists
        const SQLCOMMAND1 = `SELECT ACCOUNT_BALANCE FROM driver WHERE PHONE_NUMBER LIKE ?;`
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
            const driverAccountBalance = result[0].ACCOUNT_BALANCE;
            const value = amountToBeTransferred;
            const new_value = driverAccountBalance + value;
            const SQLCOMMAND2 = `UPDATE driver SET ACCOUNT_BALANCE LIKE ? WHERE PHONE_NUMBER LIKE ?;`
            MySQLConnection.query(SQLCOMMAND2, [new_value, driverPhoneNumber], function (err, result) {
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
//TODO ADD ACCOUNT_BALANCE TO users table
exports.tranferUserstoOtherUsers = async (req, res) => {
    const { amountToBeTransferred, userReceivingPhoneNumber, userSendingPhoneNumber } = req.body;

    const SQLCOMMAND = `SELECT ACCOUNT_BALANCE FROM users WHERE PHONE_NUMBER LIKE ?;`
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

        // Check if user exists
        const SQLCOMMAND1 = `SELECT ACCOUNT_BALANCE FROM users WHERE PHONE_NUMBER LIKE ?;`
        MySQLConnection.query(SQLCOMMAND1, userReceivingPhoneNumber, function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({ status: 500, message: 'An error occurred while processing your request.' });
                return;
            }
            if (!result.length) {
                res.status(404).json({ status: 404, message: 'No driver found.' });
                return;
            }
            const userReceivingAccountBalance = result[0].ACCOUNT_BALANCE;
            const value = amountToBeTransferred;
            const new_value = userReceivingAccountBalance + value;
            const SQLCOMMAND2 = `UPDATE users SET ACCOUNT_BALANCE LIKE ? WHERE PHONE_NUMBER LIKE ?;`
            MySQLConnection.query(SQLCOMMAND2, [new_value, driverPhoneNumber], function (err, result) {
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