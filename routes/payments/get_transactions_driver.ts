import express from 'express';
import { getDriverTransactionsFromRiders, getDriverDepositPaystackTransactions } from '../../controllers/payments/get_transactions_driver';
import { checkAuthorization } from '../../controllers/auth';

const router = express.Router();

router.get('/:driverID/getUserTransfers', checkAuthorization, getDriverTransactionsFromRiders);
router.get('/:driverID/getDeposits', checkAuthorization, getDriverDepositPaystackTransactions);

module.exports = router;