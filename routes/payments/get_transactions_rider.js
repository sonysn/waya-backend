const express = require('express');
const { getRiderPaystackDepositTransactions, getUserToUserTransactions, getUserToDriverTransactions, getUserToUserTransactionsForReceiver } = require('../../controllers/payments/get_transactions_riders');

const router = express.Router();

router.get('/:userID/getRiderPaystackDepositTransactions', getRiderPaystackDepositTransactions);
router.get('/:userID/getUserToUserTransactions', getUserToUserTransactions);
router.get('/:userID/getUserToDriverTransactions', getUserToDriverTransactions);
router.get('/:userID/getUserToUserTransactionsForReceiver', getUserToUserTransactionsForReceiver);

module.exports = router;