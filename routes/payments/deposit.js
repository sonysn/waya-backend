const express = require('express');
const { deposit, validateCharge } = require('../../controllers/payments/deposit_flutterwave');
const { depositPaystack, callbackPaystack, getBalance } = require('../../controllers/payments/deposit_paystack');

const router = express.Router();

router.get('/deposit', deposit);
router.post('/validatecharge', validateCharge)

//paystack routes
router.post('/charge', depositPaystack);
router.get('/callback', callbackPaystack);

//getbalance
router.post('/getbalance', getBalance);

module.exports = router;