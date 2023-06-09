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
const ansi_colors_config_1 = require("../../ansi-colors-config");
const paystack_deposit_riders_1 = require("../../models/paystack_deposit_riders");
const transfers_1 = require("../../models/transfers");
exports.getRiderPaystackDepositTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req.params.userID;
        const data = yield paystack_deposit_riders_1.PaystackDepositsRiders.find({ userID }).exec();
        //console.log(data);
        res.status(200).json(data);
    }
    catch (error) {
        console.error((0, ansi_colors_config_1.errormessage)(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
});
exports.getUserToDriverTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req.params.userID;
        const data = yield transfers_1.userToDriver.find({ userID }).exec();
        //console.log(data);
        res.status(200).json(data);
    }
    catch (error) {
        console.error((0, ansi_colors_config_1.errormessage)(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
});
exports.getUserToUserTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userSendingID = req.params.userID;
        const data = yield transfers_1.UsersToUsers.find({ userSendingID }).exec();
        console.log(data);
        res.status(200).json(data);
    }
    catch (error) {
        console.error((0, ansi_colors_config_1.errormessage)(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
});
exports.getUserToUserTransactionsForReceiver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userReceivingID = req.params.userID;
        const data = yield transfers_1.UsersToUsers.find({ userReceivingID }).exec();
        console.log(data);
        res.status(200).json(data);
    }
    catch (error) {
        console.error((0, ansi_colors_config_1.errormessage)(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
});
