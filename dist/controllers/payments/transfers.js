"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const transfers_1 = require("../../models/transfers");
const ansi_colors_config_1 = require("./../../ansi-colors-config");
exports.tranferUserstoDrivers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amountToBeTransferred, driverPhoneNumber, userPhoneNumber } = req.body;
    const SQLCOMMAND = `SELECT ACCOUNT_BALANCE, ID FROM users WHERE PHONE_NUMBER LIKE ?;`;
    index_1.MySQLConnection.query(SQLCOMMAND, userPhoneNumber, function (err, result) {
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
        const SQLCOMMAND1 = `SELECT ACCOUNT_BALANCE, ID FROM driver WHERE PHONE_NUMBER LIKE ?;`;
        index_1.MySQLConnection.query(SQLCOMMAND1, driverPhoneNumber, function (err, result) {
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
            const SQLCOMMAND2 = `UPDATE driver SET ACCOUNT_BALANCE = ? WHERE PHONE_NUMBER LIKE ?; UPDATE users SET ACCOUNT_BALANCE = ? WHERE ID = ?;`;
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
            };
            index_1.MySQLConnection.query(SQLCOMMAND2, [new_value, driverPhoneNumber, newUserBalance, userID], function (err, result) {
                if (err) {
                    console.error((0, ansi_colors_config_1.errormessage)(err));
                    res.status(500).json({ status: 500, message: 'An error occurred while processing your request.' });
                    return;
                }
                const payment = new transfers_1.userToDriver(parsedPayment);
                payment.save()
                    .then(() => console.log((0, ansi_colors_config_1.info)('Payment saved to database')))
                    .catch(error => console.error((0, ansi_colors_config_1.errormessage)(`${error}`)));
                res.json({ status: 200, message: 'Transaction Complete' });
            });
        });
    });
});
exports.tranferUserstoOtherUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amountToBeTransferred, userReceivingPhoneNumber, userSendingPhoneNumber } = req.body;
    const SQLCOMMAND = `SELECT ACCOUNT_BALANCE, ID FROM users WHERE PHONE_NUMBER LIKE ?;`;
    index_1.MySQLConnection.query(SQLCOMMAND, userSendingPhoneNumber, function (err, result) {
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
        const SQLCOMMAND1 = `SELECT ACCOUNT_BALANCE, ID FROM users WHERE PHONE_NUMBER LIKE ?;`;
        index_1.MySQLConnection.query(SQLCOMMAND1, userReceivingPhoneNumber, function (err, result) {
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
            const SQLCOMMAND2 = `UPDATE users SET ACCOUNT_BALANCE = ? WHERE PHONE_NUMBER LIKE ?; UPDATE users SET ACCOUNT_BALANCE = ? WHERE ID = ?;`;
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
            };
            index_1.MySQLConnection.query(SQLCOMMAND2, [new_value, userReceivingPhoneNumber, newUserBalance, userSendingID], function (err, result) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ status: 500, message: 'An error occurred while processing your request.' });
                    return;
                }
                const payment = new transfers_1.UsersToUsers(parsedPayment);
                payment.save()
                    .then(() => console.log((0, ansi_colors_config_1.info)('Payment saved to database')))
                    .catch(error => console.error((0, ansi_colors_config_1.errormessage)(`${error}`)));
                res.json({ status: 200, message: 'Transaction Complete' });
            });
        });
    });
});
/**
 * Transfer funds from one driver's account to another driver's account.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {void}
 */
exports.tranferDriverstoOtherDrivers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the data from the request body.
    const { amountToBeTransferred, driverReceivingPhoneNumber, driverSendingPhoneNumber } = req.body;
    if (driverSendingPhoneNumber === driverReceivingPhoneNumber) {
        // If the sender and receiver phone numbers are the same, return an error.
        res.status(400).json({ status: 400, message: 'Sender and receiver phone numbers cannot be the same.' });
        return;
    }
    // Get the account balance of the driver sending the funds.
    const SQLCOMMAND = `SELECT ACCOUNT_BALANCE FROM driver WHERE PHONE_NUMBER LIKE ?;`;
    index_1.MySQLConnection.query(SQLCOMMAND, driverSendingPhoneNumber, function (err, result) {
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
        const SQLCOMMAND1 = `SELECT ACCOUNT_BALANCE FROM driver WHERE PHONE_NUMBER LIKE ?;`;
        index_1.MySQLConnection.query(SQLCOMMAND1, driverReceivingPhoneNumber, function (err, result) {
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
            const SQLCOMMAND2 = `UPDATE driver SET ACCOUNT_BALANCE = ? WHERE PHONE_NUMBER LIKE ?; UPDATE driver SET ACCOUNT_BALANCE = ? WHERE PHONE_NUMBER LIKE ?;`;
            // Update the account balance of the driver sending the funds.
            index_1.MySQLConnection.query(SQLCOMMAND2, [new_value, driverReceivingPhoneNumber, new_balance_forSender, driverSendingPhoneNumber], function (err, result) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ status: 500, message: 'An error occurred while processing your request.' });
                    return;
                }
                res.json({ status: 200, message: 'Transaction Complete' });
            });
        });
    });
});
exports.getDriverData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverPhoneNumber = req.params.driverPhoneNumber;
    const SQLCOMMAND = `SELECT FIRST_NAME, LAST_NAME FROM driver WHERE PHONE_NUMBER LIKE ?`;
    index_1.MySQLConnection.query(SQLCOMMAND, driverPhoneNumber, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'An error occurred.' });
            return;
        }
        if (result.length != 0) {
            res.json({ message: result[0] });
        }
        else {
            res.json({ message: 'No Driver Found' });
        }
    });
});
exports.getUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userPhoneNumber = req.params.userPhoneNumber;
    const SQLCOMMAND = `SELECT FIRST_NAME, LAST_NAME FROM users WHERE PHONE_NUMBER LIKE ?`;
    index_1.MySQLConnection.query(SQLCOMMAND, userPhoneNumber, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'An error occurred.' });
            return;
        }
        if (result.length != 0) {
            res.json({ message: result[0] });
        }
        else {
            res.json({ message: 'No User Found' });
        }
    });
});
