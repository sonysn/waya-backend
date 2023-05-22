const express = require('express');
const {getDriverTransactionsFromRiders, getDriverDepositPaystackTransactions} = require('../../controllers/payments/get_transactions_driver');

const router = express.Router();

router.get('/:driverID/getUserTransfers', getDriverTransactionsFromRiders);
router.get('/:driverID/getDeposits', getDriverDepositPaystackTransactions);

module.exports = router;