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
exports.getDriverDepositPaystackTransactions = exports.getDriverTransactionsFromRiders = void 0;
const transfers_1 = require("../../models/transfers");
const paystack_deposit_drivers_1 = require("../../models/paystack_deposit_drivers");
const ansi_colors_config_1 = require("../../ansi-colors-config");
const getDriverTransactionsFromRiders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const driverID = req.params.driverID; // Set the driver ID here or retrieve it from req.body or req.params
        const data = yield transfers_1.userToDriver.find({ driverID }).exec();
        //console.log(data);
        res.status(200).json(data);
    }
    catch (error) {
        console.error((0, ansi_colors_config_1.errormessage)(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
});
exports.getDriverTransactionsFromRiders = getDriverTransactionsFromRiders;
const getDriverDepositPaystackTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const driverID = req.params.driverID; // Set the driver ID here or retrieve it from req.body or req.params
        const data = yield paystack_deposit_drivers_1.PaystackDepositsDrivers.find({ driverID }).exec();
        //console.log(data);
        res.status(200).json(data);
    }
    catch (error) {
        console.error((0, ansi_colors_config_1.errormessage)(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
});
exports.getDriverDepositPaystackTransactions = getDriverDepositPaystackTransactions;
