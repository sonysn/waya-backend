"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const get_transactions_driver_1 = require("../../controllers/payments/get_transactions_driver");
const auth_1 = require("../../controllers/auth");
const router = express_1.default.Router();
router.get('/:driverID/getUserTransfers', auth_1.checkAuthorization, get_transactions_driver_1.getDriverTransactionsFromRiders);
router.get('/:driverID/getDeposits', auth_1.checkAuthorization, get_transactions_driver_1.getDriverDepositPaystackTransactions);
module.exports = router;
