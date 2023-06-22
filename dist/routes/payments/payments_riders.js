"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { deposit, validateCharge } = require('../../controllers/payments/deposit_flutterwave');
const { depositPaystack, callbackPaystack, getBalance } = require('../../controllers/payments/deposit_paystack_riders');
const { tranferUserstoDrivers, tranferUserstoOtherUsers, getDriverData, getUserData } = require('../../controllers/payments/transfers');
const auth_1 = require("../../controllers/auth");
const router = express_1.default.Router();
//paystack routes
router.post('/charge', auth_1.checkAuthorization, depositPaystack);
router.get('/callback', callbackPaystack);
//getbalance
router.post('/getbalance', auth_1.checkAuthorization, getBalance);
router.post('/transferToDrivers', auth_1.checkAuthorization, tranferUserstoDrivers);
router.post('/transferToUsers', auth_1.checkAuthorization, tranferUserstoOtherUsers);
//get data
router.get('/:driverPhoneNumber/getDriverData', auth_1.checkAuthorization, getDriverData);
router.get('/:userPhoneNumber/getUserData', auth_1.checkAuthorization, getUserData);
module.exports = router;
