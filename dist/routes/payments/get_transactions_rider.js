"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { getRiderPaystackDepositTransactions, getUserToUserTransactions, getUserToDriverTransactions, getUserToUserTransactionsForReceiver } = require('../../controllers/payments/get_transactions_riders');
const auth_1 = require("../../controllers/auth");
const router = express_1.default.Router();
router.get('/:userID/getRiderPaystackDepositTransactions', auth_1.checkAuthorization, getRiderPaystackDepositTransactions);
router.get('/:userID/getUserToUserTransactions', auth_1.checkAuthorization, getUserToUserTransactions);
router.get('/:userID/getUserToDriverTransactions', auth_1.checkAuthorization, getUserToDriverTransactions);
router.get('/:userID/getUserToUserTransactionsForReceiver', auth_1.checkAuthorization, getUserToUserTransactionsForReceiver);
module.exports = router;
