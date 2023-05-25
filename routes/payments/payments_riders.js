const express = require('express');
const { deposit, validateCharge } = require('../../controllers/payments/deposit_flutterwave');
const { depositPaystack, callbackPaystack, getBalance } = require('../../controllers/payments/deposit_paystack_riders');
const { tranferUserstoDrivers, tranferUserstoOtherUsers, getDriverData, getUserData} = require('../../controllers/payments/transfers');

const router = express.Router();

//paystack routes
router.post('/charge', depositPaystack);
router.get('/callback', callbackPaystack);

//getbalance
router.post('/getbalance', getBalance);

router.post('/transferToDrivers', tranferUserstoDrivers);
router.post('/transferToUsers', tranferUserstoOtherUsers );

//get data
router.get('/:driverPhoneNumber/getDriverData', getDriverData);
router.get('/:userPhoneNumber/getUserData', getUserData );


module.exports = router;