"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { getRiderPaystackDepositTransactions, getUserToUserTransactions, getUserToDriverTransactions, getUserToUserTransactionsForReceiver } = require('../../controllers/payments/get_transactions_riders');
const router = express_1.default.Router();
router.get('/:userID/getRiderPaystackDepositTransactions', getRiderPaystackDepositTransactions);
router.get('/:userID/getUserToUserTransactions', getUserToUserTransactions);
router.get('/:userID/getUserToDriverTransactions', getUserToDriverTransactions);
router.get('/:userID/getUserToUserTransactionsForReceiver', getUserToUserTransactionsForReceiver);
module.exports = router;
