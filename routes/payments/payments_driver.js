const express = require('express');
const { deposit, validateCharge } = require('../../controllers/payments/deposit_flutterwave');
const { depositPaystack, callbackPaystack, getBalance } = require('../../controllers/payments/deposit_paystack_driver');
const { tranferDriverstoOtherDrivers } = require('../../controllers/payments/transfers')

const router = express.Router();

router.get('/deposit', deposit);
router.post('/validatecharge', validateCharge)

//paystack routes
router.post('/charge', depositPaystack);
router.get('/callbackdriver', callbackPaystack);

//getbalance
router.post('/getbalancedriver', getBalance);


//transfers
router.post('/tranfertodriver', tranferDriverstoOtherDrivers);

module.exports = router;