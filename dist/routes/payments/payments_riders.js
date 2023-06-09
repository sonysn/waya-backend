"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { deposit, validateCharge } = require('../../controllers/payments/deposit_flutterwave');
const { depositPaystack, callbackPaystack, getBalance } = require('../../controllers/payments/deposit_paystack_riders');
const { tranferUserstoDrivers, tranferUserstoOtherUsers, getDriverData, getUserData } = require('../../controllers/payments/transfers');
const router = express_1.default.Router();
//paystack routes
router.post('/charge', depositPaystack);
router.get('/callback', callbackPaystack);
//getbalance
router.post('/getbalance', getBalance);
router.post('/transferToDrivers', tranferUserstoDrivers);
router.post('/transferToUsers', tranferUserstoOtherUsers);
//get data
router.get('/:driverPhoneNumber/getDriverData', getDriverData);
router.get('/:userPhoneNumber/getUserData', getUserData);
module.exports = router;
