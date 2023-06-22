import express from 'express';
import { deposit, validateCharge } from '../../controllers/payments/deposit_flutterwave';
const { depositPaystack, callbackPaystack, getBalance } = require('../../controllers/payments/deposit_paystack_driver');
const { tranferDriverstoOtherDrivers } = require('../../controllers/payments/transfers');
import { checkAuthorization } from '../../controllers/auth';

const router = express.Router();

//THESE TWO NOT BEING USED
router.get('/deposit', checkAuthorization, deposit);
router.post('/validatecharge', validateCharge)

//paystack routes
router.post('/chargeDriver', checkAuthorization, depositPaystack);
router.get('/callbackdriver', callbackPaystack);

//getbalance
router.post('/getbalancedriver', checkAuthorization, getBalance);


//transfers
router.post('/tranfertodriver', checkAuthorization, tranferDriverstoOtherDrivers);

module.exports = router;