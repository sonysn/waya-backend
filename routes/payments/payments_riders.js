const express = require('express');
const { deposit, validateCharge } = require('../../controllers/payments/deposit_flutterwave');
const { depositPaystack, callbackPaystack, getBalance } = require('../../controllers/payments/deposit_paystack_riders');

const router = express.Router();

//paystack routes
router.post('/charge', depositPaystack);
router.get('/callback', callbackPaystack);

//getbalance
router.post('/getbalance', getBalance);

module.exports = router;