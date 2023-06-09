"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const get_transactions_driver_1 = require("../../controllers/payments/get_transactions_driver");
const router = express_1.default.Router();
router.get('/:driverID/getUserTransfers', get_transactions_driver_1.getDriverTransactionsFromRiders);
router.get('/:driverID/getDeposits', get_transactions_driver_1.getDriverDepositPaystackTransactions);
module.exports = router;
