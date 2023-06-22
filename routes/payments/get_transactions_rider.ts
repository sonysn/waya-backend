import express from 'express';
const { getRiderPaystackDepositTransactions, getUserToUserTransactions, getUserToDriverTransactions, getUserToUserTransactionsForReceiver } = require('../../controllers/payments/get_transactions_riders');
import { checkAuthorization } from '../../controllers/auth'

const router = express.Router();

router.get('/:userID/getRiderPaystackDepositTransactions', checkAuthorization, getRiderPaystackDepositTransactions);
router.get('/:userID/getUserToUserTransactions', checkAuthorization, getUserToUserTransactions);
router.get('/:userID/getUserToDriverTransactions', checkAuthorization, getUserToDriverTransactions);
router.get('/:userID/getUserToUserTransactionsForReceiver', checkAuthorization, getUserToUserTransactionsForReceiver);

module.exports = router;