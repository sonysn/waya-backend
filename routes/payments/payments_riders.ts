import express from 'express';
const { deposit, validateCharge } = require('../../controllers/payments/deposit_flutterwave');
const { depositPaystack, callbackPaystack, getBalance } = require('../../controllers/payments/deposit_paystack_riders');
const { tranferUserstoDrivers, tranferUserstoOtherUsers, getDriverData, getUserData} = require('../../controllers/payments/transfers');
import { checkAuthorization } from '../../controllers/auth';

const router = express.Router();

//paystack routes
router.post('/charge', checkAuthorization, depositPaystack);
router.get('/callback', callbackPaystack);

//getbalance
router.post('/getbalance', checkAuthorization, getBalance);

router.post('/transferToDrivers', checkAuthorization, tranferUserstoDrivers);
router.post('/transferToUsers', checkAuthorization, tranferUserstoOtherUsers );

//get data
router.get('/:driverPhoneNumber/getDriverData', checkAuthorization, getDriverData);
router.get('/:userPhoneNumber/getUserData', checkAuthorization, getUserData );


module.exports = router;