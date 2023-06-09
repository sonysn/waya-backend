import express from 'express';
import { deposit, validateCharge } from '../../controllers/payments/deposit_flutterwave';
const { depositPaystack, callbackPaystack, getBalance } = require('../../controllers/payments/deposit_paystack_driver');
const { tranferDriverstoOtherDrivers } = require('../../controllers/payments/transfers')

const router = express.Router();

router.get('/deposit', deposit);
router.post('/validatecharge', validateCharge)

//paystack routes
router.post('/chargeDriver', depositPaystack);
router.get('/callbackdriver', callbackPaystack);

//getbalance
router.post('/getbalancedriver', getBalance);


//transfers
router.post('/tranfertodriver', tranferDriverstoOtherDrivers);

module.exports = router;